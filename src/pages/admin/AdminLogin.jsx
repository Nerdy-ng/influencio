import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle, Smartphone } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ROLE_ROUTES = {
  admin:   "/admin",
  manager: "/admin/manager",
  staff:   "/admin/staff",
};

export default function AdminLogin() {
  const [step, setStep]           = useState("credentials"); // credentials | setup | verify
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const [factorId, setFactorId]   = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [qrCode, setQrCode]       = useState(null);
  const [secret, setSecret]       = useState(null);
  const [adminData, setAdminData] = useState(null);

  async function handleCredentials(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data.user) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data: adminRow, error: tableError } = await supabase
      .from("admin_users")
      .select("role, name")
      .eq("email", data.user.email)
      .single();

    if (tableError || !adminRow) {
      await supabase.auth.signOut();
      setError("Access denied. This account does not have admin privileges.");
      setLoading(false);
      return;
    }

    const role  = adminRow.role?.toLowerCase().trim();
    const route = ROLE_ROUTES[role];

    if (!route) {
      await supabase.auth.signOut();
      setError("Admin role not recognised. Contact support.");
      setLoading(false);
      return;
    }

    setAdminData({ email: data.user.email, name: adminRow.name, role, route });

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors?.totp?.find(f => f.status === "verified");

    if (verified) {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: verified.id });
      if (cErr) { setError("Failed to start 2FA challenge."); setLoading(false); return; }
      setFactorId(verified.id);
      setChallengeId(challenge.id);
      setStep("verify");
    } else {
      const { data: enrollment, error: eErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Brandior Admin",
      });
      if (eErr) { setError("Failed to set up 2FA."); setLoading(false); return; }
      setFactorId(enrollment.id);
      setQrCode(enrollment.totp.qr_code);
      setSecret(enrollment.totp.secret);
      setStep("setup");
    }

    setLoading(false);
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let cId = challengeId;

    if (step === "setup") {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) { setError("Failed to create challenge."); setLoading(false); return; }
      cId = challenge.id;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: cId,
      code: totpCode.trim(),
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    localStorage.setItem("brandiór_admin_user", JSON.stringify({ email: adminData.email, name: adminData.name }));
    localStorage.setItem("brandiór_admin_role", adminData.role);

    await supabase.auth.signOut();
    window.location.href = adminData.route;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: "#4f46e5" }}>
            {step === "credentials" ? <Shield className="w-8 h-8 text-white" /> : <Smartphone className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Brandior</h1>
          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ backgroundColor: "#1e3a5f", color: "#60a5fa" }}>
            Admin Portal
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>

          {step === "credentials" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>Enter your admin credentials.</p>

              {error && <ErrorBox message={error} />}

              <form onSubmit={handleCredentials} className="space-y-5">
                <Field label="Email Address">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@brandior.co" required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#4f46e5"}
                      onBlur={e => e.target.style.borderColor = "#334155"} />
                  </div>
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#4f46e5"}
                      onBlur={e => e.target.style.borderColor = "#334155"} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                <SubmitBtn loading={loading} label="Continue" />
              </form>
            </>
          )}

          {step === "setup" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Set up 2FA</h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                Scan this QR code with <strong style={{ color: "#fff" }}>Google Authenticator</strong> or <strong style={{ color: "#fff" }}>Authy</strong>, then enter the 6-digit code.
              </p>

              {error && <ErrorBox message={error} />}

              {qrCode && (
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <img src={qrCode} alt="2FA QR Code" style={{ width: 180, height: 180 }} />
                  </div>
                </div>
              )}

              {secret && (
                <p className="text-center text-xs mb-6" style={{ color: "#64748b" }}>
                  Manual key: <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{secret}</span>
                </p>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <Field label="6-digit code from your app">
                  <input type="text" value={totpCode} onChange={e => setTotpCode(e.target.value)}
                    placeholder="000000" maxLength={6} required inputMode="numeric"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-center tracking-widest text-lg"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#4f46e5"}
                    onBlur={e => e.target.style.borderColor = "#334155"} />
                </Field>
                <SubmitBtn loading={loading} label="Activate 2FA & Sign In" />
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Two-factor authentication</h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                Enter the 6-digit code from your authenticator app.
              </p>

              {error && <ErrorBox message={error} />}

              <form onSubmit={handleVerify} className="space-y-5">
                <Field label="Authentication code">
                  <input type="text" value={totpCode} onChange={e => setTotpCode(e.target.value)}
                    placeholder="000000" maxLength={6} required inputMode="numeric"
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-center tracking-widest text-lg"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#4f46e5"}
                    onBlur={e => e.target.style.borderColor = "#334155"} />
                </Field>
                <SubmitBtn loading={loading} label="Verify & Sign In" />
              </form>
            </>
          )}

        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          Restricted to authorised personnel only.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 mb-5"
      style={{ backgroundColor: "#450a0a", border: "1px solid #7f1d1d" }}>
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
      <p className="text-sm" style={{ color: "#f87171" }}>{message}</p>
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
      style={{ backgroundColor: "#4f46e5", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
      {loading ? "Please wait..." : label}
    </button>
  );
}

const inputStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
  caretColor: "#4f46e5",
};
