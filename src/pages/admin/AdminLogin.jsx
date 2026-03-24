import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

const CREDENTIALS = [
  { email: "admin@brandior.co", password: "admin123", role: "admin", name: "Super Admin" },
  { email: "manager@brandior.co", password: "manager123", role: "manager", name: "Platform Manager" },
  { email: "staff@brandior.co", password: "staff123", role: "staff", name: "Staff Member" },
];

const ROLE_ROUTES = {
  admin: "/admin",
  manager: "/admin/manager",
  staff: "/admin/staff",
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const match = CREDENTIALS.find(
        (c) => c.email === email.trim().toLowerCase() && c.password === password
      );

      if (match) {
        localStorage.setItem("brandiór_admin_user", JSON.stringify({ email: match.email, name: match.name }));
        localStorage.setItem("brandiór_admin_role", match.role);
        navigate(ROLE_ROUTES[match.role]);
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: "#4f46e5" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Brandiór
          </h1>
          <div
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ backgroundColor: "#1e3a5f", color: "#60a5fa" }}
          >
            Admin Portal
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          <h2 className="text-xl font-semibold text-white mb-1">Sign in to your account</h2>
          <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
            Enter your credentials to access the admin portal.
          </p>

          {error && (
            <div
              className="flex items-start gap-3 rounded-lg p-3 mb-5"
              style={{ backgroundColor: "#450a0a", border: "1px solid #7f1d1d" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
              <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#64748b" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brandior.co"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f1f5f9",
                    caretColor: "#4f46e5",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#64748b" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f1f5f9",
                    caretColor: "#4f46e5",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#64748b" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
              style={{
                backgroundColor: "#4f46e5",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          This portal is restricted to authorized personnel only.
          <br />
          Unauthorized access is a violation of company policy.
        </p>
      </div>
    </div>
  );
}
