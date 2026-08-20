import { useState, useEffect } from "react";
import { Shield, Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ROLE_ROUTES = {
  admin:   "/admin",
  manager: "/admin/manager",
  staff:   "/admin/staff",
};

const REDIRECT_URL = `${window.location.origin}/admin/login`;

export default function AdminLogin() {
  const [step, setStep]       = useState("email"); // email | sent | checking | error
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Called after Supabase session is confirmed (magic link click or page reload with active session)
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

    // Keep session alive — AdminPanel will re-verify on mount
    // Store display info only (not used as security gate)
    localStorage.setItem("brandiór_admin_user", JSON.stringify({ email: user.email, name: adminRow.name }));
    localStorage.setItem("brandiór_admin_role", role);
    window.location.href = route;
  }

  // Listen for magic link redirect completing
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        await handleAuthenticatedUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSendLink(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo:  REDIRECT_URL,
      },
    });

    if (otpErr) {
      setError("Could not send login link. Make sure this email is registered.");
      setLoading(false);
      return;
    }

    setStep("sent");
    setLoading(false);
  }

  if (step === "checking") {
    return (
      <Screen>
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#4f46e5" }} />
          <p className="text-white font-semibold">Verifying access…</p>
        </div>
      </Screen>
    );
  }

  if (step === "error") {
    return (
      <Screen>
        <ErrorBox message={error} />
        <button onClick={() => { setStep("email"); setError(""); }}
          className="w-full py-2.5 mt-4 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#4f46e5" }}>
          Try again
        </button>
      </Screen>
    );
  }

  if (step === "sent") {
    return (
      <Screen>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#14532d" }}>
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
          <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>We sent a login link to</p>
          <p className="font-semibold text-white text-sm mb-5">{email}</p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Click the link in the email — it opens the admin panel automatically. Expires in 1 hour.
          </p>
        </div>
        <button onClick={() => setStep("email")}
          className="w-full mt-4 py-2 rounded-lg text-xs font-semibold border"
          style={{ borderColor: "#334155", color: "#64748b" }}>
          Use a different email
        </button>
      </Screen>
    );
  }

  return (
    <Screen>
      <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
      <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
        Enter your admin email and we'll send a secure login link.
      </p>

      {error && <ErrorBox message={error} />}

      <form onSubmit={handleSendLink} className="space-y-5">
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
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Login Link"}
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
