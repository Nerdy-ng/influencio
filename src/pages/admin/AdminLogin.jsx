import { useState, useRef, useEffect } from "react";
import { Shield, Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ROLE_ROUTES = {
  admin:   "/admin",
  manager: "/admin/manager",
  staff:   "/admin/staff",
};

export default function AdminLogin() {
  const [step, setStep]       = useState("email"); // email | code | checking | error
  const [email, setEmail]     = useState("");
  const [code, setCode]       = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs             = useRef([]);

  // If there's already an active admin session, skip straight to checking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleAuthenticatedUser(session.user);
    });
  }, []);

  async function handleAuthenticatedUser(user) {
    setStep("checking");

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, name")
      .eq("email", user.email)
      .single();

    if (!adminRow) {
      await supabase.auth.signOut();
      setError("Access denied. This account does not have admin privileges.");
      setStep("error");
      return;
    }

    const role  = adminRow.role?.toLowerCase().trim();
    const route = ROLE_ROUTES[role];

    if (!route) {
      await supabase.auth.signOut();
      setError("Admin role not recognised. Contact support.");
      setStep("error");
      return;
    }

    localStorage.setItem("brandiór_admin_user", JSON.stringify({ email: user.email, name: adminRow.name }));
    localStorage.setItem("brandiór_admin_role", role);
    window.location.href = route;
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });

    if (otpErr) {
      setError("Could not send code. Make sure this email is registered as an admin.");
      setLoading(false);
      return;
    }

    setStep("code");
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  async function handleVerifyCode(e) {
    e?.preventDefault();
    const token = code.join("").trim();
    if (token.length !== 6) return;

    setError("");
    setLoading(true);

    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });

    if (verifyErr || !data?.user) {
      setError("Incorrect or expired code. Check your email and try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    await handleAuthenticatedUser(data.user);
  }

  function onDigitChange(i, val) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...code];
    next[i]     = digit;
    setCode(next);
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-submit when last digit is filled
    if (digit && i === 5) {
      const full = next.join("");
      if (full.length === 6) {
        setTimeout(() => handleVerifyCode(), 80);
      }
    }
  }

  function onDigitKeyDown(i, e) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyCode();
  }

  function onDigitPaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyCode(), 80);
  }

  if (step === "checking") return (
    <Screen>
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#4f46e5" }} />
        <p className="text-white font-semibold">Verifying access…</p>
      </div>
    </Screen>
  );

  if (step === "error") return (
    <Screen>
      <ErrorBox message={error} />
      <button onClick={() => { setStep("email"); setError(""); setCode(["","","","","",""]); }}
        className="w-full py-2.5 mt-4 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#4f46e5" }}>
        Try again
      </button>
    </Screen>
  );

  if (step === "code") return (
    <Screen>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#1e3a5f" }}>
          <CheckCircle className="w-7 h-7" style={{ color: "#60a5fa" }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Enter the code</h2>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          We sent a 6-digit code to
        </p>
        <p className="font-semibold text-white text-sm mt-1">{email}</p>
      </div>

      {error && <ErrorBox message={error} />}

      <form onSubmit={handleVerifyCode} className="space-y-6">
        {/* 6-box code input */}
        <div className="flex justify-center gap-3">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => onDigitChange(i, e.target.value)}
              onKeyDown={e => onDigitKeyDown(i, e)}
              onPaste={i === 0 ? onDigitPaste : undefined}
              style={{
                width: 48, height: 56, textAlign: "center",
                fontSize: 22, fontWeight: 800, letterSpacing: 0,
                backgroundColor: "#0f172a",
                border: `2px solid ${digit ? "#4f46e5" : "#334155"}`,
                borderRadius: 10, color: "#f1f5f9",
                caretColor: "#4f46e5", outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#4f46e5"}
              onBlur={e => e.target.style.borderColor = digit ? "#4f46e5" : "#334155"}
            />
          ))}
        </div>

        <button type="submit" disabled={loading || code.join("").length < 6}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#4f46e5", opacity: (loading || code.join("").length < 6) ? 0.5 : 1 }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify Code"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5">
        <button onClick={() => { setStep("email"); setCode(["","","","","",""]); setError(""); }}
          className="text-xs" style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
          ← Use a different email
        </button>
        <button onClick={handleSendCode} disabled={loading}
          className="text-xs" style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>
          Resend code
        </button>
      </div>
    </Screen>
  );

  return (
    <Screen>
      <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
      <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
        Enter your admin email to receive a 6-digit access code.
      </p>

      {error && <ErrorBox message={error} />}

      <form onSubmit={handleSendCode} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Admin Email</label>
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
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#4f46e5", opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Code"}
        </button>
      </form>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: "#4f46e5" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Brandior</h1>
          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ backgroundColor: "#1e3a5f", color: "#60a5fa" }}>
            Admin Portal
          </div>
        </div>
        <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
          {children}
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>Restricted to authorised personnel only.</p>
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 mb-4"
      style={{ backgroundColor: "#450a0a", border: "1px solid #7f1d1d" }}>
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
      <p className="text-sm" style={{ color: "#f87171" }}>{message}</p>
    </div>
  );
}

const inputStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
  caretColor: "#4f46e5",
};
