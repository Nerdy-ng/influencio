import { useState } from "react";
import { Shield, Mail, AlertCircle, Smartphone } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ROLE_ROUTES = {
  admin:   "/admin",
  manager: "/admin/manager",
  staff:   "/admin/staff",
};

export default function AdminLogin() {
  const [step, setStep]     = useState("email"); // email | otp
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });

    if (otpErr) {
      setError("Failed to send code. Check the email and try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setStep("otp");
    setLoading(false);
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type:  "email",
    });

    if (verifyErr || !data.user) {
      setError("Invalid or expired code. Try again.");
      setLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, name")
      .eq("email", data.user.email)
      .single();

    if (!adminRow) {
      await supabase.auth.signOut();
      setError("Access denied.");
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

    localStorage.setItem("brandiór_admin_user", JSON.stringify({ email: data.user.email, name: adminRow.name }));
    localStorage.setItem("brandiór_admin_role", role);

    await supabase.auth.signOut();
    window.location.href = route;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: "#4f46e5" }}>
            {step === "email" ? <Shield className="w-8 h-8 text-white" /> : <Smartphone className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Brandior</h1>
          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ backgroundColor: "#1e3a5f", color: "#60a5fa" }}>
            Admin Portal
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>

          {step === "email" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                Enter your admin email and we'll send a one-time code.
              </p>

              {error && <ErrorBox message={error} />}

              <form onSubmit={handleSendOtp} className="space-y-5">
                <Field label="Admin Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@brandior.co" required autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#4f46e5"}
                      onBlur={e => e.target.style.borderColor = "#334155"}
                    />
                  </div>
                </Field>
                <SubmitBtn loading={loading} label="Send Code" />
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Check your email</h2>
              <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                We sent a 6-digit code to <strong style={{ color: "#fff" }}>{email}</strong>. Enter it below.
              </p>

              {error && <ErrorBox message={error} />}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <Field label="One-time code">
                  <input
                    type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="000000" maxLength={6} required inputMode="numeric" autoFocus
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-center tracking-widest text-lg"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#4f46e5"}
                    onBlur={e => e.target.style.borderColor = "#334155"}
                  />
                </Field>
                <SubmitBtn loading={loading} label="Sign In" />
              </form>

              <button
                onClick={() => { setStep("email"); setOtp(""); setError(""); setSent(false); }}
                className="w-full mt-3 text-xs text-center"
                style={{ color: "#64748b" }}>
                Use a different email
              </button>
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
