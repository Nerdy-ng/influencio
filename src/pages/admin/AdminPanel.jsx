import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateAdminSession, clearAdminSession, callAdminFn, getAdminToken, registerAdminSession, logSecurityEvent } from "../../lib/adminAuth";
const stripInjection = (s) => String(s ?? '').replace(/[<>{}\\`]/g, '');
import {
  LayoutDashboard, Users, Briefcase, Shield, Bell,
  DollarSign, Settings, LogOut, ChevronDown, Search, X,
  CheckCircle, XCircle, AlertTriangle, MoreVertical, Plus,
  TrendingUp, Activity, Check, ArrowUpRight, Eye, EyeOff, ShieldAlert, Pencil, Save, Globe,
  SlidersHorizontal, Star, Zap, BadgeCheck, RotateCcw, Info, ChevronUp, ChevronRight,
  BarChart2, HelpCircle, MessageSquare, Clock, Send, CreditCard, ToggleLeft, ToggleRight, Layers,
  Scale, Sparkles, Smartphone, Tag, ListFilter, ClipboardList, GitBranch, Star as StarIcon, Wallet,
  Moon, Sun, PanelLeftClose, PanelLeftOpen, Mail, Megaphone, Ticket, TrendingDown, Timer, Download, ShieldCheck, Percent,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AdminModerationDashboard from "../../components/AdminModerationDashboard";
import { getModerationStats } from "../../utils/moderationEngine";
import CmsEditor from "../../components/admin/CmsEditor";
import PushNotificationPanel from "../../components/admin/PushNotificationPanel";
import AuditLogPanel from "../../components/admin/AuditLogPanel";
import UserDetailModal from "../../components/admin/UserDetailModal";
import RateCardModerationPanel from "../../components/admin/RateCardModerationPanel";
import CollaborationPanel     from "../../components/admin/CollaborationPanel";
import MessagingModerationPanel from "../../components/admin/MessagingModerationPanel";
import DisputeCenterPanel     from "../../components/admin/DisputeCenterPanel";
import WalletManagementPanel  from "../../components/admin/WalletManagementPanel";
import WithdrawalPanel        from "../../components/admin/WithdrawalPanel";
import EscrowPanel            from "../../components/admin/EscrowPanel";
import FinancialReportingPanel from "../../components/admin/FinancialReportingPanel";
import ReviewsModerationPanel from "../../components/admin/ReviewsModerationPanel";
import MarketplaceModerationPanel from "../../components/admin/MarketplaceModerationPanel";
import ReferralManagementPanel from "../../components/admin/ReferralManagementPanel";
import NotificationsPanel     from "../../components/admin/NotificationsPanel";
import CMSPanel               from "../../components/admin/CMSPanel";
import AnalyticsPanel         from "../../components/admin/AnalyticsPanel";
import AIControlsPanel        from "../../components/admin/AIControlsPanel";
import AlgorithmControlPanel   from "../../components/admin/AlgorithmControlPanel";
import PaymentConfigPanel     from "../../components/admin/PaymentConfigPanel";
import PitchSettingsPanel     from "../../components/admin/PitchSettingsPanel";
import RubiesPanel            from "../../components/admin/RubiesPanel";
import CategoryManagementPanel from "../../components/admin/CategoryManagementPanel";
import TrustSafetyPanel       from "../../components/admin/TrustSafetyPanel";
import SupportCenterPanel     from "../../components/admin/SupportCenterPanel";
import SystemSettingsPanel    from "../../components/admin/SystemSettingsPanel";
import KYCReviewPanel         from "../../components/admin/KYCReviewPanel";
import PayoutApprovalPanel    from "../../components/admin/PayoutApprovalPanel";
import EmailDeliveryLogPanel    from "../../components/admin/EmailDeliveryLogPanel";
import FraudDetectionPanel      from "../../components/admin/FraudDetectionPanel";
import AnnouncementBannerPanel  from "../../components/admin/AnnouncementBannerPanel";
import PromoCouponPanel         from "../../components/admin/PromoCouponPanel";
import OnboardingFunnelPanel    from "../../components/admin/OnboardingFunnelPanel";
import CreatorEarningsPanel     from "../../components/admin/CreatorEarningsPanel";
import SLATrackerPanel          from "../../components/admin/SLATrackerPanel";
import DataExportPanel          from "../../components/admin/DataExportPanel";
import AdminSecurityPanel       from "../../components/admin/AdminSecurityPanel";
import AdminRolesPanel          from "../../components/admin/AdminRolesPanel";
import RefundWorkflowPanel      from "../../components/admin/RefundWorkflowPanel";
import SystemHealthPanel        from "../../components/admin/SystemHealthPanel";
import CommissionPanel          from "../../components/admin/CommissionPanel";
import EmailNotificationsPanel  from "../../components/admin/EmailNotificationsPanel";
import { LOGO_SLOTS, getLogo, uploadLogoFile, removeLogoFromDB } from "../../lib/brandSettings";
import { getAllSettings, saveAllSettings, loadSettingsFromDB, getSetting, setSetting, isFeatureEnabled, makeFeatureValue } from "../../lib/siteSettings";
import { THEME_VARS, loadThemeFromDB, saveThemeToDB, resetThemeToDB, getThemeDefaults } from "../../lib/themeSettings";
import { supabase } from "../../lib/supabase";
import { saveProfile } from "../../lib/profile";

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color = "#4f46e5" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

function MenuRow({ icon: Icon, label, color, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left transition-colors">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span style={{ color: danger ? color : "#374151" }}>{label}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
    suspended: { bg: "#fef3c7", color: "#d97706", label: "Suspended" },
    banned: { bg: "#fee2e2", color: "#dc2626", label: "Banned" },
    pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    completed: { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
    failed: { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
    flagged: { bg: "#fee2e2", color: "#dc2626", label: "Flagged" },
    in_progress: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" },
    delivered: { bg: "#ede9fe", color: "#6d28d9", label: "Delivered" },
    revision_requested: { bg: "#fee2e2", color: "#b91c1c", label: "Revision Requested" },
    cancelled: { bg: "#f1f5f9", color: "#64748b", label: "Cancelled" },
    Active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
    Inactive: { bg: "#f1f5f9", color: "#64748b", label: "Inactive" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? "#4f46e5" : "#cbd5e1" }}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fee2e2" }}>
            <AlertTriangle className="w-5 h-5" style={{ color: "#dc2626" }} />
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#dc2626" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success" }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
      style={{ backgroundColor: type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#4f46e5" }}
    >
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",  label: "Overview",   Icon: LayoutDashboard },
  { id: "analytics",  label: "Analytics",   Icon: BarChart2 },
  { id: "funnel",     label: "Funnel",      Icon: TrendingDown },
  { id: "earnings",   label: "Earnings",    Icon: DollarSign },
  { id: "sla",        label: "SLA Tracker", Icon: Timer },
  { id: "exports",    label: "Exports",     Icon: Download },
  { id: "users",     label: "Users",      Icon: Users },
  { id: "algo-control", label: "Algorithm Control", Icon: SlidersHorizontal },
  { id: "jobs",           label: "Collabs",       Icon: Briefcase },
  { id: "pitches",        label: "Pitches",       Icon: Send },
  { id: "messaging",      label: "Messaging",     Icon: MessageSquare },
  { id: "disputes2",      label: "Disputes",      Icon: Scale, badge: true, badgeColor: "#ef4444" },
  { id: "wallets",        label: "Wallets",       Icon: CreditCard },
  { id: "withdrawals",    label: "Withdrawals",   Icon: ArrowUpRight },
  { id: "payout-approvals", label: "Payout Queue", Icon: CheckCircle, badge: true, badgeColor: "#f59e0b" },
  { id: "escrow",         label: "Escrow",        Icon: DollarSign },
  { id: "financials2",    label: "Financials",    Icon: TrendingUp },
  { id: "reviews",        label: "Reviews",       Icon: StarIcon },
  { id: "marketplace",    label: "Marketplace",   Icon: Layers },
  { id: "referrals2",     label: "Referrals",     Icon: GitBranch },
  { id: "announcements",  label: "Banners",        Icon: Megaphone },
  { id: "promo-codes",    label: "Promo Codes",    Icon: Ticket },
  { id: "notifications2", label: "Notify",        Icon: Bell },
  { id: "cms2",           label: "CMS",           Icon: Globe },
  { id: "analytics2",     label: "Analytics",     Icon: BarChart2 },
  { id: "ai-controls",    label: "AI Controls",   Icon: Sparkles },
  { id: "discovery",      label: "Discovery",     Icon: SlidersHorizontal },
  { id: "pay-config",     label: "Pay Config",    Icon: CreditCard },
  { id: "pitch-settings", label: "Pitch Config",  Icon: Send },
  { id: "rubies",         label: "Rubies",        Icon: Wallet },
  { id: "categories",     label: "Categories",    Icon: Tag },
  { id: "trust-safety",   label: "Trust & Safety",Icon: ShieldAlert },
  { id: "kyc",            label: "KYC",           Icon: BadgeCheck, badge: true, badgeColor: "#f59e0b" },
  { id: "fraud",          label: "Fraud Detection", Icon: ShieldAlert },
  { id: "support2",       label: "Support",       Icon: HelpCircle },
  { id: "email-log",      label: "Email Log",     Icon: Mail },
  { id: "email-notifs",   label: "Email Alerts",  Icon: Mail },
  { id: "system",         label: "System",        Icon: Settings },
  { id: "team",           label: "Team",          Icon: Shield },
  { id: "approvals",      label: "Approvals",     Icon: Bell, badge: true },
  { id: "content",        label: "Content",       Icon: Globe },
  { id: "ai-police",      label: "AI Police",     Icon: ShieldAlert, badge: true, badgeColor: "#ef4444" },
  { id: "features",       label: "Features",      Icon: Layers },
  { id: "payments",       label: "Payments",      Icon: CreditCard },
  { id: "legal",          label: "Legal",         Icon: Pencil },
  { id: "app-config",     label: "App Config",    Icon: Smartphone },
  { id: "push",           label: "Push",          Icon: Send },
  { id: "rate-cards",     label: "Rate Cards",    Icon: StarIcon },
  { id: "audit",          label: "Audit Log",     Icon: ClipboardList },
  { id: "security",       label: "Security",      Icon: Shield },
  { id: "roles",          label: "Roles",         Icon: ShieldCheck },
  { id: "refunds",        label: "Refunds",       Icon: RotateCcw },
  { id: "health",         label: "System Health", Icon: Activity },
  { id: "commission",     label: "Commission",    Icon: Percent },
  { id: "settings",       label: "Settings",      Icon: Settings },
];

const NAV_GROUPS = [
  { title: "Dashboard", items: ["overview", "analytics", "funnel", "earnings", "sla", "exports", "health"] },
  { title: "Community", items: ["users", "rankings", "jobs", "pitches", "messaging"] },
  { title: "Finance",   items: ["wallets", "withdrawals", "payout-approvals", "escrow", "financials2", "rubies", "pay-config", "pitch-settings", "payments", "refunds", "commission"] },
  { title: "Trust",     items: ["disputes2", "reviews", "ai-police", "trust-safety", "kyc", "fraud", "marketplace", "referrals2"] },
  { title: "Platform",  items: ["announcements", "promo-codes", "notifications2", "cms2", "push", "ai-controls", "discovery", "categories", "support2", "rate-cards", "email-log", "email-notifs"] },
  { title: "Admin",     items: ["team", "approvals", "content", "features", "legal", "app-config", "system", "analytics2", "audit", "security", "roles", "settings"] },
];

// ─── TWO-LEVEL NAVIGATION ─────────────────────────────────────────────────────

const NAV_DOMAINS = [
  { id: "overview",     label: "Overview",        items: ["overview", "analytics", "funnel", "earnings", "sla", "exports", "health"] },
  { id: "users",        label: "Users",           items: ["users", "kyc", "referrals2"] },
  { id: "collabs",      label: "Collabs",         items: ["jobs", "pitches", "messaging", "disputes2"] },
  { id: "finance",      label: "Finance",         items: ["wallets", "withdrawals", "payout-approvals", "escrow", "financials2", "commission", "rubies", "refunds", "pay-config", "payments"] },
  { id: "marketplace",  label: "Marketplace",     items: ["marketplace", "rate-cards", "categories", "algo-control", "reviews"] },
  { id: "comms",        label: "Comms",           items: ["announcements", "promo-codes", "notifications2", "push", "email-notifs", "email-log"] },
  { id: "support",      label: "Support",         items: ["support2"] },
  { id: "content",      label: "Content",         items: ["cms2", "content", "legal", "analytics2"] },
  { id: "safety",       label: "Safety",          items: ["trust-safety", "ai-police", "fraud"] },
  { id: "system",       label: "System",          items: ["ai-controls", "pitch-settings", "features", "app-config", "system", "settings", "team", "approvals", "audit", "security", "roles"] },
];

function getDomainForTab(tabId) {
  for (const d of NAV_DOMAINS) {
    if (d.items.includes(tabId)) return d.id;
  }
  return "overview";
}

// ─── DEFAULT LEGAL CONTENT ────────────────────────────────────────────────────

const DEFAULT_TERMS = `## Terms & Conditions

Last updated: March 2026

## 1. Acceptance of Terms
By accessing or using Brandior ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform.

## 2. Description of Service
Brandior is a talent and creator marketplace that connects African talents (creators, influencers, musicians, artists) with brands seeking to run campaigns and partnerships.

## 3. User Accounts
You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.

## 4. Payments & Fees
Brandior charges a platform fee on successful transactions. All payments are processed securely. Brandior is not responsible for disputes between talents and brands outside the platform.

## 5. Refunds
Approved refunds are credited to the brand's Brandior wallet by default and may be used for future campaigns, collaborations, and other eligible services on the Platform. Brandior does not provide a general cash-withdrawal facility for brand wallet balances. Refund requests are reviewed by the Brandior administration team in accordance with applicable refund conditions. This policy does not affect any refund, reversal, chargeback, or payment rights to which a brand is entitled under applicable law or payment-provider rules; where a refund must be returned through the original payment method or another required channel, Brandior will follow the applicable process.

## 6. Content & Conduct
Users must not post misleading, offensive, or illegal content. Brandior reserves the right to remove any content or suspend any account that violates these terms.

## 7. Intellectual Property
Content posted by users remains their property. By posting on Brandior, you grant us a licence to display that content on the Platform.

## 8. Limitation of Liability
Brandior is not liable for any indirect, incidental, or consequential damages arising from use of the Platform.

## 9. Governing Law
These terms are governed by the laws of the Federal Republic of Nigeria.

## 10. Contact
For questions about these terms, contact us at support@brandior.africa`

const DEFAULT_PRIVACY = `## Privacy Policy

Last updated: March 2026

## 1. Information We Collect
We collect information you provide directly (name, email, role, industry) and usage data (pages visited, actions taken on the Platform).

## 2. How We Use Your Information
We use your information to operate the Platform, send relevant notifications, improve our services, and comply with legal obligations.

## 3. Data Sharing
We do not sell your personal data. We may share data with trusted service providers (e.g. Supabase, Resend) strictly to operate the Platform.

## 4. Data Storage
Your data is stored securely on Supabase servers. We implement industry-standard security measures to protect your information.

## 5. Your Rights
You have the right to access, correct, or delete your personal data at any time. Contact us at support@brandior.africa to make a request.

## 6. Cookies
We use cookies to maintain your session and improve your experience. See our Cookie Policy for details.

## 7. Changes to This Policy
We may update this policy from time to time. We will notify you of significant changes via email.

## 8. Contact
For privacy-related enquiries, contact support@brandior.africa`

const DEFAULT_COOKIES = `## Cookie Policy

Last updated: March 2026

## What Are Cookies
Cookies are small text files stored on your device when you visit a website. They help us recognise you and remember your preferences.

## Cookies We Use

### Essential Cookies
Required for the Platform to function. These include session cookies that keep you logged in.

### Analytics Cookies
Help us understand how users interact with the Platform so we can improve it. We do not share this data with third parties for advertising.

### Preference Cookies
Remember your settings and preferences (e.g. your selected role, language).

## Managing Cookies
You can control cookies through your browser settings. Disabling essential cookies may affect Platform functionality.

## Contact
For questions about our use of cookies, contact support@brandior.africa`

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState(null);
  const [adminRole, setAdminRole] = useState("");
  const [overviewFilter, setOverviewFilter] = useState("all");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned]   = useState(() => localStorage.getItem('brandior_sidebar_pinned') === 'true');
  const sidebarOpen = sidebarPinned || sidebarHovered;
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin_theme') === 'dark');
  const activeDomain = getDomainForTab(activeTab);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [adminsList, setAdminsList] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [brandFee, setBrandFee] = useState(() => getAllSettings().brandFee || "10");
  const [creatorFee, setCreatorFee] = useState(() => getAllSettings().creatorFee || "5");
  const [legalDocs, setLegalDocs] = useState({ terms: DEFAULT_TERMS, privacy: DEFAULT_PRIVACY, cookies: DEFAULT_COOKIES })
  const [legalDocIds, setLegalDocIds] = useState({ terms: null, privacy: null, cookies: null })
  const [activeLegalDoc, setActiveLegalDoc] = useState('terms')

  async function loadLegalDocs() {
    const { data } = await supabase
      .from('cms_content')
      .select('id, type, content')
      .in('type', ['terms', 'privacy', 'cookies'])
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
    if (!data?.length) return
    const map = {}
    const ids = {}
    for (const row of data) {
      if (!map[row.type]) { map[row.type] = row.content; ids[row.type] = row.id }
    }
    setLegalDocs(p => ({ ...p, ...map }))
    setLegalDocIds(p => ({ ...p, ...ids }))
  }

  async function saveLegalDocs() {
    const TITLES = { terms: 'Terms of Service', privacy: 'Privacy Policy', cookies: 'Cookie Policy' }
    const saves = Object.entries(legalDocs).map(async ([type, content]) => {
      const id = legalDocIds[type]
      if (id) {
        return supabase.from('cms_content').update({ content, updated_at: new Date().toISOString() }).eq('id', id)
      }
      const { data } = await supabase.from('cms_content').insert({
        type, title: TITLES[type], content, status: 'published',
      }).select('id').single()
      if (data?.id) setLegalDocIds(p => ({ ...p, [type]: data.id }))
    })
    const results = await Promise.all(saves)
    const anyError = results.some(r => r?.error)
    if (anyError) { showToast('Save failed — check console', 'error'); return }
    showToast('Legal documents saved successfully.')
  }

  const [settings, setSettings] = useState(() => {
    const saved = getAllSettings()
    return {
      platformName:       saved.platformName,
      tagline:            saved.tagline,
      maintenanceMode:    saved.maintenanceMode,
      emailNotifications: saved.emailNotifications,
      countries:          saved.countries,
      heroVideo:          saved.heroVideo || '',
      loginIllustration:  saved.loginIllustration || '',
      tiktokPixelId:      saved.tiktokPixelId || '',
    }
  });
  const [logos, setLogos] = useState(() =>
    Object.fromEntries(Object.keys(LOGO_SLOTS).map(slot => [slot, getLogo(slot)]))
  )
  const [logoUploading, setLogoUploading] = useState({})

  const DEFAULT_BRAND_TIERS = {
    Partner:  { label: 'Brandior Partner',  campaigns: 0,  creators: 0  },
    Elite:    { label: 'Brandior Elite',    campaigns: 3,  creators: 5  },
    Champion: { label: 'Brandior Champion', campaigns: 7,  creators: 20 },
  }
  const [brandTiers, setBrandTiers] = useState(DEFAULT_BRAND_TIERS)
  const [tierSaved, setTierSaved] = useState(false)

  const DEFAULT_REFERRAL_CONFIG = { creator_bonus: 2500, brand_bonus: 5000, hold_days: 30 }
  const [referralConfig, setReferralConfig] = useState(DEFAULT_REFERRAL_CONFIG)
  const [referralSaved, setReferralSaved] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); setCmdQuery(""); }
      if (e.key === 'Escape') setCmdOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { localStorage.setItem('admin_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

  useEffect(() => { loadLegalDocs() }, [])        // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    supabase.from('tier_config').select('config').eq('id', 'brand_tiers').single()
      .then(({ data }) => { if (data?.config) setBrandTiers(data.config) })
    supabase.from('tier_config').select('config').eq('id', 'referral_config').single()
      .then(({ data }) => { if (data?.config) setReferralConfig(data.config) })
  }, [])

  async function saveBrandTiers() {
    await supabase.from('tier_config').upsert({ id: 'brand_tiers', config: brandTiers, updated_at: new Date().toISOString() })
    setTierSaved(true)
    setTimeout(() => setTierSaved(false), 2000)
  }

  async function saveReferralConfig() {
    await supabase.from('tier_config').upsert({ id: 'referral_config', config: referralConfig, updated_at: new Date().toISOString() })
    setReferralSaved(true)
    setTimeout(() => setReferralSaved(false), 2000)
  }

  async function handleLogoUpload(slot, e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoUploading(prev => ({ ...prev, [slot]: true }))
    try {
      const url = await uploadLogoFile(slot, file)
      setLogos(prev => ({ ...prev, [slot]: url }))
      setToast({ type: 'success', msg: 'Logo updated successfully.' })
    } catch (err) {
      setToast({ type: 'error', msg: 'Upload failed: ' + (err.message || 'Unknown error') })
    } finally {
      setLogoUploading(prev => ({ ...prev, [slot]: false }))
      e.target.value = ''
    }
  }

  const [themeColors, setThemeColors] = useState(getThemeDefaults)
  const [themeSaving, setThemeSaving] = useState(false)

  useEffect(() => {
    loadThemeFromDB().then(colors => { if (colors) setThemeColors(c => ({ ...c, ...colors })) })
  }, [])

  async function handleSaveTheme() {
    setThemeSaving(true)
    try {
      await saveThemeToDB(themeColors)
      setToast({ type: 'success', msg: 'Brand colours saved and applied.' })
    } catch (err) {
      setToast({ type: 'error', msg: 'Failed to save colours: ' + (err.message || 'Unknown error') })
    } finally {
      setThemeSaving(false)
    }
  }

  async function handleResetTheme() {
    const defaults = getThemeDefaults()
    setThemeColors(defaults)
    setThemeSaving(true)
    try {
      await resetThemeToDB()
      setToast({ type: 'success', msg: 'Colours reset to defaults.' })
    } catch (err) {
      setToast({ type: 'error', msg: 'Reset failed: ' + (err.message || 'Unknown error') })
    } finally {
      setThemeSaving(false)
    }
  }

  async function handleLogoRemove(slot) {
    setLogoUploading(prev => ({ ...prev, [slot]: true }))
    try {
      await removeLogoFromDB(slot)
      setLogos(prev => ({ ...prev, [slot]: '' }))
      setToast({ type: 'success', msg: 'Logo removed.' })
    } catch (err) {
      setToast({ type: 'error', msg: 'Remove failed: ' + (err.message || 'Unknown error') })
    } finally {
      setLogoUploading(prev => ({ ...prev, [slot]: false }))
    }
  }

  // Payment processor state
  const [rubiesStatus, setRubiesStatus] = useState({ escrowAccount: '', revenueAccount: '', env: '' })
  const [rubiesSaving, setRubiesSaving] = useState(false)
  const [rubiesSaved, setRubiesSaved] = useState(false)

  async function saveRubiesConfig() {
    setRubiesSaving(true)
    await supabase.from('site_settings').upsert([
      { key: 'rubies_escrow_account',  value: rubiesStatus.escrowAccount,  updated_at: new Date().toISOString() },
      { key: 'rubies_revenue_account', value: rubiesStatus.revenueAccount, updated_at: new Date().toISOString() },
      { key: 'rubies_env',             value: rubiesStatus.env,            updated_at: new Date().toISOString() },
    ])
    setRubiesSaving(false)
    setRubiesSaved(true)
    setTimeout(() => setRubiesSaved(false), 2000)
  }

  useEffect(() => {
    Promise.all([
      supabase.from('site_settings').select('value').eq('key', 'rubies_escrow_account').single(),
      supabase.from('site_settings').select('value').eq('key', 'rubies_revenue_account').single(),
      supabase.from('site_settings').select('value').eq('key', 'rubies_env').single(),
    ]).then(([e, r, env]) => {
      setRubiesStatus({
        escrowAccount:  e.data?.value  || '',
        revenueAccount: r.data?.value  || '',
        env:            env.data?.value || 'sandbox',
      })
    })
  }, [])

  // App Config state
  const DEFAULT_APP_CONFIG = {
    niche_categories:           ['Beauty & Skincare', 'Fashion & Style', 'Fitness & Sports', 'Food & Lifestyle', 'Tech & Gadgets', 'Travel', 'Health & Wellness', 'Entertainment', 'Education', 'Business & Finance', 'Parenting & Family', 'Art & Culture'],
    content_types:              ['UGC Content', 'Influencer Post', 'Brand Ambassador', 'Voiceover', 'Product Review'],
    min_creator_rate:           20000,
    platform_commission_pct:    10,
    escrow_release_delay_hours: 48,
    auto_release_days:          7,
    max_pitches_per_month:      10,
    pitch_pack_size:            10,
    pitch_pack_price:           500,
  }
  const [appConfig,        setAppConfig]        = useState(DEFAULT_APP_CONFIG)
  const [appConfigSaving,  setAppConfigSaving]  = useState(false)
  const [appConfigSaved,   setAppConfigSaved]   = useState(false)
  const [appConfigNewItem, setAppConfigNewItem] = useState({ niche_categories: '', content_types: '' })

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'app_config').maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const p = JSON.parse(data.value)
            setAppConfig(prev => ({ ...prev, ...p }))
          } catch {}
        }
      })
  }, [])

  async function saveAppConfig() {
    setAppConfigSaving(true)
    const { error: invokeErr, data: invokeData } = await supabase.functions.invoke(
      'admin-site-settings-write',
      {
        body:    { rows: [{ key: 'app_config', value: JSON.stringify(appConfig) }] },
        headers: { 'x-admin-token': getAdminToken() },
      },
    )
    setAppConfigSaving(false)
    if (invokeErr || !invokeData?.ok) {
      return
    }
    setAppConfigSaved(true)
    setTimeout(() => setAppConfigSaved(false), 2500)
  }

  function addAppConfigItem(field) {
    const val = appConfigNewItem[field]?.trim()
    if (!val || appConfig[field].includes(val)) return
    setAppConfig(prev => ({ ...prev, [field]: [...prev[field], val] }))
    setAppConfigNewItem(prev => ({ ...prev, [field]: '' }))
  }

  function removeAppConfigItem(field, item) {
    setAppConfig(prev => ({ ...prev, [field]: prev[field].filter(v => v !== item) }))
  }

  // Search/filter state
  const [userSearch,     setUserSearch]     = useState("");
  const [userFilter,     setUserFilter]     = useState("Talents");
  const [searchField,    setSearchField]    = useState("all");
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Modal state
  const [addTeamModal, setAddTeamModal] = useState(null); // 'manager' | 'staff'
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "" });
  const [editUser, setEditUser] = useState(null);   // user object being edited

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const [modStats, setModStats] = useState({ pending: 0 });
  const [openDisputeCount, setOpenDisputeCount] = useState(0);

  useEffect(() => {
    async function loadOpenDisputeCount() {
      const { count } = await supabase
        .from('disputes')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'awaiting_response', 'under_review', 'ai_analyzed']);
      setOpenDisputeCount(count || 0);
    }
    loadOpenDisputeCount();
  }, []);

  // Refresh mod stats whenever AI Police tab is opened or a new report fires
  useEffect(() => {
    function refresh() { setModStats(getModerationStats()); }
    refresh();
    window.addEventListener('brandiór:moderation-report', refresh);
    return () => window.removeEventListener('brandiór:moderation-report', refresh);
  }, []);

  useEffect(() => {
    async function verifySession() {
      const session = await validateAdminSession();
      if (!session) { clearAdminSession(); navigate("/admin/login"); return; }
      const role = session.role.toLowerCase().trim();
      if (!["admin", "super admin", "superadmin"].includes(role)) {
        clearAdminSession({ email: session.email, name: session.name, role: session.role }); navigate("/admin/login"); return;
      }
      setAdminUser({ email: session.email, name: session.name || '' });
      setAdminRole(role);
      localStorage.setItem('brandiór_admin_user', JSON.stringify({ email: session.email, name: session.name }));
      localStorage.setItem('brandiór_admin_role', session.role);
      // Register session in DB (first load only — no-op if session_id already set)
      if (!localStorage.getItem('brandiór_admin_session_id')) {
        registerAdminSession({ email: session.email, name: session.name, role: session.role });
      }
    }
    verifySession();
  }, [navigate]);

  // Heartbeat — re-validate every 5 min; redirect if session expired or revoked
  useEffect(() => {
    const iv = setInterval(async () => {
      const session = await validateAdminSession();
      if (!session) { clearAdminSession(); navigate("/admin/login"); }
    }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [navigate]);

  // ── Sync settings from DB so admin sees persisted values ───────────────────
  useEffect(() => {
    loadSettingsFromDB().then(() => setSettings(getAllSettings()))
  }, [])

  // ── Fetch real data from Supabase ────────────────────────────────────────────
  useEffect(() => {
    async function fetchRealData() {
      // Users from profiles table
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (profiles && profiles.length > 0) {
        setUsers(profiles.map(p => ({
          id: p.id,
          name: p.full_name || p.handle || 'Unknown',
          email: p.handle || '',
          role: p.role || 'Talent',
          tier: p.tier || null,
          location: p.location || '—',
          joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          status: p.status || 'active',
          avatar: (p.full_name || p.handle || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
          verified: p.verified || false,
          _raw: p,
        })))
      }

      // Overview stats — all 21 metrics fetched in parallel
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

      const [
        { count: userCount },
        { count: creatorCount },
        { count: brandCount },
        { count: verifiedCreators },
        { count: verifiedBrands },
        { count: pendingVerificationsCount },
        { count: activeCollabs },
        { count: openCollabs },
        { count: completedCollabs },
        { data: gmvData },
        { count: pendingDisputeCount },
        { count: dailySignupCount },
        { count: newReferralCount },
        { count: pitchesTodayCount },
        { data: walletData },
        { data: escrowData },
        { data: pendingWithdrawData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['creator', 'talent']).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'brand').eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['creator', 'talent']).eq('verified', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'brand').eq('verified', true),
        supabase.from('admin_approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('collabs').select('*', { count: 'exact', head: true }).in('status', ['in_progress', 'delivered', 'revision_requested']),
        supabase.from('collabs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('collabs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('collabs').select('total_amount, platform_fee, creator_payout, payment_status, status'),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'pending', 'under_review']),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('referrals').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('profiles').select('wallet_balance'),
        supabase.from('collabs').select('creator_payout, payment_status'),
        supabase.from('payout_requests').select('amount, status').eq('status', 'pending'),
      ])

      const totalGMV = (gmvData || []).filter(r => r.payment_status !== 'unpaid').reduce((s, r) => s + (r.total_amount || 0), 0)
      const brandiorRevenue = (gmvData || []).reduce((s, r) => s + (r.platform_fee || 0), 0)
      const walletBalances = (walletData || []).reduce((s, r) => s + (r.wallet_balance || 0), 0)
      const escrowBalance = (escrowData || []).filter(r => r.payment_status === 'paid').reduce((s, r) => s + (r.creator_payout || 0), 0)
      const pendingWithdrawals = (pendingWithdrawData || []).reduce((s, r) => s + (r.amount || 0), 0)
      const totalCollabs = (activeCollabs || 0) + (openCollabs || 0) + (completedCollabs || 0)
      const conversionRate = totalCollabs > 0 ? Math.round(((completedCollabs || 0) / totalCollabs) * 100) : 0

      setRealStats({
        userCount, creatorCount, brandCount,
        verifiedCreators, verifiedBrands, pendingVerifications: pendingVerificationsCount,
        activeCollabs, openCollabs, completedCollabs,
        totalGMV, brandiorRevenue, walletBalances,
        escrowBalance, pendingWithdrawals, pendingDisputes: pendingDisputeCount,
        dailySignups: dailySignupCount, conversionRate, newReferrals: newReferralCount,
        pitchesToday: pitchesTodayCount, avgCreatorResponse: null, avgBrandResponse: null,
      })

      // Build 30-day daily charts
      const buildDailyCount = (rows, dateField) => {
        const map = {}
        for (let i = 29; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i)
          map[d.toISOString().slice(0, 10)] = 0
        }
        ;(rows || []).forEach(r => {
          const day = new Date(r[dateField]).toISOString().slice(0, 10)
          if (map[day] !== undefined) map[day]++
        })
        return Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count }))
      }
      const buildDailySum = (rows, dateField, valueField) => {
        const map = {}
        for (let i = 29; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i)
          map[d.toISOString().slice(0, 10)] = 0
        }
        ;(rows || []).forEach(r => {
          const day = new Date(r[dateField]).toISOString().slice(0, 10)
          if (map[day] !== undefined) map[day] += (r[valueField] || 0)
        })
        return Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count }))
      }
      const since = new Date(); since.setDate(since.getDate() - 30)
      const [
        { data: recentProfiles },
        { data: recentCollabsAll },
        { data: recentCollabsCompleted },
        { data: recentCollabsRevenue },
        { data: recentDeposits },
        { data: recentWithdrawals },
      ] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', since.toISOString()),
        supabase.from('collabs').select('created_at').gte('created_at', since.toISOString()),
        supabase.from('collabs').select('updated_at').eq('status', 'completed').gte('updated_at', since.toISOString()),
        supabase.from('collabs').select('created_at, platform_fee').eq('payment_status', 'released').gte('created_at', since.toISOString()),
        supabase.from('wallet_topups').select('created_at, amount').eq('status', 'completed').gte('created_at', since.toISOString()),
        supabase.from('payout_requests').select('created_at, amount').gte('created_at', since.toISOString()),
      ])
      setAdminCharts({
        dailySignups:    buildDailyCount(recentProfiles, 'created_at'),
        dailyCollabs:    buildDailyCount(recentCollabsAll, 'created_at'),
        dailyCompleted:  buildDailyCount(recentCollabsCompleted, 'updated_at'),
        dailyRevenue:    buildDailySum(recentCollabsRevenue, 'created_at', 'platform_fee'),
        dailyDeposits:   buildDailySum(recentDeposits, 'created_at', 'amount'),
        dailyWithdrawals: buildDailySum(recentWithdrawals, 'created_at', 'amount'),
      })

      // Team members
      const { data: teamRows } = await supabase.from('admin_users').select('*').order('created_at')
      if (teamRows) {
        const mkAvatar = name => (name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
        const mkLastLogin = ts => ts ? new Date(ts).toLocaleString('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Never'
        const mkMember = r => ({ ...r, avatar: mkAvatar(r.name), lastLogin: mkLastLogin(r.last_login) })
        setAdminsList(teamRows.filter(r => ['admin','super admin','superadmin'].includes((r.role||'').toLowerCase())).map(mkMember))
        setManagers(teamRows.filter(r => r.role === 'manager').map(mkMember))
        setStaffList(teamRows.filter(r => r.role === 'staff').map(mkMember))
      }

      // Approvals queue
      const { data: approvalRows } = await supabase.from('admin_approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      if (approvalRows) {
        setApprovals(approvalRows.map(r => ({
          id: r.id, requester: r.requester_name, requesterRole: r.requester_role,
          type: r.type, description: r.description, target: r.target, targetId: r.target_id,
          timestamp: new Date(r.created_at).toLocaleString('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
          status: r.status,
        })))
      }

      // Activity feed from recent platform events
      const actSince = new Date(); actSince.setHours(actSince.getHours() - 72)
      const [{ data: recentUsers }, { data: recentCollabsAct }] = await Promise.all([
        supabase.from('profiles').select('full_name, company_name, role, created_at').gte('created_at', actSince.toISOString()).order('created_at', { ascending: false }).limit(10),
        supabase.from('collabs').select('content_type, status, created_at, updated_at').gte('updated_at', actSince.toISOString()).order('updated_at', { ascending: false }).limit(10),
      ])
      const toRelative = ts => {
        const diff = Date.now() - new Date(ts).getTime()
        if (diff < 3600000) return `${Math.max(1, Math.round(diff/60000))} min ago`
        if (diff < 86400000) return `${Math.round(diff/3600000)} hr ago`
        return `${Math.round(diff/86400000)} days ago`
      }
      const STATUS_LABEL = { in_progress: 'started', delivered: 'submitted work on', completed: 'completed', cancelled: 'cancelled', revision_requested: 'requested revision on' }
      const feed = [
        ...(recentUsers || []).map(u => ({ text: `New ${u.role === 'brand' ? 'brand' : 'creator'} ${u.full_name || u.company_name || 'user'} joined`, time: toRelative(u.created_at), type: 'new' })),
        ...(recentCollabsAct || []).map(c => ({ text: `Collab ${STATUS_LABEL[c.status] || c.status} (${c.content_type || 'collab'})`, time: toRelative(c.updated_at || c.created_at), type: c.status === 'completed' ? 'complete' : c.status === 'cancelled' ? 'flag' : 'approve' })),
      ].sort((a, b) => 0).slice(0, 8)
      setActivityFeed(feed.length > 0 ? feed : [{ text: 'No recent activity', time: '', type: 'new' }])
    }
    fetchRealData()
  }, [])

  const [realStats, setRealStats] = useState({
    // Users
    userCount: null, creatorCount: null, brandCount: null,
    verifiedCreators: null, verifiedBrands: null, pendingVerifications: null,
    // Collabs
    activeCollabs: null, openCollabs: null, completedCollabs: null,
    // Financial
    totalGMV: null, brandiorRevenue: null, walletBalances: null,
    escrowBalance: null, pendingWithdrawals: null, pendingDisputes: null,
    // Activity
    dailySignups: null, conversionRate: null, newReferrals: null,
    pitchesToday: null, avgCreatorResponse: null, avgBrandResponse: null,
  })
  const [adminCharts, setAdminCharts] = useState(null)
  const [chartRange, setChartRange] = useState(30)

  // ── Financial state ──
  const [finStats, setFinStats]             = useState({ revenue: 0, escrowTotal: 0, releasedTotal: 0, refundedTotal: 0 })
  const [escrowItems, setEscrowItems]       = useState([])
  const [finTransactions, setFinTransactions] = useState([])
  const [wallets, setWallets]               = useState([])
  const [finLoading, setFinLoading]         = useState(false)
  const [walletAdjust, setWalletAdjust]     = useState(null) // { profile, delta, reason }
  const [pitchAdjust,  setPitchAdjust]      = useState(null) // { profile, amount, reason }
  const [payoutTarget, setPayoutTarget]     = useState(null) // creator profile
  const [payoutAmount, setPayoutAmount]     = useState('')
  const [payoutBusy, setPayoutBusy]         = useState(false)

  async function loadFinancials() {
    setFinLoading(true)
    try {
      const [collabsRes, walletsRes] = await Promise.all([
        supabase.from('collabs')
          .select('id, content_type, total_amount, platform_fee, creator_payout, payment_status, status, created_at, brand_id, creator_id')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('profiles')
          .select('id, full_name, company_name, owner_name, role, wallet_balance, extra_pitches, payout_accounts')
          .order('wallet_balance', { ascending: false })
          .limit(50),
      ])

      const collabs = collabsRes.data || []
      const profiles = walletsRes.data || []
      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

      function pName(p) { return p?.company_name || p?.full_name || p?.owner_name || 'Unknown' }

      const paid    = collabs.filter(c => c.payment_status === 'paid')
      const released = collabs.filter(c => c.payment_status === 'released')
      const refunded = collabs.filter(c => c.payment_status === 'refunded')

      setFinStats({
        revenue:        released.reduce((s, c) => s + (c.platform_fee || 0), 0),
        escrowTotal:    paid.reduce((s, c) => s + (c.total_amount || 0), 0),
        releasedTotal:  released.reduce((s, c) => s + (c.creator_payout || 0), 0),
        refundedTotal:  refunded.reduce((s, c) => s + (c.total_amount || 0), 0),
      })

      setEscrowItems(paid.map(c => ({
        ...c,
        brandName:   pName(profileMap[c.brand_id]),
        creatorName: pName(profileMap[c.creator_id]),
      })))

      setFinTransactions(collabs.filter(c => c.payment_status !== 'unpaid').map(c => ({
        id: c.id.slice(0, 8).toUpperCase(),
        fullId: c.id,
        creator: pName(profileMap[c.creator_id]),
        brand:   pName(profileMap[c.brand_id]),
        amount:  c.total_amount,
        fee:     c.platform_fee || 0,
        net:     c.creator_payout || 0,
        date:    new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
        status:  c.payment_status,
        type:    c.content_type || 'Collab',
      })))

      setWallets(profiles.filter(p => (p.wallet_balance || 0) > 0))
    } finally {
      setFinLoading(false)
    }
  }

  async function releaseEscrow(item) {
    const collabId = item.fullId || item.id
    const { data, error } = await supabase.functions.invoke('admin-collab-release', {
      body: { collab_id: collabId, next: 'release', note: 'Admin escrow release' },
      headers: { 'x-admin-token': getAdminToken() },
    })
    if (error || data?.error) {
      const msg = data?.error || error?.message || 'Release failed'
      showToast(`Release failed: ${msg}`, 'error')
      return
    }
    if (data?.already_released) {
      showToast('Already released — no action taken', 'info')
      loadFinancials()
      return
    }
    auditLog('release_escrow', 'collab', collabId, item.creatorName, { amount: item.creator_payout })
    showToast(`Released ₦${(item.creator_payout || 0).toLocaleString()} to ${item.creatorName}`)
    loadFinancials()
  }

  async function refundEscrow(item) {
    const collabId = item.fullId || item.id
    const { data, error } = await supabase.functions.invoke('admin-escrow-refund', {
      body: { collab_id: collabId },
      headers: { 'x-admin-token': getAdminToken() },
    })
    if (error || data?.error) {
      const msg = data?.error || error?.message || 'Refund failed'
      showToast(`Refund failed: ${msg}`, 'error')
      return
    }
    if (data?.already_refunded) {
      showToast('Already refunded — no action taken', 'info')
      loadFinancials()
      return
    }
    auditLog('refund_escrow', 'collab', collabId, item.brandName, { amount: item.total_amount })
    const toastMsg = data?.manual_action_needed
      ? `Refund of ₦${(item.total_amount || 0).toLocaleString()} queued — process manually via Rubies dashboard`
      : `Refunded ₦${(item.total_amount || 0).toLocaleString()} to ${item.brandName}`
    showToast(toastMsg, data?.manual_action_needed ? 'warning' : 'success')
    loadFinancials()
  }

  async function applyWalletAdjust() {
    if (!walletAdjust) return
    const { profile, delta, reason } = walletAdjust
    const n = Number(delta)
    const { error } = await supabase.functions.invoke('admin-adjust-wallet', {
      body: { action: n >= 0 ? 'credit' : 'debit', user_id: profile.id, amount: Math.abs(n), note: reason || undefined }
    })
    if (error) { showToast('Adjustment failed', 'error'); return }
    auditLog(n >= 0 ? 'wallet_credit' : 'wallet_debit', 'user', profile.id, pName(profile), { delta: n, reason });
    showToast(`Wallet for ${pName(profile)} adjusted — ${reason || 'no reason given'}`)
    setWalletAdjust(null)
    loadFinancials()
  }

  async function applyPitchAdjust() {
    if (!pitchAdjust) return
    const { profile, amount, reason } = pitchAdjust
    const current = profile.extra_pitches || 0
    const newTotal = Math.max(0, current + Number(amount))
    await saveProfile(profile.id, { extra_pitches: newTotal })
    await supabase.from('notifications').insert({
      user_id: profile.id,
      title:   'Pitches added to your account',
      body:    `${Number(amount)} extra pitches have been added by the Brandior team. You now have ${newTotal} extra pitches available.${reason ? ` (${reason})` : ''}`,
      type:    'general',
      data:    {},
    })
    auditLog('pitch_topup', 'user', profile.id, pName(profile), { amount: Number(amount), reason })
    showToast(`${Number(amount)} pitches added to ${pName(profile)} — total now: ${newTotal}`)
    setPitchAdjust(null)
    loadFinancials()
  }

  function pName(p) { return p?.company_name || p?.full_name || p?.owner_name || 'Unknown' }

  async function triggerPayout() {
    if (!payoutTarget || !payoutAmount) return
    setPayoutBusy(true)
    try {
      const amt = parseInt(payoutAmount.replace(/\D/g, ''), 10)
      if (amt < 100) { showToast('Minimum payout is ₦100', 'error'); return }
      const adminToken = getAdminToken()
      if (!adminToken) { showToast('Session expired. Please log in again.', 'error'); return }
      const { data, error } = await supabase.functions.invoke('payout-transfer', {
        body: { amount: amt, target_profile_id: payoutTarget.id },
        headers: { 'x-admin-token': adminToken },
      })
      if (error || !data?.ok) {
        showToast(data?.error || error?.message || 'Transfer failed', 'error')
        return
      }
      showToast(`Transferred ₦${amt.toLocaleString()} to ${pName(payoutTarget)}`)
      setPayoutTarget(null); setPayoutAmount('')
      loadFinancials()
    } catch (e) {
      showToast(e.message || 'Transfer failed', 'error')
    } finally {
      setPayoutBusy(false)
    }
  }

  // Persist users to localStorage whenever they change
  useEffect(() => { localStorage.setItem('brandior_admin_users', JSON.stringify(users)) }, [users])

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const auditLog = (action, targetType, targetId, targetLabel, detail = {}) => {
    const admin = JSON.parse(localStorage.getItem('brandiór_admin_user') || '{}');
    supabase.from('admin_audit_log').insert({
      admin_name:   admin.name  || 'Admin',
      admin_role:   admin.role  || 'admin',
      action,
      target_type:  targetType  ?? null,
      target_id:    targetId    ? String(targetId) : null,
      target_label: targetLabel ?? null,
      detail,
    }).then(() => {});
  };

  const handleLogout = async () => {
    const token = getAdminToken();
    if (token) callAdminFn('admin-revoke-session', { token, selfRevoke: true }).catch(() => {});
    await clearAdminSession(adminUser);
    navigate("/admin/login");
  };

  const handleApprovalAction = async (id, action) => {
    const item = approvals.find((a) => a.id === id);
    if (action === 'approved' && item) {
      if (item.type === 'Verify Talent' && item.targetId) {
        await saveProfile(item.targetId, { verified: true })
        setUsers(prev => prev.map(u => u.id === item.targetId ? { ...u, verified: true } : u))
      } else if (item.type === 'Suspend User' && item.targetId) {
        await saveProfile(item.targetId, { status: 'suspended' })
        setUsers(prev => prev.map(u => u.id === item.targetId ? { ...u, status: 'suspended' } : u))
      } else if (item.type === 'Process Refund') {
        showToast(`Refund initiated for ${item.target}.`, 'info')
      }
    }
    const adminUser = JSON.parse(localStorage.getItem('brandiór_admin_user') || '{}')
    await supabase.from('admin_approvals').update({ status: action, reviewed_by: adminUser.name || 'Admin', reviewed_at: new Date().toISOString() }).eq('id', id)
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setApprovalHistory((prev) => [{ ...item, status: action, reviewedAt: "Just now" }, ...prev]);
    showToast(`Request ${action === "approved" ? "approved" : "rejected"} successfully.`);
  };

  const handleBanUser = (userId) => {
    const target = users.find(u => u.id === userId);
    setConfirmModal({
      title: "Ban User",
      message: "Are you sure you want to permanently ban this user? This action cannot be undone.",
      onConfirm: async () => {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "banned" } : u));
        await saveProfile(userId, { status: 'banned' })
        auditLog('ban_user', 'user', userId, target?.name);
        setConfirmModal(null);
        showToast("User has been banned.");
      },
    });
  };

  const handleSuspendUser = async (userId) => {
    const user = users.find(u => u.id === userId)
    const newStatus = user?.status === "suspended" ? "active" : "suspended"
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    await saveProfile(userId, { status: newStatus })
    auditLog(newStatus === 'suspended' ? 'suspend_user' : 'unsuspend_user', 'user', userId, user?.name);
    showToast("User status updated.");
  };

  const handleVerifyUser = async (userId) => {
    const target = users.find(u => u.id === userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verified: true } : u));
    await saveProfile(userId, { verified: true })
    auditLog('verify_user', 'user', userId, target?.name);
    showToast("User verified successfully.");
  };

  const handleSaveUser = async () => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
    await saveProfile(editUser.id, {
      full_name: editUser.name,
      location: editUser.location,
      status: editUser.status,
      verified: editUser.verified,
    })
    setEditUser(null);
    showToast("User profile updated successfully.");
  };

  const handleDeleteUser = (userId) => {
    const target = users.find(u => u.id === userId);
    setConfirmModal({
      title: "Delete Account",
      message: `Permanently delete ${target?.name}'s account? This sets their profile to deleted and cannot be undone.`,
      onConfirm: async () => {
        await saveProfile(userId, { status: 'deleted' });
        setUsers(prev => prev.filter(u => u.id !== userId));
        auditLog('delete_user', 'user', userId, target?.name);
        setConfirmModal(null);
        setViewUser(null);
        showToast("Account deleted.");
      },
    });
  };

  const handleResetPassword = async (userId) => {
    const target = users.find(u => u.id === userId);
    const email = target?._raw?.email;
    if (!email) { showToast("No email found for this user.", "error"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { showToast(error.message, "error"); return; }
    auditLog('reset_password', 'user', userId, target?.name);
    showToast(`Password reset email sent to ${email}`);
  };

  const handleForceLogout = async (userId) => {
    const target = users.find(u => u.id === userId);
    await saveProfile(userId, { force_logout_at: new Date().toISOString() });
    auditLog('force_logout', 'user', userId, target?.name);
    showToast(`${target?.name} will be logged out on next app open.`);
  };

  const handleToggleRestriction = async (userId, key) => {
    const target = users.find(u => u.id === userId);
    const current = target?._raw?.restrictions || {};
    const updated = { ...current, [key]: !current[key] };
    await saveProfile(userId, { restrictions: updated });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, _raw: { ...u._raw, restrictions: updated } } : u));
    auditLog('toggle_restriction', 'user', userId, target?.name, { key, value: updated[key] });
    showToast(`${key} ${updated[key] ? "disabled" : "enabled"} for ${target?.name}`);
  };

  const handleUserAction = (type, userId, ...args) => {
    if (type === 'verify')             handleVerifyUser(userId);
    else if (type === 'suspend')       handleSuspendUser(userId);
    else if (type === 'ban')           handleBanUser(userId);
    else if (type === 'delete')        handleDeleteUser(userId);
    else if (type === 'resetPassword') handleResetPassword(userId);
    else if (type === 'forceLogout')   handleForceLogout(userId);
    else if (type === 'toggleRestriction') handleToggleRestriction(userId, args[0]);
  };

  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role) return;
    const role = newMember.role;
    const { data: inserted, error } = await supabase.from('admin_users').insert({
      name: newMember.name.trim(), email: newMember.email.trim().toLowerCase(), role, status: 'Active',
    }).select().single()
    if (error) { showToast(error.message || 'Failed to add team member', 'error'); return; }
    const mkAvatar = name => (name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    const member = { ...inserted, avatar: mkAvatar(inserted.name), lastLogin: 'Never' };
    if (['admin','super admin','superadmin'].includes(role.toLowerCase())) setAdminsList(p => [...p, member]);
    else if (role === 'manager') setManagers(p => [...p, member]);
    else setStaffList(p => [...p, member]);
    setAddTeamModal(null);
    setNewMember({ name: "", email: "", role: "" });
    auditLog?.('add_team_member', 'admin_users', inserted.id, inserted.name, { role });
    showToast(`${inserted.name} added as ${role}.`);
  };

  async function loadActiveSessions() {
    const token = getAdminToken();
    if (!token) return;
    const { ok, data } = await callAdminFn('admin-get-sessions', { token });
    if (ok && Array.isArray(data?.sessions)) setActiveSessions(data.sessions);
  }

  async function handleRevokeSession(targetId) {
    const token = getAdminToken();
    if (!token) return;
    await callAdminFn('admin-revoke-session', { token, targetSessionId: targetId });
    await loadActiveSessions();
    showToast('Session revoked');
  }

  async function handleRevokeAllSessions() {
    if (!window.confirm('Revoke all other active admin sessions? They will be signed out immediately.')) return;
    const token = getAdminToken();
    if (!token) return;
    await callAdminFn('admin-revoke-session', { token, revokeAll: true });
    await loadActiveSessions();
    showToast('All other sessions revoked');
  }

  const handleRemoveTeamMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} (${member.role}) from the team?`)) return;
    const { error } = await supabase.from('admin_users').delete().eq('id', member.id);
    if (error) { showToast(error.message || 'Failed to remove member', 'error'); return; }
    const role = (member.role || '').toLowerCase();
    if (['admin','super admin','superadmin'].includes(role)) setAdminsList(p => p.filter(m => m.id !== member.id));
    else if (role === 'manager') setManagers(p => p.filter(m => m.id !== member.id));
    else setStaffList(p => p.filter(m => m.id !== member.id));
    auditLog?.('remove_team_member', 'admin_users', member.id, member.name, { role: member.role });
    showToast(`${member.name} removed.`);
  };

  const filteredUsers = users.filter((u) => {
    const p   = u._raw || {};
    const term = userSearch.toLowerCase().trim();
    const matchSearch = !term || (() => {
      if (searchField === 'email')         return (p.email         || '').toLowerCase().includes(term);
      if (searchField === 'phone')         return (p.phone         || '').toLowerCase().includes(term);
      if (searchField === 'company_name')  return (p.company_name  || '').toLowerCase().includes(term);
      if (searchField === 'full_name')     return (p.full_name     || '').toLowerCase().includes(term);
      if (searchField === 'referral_code') return (p.referral_code || '').toLowerCase().includes(term);
      if (searchField === 'handle')        return (p.handle        || '').toLowerCase().includes(term);
      return [p.full_name, p.email, p.phone, p.company_name, p.handle, p.referral_code, p.owner_name]
        .some(f => (f || '').toLowerCase().includes(term));
    })();
    const matchRole = userFilter === "Suspended" || userFilter === "Banned"
      ? true
      : userFilter === "Talents" ? ['Talent', 'talent', 'creator'].includes(u.role) : ['Brand', 'brand'].includes(u.role);
    const matchStatus = userFilter === "Suspended" ? u.status === "suspended"
      : userFilter === "Banned" ? u.status === "banned"
      : true;
    return matchSearch && matchRole && matchStatus;
  });

  // ─── TABS ─────────────────────────────────────────────────────────────────

  const renderOverview = () => {
    const fmtNum   = v => v == null ? "—" : v.toLocaleString()
    const fmtMoney = v => v == null ? "₦0" : `₦${v.toLocaleString()}`
    const fmtPct   = v => v == null ? "—" : `${v}%`

    // Top stat strip
    const allStats = [
      { label: "Total Users",        value: fmtNum(realStats.userCount),           icon: Users,      color: "#7c3aed", bg: "#f3f0ff" },
      { label: "Creators",           value: fmtNum(realStats.creatorCount),         icon: Users,      color: "#0ea5e9", bg: "#e0f2fe" },
      { label: "Brands",             value: fmtNum(realStats.brandCount),           icon: Briefcase,  color: "#f97316", bg: "#fff7ed" },
      { label: "Verified",           value: fmtNum(realStats.verifiedCreators),     icon: BadgeCheck, color: "#10b981", bg: "#ecfdf5" },
      { label: "Wallet Balance",     value: fmtMoney(realStats.walletBalances),     icon: CreditCard, color: "#6366f1", bg: "#eef2ff" },
      { label: "Active Campaigns",   value: fmtNum(realStats.activeCollabs),        icon: Activity,   color: "#ec4899", bg: "#fdf2f8" },
    ]
    const creatorStats = [
      { label: "Active Creators",    value: fmtNum(realStats.creatorCount),         icon: Users,      color: "#7c3aed", bg: "#f3f0ff" },
      { label: "Verified Creators",  value: fmtNum(realStats.verifiedCreators),     icon: BadgeCheck, color: "#10b981", bg: "#ecfdf5" },
      { label: "Pending Verify",     value: fmtNum(realStats.pendingVerifications), icon: Clock,      color: "#d97706", bg: "#fef3c7" },
      { label: "Pitches Today",      value: fmtNum(realStats.pitchesToday),         icon: Send,       color: "#7c3aed", bg: "#f3f0ff" },
      { label: "Creator Payouts",    value: fmtMoney(realStats.escrowBalance),      icon: Wallet,     color: "#16a34a", bg: "#dcfce7" },
      { label: "Avg Response",       value: realStats.avgCreatorResponse ? `${realStats.avgCreatorResponse}h` : "—", icon: Clock, color: "#0ea5e9", bg: "#e0f2fe" },
    ]
    const brandStats = [
      { label: "Active Brands",      value: fmtNum(realStats.brandCount),           icon: Briefcase,  color: "#f97316", bg: "#fff7ed" },
      { label: "Verified Brands",    value: fmtNum(realStats.verifiedBrands),       icon: BadgeCheck, color: "#10b981", bg: "#ecfdf5" },
      { label: "Total GMV",          value: fmtMoney(realStats.totalGMV),           icon: TrendingUp, color: "#16a34a", bg: "#dcfce7" },
      { label: "Revenue",            value: fmtMoney(realStats.brandiorRevenue),    icon: DollarSign, color: "#4f46e5", bg: "#eef2ff" },
      { label: "In Escrow",          value: fmtMoney(realStats.escrowBalance),      icon: Shield,     color: "#6366f1", bg: "#eef2ff" },
      { label: "Avg Response",       value: realStats.avgBrandResponse ? `${realStats.avgBrandResponse}h` : "—", icon: Clock, color: "#d97706", bg: "#fef3c7" },
    ]
    const platformStats = [
      { label: "Total Users",        value: fmtNum(realStats.userCount),            icon: Users,      color: "#7c3aed", bg: "#f3f0ff" },
      { label: "Completed Collabs",  value: fmtNum(realStats.completedCollabs),     icon: CheckCircle,color: "#16a34a", bg: "#dcfce7" },
      { label: "Conversion Rate",    value: fmtPct(realStats.conversionRate),       icon: BarChart2,  color: "#10b981", bg: "#ecfdf5" },
      { label: "Pending Disputes",   value: fmtNum(realStats.pendingDisputes),      icon: Scale,      color: "#ef4444", bg: "#fee2e2" },
      { label: "Platform Revenue",   value: fmtMoney(realStats.brandiorRevenue),    icon: TrendingUp, color: "#4f46e5", bg: "#eef2ff" },
      { label: "Daily Signups",      value: fmtNum(realStats.dailySignups),         icon: Users,      color: "#0ea5e9", bg: "#e0f2fe" },
    ]

    const statsRow = overviewFilter === "creator" ? creatorStats : overviewFilter === "brand" ? brandStats : overviewFilter === "platform" ? platformStats : allStats

    const allFlowItems = [
      { label: "Creators",       sub: "Talent building the future",    value: fmtNum(realStats.creatorCount),    color: "#7c3aed", bg: "#f3f0ff", icon: Users },
      { label: "Brands",         sub: "Businesses creating impact",    value: fmtNum(realStats.brandCount),      color: "#f97316", bg: "#fff7ed", icon: Briefcase },
      { label: "Campaigns",      sub: "Active opportunities",          value: fmtNum(realStats.activeCollabs),   color: "#0ea5e9", bg: "#e0f2fe", icon: Activity },
      { label: "Collaborations", sub: "Creator-brand matches",         value: fmtNum(realStats.openCollabs),     color: "#10b981", bg: "#ecfdf5", icon: Layers },
      { label: "Payments",       sub: "Secure & transparent",          value: fmtMoney(realStats.totalGMV),      color: "#6366f1", bg: "#eef2ff", icon: CreditCard },
    ]
    const creatorFlowItems = [
      { label: "Active Creators",  sub: "On the platform",         value: fmtNum(realStats.creatorCount),       color: "#7c3aed", bg: "#f3f0ff", icon: Users },
      { label: "Verified",         sub: "ID & portfolio confirmed", value: fmtNum(realStats.verifiedCreators),  color: "#10b981", bg: "#ecfdf5", icon: BadgeCheck },
      { label: "Pitches Today",    sub: "Applications sent",        value: fmtNum(realStats.pitchesToday),       color: "#0ea5e9", bg: "#e0f2fe", icon: Send },
      { label: "Pending Verify",   sub: "Awaiting review",          value: fmtNum(realStats.pendingVerifications), color: "#f97316", bg: "#fff7ed", icon: Clock },
      { label: "Wallet Balance",   sub: "Across all creators",      value: fmtMoney(realStats.walletBalances),  color: "#6366f1", bg: "#eef2ff", icon: Wallet },
    ]
    const brandFlowItems = [
      { label: "Active Brands",    sub: "On the platform",          value: fmtNum(realStats.brandCount),        color: "#f97316", bg: "#fff7ed", icon: Briefcase },
      { label: "Verified Brands",  sub: "Identity confirmed",       value: fmtNum(realStats.verifiedBrands),   color: "#10b981", bg: "#ecfdf5", icon: BadgeCheck },
      { label: "Total GMV",        sub: "Brand spend processed",    value: fmtMoney(realStats.totalGMV),        color: "#16a34a", bg: "#dcfce7", icon: TrendingUp },
      { label: "In Escrow",        sub: "Locked for active collabs",value: fmtMoney(realStats.escrowBalance),  color: "#6366f1", bg: "#eef2ff", icon: Shield },
      { label: "Revenue",          sub: "Platform commission",      value: fmtMoney(realStats.brandiorRevenue), color: "#4f46e5", bg: "#eef2ff", icon: DollarSign },
    ]
    const platformFlowItems = [
      { label: "Total Users",      sub: "All registered accounts",  value: fmtNum(realStats.userCount),         color: "#7c3aed", bg: "#f3f0ff", icon: Users },
      { label: "Completed Collabs",sub: "Finished campaigns",       value: fmtNum(realStats.completedCollabs),  color: "#10b981", bg: "#ecfdf5", icon: CheckCircle },
      { label: "Pending Disputes", sub: "Needs resolution",         value: fmtNum(realStats.pendingDisputes),   color: "#ef4444", bg: "#fee2e2", icon: Scale },
      { label: "Platform Revenue", sub: "Total commission earned",  value: fmtMoney(realStats.brandiorRevenue), color: "#4f46e5", bg: "#eef2ff", icon: TrendingUp },
      { label: "Daily Signups",    sub: "New users today",          value: fmtNum(realStats.dailySignups),      color: "#0ea5e9", bg: "#e0f2fe", icon: Users },
    ]
    const flowItems = overviewFilter === "creator" ? creatorFlowItems : overviewFilter === "brand" ? brandFlowItems : overviewFilter === "platform" ? platformFlowItems : allFlowItems

    const systemAlerts = [
      { label: "Pending Verifications", value: realStats.pendingVerifications ?? 0, color: "#f97316", Icon: BadgeCheck, tab: "users" },
      { label: "Open Disputes",         value: openDisputeCount,                    color: "#ef4444", Icon: Scale,      tab: "disputes2" },
      { label: "Reported Content",      value: modStats.pending ?? 0,              color: "#7c3aed", Icon: ShieldAlert, tab: "ai-police" },
      { label: "Escrow Balance",        value: fmtMoney(realStats.escrowBalance),   color: "#6366f1", Icon: Shield,     tab: "escrow" },
    ]

    const moneyFlow = [
      { label: "Brand Payment", Icon: Briefcase, color: "#f97316" },
      { label: "Escrow",        Icon: Shield,    color: "#6366f1" },
      { label: "Creator Wallet",Icon: Wallet,    color: "#10b981" },
      { label: "Withdrawal",    Icon: ArrowUpRight, color: "#0ea5e9" },
    ]

    const quickActions = [
      { label: "Add Creator",          Icon: Users,      color: "#7c3aed", tab: "users" },
      { label: "Add Brand",            Icon: Briefcase,  color: "#f97316", tab: "users" },
      { label: "Create Campaign",      Icon: Activity,   color: "#0ea5e9", tab: "jobs" },
      { label: "Review Verifications", Icon: BadgeCheck, color: "#10b981", tab: "users" },
      { label: "Manage Disputes",      Icon: Scale,      color: "#ef4444", tab: "disputes2" },
      { label: "Platform Settings",    Icon: Settings,   color: "#6366f1", tab: "system" },
    ]

    return (
      <div className="space-y-5">
        {/* ── Top stat strip ── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
          {statsRow.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl p-4" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 15, height: 15, color }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, lineHeight: 1.2 }}>{label}</p>
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: T.text, lineHeight: 1 }} className="tabular-nums">{value}</p>
              <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>Last 30 days</p>
            </div>
          ))}
        </div>

        {/* ── Three column layout ── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.6fr 1fr" }}>
          {/* ── Ecosystem Flow ── */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>Ecosystem Flow</p>
            <div className="space-y-1">
              {flowItems.map(({ label, sub, value, color, bg, icon: Icon }, i) => (
                <div key={label}>
                  <div className="flex items-center gap-3 py-2.5 rounded-xl px-2" style={{ backgroundColor: T.hover }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 16, height: 16, color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</p>
                      <p style={{ fontSize: 11, color: T.textMuted }}>{sub}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 800, color, flexShrink: 0 }}>{value}</p>
                  </div>
                  {i < flowItems.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <div style={{ width: 1.5, height: 14, backgroundColor: T.cardBd }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Marketplace Overview ── */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 12 }}>Marketplace Overview</p>
            <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `1.5px dashed ${T.cardBd}` }} />
              <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: `1px dashed ${T.divider}` }} />
              <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: T.card, border: `2px solid ${T.cardBd}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <img src="/Brandiör-2.png" style={{ width: 36, height: 36, objectFit: "contain" }} alt="" />
              </div>
              {[
                { label: fmtNum(realStats.creatorCount),  sub: "Creators",       color: "#7c3aed", Icon: Users,      angle: -90 },
                { label: fmtNum(realStats.brandCount),    sub: "Brands",         color: "#f97316", Icon: Briefcase,  angle: 30 },
                { label: fmtNum(realStats.activeCollabs), sub: "Campaigns",      color: "#0ea5e9", Icon: Activity,   angle: 150 },
                { label: fmtMoney(realStats.totalGMV),    sub: "Payments",       color: "#10b981", Icon: CreditCard, angle: 210 },
                { label: fmtNum(realStats.openCollabs),   sub: "Collaborations", color: "#6366f1", Icon: Layers,     angle: 330 },
              ].map(({ label, sub, color, Icon, angle }) => {
                const rad = (angle * Math.PI) / 180
                const r = 95
                const x = Math.cos(rad) * r
                const y = Math.sin(rad) * r
                return (
                  <div key={sub} style={{ position: "absolute", transform: `translate(${x}px,${y}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${color}30` }}>
                      <Icon style={{ width: 16, height: 16, color }} />
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: T.text, textAlign: "center", whiteSpace: "nowrap" }}>{label}</p>
                    <p style={{ fontSize: 10, color: T.textMuted, textAlign: "center" }}>{sub}</p>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: "Active Collabs",    value: fmtNum(realStats.openCollabs),       color: "#7c3aed" },
                { label: "Pending Approvals", value: fmtNum(pendingCount),                color: "#f97316" },
                { label: "Completed",         value: fmtNum(realStats.completedCollabs),  color: "#10b981" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: T.row }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color }} className="tabular-nums">{value}</p>
                  <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: Alerts + Activity ── */}
          <div className="space-y-4">
            {/* System Alerts */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: 14, fontWeight: 800, color: T.text }}>System Alerts</p>
                <button onClick={() => setActiveTab("audit")} style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all</button>
              </div>
              <div className="space-y-2">
                {systemAlerts.map(({ label, value, color, Icon, tab }) => (
                  <button key={label} onClick={() => setActiveTab(tab)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
                    style={{ backgroundColor: T.hover, border: `1px solid ${T.cardBd}`, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = T.hoverBd}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = T.hover}>
                    <div className="flex items-center gap-2.5">
                      <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 13, height: 13, color }} />
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub }}>{label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 800, color: typeof value === "string" ? T.text : (value > 0 ? color : "#10b981") }} className="tabular-nums">
                        {typeof value === "string" ? value : (value > 0 ? value : 0)}
                      </span>
                      <ChevronRight style={{ width: 12, height: 12, color: T.textMuted }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Activity */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Live Activity</p>
                <button onClick={() => setActiveTab("audit")} style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all</button>
              </div>
              <div className="space-y-2.5">
                {activityFeed.length === 0 ? (
                  <p style={{ fontSize: 12, color: T.textMuted }}>No recent activity</p>
                ) : activityFeed.slice(0, 6).map((a) => {
                  const dotColor = a.type === "flag" ? "#ef4444" : a.type === "approve" ? "#10b981" : "#7c3aed"
                  const icons = { flag: ShieldAlert, approve: CheckCircle, signup: Users, collab: Layers, pitch: Send, wallet: Wallet }
                  const AIcon = icons[a.type] || Activity
                  return (
                    <div key={a.id} className="flex items-center gap-2.5">
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: dotColor + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <AIcon style={{ width: 12, height: 12, color: dotColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: T.textSub, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.text}</p>
                        <p style={{ fontSize: 10, color: T.textMuted }}>{a.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Financial Overview ── */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>Financial Overview</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1.2fr" }}>
            {[
              { label: "Total GMV",           value: fmtMoney(realStats.totalGMV),           color: "#7c3aed" },
              { label: "Platform Revenue",     value: fmtMoney(realStats.brandiorRevenue),    color: "#10b981" },
              { label: "Escrow Balance",       value: fmtMoney(realStats.escrowBalance),      color: "#6366f1" },
              { label: "Pending Withdrawals",  value: fmtMoney(realStats.pendingWithdrawals), color: "#f97316" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: T.row }}>
                <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color }} className="tabular-nums">{value}</p>
                <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>—</p>
              </div>
            ))}
            <div className="rounded-xl p-4" style={{ backgroundColor: T.row }}>
              <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 12 }}>Money Flow</p>
              <div className="flex items-center gap-1">
                {moneyFlow.map(({ label, Icon, color }, i) => (
                  <div key={label} className="flex items-center gap-1">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 12, height: 12, color }} />
                      </div>
                      <p style={{ fontSize: 9, color: T.textMuted, textAlign: "center", lineHeight: 1.2, maxWidth: 36 }}>{label}</p>
                    </div>
                    {i < moneyFlow.length - 1 && <ArrowUpRight style={{ width: 10, height: 10, color: T.textMuted, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBd}` }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>Quick Actions</p>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map(({ label, Icon, color, tab }) => (
              <button key={label} onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                style={{ backgroundColor: T.row, border: `1px solid ${T.cardBd}`, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = color + "15"; e.currentTarget.style.borderColor = color + "50"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.row; e.currentTarget.style.borderColor = T.cardBd; }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 12, height: 12, color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.textSub }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAnalytics = () => {
    if (!adminCharts) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" /></div>

    const slice = (data) => chartRange === 7 ? data.slice(-7) : data
    const isMoney = (key) => key === 'dailyRevenue' || key === 'dailyDeposits' || key === 'dailyWithdrawals'
    const fmtTick = (v, key) => isMoney(key) ? `₦${(v/1000).toFixed(0)}k` : v
    const fmtTooltip = (v, key) => isMoney(key) ? `₦${v.toLocaleString()}` : v

    const charts = [
      { key: 'dailySignups',    title: 'Signups',                    color: '#4f46e5' },
      { key: 'dailyRevenue',    title: 'Revenue (₦)',                color: '#16a34a' },
      { key: 'dailyCollabs',    title: 'Campaigns Created',          color: '#0ea5e9' },
      { key: 'dailyCompleted',  title: 'Successful Collaborations',  color: '#7c3aed' },
      { key: 'dailyDeposits',   title: 'Wallet Deposits (₦)',        color: '#f97316' },
      { key: 'dailyWithdrawals',title: 'Withdrawals (₦)',            color: '#ef4444' },
    ]

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Platform Analytics</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[7, 30].map(r => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                style={chartRange === r
                  ? { backgroundColor: '#fff', color: '#4f46e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#6b7280' }}
              >{r}d</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {charts.map(({ key, title, color }) => {
            const data = slice(adminCharts[key] || [])
            const hasData = data.some(d => d.count > 0)
            const total = data.reduce((s, d) => s + d.count, 0)
            return (
              <div key={key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>
                    {isMoney(key) ? `₦${total.toLocaleString()}` : total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Last {chartRange} days</p>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data} barSize={chartRange === 7 ? 22 : 8}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={chartRange === 7 ? 0 : 4} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9 }} width={isMoney(key) ? 38 : 24} tickLine={false} axisLine={false}
                        tickFormatter={v => fmtTick(v, key)} />
                      <Tooltip formatter={(v) => [fmtTooltip(v, key), title]} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-300">No data yet</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderUsers = () => {
    const talentCount    = users.filter(u => u.role === "Talent").length;
    const brandCount     = users.filter(u => u.role === "Brand").length;
    const suspendedCount = users.filter(u => u.status === "suspended").length;
    const bannedCount    = users.filter(u => u.status === "banned").length;

    const accentMap = {
      Talents:   { color: "#7c3aed", bg: "#ede9fe" },
      Brands:    { color: "#0ea5e9", bg: "#dbeafe" },
      Suspended: { color: "#d97706", bg: "#fef3c7" },
      Banned:    { color: "#dc2626", bg: "#fee2e2" },
    }
    const accentColor = accentMap[userFilter]?.color ?? "#7c3aed";
    const accentBg    = accentMap[userFilter]?.bg    ?? "#ede9fe";

    return (
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit flex-wrap">
          {[
            { key: "Talents",   label: "Talents",   count: talentCount    },
            { key: "Brands",    label: "Brands",    count: brandCount     },
            { key: "Suspended", label: "Suspended", count: suspendedCount },
            { key: "Banned",    label: "Banned",    count: bannedCount    },
          ].map(({ key, label, count }) => {
            const { color, bg } = accentMap[key];
            return (
              <button
                key={key}
                onClick={() => { setUserFilter(key); setUserSearch("") }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={userFilter === key
                  ? { backgroundColor: bg, color }
                  : { color: "#94a3b8" }}
              >
                {label}
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={userFilter === key
                    ? { backgroundColor: color, color: "#fff" }
                    : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-2">
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 outline-none bg-gray-50 flex-shrink-0"
              style={{ color: accentColor }}>
              <option value="all">All fields</option>
              <option value="full_name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="company_name">Brand name</option>
              <option value="handle">Username</option>
              <option value="referral_code">Referral code</option>
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${userFilter.toLowerCase()}...`}
                value={userSearch}
                onChange={(e) => setUserSearch(stripInjection(e.target.value))}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier / Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No {userFilter.toLowerCase()} found.</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={user.avatar} size="sm" color={accentColor} />
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            {user.name}
                            {user.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: accentBg, color: accentColor }}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.location}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewUser(user)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button onClick={() => setEditUser({ ...user })}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-white"
                          style={{ backgroundColor: accentColor }}>
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        {/* ⋯ More actions */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                            <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          {openActionMenu === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenu(null)} />
                              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-48">
                                {!user.verified && (
                                  <MenuRow icon={CheckCircle} label="Verify" color="#16a34a" onClick={() => { setOpenActionMenu(null); handleVerifyUser(user.id); }} />
                                )}
                                <MenuRow icon={ShieldAlert} label={user.status === "suspended" ? "Unsuspend" : "Suspend"} color="#d97706"
                                  onClick={() => { setOpenActionMenu(null); handleSuspendUser(user.id); }} />
                                <MenuRow icon={XCircle} label="Ban" color="#dc2626"
                                  onClick={() => { setOpenActionMenu(null); handleBanUser(user.id); }} />
                                <MenuRow icon={RotateCcw} label="Reset password" color="#4f46e5"
                                  onClick={() => { setOpenActionMenu(null); handleResetPassword(user.id); }} />
                                <MenuRow icon={LogOut} label="Force logout" color="#d97706"
                                  onClick={() => { setOpenActionMenu(null); handleForceLogout(user.id); }} />
                                <div className="border-t border-gray-100 my-1" />
                                <MenuRow icon={MessageSquare} label={(user._raw?.restrictions?.messaging ? "Enable" : "Disable") + " messaging"} color="#6366f1"
                                  onClick={() => { setOpenActionMenu(null); handleToggleRestriction(user.id, "messaging"); }} />
                                <MenuRow icon={CreditCard} label={(user._raw?.restrictions?.withdrawals ? "Enable" : "Disable") + " withdrawals"} color="#f97316"
                                  onClick={() => { setOpenActionMenu(null); handleToggleRestriction(user.id, "withdrawals"); }} />
                                {['Talent','talent','creator'].includes(user.role) && (
                                  <MenuRow icon={Send} label={(user._raw?.restrictions?.pitching ? "Enable" : "Disable") + " pitching"} color="#7c3aed"
                                    onClick={() => { setOpenActionMenu(null); handleToggleRestriction(user.id, "pitching"); }} />
                                )}
                                {['Brand','brand'].includes(user.role) && (
                                  <MenuRow icon={Briefcase} label={(user._raw?.restrictions?.campaigns ? "Enable" : "Disable") + " campaigns"} color="#0ea5e9"
                                    onClick={() => { setOpenActionMenu(null); handleToggleRestriction(user.id, "campaigns"); }} />
                                )}
                                <div className="border-t border-gray-100 my-1" />
                                <MenuRow icon={X} label="Delete account" color="#ef4444" danger
                                  onClick={() => { setOpenActionMenu(null); handleDeleteUser(user.id); }} />
                              </div>
                            </>
                          )}
                        </div>
                        {/* Pitch top-up for creators */}
                        {['Talent','talent','creator'].includes(user.role) && (
                          <button onClick={() => setPitchAdjust({ profile: user._raw, amount: '', reason: '' })}
                            className="px-2 py-1.5 text-xs font-bold rounded-lg"
                            style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                            + Pitches
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const isSuperAdmin = ["super admin","superadmin"].includes(adminRole);

  const TeamRow = ({ member, accentCol }) => (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar initials={member.avatar} size="sm" color={accentCol} />
        <div>
          <p className="font-medium text-gray-900 text-sm">{member.name}</p>
          <p className="text-xs text-gray-400">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={member.status} />
        <p className="text-xs text-gray-400 hidden sm:block">Last: {member.lastLogin}</p>
        {isSuperAdmin && (
          <button
            onClick={() => handleRemoveTeamMember(member)}
            className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      {/* Admins — super admin only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Admins <span className="text-gray-400 text-sm font-normal ml-1">({adminsList.length})</span></h3>
              <p className="text-xs text-gray-400 mt-0.5">Full platform access — add with care</p>
            </div>
            <button onClick={() => { setAddTeamModal("add"); setNewMember({ name:"", email:"", role:"admin" }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#7c3aed" }}>
              <Plus className="w-4 h-4" /> Add Admin
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {adminsList.length === 0
              ? <p className="text-xs text-gray-400 text-center py-6">No admins found</p>
              : adminsList.map(m => <TeamRow key={m.id} member={m} accentCol="#7c3aed" />)}
          </div>
        </div>
      )}

      {/* Managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Managers <span className="text-gray-400 text-sm font-normal ml-1">({managers.length})</span></h3>
          {isSuperAdmin && (
            <button onClick={() => { setAddTeamModal("add"); setNewMember({ name:"", email:"", role:"manager" }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#4f46e5" }}>
              <Plus className="w-4 h-4" /> Add Manager
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {managers.length === 0
            ? <p className="text-xs text-gray-400 text-center py-6">No managers yet</p>
            : managers.map(m => <TeamRow key={m.id} member={m} accentCol="#4f46e5" />)}
        </div>
      </div>

      {/* Staff */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Staff <span className="text-gray-400 text-sm font-normal ml-1">({staffList.length})</span></h3>
          {isSuperAdmin && (
            <button onClick={() => { setAddTeamModal("add"); setNewMember({ name:"", email:"", role:"staff" }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0ea5e9" }}>
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {staffList.length === 0
            ? <p className="text-xs text-gray-400 text-center py-6">No staff yet</p>
            : staffList.map(s => <TeamRow key={s.id} member={s} accentCol="#0ea5e9" />)}
        </div>
      </div>

      {/* Active Sessions — super admin only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Active Sessions <span className="text-gray-400 text-sm font-normal ml-1">({activeSessions.length})</span></h3>
              <p className="text-xs text-gray-400 mt-0.5">Sessions idle for 8+ hours are automatically expired</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadActiveSessions}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                <RotateCcw className="w-3 h-3" /> Refresh
              </button>
              {activeSessions.length > 1 && (
                <button onClick={handleRevokeAllSessions}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                  Revoke All Others
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {activeSessions.length === 0
              ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">No active sessions found</p>
                  <button onClick={loadActiveSessions} className="text-xs text-indigo-500 mt-1 hover:underline">Load sessions</button>
                </div>
              )
              : activeSessions.map(s => {
                const isOwn = s.id === getAdminToken();
                const lastActive = s.last_active_at ? new Date(s.last_active_at).toLocaleString('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
                return (
                  <div key={s.id} className={`flex items-center justify-between px-5 py-3 ${isOwn ? 'bg-indigo-50' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: isOwn ? '#4f46e5' : '#94a3b8' }}>
                        {(s.name || s.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name || s.email}</p>
                          {isOwn && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">You</span>}
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize flex-shrink-0">{s.role}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">Last active: {lastActive} · {s.ip || 'Unknown IP'}</p>
                      </div>
                    </div>
                    {!isOwn && (
                      <button onClick={() => handleRevokeSession(s.id)}
                        className="flex-shrink-0 ml-3 px-2 py-1 text-xs rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Pending Requests <span className="ml-1 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#d97706" }}>{pendingCount}</span></h3>
        {approvals.filter((a) => a.status === "pending").length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500">No pending requests.</p>
          </div>
        )}
        {approvals.filter((a) => a.status === "pending").map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{item.requester}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: item.requesterRole === "Manager" ? "#ede9fe" : "#dbeafe", color: item.requesterRole === "Manager" ? "#7c3aed" : "#1d4ed8" }}>
                    {item.requesterRole}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                <p className="text-xs text-gray-400">Target: <span className="font-medium text-gray-600">{item.target}</span> · {item.timestamp}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleApprovalAction(item.id, "approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#16a34a" }}>
                  <Check className="w-3 h-3" /> Approve
                </button>
                <button onClick={() => handleApprovalAction(item.id, "rejected")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#dc2626" }}>
                  <X className="w-3 h-3" /> Reject
                </button>
                <button
                  onClick={() => showToast(`Escalated "${item.type}" to senior admin.`, 'info')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Escalate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {approvalHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm text-gray-500 uppercase tracking-wide">History</h3>
          {approvalHistory.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <StatusBadge status={item.status} />
              <div>
                <p className="text-sm font-medium text-gray-800">{item.type} — {item.target}</p>
                <p className="text-xs text-gray-400">by {item.requester} · {item.reviewedAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAppConfig = () => {
    const listFields = [
      { key: 'niche_categories', label: 'Niche Categories',  desc: 'Niche options creators pick for their profile and brands use to filter creators.' },
      { key: 'content_types',    label: 'Content Types',     desc: 'Types of content a creator can deliver — used in rate cards, campaign creation, and offers.' },
    ]
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Mobile App Content</h2>
            <p className="text-xs text-gray-400">Changes are reflected in the app immediately — no rebuild required.</p>
          </div>
        </div>

        {/* List editors */}
        {listFields.map(({ key, label, desc }) => (
          <div key={key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-2 mb-1">
              <ListFilter className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 pl-6">{desc}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {appConfig[key].map(item => (
                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
                  {item}
                  <button
                    onClick={() => removeAppConfigItem(key, item)}
                    className="text-indigo-400 hover:text-red-500 transition-colors ml-0.5"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={appConfigNewItem[key]}
                onChange={e => setAppConfigNewItem(prev => ({ ...prev, [key]: stripInjection(e.target.value) }))}
                onKeyDown={e => e.key === 'Enter' && addAppConfigItem(key)}
                placeholder={`Add a new ${label.toLowerCase().replace('s', '')}…`}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
              />
              <button
                onClick={() => addAppConfigItem(key)}
                className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Numeric fields */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Pricing Rules</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Minimum Creator Rate (₦)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={appConfig.min_creator_rate}
                onChange={e => setAppConfig(prev => ({ ...prev, min_creator_rate: parseInt(stripInjection(e.target.value)) || 0 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Creators cannot set a rate card price below this amount. Default: ₦20,000.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Platform Commission (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={appConfig.platform_commission_pct}
                onChange={e => setAppConfig(prev => ({ ...prev, platform_commission_pct: parseFloat(stripInjection(e.target.value)) || 0 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Percentage the platform takes from each collab payment. Default: 10%.</p>
            </div>
          </div>
        </div>

        {/* Escrow & Payout Controls */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Escrow & Payout Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Release Delay (hours)</label>
              <input
                type="number"
                min="0"
                max="168"
                step="1"
                value={appConfig.escrow_release_delay_hours}
                onChange={e => setAppConfig(prev => ({ ...prev, escrow_release_delay_hours: parseInt(stripInjection(e.target.value)) || 0 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Hours after brand approval before creator can withdraw. Default: 48hrs.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Auto-Release (days)</label>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={appConfig.auto_release_days}
                onChange={e => setAppConfig(prev => ({ ...prev, auto_release_days: parseInt(stripInjection(e.target.value)) || 7 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Days after delivery before funds auto-release if brand doesn't act. Default: 7 days.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Max Pitches Per Month</label>
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={appConfig.max_pitches_per_month}
                onChange={e => setAppConfig(prev => ({ ...prev, max_pitches_per_month: parseInt(stripInjection(e.target.value)) || 10 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Number of pitches a creator can submit per calendar month. Default: 10.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pitch Pack Size</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={appConfig.pitch_pack_size}
                onChange={e => setAppConfig(prev => ({ ...prev, pitch_pack_size: parseInt(stripInjection(e.target.value)) || 10 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Number of extra pitches per purchased pack. Default: 10.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pitch Pack Price (₦)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={appConfig.pitch_pack_price}
                onChange={e => setAppConfig(prev => ({ ...prev, pitch_pack_price: parseInt(stripInjection(e.target.value)) || 500 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Price creators pay to buy one pitch pack. Default: ₦500.</p>
            </div>
          </div>
        </div>

        <button
          onClick={saveAppConfig}
          disabled={appConfigSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: appConfigSaved ? '#22c55e' : '#4f46e5', opacity: appConfigSaving ? 0.6 : 1 }}
        >
          {appConfigSaved
            ? <><CheckCircle className="w-4 h-4" /> Saved to app!</>
            : appConfigSaving
              ? 'Saving…'
              : <><Save className="w-4 h-4" /> Save App Config</>}
        </button>
      </div>
    )
  }

  const renderSettings = () => (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-900">Platform Identity</h3>

        {/* Logo Upload — labeled slots */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800">Logo Slots</label>
          <p className="text-xs text-gray-400 -mt-2">Each slot controls a specific area of the platform. Changes take effect immediately.</p>
          {Object.entries(LOGO_SLOTS).map(([slot, { label }]) => (
            <div key={slot} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                {logos[slot]
                  ? <img src={logos[slot]} alt={label} className="w-full h-full object-contain" />
                  : <span className="text-[10px] text-gray-400 text-center px-1 leading-tight">No logo</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${logoUploading[slot] ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'}`}>
                  <input type="file" accept="image/*" className="hidden" disabled={logoUploading[slot]} onChange={(e) => handleLogoUpload(slot, e)} />
                  {logoUploading[slot] ? 'Uploading…' : logos[slot] ? 'Replace' : 'Upload'}
                </label>
                {logos[slot] && !logoUploading[slot] && (
                  <button type="button" onClick={() => handleLogoRemove(slot)}
                    className="ml-2 text-xs text-red-400 hover:text-red-600 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">PNG, JPG or SVG. Recommended: 200×200px or wider for header/footer.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => setSettings((s) => ({ ...s, platformName: stripInjection(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings((s) => ({ ...s, tagline: stripInjection(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Video URL</label>
          <input
            type="url"
            value={settings.heroVideo}
            onChange={(e) => setSettings((s) => ({ ...s, heroVideo: stripInjection(e.target.value) }))}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">Direct link to an MP4 video. Leave empty to use the gradient background.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Login Page Illustration URL</label>
          <input
            type="url"
            value={settings.loginIllustration}
            onChange={(e) => setSettings((s) => ({ ...s, loginIllustration: stripInjection(e.target.value) }))}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">Image shown on the left panel of the login page. Leave empty to use the default illustration.</p>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <h3 className="font-semibold text-gray-900">Integrations</h3>
          <p className="text-xs text-gray-400 mt-0.5">Third-party tracking and analytics tools.</p>
        </div>

        {/* TikTok Pixel */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm" style={{ backgroundColor: '#010101' }}>TT</div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">TikTok Pixel</p>
              <p className="text-xs text-gray-400">Tracks ad conversions and page views. Find your Pixel ID in TikTok Ads Manager → Assets → Events.</p>
            </div>
            <input
              type="text"
              value={settings.tiktokPixelId}
              onChange={(e) => setSettings((s) => ({ ...s, tiktokPixelId: stripInjection(e.target.value).trim() }))}
              placeholder="e.g. CXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-indigo-400 bg-white"
            />
            {settings.tiktokPixelId && (
              <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Pixel will fire on every page view
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-900">System Controls</h3>
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <div>
            <p className="font-medium text-gray-800 text-sm">Maintenance Mode</p>
            <p className="text-xs text-gray-500">Puts the platform in read-only mode for non-admins.</p>
          </div>
          <Toggle checked={settings.maintenanceMode} onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-gray-800 text-sm">Email Notifications</p>
            <p className="text-xs text-gray-500">Send system emails for account events and campaigns.</p>
          </div>
          <Toggle checked={settings.emailNotifications} onChange={(v) => setSettings((s) => ({ ...s, emailNotifications: v }))} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Allowed Countries</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.countries.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              <CheckCircle className="w-3.5 h-3.5" /> {c}
              <button
                onClick={() => setSettings(s => ({ ...s, countries: s.countries.filter(x => x !== c) }))}
                className="ml-0.5 hover:text-red-500 transition-colors text-green-600 font-bold"
                title="Remove">×</button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCountry}
            onChange={e => setNewCountry(stripInjection(e.target.value))}
            onKeyDown={e => {
              if (e.key === 'Enter' && newCountry.trim() && !settings.countries.includes(newCountry.trim())) {
                setSettings(s => ({ ...s, countries: [...s.countries, newCountry.trim()] }))
                setNewCountry('')
              }
            }}
            placeholder="e.g. Ghana"
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 w-40"
          />
          <button
            onClick={() => {
              const trimmed = newCountry.trim()
              if (trimmed && !settings.countries.includes(trimmed)) {
                setSettings(s => ({ ...s, countries: [...s.countries, trimmed] }))
                setNewCountry('')
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#4f46e5' }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* ── Brand Colours ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Brand Colours</h3>
            <p className="text-xs text-gray-400 mt-0.5">Changes apply instantly across the entire platform for all visitors.</p>
          </div>
          <button
            onClick={handleResetTheme}
            disabled={themeSaving}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
          >
            Reset defaults
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(THEME_VARS).map(([name, { label, default: def, desc }]) => (
            <div key={name} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: themeColors[name] || def }}
                />
                <input
                  type="color"
                  value={themeColors[name] || def}
                  onChange={e => {
                    const val = e.target.value
                    setThemeColors(prev => ({ ...prev, [name]: val }))
                    document.documentElement.style.setProperty(`--b-${name}`, val)
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  title={label}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <input
                type="text"
                value={themeColors[name] || def}
                onChange={e => {
                  const val = e.target.value.trim()
                  setThemeColors(prev => ({ ...prev, [name]: val }))
                  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                    document.documentElement.style.setProperty(`--b-${name}`, val)
                  }
                }}
                onBlur={e => {
                  const val = e.target.value.trim()
                  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                    setThemeColors(prev => ({ ...prev, [name]: def }))
                  }
                }}
                className="w-24 text-xs font-mono text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-shrink-0 text-center"
                placeholder={def}
                maxLength={7}
                spellCheck={false}
              />
            </div>
          ))}
        </div>

        {/* Live preview strip */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: themeColors.navbarBg || '#e9d5ff' }}>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: themeColors.dark || '#4c1d95' }} />
            <span className="text-sm font-bold" style={{ color: themeColors.dark || '#4c1d95' }}>Navbar Preview</span>
            <div className="ml-auto flex gap-2">
              <div className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: themeColors.cta || '#FA8112' }}>Post a Job</div>
              <div className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: themeColors.dark || '#4c1d95' }}>Get Started</div>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: themeColors.secondary || '#c084fc' }}>
            <div className="px-3 py-1 rounded-full text-xs font-semibold text-white/70">Menu link</div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold text-white">Hovered</div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: themeColors.primary || '#7c3aed' }}>Active</div>
          </div>
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={themeSaving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
          style={{ backgroundColor: '#4f46e5', opacity: themeSaving ? 0.6 : 1 }}
        >
          {themeSaving ? 'Saving…' : 'Save Brand Colours'}
        </button>
      </div>

      {/* ── Brand Tier Requirements ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">Brand Tier Requirements</h3>
          <p className="text-xs text-gray-400 mt-1">Set how many campaigns and creators a brand must hire to reach each tier.</p>
        </div>
        {Object.entries(brandTiers).map(([tier, cfg]) => (
          <div key={tier} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{tier}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={cfg.label}
                  onChange={e => setBrandTiers(prev => ({ ...prev, [tier]: { ...prev[tier], label: stripInjection(e.target.value) } }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min. Campaigns</label>
                <input
                  type="number" min="0"
                  value={cfg.campaigns}
                  onChange={e => setBrandTiers(prev => ({ ...prev, [tier]: { ...prev[tier], campaigns: Number(stripInjection(e.target.value)) } }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min. Creators Hired</label>
                <input
                  type="number" min="0"
                  value={cfg.creators}
                  onChange={e => setBrandTiers(prev => ({ ...prev, [tier]: { ...prev[tier], creators: Number(stripInjection(e.target.value)) } }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={saveBrandTiers}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: tierSaved ? '#10b981' : '#4f46e5' }}
        >
          {tierSaved ? 'Saved ✓' : 'Save Tier Requirements'}
        </button>
      </div>

      {/* ── Referral Incentive Config ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">Referral Incentives</h3>
          <p className="text-xs text-gray-400 mt-1">Set the bonus amounts paid to referrers and the holding period before payout.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Creator Bonus (₦)</label>
            <input
              type="number" min="0" step="100"
              value={referralConfig.creator_bonus}
              onChange={e => setReferralConfig(p => ({ ...p, creator_bonus: Number(stripInjection(e.target.value)) }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-gray-400 mt-1">Paid when a referred creator completes their first collab</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Brand Bonus (₦)</label>
            <input
              type="number" min="0" step="100"
              value={referralConfig.brand_bonus}
              onChange={e => setReferralConfig(p => ({ ...p, brand_bonus: Number(stripInjection(e.target.value)) }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-gray-400 mt-1">Paid when a referred brand completes their first collab</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hold Period (days)</label>
            <input
              type="number" min="1" max="90"
              value={referralConfig.hold_days}
              onChange={e => setReferralConfig(p => ({ ...p, hold_days: Number(stripInjection(e.target.value)) }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-gray-400 mt-1">Days to hold bonus before crediting wallet</p>
          </div>
        </div>
        <button
          onClick={saveReferralConfig}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: referralSaved ? '#10b981' : '#4f46e5' }}
        >
          {referralSaved ? 'Saved ✓' : 'Save Referral Config'}
        </button>
      </div>

      <button
        onClick={() => {
          saveAllSettings({ ...settings, brandFee, creatorFee })
          showToast("Settings saved successfully.")
        }}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: "#4f46e5" }}
      >
        Save Settings
      </button>
    </div>
  );

  const renderAiPolice = () => <AdminModerationDashboard />;

  const renderLegal = () => (
    <div className="max-w-3xl space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'terms', label: 'Terms & Conditions', href: '/terms' },
          { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
          { id: 'cookies', label: 'Cookie Policy', href: '/cookies' },
        ].map(doc => (
          <button key={doc.id} onClick={() => setActiveLegalDoc(doc.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeLegalDoc === doc.id
              ? { backgroundColor: '#4f46e5', color: '#fff' }
              : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
            {doc.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {activeLegalDoc === 'terms' ? 'Terms & Conditions' : activeLegalDoc === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'}
          </h3>
          <a href={`/${activeLegalDoc === 'terms' ? 'terms' : activeLegalDoc === 'privacy' ? 'privacy' : 'cookies'}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> View live page
          </a>
        </div>
        <p className="text-xs text-gray-400">Edit the content below. Use blank lines to separate paragraphs. Start a line with ## for a heading.</p>
        <textarea
          value={legalDocs[activeLegalDoc]}
          onChange={e => setLegalDocs(d => ({ ...d, [activeLegalDoc]: e.target.value }))}
          rows={24}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-indigo-400 font-mono resize-y leading-relaxed"
          placeholder="Enter document content..."
        />
      </div>

      <button onClick={saveLegalDocs}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: '#4f46e5' }}>
        Save Changes
      </button>
    </div>
  )

  // ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
  const FEATURE_DEFS = [
    { id: 'featureMarketplace',   label: 'Talent Marketplace',      desc: 'Browse and hire creator profiles',               category: 'Discovery', color: '#6366f1' },
    { id: 'featureJobBoard',      label: 'Direct-Hire Collabs',       desc: 'Brands hire creators directly from their rate card', category: 'Discovery', color: '#6366f1' },
    { id: 'featureCreatorSignup', label: 'Creator Signup',           desc: 'New talent accounts can be created',             category: 'Access',    color: '#ec4899' },
    { id: 'featureBrandSignup',   label: 'Brand Signup',             desc: 'New brand accounts can be created',              category: 'Access',    color: '#ec4899' },
    { id: 'featureMessaging',     label: 'Messaging',                desc: 'In-app chat between brands and talents',         category: 'Engagement',color: '#0ea5e9' },
    { id: 'featureProposals',     label: 'Campaign Proposals',       desc: 'Talents submit proposals to brand campaigns',    category: 'Engagement',color: '#0ea5e9' },
    { id: 'featureWallet',        label: 'Wallet & Payments',        desc: 'Deposits, withdrawals and transactions',         category: 'Finance',   color: '#16a34a' },
    { id: 'featureReferrals',     label: 'Referral / Invite System', desc: 'Users invite others for rewards',                category: 'Growth',    color: '#f59e0b' },
    { id: 'featureReviews',       label: 'Reviews & Ratings',        desc: 'Brands rate and review talent work',             category: 'Trust',     color: '#f59e0b' },
    { id: 'featureAI',            label: 'AI Features',              desc: 'AI-powered matching and recommendations',        category: 'Core',      color: '#8b5cf6' },
  ]
  const FEATURE_CATEGORIES = [...new Set(FEATURE_DEFS.map(f => f.category))]

  // features[id] = { enabled: bool, platforms: { web: bool, ios: bool, android: bool } }
  const [features, setFeatures] = useState(() =>
    Object.fromEntries(FEATURE_DEFS.map(f => {
      const stored = getSetting(f.id)
      if (stored && typeof stored === 'object' && 'enabled' in stored) return [f.id, stored]
      const enabled = stored !== false
      return [f.id, makeFeatureValue(enabled)]
    }))
  )
  const [featureSaving, setFeatureSaving] = useState(false)
  const [featureSaved, setFeatureSaved]   = useState(false)
  const [featureChanged, setFeatureChanged] = useState({})

  function toggleFeature(id) {
    const prev = features[id]
    setFeatureChanged(c => ({ ...c, [id]: prev }))
    const nowEnabled = !prev.enabled
    setFeatures(f => ({ ...f, [id]: makeFeatureValue(nowEnabled) }))
  }

  function togglePlatform(id, platform) {
    setFeatureChanged(c => ({ ...c, [id]: features[id] }))
    setFeatures(f => ({
      ...f,
      [id]: { ...f[id], platforms: { ...f[id].platforms, [platform]: !f[id].platforms[platform] } },
    }))
  }

  async function saveFeatures() {
    setFeatureSaving(true)
    await Promise.all(FEATURE_DEFS.map(({ id }) => setSetting(id, features[id])))
    setFeatureSaving(false)
    setFeatureSaved(true)
    setFeatureChanged({})
    setTimeout(() => setFeatureSaved(false), 2500)
  }

  const renderFeatures = () => {
    const offCount = FEATURE_DEFS.filter(f => !features[f.id]).length
    return (
      <div className="max-w-2xl space-y-6">
        {/* Header bar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Platform Feature Switches</h3>
            <p className="text-sm text-gray-400 mt-0.5">Disable features temporarily without deleting any data. Changes go live immediately after saving.</p>
          </div>
          {offCount > 0 && (
            <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: '#ef4444' }}>
              {offCount} off
            </span>
          )}
        </div>

        {/* Grouped feature cards */}
        {FEATURE_CATEGORIES.map(category => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: '#f8fafc' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{category}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {FEATURE_DEFS.filter(f => f.category === category).map(({ id, label, desc, color }) => {
                const fv      = features[id] || makeFeatureValue(true)
                const on      = fv.enabled
                const plats   = fv.platforms || { web: on, ios: on, android: on }
                const changed = id in featureChanged
                const PLAT_LABELS = [
                  { key: 'web',     label: 'Web' },
                  { key: 'ios',     label: 'iOS' },
                  { key: 'android', label: 'Andr' },
                ]
                return (
                  <div key={id} className="px-5 py-4 transition-colors"
                    style={{ backgroundColor: !on ? '#fef2f2' : changed ? '#f0fdf4' : 'white' }}>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900">{label}</p>
                          {!on && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">All platforms off</span>}
                          {changed && on && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Changed</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => toggleFeature(id)}
                        className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200"
                        style={{ backgroundColor: on ? color : '#d1d5db' }}>
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                          style={{ transform: on ? 'translateX(24px)' : 'translateX(0)' }} />
                      </button>
                    </div>
                    {/* Per-platform overrides — only shown when globally on */}
                    {on && (
                      <div className="flex items-center gap-2 mt-2.5 ml-0.5">
                        <span className="text-[10px] text-gray-400 font-medium mr-1">Platforms:</span>
                        {PLAT_LABELS.map(({ key, label: pl }) => {
                          const platOn = plats[key] !== false
                          return (
                            <button key={key} onClick={() => togglePlatform(id, key)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border"
                              style={platOn
                                ? { backgroundColor: `${color}18`, color, borderColor: `${color}40` }
                                : { backgroundColor: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }}>
                              {platOn ? '✓' : '✗'} {pl}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Save */}
        <button onClick={saveFeatures} disabled={featureSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ backgroundColor: featureSaved ? '#16a34a' : '#4f46e5' }}>
          {featureSaved
            ? <><CheckCircle className="w-4 h-4" /> Changes saved</>
            : featureSaving ? 'Saving…'
            : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    )
  }

  const renderPayments = () => (
    <div className="space-y-6 max-w-3xl">
      {/* Rubies MFB — sole payment processor */}
      <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: '#16a34a' }}>
        <div className="flex items-center gap-4 px-5 py-4" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ backgroundColor: '#16a34a' }}>RB</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">Rubies MFB</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#16a34a' }}>Active</span>
            </div>
            <p className="text-xs text-gray-500">Nigerian microfinance bank — sole payment processor for Brandior</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Integrated
          </span>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">API credentials:</span> Configured via Supabase Edge Function secrets — not stored in the database.</p>
          <p><span className="font-medium">Wallet top-ups:</span> Rubies card payment API (<code className="text-xs bg-gray-100 px-1 rounded">baas-card-payment/initiate</code>)</p>
          <p><span className="font-medium">Payouts &amp; escrow:</span> Rubies internal + external transfer API (<code className="text-xs bg-gray-100 px-1 rounded">baas-transaction/fund-transfer</code>)</p>
          <p><span className="font-medium">KYC:</span> BVN and NIN validation via Rubies KYC API</p>
        </div>
      </div>

      {/* Operational account numbers (editable via site_settings) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="font-bold text-gray-800 mb-0.5">Operational Accounts</h3>
          <p className="text-xs text-gray-400">These numbers are used by Edge Functions at runtime. Changing them takes effect on the next EF deploy.</p>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
          <span className="text-sm font-medium text-gray-600">Environment:</span>
          <div className="flex gap-1 p-0.5 rounded-lg bg-gray-200">
            {['sandbox', 'production'].map(m => (
              <button key={m} onClick={() => setRubiesStatus(s => ({ ...s, env: m }))}
                className="px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all"
                style={rubiesStatus.env === m
                  ? { backgroundColor: m === 'production' ? '#16a34a' : '#4f46e5', color: '#fff' }
                  : { color: '#64748b' }}>
                {m === 'production' ? '🟢 Production' : '🔵 Sandbox'}
              </button>
            ))}
          </div>
          {rubiesStatus.env === 'production' && (
            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Live money
            </span>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Escrow Account Number</label>
          <input type="text" value={rubiesStatus.escrowAccount}
            onChange={e => setRubiesStatus(s => ({ ...s, escrowAccount: stripInjection(e.target.value) }))}
            placeholder="e.g. 1000001748"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-indigo-400" />
          <p className="text-xs text-gray-400 mt-1">Funds from brands are held here until a collaboration is completed or refunded.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Revenue / Fee Account Number</label>
          <input type="text" value={rubiesStatus.revenueAccount}
            onChange={e => setRubiesStatus(s => ({ ...s, revenueAccount: stripInjection(e.target.value) }))}
            placeholder="e.g. 1000001749 (leave blank to skip fee transfer)"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-indigo-400" />
          <p className="text-xs text-gray-400 mt-1">Platform commission is transferred here on escrow release. Leave blank to skip.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Changing RUBIES_API_KEY or RUBIES_BASE_URL?</p>
        <p>Update those values in Supabase → Edge Functions → Secrets. They are not managed here.</p>
      </div>

      <button onClick={saveRubiesConfig} disabled={rubiesSaving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
        style={{ backgroundColor: rubiesSaved ? '#16a34a' : '#4f46e5' }}>
        {rubiesSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : rubiesSaving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Account Numbers</>}
      </button>
    </div>
  )

  const renderPush       = () => <PushNotificationPanel showToast={showToast} auditLog={auditLog} />
  const renderAudit      = () => <AuditLogPanel />
  const renderRateCards  = () => <RateCardModerationPanel showToast={showToast} auditLog={auditLog} />

  const TAB_CONTENT = {
    overview:         renderOverview,
    analytics:        renderAnalytics,
    users:            renderUsers,
    jobs:             () => <CollaborationPanel showToast={showToast} auditLog={auditLog} />,
    pitches:          () => <PitchesPanel showToast={showToast} auditLog={auditLog} />,
    messaging:        () => <MessagingModerationPanel showToast={showToast} auditLog={auditLog} />,
    disputes2:        () => <DisputeCenterPanel showToast={showToast} auditLog={auditLog} />,
    wallets:          () => <WalletManagementPanel showToast={showToast} auditLog={auditLog} />,
    withdrawals:        () => <WithdrawalPanel showToast={showToast} auditLog={auditLog} />,
    "payout-approvals": () => <PayoutApprovalPanel showToast={showToast} auditLog={auditLog} />,
    escrow:           () => <EscrowPanel showToast={showToast} auditLog={auditLog} />,
    financials2:      () => <FinancialReportingPanel showToast={showToast} auditLog={auditLog} />,
    reviews:          () => <ReviewsModerationPanel showToast={showToast} auditLog={auditLog} />,
    marketplace:      () => <MarketplaceModerationPanel showToast={showToast} auditLog={auditLog} />,
    referrals2:       () => <ReferralManagementPanel showToast={showToast} auditLog={auditLog} />,
    announcements:    () => <AnnouncementBannerPanel showToast={showToast} auditLog={auditLog} />,
    "promo-codes":    () => <PromoCouponPanel showToast={showToast} auditLog={auditLog} />,
    notifications2:   () => <NotificationsPanel showToast={showToast} auditLog={auditLog} />,
    cms2:             () => <CMSPanel showToast={showToast} auditLog={auditLog} />,
    analytics2:       () => <AnalyticsPanel />,
    funnel:           () => <OnboardingFunnelPanel showToast={showToast} />,
    earnings:         () => <CreatorEarningsPanel showToast={showToast} />,
    sla:              () => <SLATrackerPanel showToast={showToast} setActiveTab={setActiveTab} />,
    exports:          () => <DataExportPanel showToast={showToast} auditLog={auditLog} />,
    "ai-controls":    () => <AIControlsPanel showToast={showToast} auditLog={auditLog} />,
    "algo-control":   () => <AlgorithmControlPanel showToast={showToast} auditLog={auditLog} />,
    "pay-config":     () => <PaymentConfigPanel showToast={showToast} auditLog={auditLog} />,
    "pitch-settings": () => <PitchSettingsPanel showToast={showToast} auditLog={auditLog} />,
    rubies:           () => <RubiesPanel showToast={showToast} auditLog={auditLog} />,
    categories:       () => <CategoryManagementPanel showToast={showToast} auditLog={auditLog} />,
    "trust-safety":   () => <TrustSafetyPanel showToast={showToast} auditLog={auditLog} />,
    kyc:              () => <KYCReviewPanel showToast={showToast} auditLog={auditLog} />,
    fraud:            () => <FraudDetectionPanel showToast={showToast} auditLog={auditLog} />,
    support2:         () => <SupportCenterPanel showToast={showToast} auditLog={auditLog} />,
    "email-log":      () => <EmailDeliveryLogPanel showToast={showToast} />,
    "email-notifs":   () => <EmailNotificationsPanel showToast={showToast} auditLog={auditLog} />,
    system:           () => <SystemSettingsPanel showToast={showToast} auditLog={auditLog} />,
    team:             renderTeam,
    approvals:        renderApprovals,
    content:          () => <CmsEditor />,
    "ai-police":      renderAiPolice,
    features:         renderFeatures,
    payments:         renderPayments,
    legal:            renderLegal,
    settings:         renderSettings,
    "app-config":     renderAppConfig,
    push:             renderPush,
    audit:            renderAudit,
    "rate-cards":     renderRateCards,
    security:         () => <AdminSecurityPanel showToast={showToast} auditLog={auditLog} />,
    roles:            () => <AdminRolesPanel showToast={showToast} auditLog={auditLog} />,
    refunds:          () => <RefundWorkflowPanel showToast={showToast} auditLog={auditLog} />,
    health:           () => <SystemHealthPanel showToast={showToast} />,
    commission:       () => <CommissionPanel showToast={showToast} auditLog={auditLog} />,
  };

  if (!adminUser) return null;

  const navItemMap = Object.fromEntries(NAV_ITEMS.map(n => [n.id, n]));
  const totalAlerts = (modStats.pending || 0) + (pendingCount || 0) + (openDisputeCount || 0);

  const T = darkMode ? {
    bg:         '#0f1117', header:    '#161b22', headerBd: '#21262d',
    card:       '#1c2333', cardBd:    '#30363d', row:      '#161b22',
    hover:      '#21262d', hoverBd:   '#30363d',
    text:       '#e6edf3', textSub:   '#8b949e', textMuted: '#6e7681',
    input:      '#0d1117', inputBd:   '#30363d', divider:  '#21262d',
    tabActive:  '#7c3aed', tabBg:     '#21262d',
  } : {
    bg:         '#f0f2f5', header:    '#ffffff', headerBd: '#e5e7eb',
    card:       '#ffffff', cardBd:    '#e5e7eb', row:      '#f9fafb',
    hover:      '#f9fafb', hoverBd:   '#e5e7eb',
    text:       '#111827', textSub:   '#6b7280', textMuted: '#9ca3af',
    input:      '#f9fafb', inputBd:   '#e5e7eb', divider:  '#f3f4f6',
    tabActive:  '#0d1117', tabBg:     '#f3f4f6',
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: T.bg }}>

      {/* ══ TOP DOMAIN BAR ══════════════════════════════════════════════════════ */}
      <div style={{
        height: 48, flexShrink: 0,
        backgroundColor: "#0d1117",
        borderBottom: "1px solid #161b22",
        display: "flex", alignItems: "center",
        paddingLeft: 14, paddingRight: 12,
        gap: 6,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginRight: 8 }}>
          <img src="/Brandiör-2.png" alt="Brandior" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>Brandior</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, backgroundColor: "#21262d", flexShrink: 0, marginRight: 4 }} />

        {/* Domain tabs — scrollable */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
          {NAV_DOMAINS.map(domain => {
            const isDomainActive = activeDomain === domain.id;
            const domainBadgeCount =
              domain.id === "collabs" ? openDisputeCount :
              domain.id === "finance" ? 0 :
              domain.id === "safety"  ? modStats.pending :
              domain.id === "system"  ? pendingCount : 0;
            return (
              <button key={domain.id}
                onClick={() => setActiveTab(domain.items[0])}
                style={{
                  height: 30, borderRadius: 7,
                  padding: "0 10px",
                  backgroundColor: isDomainActive ? "#7c3aed" : "transparent",
                  color: isDomainActive ? "#fff" : "#8b949e",
                  fontSize: 12, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                  transition: "background-color 0.15s, color 0.15s",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!isDomainActive) { e.currentTarget.style.backgroundColor = "#21262d"; e.currentTarget.style.color = "#c9d1d9"; }}}
                onMouseLeave={e => { if (!isDomainActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8b949e"; }}}
              >
                {domain.label}
                {domainBadgeCount > 0 && (
                  <span style={{
                    position: "absolute", top: 3, right: 3,
                    width: 6, height: 6, borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    border: "1.5px solid #0d1117",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: logout */}
        <button onClick={handleLogout} title="Logout"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 7, backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#6e7681", flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#21262d"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6e7681"; }}>
          <LogOut style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* ══ BODY (sidebar + main) ═══════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* ── Contextual Sidebar ── */}
        <aside
          onMouseEnter={() => !sidebarPinned && setSidebarHovered(true)}
          onMouseLeave={() => !sidebarPinned && setSidebarHovered(false)}
          style={{
            width: sidebarOpen ? 168 : 48,
            backgroundColor: "#0d1117",
            borderRight: "1px solid #161b22",
            flexShrink: 0,
            display: "flex", flexDirection: "column",
            overflowY: "auto", overflowX: "hidden",
            transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
            height: "100%",
            scrollbarWidth: "none",
          }}
        >
          {/* Domain heading + pin toggle */}
          <div style={{
            height: 36, flexShrink: 0,
            display: "flex", alignItems: "center",
            paddingLeft: 14, paddingRight: 6,
            borderBottom: "1px solid #161b22",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
              color: "#6e7681", textTransform: "uppercase",
              opacity: sidebarOpen ? 1 : 0,
              transition: "opacity 0.15s ease",
              whiteSpace: "nowrap", flex: 1,
            }}>
              {NAV_DOMAINS.find(d => d.id === activeDomain)?.label}
            </span>
            <button
              onClick={() => {
                const next = !sidebarPinned;
                setSidebarPinned(next);
                localStorage.setItem('brandior_sidebar_pinned', String(next));
                if (!next) setSidebarHovered(false);
              }}
              title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar open"}
              style={{
                opacity: sidebarOpen ? 1 : 0,
                transition: "opacity 0.15s ease",
                background: "none", border: "none", cursor: "pointer",
                color: sidebarPinned ? "#7c3aed" : "#6e7681",
                padding: "4px", flexShrink: 0,
              }}
            >
              {sidebarPinned
                ? <PanelLeftClose style={{ width: 14, height: 14 }} />
                : <PanelLeftOpen  style={{ width: 14, height: 14 }} />
              }
            </button>
          </div>

          {/* Submenu items */}
          <nav style={{ flex: 1, padding: "6px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
            {(NAV_DOMAINS.find(d => d.id === activeDomain)?.items || []).map(id => {
              const item = navItemMap[id];
              if (!item) return null;
              const { Icon, label, badge, badgeColor } = item;
              const active = activeTab === id;
              const badgeCount =
                badge && id === "ai-police" ? modStats.pending :
                badge && id === "approvals" ? pendingCount :
                badge && id === "disputes2" ? openDisputeCount : 0;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); if (id === 'financials') loadFinancials(); }}
                  style={{
                    height: 36, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center",
                    paddingLeft: 11, paddingRight: 6, gap: 9,
                    backgroundColor: active ? "#7c3aed" : "transparent",
                    color: active ? "#fff" : "#6e7681",
                    position: "relative",
                    transition: "background-color 0.15s, color 0.15s",
                    border: "none", cursor: "pointer",
                    whiteSpace: "nowrap", overflow: "hidden",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "#21262d"; e.currentTarget.style.color = "#c9d1d9"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6e7681"; } }}
                >
                  <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    opacity: sidebarOpen ? 1 : 0,
                    transition: "opacity 0.15s ease",
                  }}>{label}</span>
                  {badge && badgeCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: sidebarOpen ? "50%" : 5,
                      right: sidebarOpen ? 8 : 5,
                      transform: sidebarOpen ? "translateY(-50%)" : "none",
                      width: sidebarOpen ? "auto" : 8,
                      height: sidebarOpen ? 18 : 8,
                      minWidth: sidebarOpen ? 18 : 8,
                      borderRadius: sidebarOpen ? 9 : "50%",
                      backgroundColor: badgeColor || "#ef4444",
                      border: "1.5px solid #0d1117",
                      fontSize: 10, fontWeight: 800, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: sidebarOpen ? "0 4px" : 0,
                      transition: "all 0.15s ease",
                    }}>{sidebarOpen ? badgeCount : ""}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center gap-4 px-6" style={{ backgroundColor: T.header, borderBottom: `1px solid ${T.headerBd}`, height: 64 }}>
          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black" style={{ fontSize: 17, color: T.text }}>
                  {activeTab === "overview" ? "Command Center" : NAV_ITEMS.find(n => n.id === activeTab)?.label}
                </h1>
                {activeTab === "overview" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs font-medium" style={{ color: T.textMuted }}>Real-time overview of the Brandior ecosystem</p>
            </div>
          </div>

          {/* Filter tabs — overview only */}
          {activeTab === "overview" && (
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: T.tabBg }}>
              {[
                { key: "all",      label: "ALL" },
                { key: "creator",  label: "CREATOR" },
                { key: "brand",    label: "BRAND" },
                { key: "platform", label: "PLATFORM" },
              ].map(f => (
                <button key={f.key} onClick={() => setOverviewFilter(f.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all"
                  style={overviewFilter === f.key
                    ? { backgroundColor: T.tabActive, color: "#fff" }
                    : { backgroundColor: "transparent", color: T.textSub }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Search */}
            <button onClick={() => { setCmdOpen(true); setCmdQuery(""); }}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e9ecef"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f3f4f6"}>
              <Search style={{ width: 14, height: 14, color: "#9ca3af" }} />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>Search anything…</span>
              <span style={{ fontSize: 11, color: "#d1d5db", backgroundColor: "#e5e7eb", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>⌘K</span>
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(v => !v)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.headerBd}`, backgroundColor: T.hover, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.headerBd; e.currentTarget.style.color = T.textSub; }}>
              {darkMode ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
            </button>
            {/* Notifications */}
            <button style={{ position: "relative", width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.headerBd}`, backgroundColor: T.header, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => setActiveTab("notifications2")}>
              <Bell style={{ width: 16, height: 16, color: T.textSub }} />
              {totalAlerts > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 18, height: 18, borderRadius: 9, padding: "0 4px",
                  backgroundColor: "#ef4444", color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #fff",
                }}>{totalAlerts > 99 ? "99+" : totalAlerts}</span>
              )}
            </button>
            {/* User */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {(adminUser.name || "SA").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold leading-none" style={{ color: T.text }}>{adminUser.name}</p>
                <p className="text-xs" style={{ color: T.textMuted }}>Super Admin</p>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: T.textMuted }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto" style={{ padding: "24px 28px" }}>
          {TAB_CONTENT[activeTab]?.()}
        </div>
      </main>
      </div>{/* ── end body (sidebar + main) ── */}

      {/* Modals */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── Command Palette ── */}
      {cmdOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120 }}
          onClick={() => setCmdOpen(false)}
        >
          <div
            style={{ width: 560, backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
              <Search style={{ width: 18, height: 18, color: "#9ca3af", flexShrink: 0 }} />
              <input
                autoFocus
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                placeholder="Search panels…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#111827", background: "transparent" }}
              />
              {cmdQuery && (
                <button onClick={() => setCmdQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
              <span style={{ fontSize: 11, color: "#d1d5db", backgroundColor: "#f3f4f6", borderRadius: 4, padding: "2px 6px", fontWeight: 700, flexShrink: 0 }}>ESC</span>
            </div>
            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
              {(() => {
                const q = cmdQuery.toLowerCase().trim();
                const results = NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q));
                if (results.length === 0) return (
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "32px 0" }}>No panels match "{cmdQuery}"</p>
                );
                return results.map(({ id, label, Icon }) => (
                  <button key={id}
                    onClick={() => { setActiveTab(id); setCmdOpen(false); setCmdQuery(""); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 15, height: 15, color: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{label}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>Go to panel →</span>
                  </button>
                ));
              })()}
            </div>
            {/* Footer hint */}
            <div style={{ padding: "10px 18px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 16 }}>
              {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, desc]) => (
                <span key={key} style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ backgroundColor: "#f3f4f6", borderRadius: 4, padding: "1px 5px", fontWeight: 700, color: "#6b7280" }}>{key}</span>
                  {desc}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {addTeamModal === "add" && (
        <Modal title="Add Team Member" onClose={() => { setAddTeamModal(null); setNewMember({ name:"", email:"", role:"" }); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember((m) => ({ ...m, name: stripInjection(e.target.value) }))}
                placeholder="Jane Okonkwo"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember((m) => ({ ...m, email: stripInjection(e.target.value) }))}
                placeholder="jane@brandior.co"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember((m) => ({ ...m, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white">
                {isSuperAdmin && <option value="admin">Admin — full access</option>}
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            {newMember.role === 'admin' && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                Admins have full platform access. Only add trusted team members.
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setAddTeamModal(null); setNewMember({ name:"", email:"", role:"" }); }}
                className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddTeamMember} disabled={!newMember.name || !newMember.email || !newMember.role}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#4f46e5" }}>Add Member</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── User Detail Modal ── */}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} onAction={handleUserAction} />}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <Modal title="Edit User Profile" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ backgroundColor: "#eef2ff" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#4f46e5" }}>{editUser.avatar}</div>
              <div>
                <p className="text-xs font-semibold text-indigo-700">Editing as Super Admin</p>
                <p className="text-xs text-indigo-500">Changes take effect immediately across the platform.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: stripInjection(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: stripInjection(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                <input value={editUser.location} onChange={e => setEditUser(u => ({ ...u, location: stripInjection(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Account Status</label>
                <select value={editUser.status} onChange={e => setEditUser(u => ({ ...u, status: stripInjection(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Verified</label>
                <select value={editUser.verified ? "yes" : "no"} onChange={e => setEditUser(u => ({ ...u, verified: stripInjection(e.target.value) === "yes" }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  <option value="yes">✓ Verified</option>
                  <option value="no">Not verified</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Internal Admin Note</label>
              <textarea rows={2} placeholder="Optional note visible only to admin team…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveUser}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#4f46e5" }}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}


      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// ─── PITCH MANAGEMENT ────────────────────────────────────────────────────────

const PITCH_FILTERS = [
  { key: 'all',       label: 'All',       color: '#4f46e5' },
  { key: 'pending',   label: 'Pending',   color: '#d97706' },
  { key: 'accepted',  label: 'Accepted',  color: '#16a34a' },
  { key: 'rejected',  label: 'Rejected',  color: '#dc2626' },
  { key: 'withdrawn', label: 'Withdrawn', color: '#64748b' },
  { key: 'expired',   label: 'Expired',   color: '#f97316' },
  { key: 'flagged',   label: 'Flagged',   color: '#7c3aed' },
]

function PitchesPanel({ showToast, auditLog }) {
  const [pitches,  setPitches]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const [busy,     setBusy]     = useState(false)

  async function load() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('job_applications')
      .select('id, job_id, creator_id, pitch, rate, status, admin_flags, created_at')
      .order('created_at', { ascending: false })
    if (error) { showToast(error.message, 'error'); setLoading(false); return }
    const list = rows || []

    // Fetch creator names
    const creatorIds = [...new Set(list.map(r => r.creator_id).filter(Boolean))]
    let creatorMap = {}
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, handle, extra_pitches')
        .in('id', creatorIds)
      ;(profiles || []).forEach(p => { creatorMap[p.id] = p })
    }

    // Fetch collab/job titles
    const jobIds = [...new Set(list.map(r => r.job_id).filter(Boolean))]
    let jobMap = {}
    if (jobIds.length > 0) {
      const { data: jobs } = await supabase
        .from('collabs')
        .select('id, content_type')
        .in('id', jobIds)
      ;(jobs || []).forEach(j => { jobMap[j.id] = j.content_type || 'Campaign' })
    }

    setPitches(list.map(r => ({
      ...r,
      creatorName:    creatorMap[r.creator_id]?.full_name || creatorMap[r.creator_id]?.handle || 'Unknown',
      creatorProfile: creatorMap[r.creator_id] || null,
      campaignTitle:  jobMap[r.job_id] || '—',
    })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = pitches.filter(p => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      p.creatorName.toLowerCase().includes(term) ||
      (p.pitch || '').toLowerCase().includes(term) ||
      p.campaignTitle.toLowerCase().includes(term)
    const matchFilter = filter === 'all'     ? true
      : filter === 'flagged' ? !!(p.admin_flags?.abuse)
      : p.status === filter
    return matchSearch && matchFilter
  })

  const counts = Object.fromEntries(
    PITCH_FILTERS.map(f => [f.key,
      f.key === 'all'     ? pitches.length
      : f.key === 'flagged' ? pitches.filter(p => p.admin_flags?.abuse).length
      : pitches.filter(p => p.status === f.key).length
    ])
  )

  async function updatePitch(id, patch) {
    setBusy(true)
    const { error } = await supabase.from('job_applications').update(patch).eq('id', id)
    if (error) { showToast(error.message, 'error'); setBusy(false); return }
    await load()
    setBusy(false)
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete this pitch from ${p.creatorName}? This cannot be undone.`)) return
    setBusy(true)
    await supabase.from('job_applications').delete().eq('id', p.id)
    auditLog?.('delete_pitch', 'pitch', p.id, p.creatorName)
    showToast('Pitch deleted')
    setSelected(null)
    await load()
    setBusy(false)
  }

  async function handleFlagAbuse(p) {
    const current = p.admin_flags || {}
    const nowFlagged = !current.abuse
    await updatePitch(p.id, { admin_flags: { ...current, abuse: nowFlagged } })
    auditLog?.('flag_pitch_abuse', 'pitch', p.id, p.creatorName)
    showToast(nowFlagged ? 'Pitch flagged for abuse' : 'Abuse flag removed')
  }

  async function handleRestore(p) {
    await updatePitch(p.id, { status: 'pending', admin_flags: { ...(p.admin_flags || {}), restored: true } })
    auditLog?.('restore_pitch', 'pitch', p.id, p.creatorName)
    showToast('Pitch restored to pending')
  }

  async function handleCreditBack(p) {
    if (!p.creatorProfile) { showToast('Creator profile not found', 'error'); return }
    const current = p.creatorProfile.extra_pitches || 0
    setBusy(true)
    const { error } = await supabase.from('profiles')
      .update({ extra_pitches: current + 1 })
      .eq('id', p.creator_id)
    if (error) { showToast(error.message, 'error'); setBusy(false); return }
    auditLog?.('credit_pitch_back', 'pitch', p.id, p.creatorName)
    showToast(`1 pitch credited back to ${p.creatorName}`)
    await load()
    setBusy(false)
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const STATUS_STYLE = {
    pending:   { bg: '#fef3c7', color: '#d97706' },
    accepted:  { bg: '#dcfce7', color: '#16a34a' },
    rejected:  { bg: '#fee2e2', color: '#dc2626' },
    withdrawn: { bg: '#f1f5f9', color: '#64748b' },
    expired:   { bg: '#fff7ed', color: '#f97316' },
    interview:     { bg: '#ede9fe', color: '#7c3aed' },
    in_discussion: { bg: '#ede9fe', color: '#7c3aed' },
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pitch Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pitches.length} total pitches</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {PITCH_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f.key
              ? { backgroundColor: f.color, color: '#fff' }
              : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
            {f.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={filter === f.key
                ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                : { backgroundColor: '#e2e8f0', color: '#64748b' }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by creator, campaign or pitch text…"
            value={search} onChange={e => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400" />
        </div>
      </div>

      {/* List + Detail */}
      <div className="flex gap-4" style={{ minHeight: 500 }}>

        {/* List */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 700 }}>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Send className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No pitches</p>
            </div>
          ) : filtered.map(p => {
            const ss = STATUS_STYLE[p.status] || { bg: '#f1f5f9', color: '#64748b' }
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{ backgroundColor: selected?.id === p.id ? '#eef2ff' : '#fff', border: `1px solid ${selected?.id === p.id ? '#c7d2fe' : '#e2e8f0'}` }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.creatorName}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.admin_flags?.abuse && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Flagged</span>}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={ss}>{p.status}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">{p.campaignTitle}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{p.pitch ? p.pitch.slice(0, 60) + '…' : '—'}</p>
                <p className="text-xs text-gray-300 mt-1">{fmtDate(p.created_at)}</p>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white overflow-y-auto" style={{ border: '1px solid #e2e8f0', maxHeight: 700 }}>

            {/* Detail header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{selected.creatorName}</p>
                  <p className="text-sm text-gray-500">{selected.campaignTitle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {selected.admin_flags?.abuse && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Abuse flagged</span>
                  )}
                  {selected.admin_flags?.restored && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Restored</span>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={STATUS_STYLE[selected.status] || { bg: '#f1f5f9', color: '#64748b' }}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5">
                <ActionBtn label="🗑 Delete spam"      color="#ef4444" danger onClick={() => handleDelete(selected)} busy={busy} />
                <ActionBtn label={selected.admin_flags?.abuse ? '✓ Unflag abuse' : '⚑ Flag abuse'} color="#7c3aed"
                  onClick={() => handleFlagAbuse(selected)} busy={busy} />
                <ActionBtn label="↩ Restore pitch"    color="#0ea5e9" onClick={() => handleRestore(selected)} busy={busy} />
                <ActionBtn label="+ Credit pitch back" color="#16a34a" onClick={() => handleCreditBack(selected)} busy={busy} />
              </div>
            </div>

            {/* Detail body */}
            <div className="p-6 space-y-5">

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Proposed Rate</p>
                  <p className="text-base font-black text-gray-800 tabular-nums">₦{Number(selected.rate || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Submitted</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(selected.created_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Extra Pitches</p>
                  <p className="text-base font-black text-purple-600 tabular-nums">{selected.creatorProfile?.extra_pitches ?? '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pitch Text</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.pitch || 'No pitch text'}
                </div>
              </div>

              {selected.admin_flags && Object.keys(selected.admin_flags).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selected.admin_flags).map(([k, v]) => v && (
                      <span key={k} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 capitalize">
                        {k.replace(/_/g, ' ')}: {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: '1px solid #e2e8f0' }}>
            <div className="text-center">
              <Send className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Select a pitch to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
