import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Info, AlertTriangle, CheckCircle, Zap, X } from "lucide-react";

const TYPE_CONFIG = {
  info:    { color: "#0891b2", bg: "#e0f2fe", border: "#bae6fd", Icon: Info          },
  success: { color: "#059669", bg: "#d1fae5", border: "#a7f3d0", Icon: CheckCircle   },
  warning: { color: "#d97706", bg: "#fef3c7", border: "#fde68a", Icon: AlertTriangle  },
  urgent:  { color: "#dc2626", bg: "#fee2e2", border: "#fecaca", Icon: Zap           },
};

export default function AnnouncementBanner({ role }) {
  const [banner, setBanner]     = useState(null);
  const [dismissed, setDismiss] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const now = new Date().toISOString();
    supabase
      .from("platform_announcements")
      .select("*")
      .eq("active", true)
      .or(`target_role.eq.all,target_role.eq.${role}`)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setBanner(data || null));
  }, [role, dismissed]);

  if (!banner || dismissed) return null;

  const cfg = TYPE_CONFIG[banner.type] || TYPE_CONFIG.info;

  return (
    <div className="flex items-start gap-3 px-5 py-3 text-sm font-medium leading-snug"
      style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
      <cfg.Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
      <p className="flex-1" style={{ color: cfg.color }}>{banner.message}</p>
      <button onClick={() => setDismiss(true)} className="flex-shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" style={{ color: cfg.color }} />
      </button>
    </div>
  );
}
