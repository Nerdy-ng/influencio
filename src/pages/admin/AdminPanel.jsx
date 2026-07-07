import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Shield, Bell,
  DollarSign, Settings, LogOut, ChevronDown, Search, X,
  CheckCircle, XCircle, AlertTriangle, MoreVertical, Plus,
  TrendingUp, Activity, Check, ArrowUpRight, Eye, EyeOff, ShieldAlert, Pencil, Save, Globe,
  SlidersHorizontal, Star, Zap, BadgeCheck, RotateCcw, Info, ChevronUp, ChevronRight,
  BarChart2, HelpCircle, MessageSquare, Clock, Send, CreditCard, ToggleLeft, ToggleRight, Layers,
  Scale, Sparkles, Smartphone, Tag, ListFilter,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AdminModerationDashboard from "../../components/AdminModerationDashboard";
import { getModerationStats } from "../../utils/moderationEngine";
import CmsEditor from "../../components/admin/CmsEditor";
import { LOGO_SLOTS, getLogo, uploadLogoFile, removeLogoFromDB } from "../../lib/brandSettings";
import { getAllSettings, saveAllSettings, loadSettingsFromDB, getSetting, setSetting } from "../../lib/siteSettings";
import { THEME_VARS, loadThemeFromDB, saveThemeToDB, resetThemeToDB, getThemeDefaults } from "../../lib/themeSettings";
import { supabase } from "../../lib/supabase";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────


// ─── RANKING ALGORITHM DATA ───────────────────────────────────────────────────

const RANKING_TALENTS = [
  { id: 't1', name: 'Adaeze Okafor',    handle: '@adaeze.creates',  avatar: 'AO', tier: 'top-rated',   niches: ['Beauty','Fashion'],      location: 'Lagos',        rating: 4.9, campaigns: 89, followers: 280000, engagement: 4.8, verified: true,  profilePct: 100, joinedDays: 480 },
  { id: 't2', name: 'Tunde Bakare',     handle: '@tundebakare',     avatar: 'TB', tier: 'top-rated',   niches: ['Tech','Gadgets'],        location: 'Lagos',        rating: 4.9, campaigns: 72, followers: 120000, engagement: 5.1, verified: true,  profilePct: 100, joinedDays: 390 },
  { id: 't3', name: 'Ngozi Nnaji',      handle: '@ngozi.style',     avatar: 'NN', tier: 'top-rated',   niches: ['Fashion','Lifestyle'],   location: 'Abuja',        rating: 4.7, campaigns: 54, followers: 95000,  engagement: 4.2, verified: true,  profilePct: 95,  joinedDays: 310 },
  { id: 't4', name: 'Chiamaka Eze',     handle: '@chiamaka.tv',     avatar: 'CE', tier: 'next-rated',  niches: ['Food','Cooking'],        location: 'Enugu',        rating: 4.6, campaigns: 31, followers: 61000,  engagement: 6.3, verified: false, profilePct: 90,  joinedDays: 240 },
  { id: 't5', name: 'Emeka Obi',        handle: '@emeka.fitness',   avatar: 'EO', tier: 'next-rated',  niches: ['Fitness','Wellness'],    location: 'Lagos',        rating: 4.5, campaigns: 22, followers: 34000,  engagement: 4.9, verified: false, profilePct: 85,  joinedDays: 185 },
  { id: 't6', name: 'Fatima Usman',     handle: '@fatima.vibes',    avatar: 'FU', tier: 'next-rated',  niches: ['Beauty','Comedy'],       location: 'Kano',         rating: 4.4, campaigns: 18, followers: 48000,  engagement: 5.7, verified: false, profilePct: 80,  joinedDays: 160 },
  { id: 't7', name: 'Sola Adesanya',    handle: '@solacomedy',      avatar: 'SA', tier: 'fast-rising', niches: ['Comedy','Entertainment'],location: 'Ibadan',       rating: 4.2, campaigns: 8,  followers: 28000,  engagement: 7.1, verified: false, profilePct: 70,  joinedDays: 95  },
  { id: 't8', name: 'Amara Nwachukwu',  handle: '@amara.eats',      avatar: 'AN', tier: 'fast-rising', niches: ['Food','Travel'],         location: 'Port Harcourt',rating: 4.1, campaigns: 5,  followers: 15000,  engagement: 8.2, verified: false, profilePct: 65,  joinedDays: 60  },
  { id: 't9', name: 'Biodun Alabi',     handle: '@biodun.creates',  avatar: 'BA', tier: 'fast-rising', niches: ['Finance','Business'],    location: 'Kano',         rating: 3.9, campaigns: 3,  followers: 9500,   engagement: 6.4, verified: false, profilePct: 55,  joinedDays: 40  },
  { id: 't10',name: 'Chisom Igwe',      handle: '@chisom.style',    avatar: 'CI', tier: 'fast-rising', niches: ['Fashion','Beauty'],      location: 'Owerri',       rating: 4.3, campaigns: 6,  followers: 12000,  engagement: 9.1, verified: false, profilePct: 60,  joinedDays: 52  },
]

const WEIGHT_DEFAULTS = {
  balanced:     { rating: 20, campaigns: 20, followers: 15, engagement: 20, tier: 15, verified: 5, profilePct: 5 },
  qualityFirst: { rating: 35, campaigns: 30, followers: 5,  engagement: 15, tier: 10, verified: 3, profilePct: 2 },
  reachFirst:   { rating: 10, campaigns: 10, followers: 35, engagement: 30, tier: 10, verified: 3, profilePct: 2 },
  risingStars:  { rating: 15, campaigns: 5,  followers: 10, engagement: 30, tier: 5,  verified: 5, profilePct: 30 },
  topTier:      { rating: 20, campaigns: 25, followers: 10, engagement: 15, tier: 25, verified: 5, profilePct: 0 },
}

const WEIGHT_META = [
  { key: 'rating',     label: 'Avg Rating',          desc: 'Brand satisfaction score (0–5)',              color: '#D4AF37', max: 5,      icon: '⭐' },
  { key: 'campaigns',  label: 'Completed Campaigns',  desc: 'Proven track record on the platform',         color: '#22c55e', max: 100,    icon: '✅' },
  { key: 'followers',  label: 'Total Followers',       desc: 'Audience reach across all platforms',         color: '#3b82f6', max: 500000, icon: '👥' },
  { key: 'engagement', label: 'Engagement Rate',       desc: 'Audience quality and interaction (0–10%)',    color: '#ec4899', max: 10,     icon: '💫' },
  { key: 'tier',       label: 'Tier Level',            desc: 'Platform recognition (fast-rising→top-rated)',color: '#8b5cf6', max: 1,      icon: '🏅' },
  { key: 'verified',   label: 'Verified Status',       desc: 'Identity and social accounts verified',       color: '#06b6d4', max: 1,      icon: '🔒' },
  { key: 'profilePct', label: 'Profile Completeness',  desc: 'How complete the creator\'s profile is',      color: '#f97316', max: 100,    icon: '📋' },
]

const TIER_SCORE = { 'top-rated': 1.0, 'next-rated': 0.6, 'fast-rising': 0.25 }

const RANKING_KEY = 'brandior_ranking_config'

function calcScore(talent, weights, rules) {
  const w = weights
  const total = Object.values(w).reduce((s, v) => s + v, 0) || 1

  const signals = {
    rating:     talent.rating / 5,
    campaigns:  Math.min(talent.campaigns, 100) / 100,
    followers:  Math.min(talent.followers, 500000) / 500000,
    engagement: Math.min(talent.engagement, 10) / 10,
    tier:       TIER_SCORE[talent.tier] || 0,
    verified:   talent.verified ? 1 : 0,
    profilePct: talent.profilePct / 100,
  }

  let score = 0
  const breakdown = {}
  for (const key of Object.keys(signals)) {
    const contribution = (signals[key] * (w[key] || 0)) / total
    breakdown[key] = Math.round(contribution * 1000) / 10
    score += contribution
  }

  // Boost rules
  if (rules.pinVerified && talent.verified) score = Math.min(score + 0.1, 1)
  if (rules.boostNewcomers && talent.joinedDays < 90) score = Math.min(score + 0.05, 1)
  if (rules.highEngagementBoost && talent.engagement > 7) score = Math.min(score + 0.05, 1)

  return { score: Math.round(score * 1000) / 10, breakdown }
}

const MOCK_MANAGERS = [
  { id: 1, name: "Jane Okonkwo", email: "jane@brandior.co", role: "Manager", status: "Active", lastLogin: "Today, 09:14 AM", avatar: "JO" },
  { id: 2, name: "Chidi Eze", email: "chidi@brandior.co", role: "Manager", status: "Active", lastLogin: "Yesterday, 3:22 PM", avatar: "CE" },
  { id: 3, name: "Fatima Bello", email: "fatima@brandior.co", role: "Manager", status: "Inactive", lastLogin: "Mar 10, 2025", avatar: "FB" },
];

const MOCK_STAFF = [
  { id: 1, name: "Tunde Afolabi", email: "tunde@brandior.co", role: "Staff", status: "Active", lastLogin: "Today, 10:02 AM", avatar: "TA" },
  { id: 2, name: "Blessing Eze", email: "blessing@brandior.co", role: "Staff", status: "Active", lastLogin: "Today, 08:45 AM", avatar: "BE" },
  { id: 3, name: "Musa Garba", email: "musa@brandior.co", role: "Staff", status: "Inactive", lastLogin: "Mar 12, 2025", avatar: "MG" },
  { id: 4, name: "Chinwe Obi", email: "chinwe@brandior.co", role: "Staff", status: "Active", lastLogin: "Yesterday, 5:10 PM", avatar: "CO" },
  { id: 5, name: "Amaka Nze", email: "amaka@brandior.co", role: "Staff", status: "Active", lastLogin: "Today, 07:30 AM", avatar: "AN" },
];

const MOCK_APPROVALS = [
  { id: 1, requester: "Jane Okonkwo", requesterRole: "Manager", type: "Verify Talent", description: "Adaeze Okafor completed verification requirements. Recommend full badge.", target: "Adaeze Okafor", timestamp: "2 hours ago", status: "pending" },
  { id: 2, requester: "Tunde Afolabi", requesterRole: "Staff", type: "Suspend User", description: "User repeatedly posting misleading campaign info. Recommend temporary suspension.", target: "Biodun Alabi", timestamp: "4 hours ago", status: "pending" },
  { id: 5, requester: "Fatima Bello", requesterRole: "Manager", type: "Process Refund", description: "Brand cancelled collab 48hrs after creator delivered. Partial refund requested.", target: "GTBank Marketing", timestamp: "2 days ago", status: "pending" },
  { id: 6, requester: "Chinwe Obi", requesterRole: "Staff", type: "Suspend User", description: "Fake follower evidence submitted for this talent profile.", target: "Kemi Fashola", timestamp: "3 days ago", status: "pending" },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN001", talent: "Adaeze Okafor", brand: "Tecno Mobile", amount: "₦850,000", fee: "₦85,000", net: "₦765,000", date: "Mar 18, 2025", status: "completed" },
  { id: "TXN002", talent: "Ngozi Adeyemi", brand: "Flutterwave", amount: "₦400,000", fee: "₦40,000", net: "₦360,000", date: "Mar 15, 2025", status: "pending" },
  { id: "TXN003", talent: "Emeka Nwosu", brand: "Pepsi Nigeria", amount: "₦1,800,000", fee: "₦180,000", net: "₦1,620,000", date: "Mar 12, 2025", status: "completed" },
  { id: "TXN004", talent: "Kemi Fashola", brand: "Zara Nigeria", amount: "₦600,000", fee: "₦60,000", net: "₦540,000", date: "Mar 10, 2025", status: "failed" },
  { id: "TXN005", talent: "Biodun Alabi", brand: "GTBank Marketing", amount: "₦1,200,000", fee: "₦120,000", net: "₦1,080,000", date: "Mar 8, 2025", status: "pending" },
];

const ACTIVITY_FEED = [
  { id: 1, text: "Manager Jane approved talent Adaeze Okafor for verification", time: "2 min ago", type: "approve" },
  { id: 2, text: "Staff flagged job post from Tecno Mobile (J01) for review", time: "14 min ago", type: "flag" },
  { id: 3, text: "New brand Zara Nigeria completed onboarding", time: "31 min ago", type: "new" },
  { id: 4, text: "Campaign completed: Emeka Nwosu x Pepsi Nigeria", time: "1 hr ago", type: "complete" },
  { id: 5, text: "Manager Chidi submitted refund request for GTBank", time: "2 hrs ago", type: "request" },
  { id: 6, text: "Staff Blessing flagged user Biodun Alabi for fake followers", time: "4 hrs ago", type: "flag" },
];

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color = "#4f46e5" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
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
  { id: "analytics", label: "Analytics",  Icon: BarChart2 },
  { id: "users",     label: "Users",      Icon: Users },
  { id: "rankings",  label: "Rankings",   Icon: SlidersHorizontal },
  { id: "jobs",      label: "Collabs",     Icon: Briefcase },
  { id: "team",      label: "Team",       Icon: Shield },
  { id: "approvals", label: "Approvals",  Icon: Bell, badge: true },
  { id: "disputes",  label: "Disputes",   Icon: Scale, badge: true, badgeColor: "#ef4444" },
  { id: "content",   label: "Content",    Icon: Globe },
  { id: "ai-police", label: "AI Police",  Icon: ShieldAlert, badge: true, badgeColor: "#ef4444" },
  { id: "features",  label: "Features",   Icon: Layers },
  { id: "payments",  label: "Payments",   Icon: CreditCard },
  { id: "financials",label: "Financials", Icon: DollarSign },
  { id: "legal",     label: "Legal",      Icon: Pencil },
  { id: "support",   label: "Support",    Icon: HelpCircle },
  { id: "app-config",label: "App Config",  Icon: Smartphone },
  { id: "settings",  label: "Settings",   Icon: Settings },
];

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

## 5. Content & Conduct
Users must not post misleading, offensive, or illegal content. Brandior reserves the right to remove any content or suspend any account that violates these terms.

## 6. Intellectual Property
Content posted by users remains their property. By posting on Brandior, you grant us a licence to display that content on the Platform.

## 7. Limitation of Liability
Brandior is not liable for any indirect, incidental, or consequential damages arising from use of the Platform.

## 8. Governing Law
These terms are governed by the laws of the Federal Republic of Nigeria.

## 9. Contact
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
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [users, setUsers] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [managers, setManagers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [brandFee, setBrandFee] = useState(() => getAllSettings().brandFee || "10");
  const [creatorFee, setCreatorFee] = useState(() => getAllSettings().creatorFee || "5");
  const [legalDocs, setLegalDocs] = useState({
    terms: localStorage.getItem('brandior_legal_terms') || DEFAULT_TERMS,
    privacy: localStorage.getItem('brandior_legal_privacy') || DEFAULT_PRIVACY,
    cookies: localStorage.getItem('brandior_legal_cookies') || DEFAULT_COOKIES,
  })
  const [activeLegalDoc, setActiveLegalDoc] = useState('terms')

  // Ranking algorithm state
  const [rankWeights, setRankWeights] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RANKING_KEY + '_weights')) || WEIGHT_DEFAULTS.balanced }
    catch { return WEIGHT_DEFAULTS.balanced }
  })
  const [rankRules, setRankRules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RANKING_KEY + '_rules')) || { pinVerified: false, suppressSuspended: true, boostNewcomers: false, highEngagementBoost: false } }
    catch { return { pinVerified: false, suppressSuspended: true, boostNewcomers: false, highEngagementBoost: false } }
  })
  const [rankPreset, setRankPreset] = useState('balanced')
  const [rankSaved, setRankSaved] = useState(false)
  const [rankExpanded, setRankExpanded] = useState(null)

  function saveLegalDocs() {
    localStorage.setItem('brandior_legal_terms', legalDocs.terms)
    localStorage.setItem('brandior_legal_privacy', legalDocs.privacy)
    localStorage.setItem('brandior_legal_cookies', legalDocs.cookies)
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
  const PAYMENT_KEY = 'brandior_payment_config'
  const defaultPaymentConfig = {
    activeProcessor: '',
    mode: 'test',
    processors: {
      paystack:    { enabled: false, publicKey: '', secretKey: '', showSecret: false },
      flutterwave: { enabled: false, publicKey: '', secretKey: '', showSecret: false },
      stripe:      { enabled: false, publicKey: '', secretKey: '', showSecret: false },
    }
  }
  const [paymentConfig, setPaymentConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PAYMENT_KEY)) || defaultPaymentConfig } catch { return defaultPaymentConfig }
  })
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [paymentSaved, setPaymentSaved] = useState(false)

  async function savePaymentConfig() {
    setPaymentSaving(true)
    const clean = { ...paymentConfig, processors: Object.fromEntries(
      Object.entries(paymentConfig.processors).map(([k, v]) => [k, { ...v, showSecret: false }])
    )}
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(clean))
    await supabase.from('site_settings').upsert({ key: 'payment_config', value: JSON.stringify(clean), updated_at: new Date().toISOString() })
    setPaymentSaving(false)
    setPaymentSaved(true)
    setTimeout(() => setPaymentSaved(false), 2000)
  }

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'payment_config').single()
      .then(({ data }) => {
        if (data?.value) {
          try { setPaymentConfig(JSON.parse(data.value)) } catch {}
        }
      })
  }, [])

  // App Config state
  const DEFAULT_APP_CONFIG = {
    collab_types:           ['UGC', 'Brand Ambassador', 'Voiceover', 'Influencer', 'Product Review'],
    niche_categories:       ['Beauty & Skincare', 'Fashion & Style', 'Fitness & Sports', 'Food & Lifestyle', 'Tech & Gadgets', 'Travel', 'Health & Wellness', 'Entertainment', 'Education', 'Business & Finance', 'Parenting & Family', 'Art & Culture'],
    content_types:          ['Short Video', 'Photo Post', 'Story / Reel', 'Long-form Video', 'Blog Post', 'Podcast Mention', 'Live Session'],
    min_creator_rate:       20000,
    platform_commission_pct: 5,
  }
  const [appConfig,        setAppConfig]        = useState(DEFAULT_APP_CONFIG)
  const [appConfigSaving,  setAppConfigSaving]  = useState(false)
  const [appConfigSaved,   setAppConfigSaved]   = useState(false)
  const [appConfigNewItem, setAppConfigNewItem] = useState({ collab_types: '', niche_categories: '', content_types: '' })

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
    await supabase.from('site_settings').upsert({
      key: 'app_config',
      value: JSON.stringify(appConfig),
      updated_at: new Date().toISOString(),
    })
    setAppConfigSaving(false)
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
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("Talents");

  // Modal state
  const [addTeamModal, setAddTeamModal] = useState(null); // 'manager' | 'staff'
  const [newMember, setNewMember] = useState({ name: "", email: "" });
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
    const role = localStorage.getItem("brandiór_admin_role");
    const user = localStorage.getItem("brandiór_admin_user");
    if (role !== "admin") {
      navigate("/admin/login");
      return;
    }
    if (user) setAdminUser(JSON.parse(user));
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
          tier: p.tier || 'fast-rising',
          location: p.location || '—',
          joined: p.created_at ? new Date(p.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          status: p.status || 'active',
          avatar: (p.full_name || p.handle || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
          verified: p.verified || false,
          _raw: p,
        })))
      }

      // Overview stats
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: collabCount } = await supabase.from('collabs').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress', 'delivered', 'revision_requested'])
      const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
      setRealStats({ userCount, collabCount, reviewCount })

      // Build 30-day daily charts
      const buildDailyMap = (rows, dateField) => {
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
      const since = new Date(); since.setDate(since.getDate() - 30)
      const [{ data: recentProfiles }, { data: recentCollabs }] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', since.toISOString()),
        supabase.from('collabs').select('created_at').gte('created_at', since.toISOString()),
      ])
      setAdminCharts({
        dailySignups: buildDailyMap(recentProfiles, 'created_at'),
        dailyCollabs: buildDailyMap(recentCollabs, 'created_at'),
      })

      // Team members
      const { data: teamRows } = await supabase.from('admin_users').select('*').order('created_at')
      if (teamRows) {
        const mkAvatar = name => (name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
        const mkLastLogin = ts => ts ? new Date(ts).toLocaleString('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Never'
        setManagers(teamRows.filter(r => r.role === 'manager').map(r => ({ ...r, avatar: mkAvatar(r.name), lastLogin: mkLastLogin(r.last_login) })))
        setStaffList(teamRows.filter(r => r.role === 'staff').map(r => ({ ...r, avatar: mkAvatar(r.name), lastLogin: mkLastLogin(r.last_login) })))
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

  const [realStats, setRealStats] = useState({ userCount: null, collabCount: null, reviewCount: null })
  const [adminCharts, setAdminCharts] = useState(null)

  // ── Financial state ──
  const [finStats, setFinStats]             = useState({ revenue: 0, escrowTotal: 0, releasedTotal: 0, refundedTotal: 0 })
  const [escrowItems, setEscrowItems]       = useState([])
  const [finTransactions, setFinTransactions] = useState([])
  const [wallets, setWallets]               = useState([])
  const [finLoading, setFinLoading]         = useState(false)
  const [walletAdjust, setWalletAdjust]     = useState(null) // { profile, delta, reason }
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
          .select('id, full_name, company_name, owner_name, role, wallet_balance, payout_accounts')
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
    const { data: creator } = await supabase.from('profiles').select('wallet_balance').eq('id', item.creator_id).single()
    const newBal = (creator?.wallet_balance || 0) + (item.creator_payout || 0)
    await Promise.all([
      supabase.from('collabs').update({ payment_status: 'released' }).eq('id', item.fullId || item.id),
      supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', item.creator_id),
    ])
    showToast(`Released ₦${(item.creator_payout||0).toLocaleString()} to ${item.creatorName}`)
    loadFinancials()
  }

  async function refundEscrow(item) {
    const { data: brand } = await supabase.from('profiles').select('wallet_balance').eq('id', item.brand_id).single()
    const newBal = (brand?.wallet_balance || 0) + (item.total_amount || 0)
    await Promise.all([
      supabase.from('collabs').update({ payment_status: 'refunded', status: 'cancelled' }).eq('id', item.fullId || item.id),
      supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', item.brand_id),
    ])
    showToast(`Refunded ₦${(item.total_amount||0).toLocaleString()} to ${item.brandName}`)
    loadFinancials()
  }

  async function applyWalletAdjust() {
    if (!walletAdjust) return
    const { profile, delta, reason } = walletAdjust
    const newBal = Math.max(0, (profile.wallet_balance || 0) + Number(delta))
    await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', profile.id)
    showToast(`Wallet for ${pName(profile)} adjusted to ₦${newBal.toLocaleString()} — ${reason || 'no reason given'}`)
    setWalletAdjust(null)
    loadFinancials()
  }

  function pName(p) { return p?.company_name || p?.full_name || p?.owner_name || 'Unknown' }

  async function triggerPayout() {
    if (!payoutTarget || !payoutAmount) return
    setPayoutBusy(true)
    try {
      const account = (payoutTarget.payout_accounts || []).find(a => a.isDefault) || payoutTarget.payout_accounts?.[0]
      if (!account) { showToast('Creator has no payout account set up', 'error'); return }
      const amt = parseInt(payoutAmount.replace(/\D/g, ''), 10)
      if (amt < 100) { showToast('Minimum payout is ₦100', 'error'); return }
      const res = await fetch('/api/paystack-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          recipient: { bank_code: account.bankCode, account_number: account.accountNumber, name: account.accountName },
          reason: `Brandior payout — ${payoutTarget.full_name || payoutTarget.company_name}`,
          meta: { profile_id: payoutTarget.id },
        }),
      })
      const json = await res.json()
      if (json.status === 'success') {
        const newBal = Math.max(0, (payoutTarget.wallet_balance || 0) - amt)
        await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', payoutTarget.id)
        showToast(`Transferred ₦${amt.toLocaleString()} to ${account.accountName} (${account.bankName})`)
        setPayoutTarget(null); setPayoutAmount('')
        loadFinancials()
      } else {
        showToast(json.message || 'Transfer failed', 'error')
      }
    } catch (e) {
      showToast('Payout API not deployed yet — set up /api/paystack-transfer first', 'error')
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

  const handleLogout = () => {
    localStorage.removeItem("brandiór_admin_user");
    localStorage.removeItem("brandiór_admin_role");
    navigate("/admin/login");
  };

  const handleApprovalAction = async (id, action) => {
    const item = approvals.find((a) => a.id === id);
    if (action === 'approved' && item) {
      if (item.type === 'Verify Talent' && item.targetId) {
        await supabase.from('profiles').update({ verified: true }).eq('id', item.targetId)
        setUsers(prev => prev.map(u => u.id === item.targetId ? { ...u, verified: true } : u))
      } else if (item.type === 'Suspend User' && item.targetId) {
        await supabase.from('profiles').update({ status: 'suspended' }).eq('id', item.targetId)
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
    setConfirmModal({
      title: "Ban User",
      message: "Are you sure you want to permanently ban this user? This action cannot be undone.",
      onConfirm: async () => {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "banned" } : u));
        await supabase.from('profiles').update({ status: 'banned' }).eq('id', userId)
        setConfirmModal(null);
        showToast("User has been banned.");
      },
    });
  };

  const handleSuspendUser = async (userId) => {
    const user = users.find(u => u.id === userId)
    const newStatus = user?.status === "suspended" ? "active" : "suspended"
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    showToast("User status updated.");
  };

  const handleVerifyUser = async (userId) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verified: true } : u));
    await supabase.from('profiles').update({ verified: true }).eq('id', userId)
    showToast("User verified successfully.");
  };

  const handleChangeTier = async (userId, tier) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, tier } : u));
    await supabase.from('profiles').update({ tier }).eq('id', userId)
    showToast("Tier updated.");
  };

  const handleSaveUser = async () => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
    await supabase.from('profiles').update({
      full_name: editUser.name,
      location: editUser.location,
      tier: editUser.tier,
      status: editUser.status,
      verified: editUser.verified,
    }).eq('id', editUser.id)
    setEditUser(null);
    showToast("User profile updated successfully.");
  };

  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.email) return;
    const role = addTeamModal === "manager" ? "manager" : "staff"
    const { data: inserted, error } = await supabase.from('admin_users').insert({
      name: newMember.name, email: newMember.email.trim().toLowerCase(), role, status: 'Active',
    }).select().single()
    if (error) { showToast(error.message || 'Failed to add team member', 'error'); return; }
    const member = {
      ...inserted,
      avatar: newMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      lastLogin: 'Never',
    };
    if (addTeamModal === "manager") setManagers((prev) => [...prev, member]);
    else setStaffList((prev) => [...prev, member]);
    setAddTeamModal(null);
    setNewMember({ name: "", email: "" });
    showToast(`${addTeamModal === "manager" ? "Manager" : "Staff"} added successfully.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userFilter === "Suspended" || userFilter === "Banned"
      ? true
      : userFilter === "Talents" ? ['Talent', 'talent', 'creator'].includes(u.role) : ['Brand', 'brand'].includes(u.role);
    const matchStatus = userFilter === "Suspended" ? u.status === "suspended"
      : userFilter === "Banned" ? u.status === "banned"
      : true;
    return matchSearch && matchRole && matchStatus;
  });

  // ─── TABS ─────────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users",       value: realStats.userCount ?? users.length,    icon: Users,    color: "#4f46e5" },
          { label: "Active Collabs",     value: realStats.collabCount ?? 0,             icon: Activity, color: "#0ea5e9" },
          { label: "Total Reviews",      value: realStats.reviewCount ?? '—',           icon: Star,     color: "#16a34a" },
          { label: "Pending Approvals",  value: pendingCount,                           icon: Bell,     color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% this week</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activityFeed.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: a.type === "flag" ? "#ef4444" : a.type === "approve" ? "#16a34a" : "#4f46e5" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            {[
              { label: "Talent signups this week", value: 23 },
              { label: "Brand signups", value: 8 },
              { label: "Jobs posted", value: 41 },
              { label: "Campaigns completed", value: 17 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-600">{item.label}</p>
                <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    if (!adminCharts) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" /></div>
    const chartStyle = { border: '1px solid #e2e8f0' }
    const INDIGO = '#4f46e5'
    const GREEN  = '#16a34a'
    const AMBER  = '#d97706'
    const charts = [
      { title: 'User Signups — Last 30 Days',  data: adminCharts.dailySignups, color: INDIGO },
      { title: 'Collabs Created — Last 30 Days', data: adminCharts.dailyCollabs, color: GREEN  },
    ]
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Platform Analytics</h2>
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',      value: realStats.userCount ?? '—',    color: INDIGO },
            { label: 'Active Collabs',   value: realStats.collabCount ?? '—',  color: GREEN  },
            { label: 'Total Reviews',    value: realStats.reviewCount ?? '—',  color: '#0ea5e9' },
            { label: 'Pending Approvals',value: pendingCount,                  color: AMBER  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        {/* Charts */}
        {charts.map(({ title, data, color }) => (
          <div key={title} className="bg-white rounded-xl p-5 shadow-sm" style={chartStyle}>
            <p className="font-semibold text-gray-900 mb-4">{title}</p>
            {data.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-28 text-sm text-gray-400">No data yet</div>
            )}
          </div>
        ))}
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${userFilter.toLowerCase()}...`}
              value={userSearch}
              onChange={(e) => setUserSearch(stripInjection(e.target.value))}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none"
              style={{ '--tw-ring-color': accentColor }}
            />
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setEditUser({ ...user })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-white"
                          style={{ backgroundColor: accentColor }}>
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        {!user.verified && (
                          <button onClick={() => handleVerifyUser(user.id)} className="px-2 py-1 text-xs rounded-lg text-white" style={{ backgroundColor: "#16a34a" }}>Verify</button>
                        )}
                        <button onClick={() => handleSuspendUser(user.id)} className="px-2 py-1 text-xs rounded-lg font-medium" style={{ backgroundColor: user.status === "suspended" ? "#dcfce7" : "#fef3c7", color: user.status === "suspended" ? "#16a34a" : "#d97706" }}>
                          {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                        </button>
                        <button onClick={() => handleBanUser(user.id)} className="px-2 py-1 text-xs rounded-lg text-white" style={{ backgroundColor: "#dc2626" }}>Ban</button>
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

  const renderCollabs = () => <CollabsPanel showToast={showToast} />

  const renderTeam = () => (
    <div className="space-y-6">
      {/* Managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Managers <span className="text-gray-400 text-sm font-normal ml-1">({managers.length})</span></h3>
          <button onClick={() => setAddTeamModal("manager")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#4f46e5" }}>
            <Plus className="w-4 h-4" /> Add Manager
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {managers.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar initials={m.avatar} size="sm" color="#7c3aed" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={m.status} />
                <p className="text-xs text-gray-400 hidden sm:block">Last: {m.lastLogin}</p>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Deactivate</button>
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Reset PW</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Staff <span className="text-gray-400 text-sm font-normal ml-1">({staffList.length})</span></h3>
          <button onClick={() => setAddTeamModal("staff")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0ea5e9" }}>
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {staffList.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar initials={s.avatar} size="sm" color="#0ea5e9" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={s.status} />
                <p className="text-xs text-gray-400 hidden sm:block">Last: {s.lastLogin}</p>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Deactivate</button>
                  <button className="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Reset PW</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

  const renderFinancials = () => (
    <div className="space-y-6">

      {/* ── Reload button ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Live data from Supabase</p>
        <button onClick={loadFinancials} disabled={finLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
          <RotateCcw className={`w-3.5 h-3.5 ${finLoading ? 'animate-spin' : ''}`} />
          {finLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Platform Revenue", value: `₦${finStats.revenue.toLocaleString()}`,       color: "#16a34a", icon: TrendingUp },
          { label: "In Escrow",        value: `₦${finStats.escrowTotal.toLocaleString()}`,    color: "#d97706", icon: Clock },
          { label: "Released",         value: `₦${finStats.releasedTotal.toLocaleString()}`,  color: "#4f46e5", icon: CheckCircle },
          { label: "Refunded",         value: `₦${finStats.refundedTotal.toLocaleString()}`,  color: "#ef4444", icon: RotateCcw },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Escrow Management ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Escrow Queue</h3>
            <p className="text-xs text-gray-400 mt-0.5">Payments held in escrow — release to creator or refund to brand</p>
          </div>
          {escrowItems.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{escrowItems.length} pending</span>
          )}
        </div>
        {escrowItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No payments in escrow</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["ID", "Brand", "Creator", "Type", "Total", "Creator Gets", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {escrowItems.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/40">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{item.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.brandName}</td>
                    <td className="px-4 py-3 text-gray-700">{item.creatorName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.content_type || '—'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₦{(item.total_amount||0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">₦{(item.creator_payout||0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => releaseEscrow(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors whitespace-nowrap">
                          Release
                        </button>
                        <button onClick={() => refundEscrow(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap">
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Wallet Management ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Wallet Balances</h3>
          <p className="text-xs text-gray-400 mt-0.5">View and manually adjust user wallet balances</p>
        </div>
        {wallets.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No wallets with positive balances</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["User", "Role", "Balance", "Adjust"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wallets.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{pName(p)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: p.role === 'brand' ? '#dbeafe' : '#f3e8ff', color: p.role === 'brand' ? '#1d4ed8' : '#7c3aed' }}>
                        {p.role || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">₦{(p.wallet_balance||0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setWalletAdjust({ profile: p, delta: '', reason: '' })}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Paystack Payout Trigger ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Manual Payout Trigger</h3>
          <p className="text-xs text-gray-400 mt-0.5">Send a Paystack bank transfer directly to a creator's registered account</p>
        </div>
        <div className="p-5 space-y-4">
          {/* Creator picker */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Select Creator</label>
            <select
              value={payoutTarget?.id || ''}
              onChange={e => setPayoutTarget(wallets.find(w => w.id === e.target.value && w.role === 'creator') || null)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white">
              <option value="">— choose a creator —</option>
              {wallets.filter(w => w.role === 'creator').map(w => (
                <option key={w.id} value={w.id}>{pName(w)} — ₦{(w.wallet_balance||0).toLocaleString()}</option>
              ))}
            </select>
          </div>

          {/* Bank account preview */}
          {payoutTarget && (() => {
            const acc = (payoutTarget.payout_accounts || []).find(a => a.isDefault) || payoutTarget.payout_accounts?.[0]
            return acc ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{acc.accountName}</p>
                  <p className="text-xs text-gray-500">{acc.bankName} · {acc.accountNumber}</p>
                </div>
                <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Default</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 font-medium">
                No payout account set up — creator must add one in PayoutSettings
              </div>
            )
          })()}

          {/* Amount + send */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (₦)</label>
              <input type="text" value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="flex items-end">
              <button onClick={triggerPayout} disabled={payoutBusy || !payoutTarget || !payoutAmount}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: payoutBusy ? '#94a3b8' : '#7c3aed' }}>
                {payoutBusy ? 'Sending…' : 'Send Transfer'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Requires <code className="bg-gray-100 px-1 rounded">/api/paystack-transfer</code> endpoint to be deployed.</p>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>
        {finTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["ID", "Creator", "Brand", "Amount", "Fee", "Net", "Type", "Date", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finTransactions.map(t => (
                  <tr key={t.fullId || t.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.creator}</td>
                    <td className="px-4 py-3 text-gray-600">{t.brand}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₦{(t.amount||0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-500">₦{(t.fee||0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₦{(t.net||0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.type}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Fee Settings ── */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-1">Fee Settings</h3>
        <p className="text-xs text-gray-400 mb-5">Brand fee is added on top of the collab total. Creator fee is deducted from creator's payout.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brand Fee (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" value={brandFee} onChange={e => setBrandFee(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" min="0" max="50" />
              <span className="text-sm text-gray-500">% of collab value</span>
            </div>
            <p className="text-xs text-gray-500">e.g. ₦100,000 → brand pays <strong>₦{(100000*(1+Number(brandFee)/100)).toLocaleString()}</strong></p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Creator Fee (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" value={creatorFee} onChange={e => setCreatorFee(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" min="0" max="50" />
              <span className="text-sm text-gray-500">% of payout</span>
            </div>
            <p className="text-xs text-gray-500">e.g. ₦100,000 → creator receives <strong>₦{(100000*(1-Number(creatorFee)/100)).toLocaleString()}</strong></p>
          </div>
        </div>
        <button onClick={() => { saveAllSettings({ brandFee, creatorFee }); showToast("Fee settings saved.") }}
          className="mt-5 px-5 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#4f46e5" }}>
          Save Fees
        </button>
      </div>

      {/* ── Wallet Adjust Modal ── */}
      {walletAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-1">Adjust Wallet</h3>
            <p className="text-sm text-gray-500 mb-4">
              {pName(walletAdjust.profile)} · Current: <strong>₦{(walletAdjust.profile.wallet_balance||0).toLocaleString()}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (use − to deduct)</label>
                <input type="number" value={walletAdjust.delta}
                  onChange={e => setWalletAdjust(a => ({ ...a, delta: e.target.value }))}
                  placeholder="e.g. 5000 or -2500"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Reason</label>
                <input type="text" value={walletAdjust.reason}
                  onChange={e => setWalletAdjust(a => ({ ...a, reason: e.target.value }))}
                  placeholder="e.g. Manual credit for campaign bonus"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setWalletAdjust(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={applyWalletAdjust} disabled={!walletAdjust.delta}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#4f46e5' }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAppConfig = () => {
    const listFields = [
      { key: 'collab_types',     label: 'Collab Types',      desc: 'Available collaboration types brands can choose when posting a campaign or hiring a creator.' },
      { key: 'niche_categories', label: 'Niche Categories',  desc: 'Niche options creators pick for their profile and brands use to filter creators.' },
      { key: 'content_types',    label: 'Content Types',     desc: 'Types of content deliverables creators and brands can select in offers and campaigns.' },
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
              <p className="text-xs text-gray-400 mt-1">Percentage the platform takes from each collab payment. Default: 5%.</p>
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

  // ── Rankings Algorithm ──────────────────────────────────────────────────────
  function applyPreset(preset) {
    setRankWeights({ ...WEIGHT_DEFAULTS[preset] })
    setRankPreset(preset)
  }

  function updateWeight(key, val) {
    setRankWeights(w => ({ ...w, [key]: Number(val) }))
    setRankPreset('custom')
  }

  function saveRanking() {
    localStorage.setItem(RANKING_KEY + '_weights', JSON.stringify(rankWeights))
    localStorage.setItem(RANKING_KEY + '_rules', JSON.stringify(rankRules))
    window.dispatchEvent(new CustomEvent('brandior:rankings-updated', { detail: { weights: rankWeights, rules: rankRules } }))
    setRankSaved(true)
    setTimeout(() => setRankSaved(false), 2500)
  }

  function resetRanking() {
    applyPreset('balanced')
    setRankRules({ pinVerified: false, suppressSuspended: true, boostNewcomers: false, highEngagementBoost: false })
  }

  const rankedTalents = [...RANKING_TALENTS]
    .map(t => ({ ...t, ...calcScore(t, rankWeights, rankRules) }))
    .sort((a, b) => b.score - a.score)

  const TIER_BADGE = {
    'top-rated':   { label: 'Top Rated',   bg: '#D4AF3720', color: '#D4AF37' },
    'next-rated':  { label: 'Next Rated',  bg: '#3b82f620', color: '#3b82f6' },
    'fast-rising': { label: 'Fast Rising', bg: '#22c55e20', color: '#22c55e' },
  }

  const PRESET_INFO = [
    { key: 'balanced',     label: 'Balanced',       desc: 'Equal weighting across all signals' },
    { key: 'qualityFirst', label: 'Quality First',  desc: 'Prioritise rating + proven campaigns' },
    { key: 'reachFirst',   label: 'Reach First',    desc: 'Maximise follower count and engagement' },
    { key: 'risingStars',  label: 'Rising Stars',   desc: 'Surface new talent with high engagement' },
    { key: 'topTier',      label: 'Top Tier Only',  desc: 'Heavy weight on tier and track record' },
  ]

  const BOOST_RULES = [
    { key: 'pinVerified',        label: 'Pin verified creators',     desc: 'Give verified creators a +10% score bump' },
    { key: 'suppressSuspended',  label: 'Suppress suspended accounts', desc: 'Hide suspended creators from suggestions' },
    { key: 'boostNewcomers',     label: 'Boost newcomers',           desc: '+5% for creators who joined in the last 90 days' },
    { key: 'highEngagementBoost',label: 'Boost high engagement',     desc: '+5% for creators with engagement rate above 7%' },
  ]

  const totalWeight = Object.values(rankWeights).reduce((s, v) => s + v, 0)

  const renderRankings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
            Ranking Algorithm
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure how creator profiles are ranked and suggested to brands.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetRanking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={saveRanking}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: rankSaved ? '#16a34a' : '#4f46e5' }}>
            {rankSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Algorithm</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── Left: Config panel ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Presets */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Quick Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_INFO.map(p => (
                <button key={p.key} onClick={() => applyPreset(p.key)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border"
                  style={{
                    backgroundColor: rankPreset === p.key ? '#eef2ff' : '#fafafa',
                    borderColor: rankPreset === p.key ? '#6366f1' : '#e5e7eb',
                  }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rankPreset === p.key ? '#4f46e5' : '#d1d5db' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                    <p className="text-xs text-gray-400 truncate">{p.desc}</p>
                  </div>
                  {rankPreset === p.key && <Check className="w-4 h-4 ml-auto flex-shrink-0 text-indigo-500" />}
                </button>
              ))}
              {rankPreset === 'custom' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500"
                  style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <Info className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                  Custom configuration active
                </div>
              )}
            </div>
          </div>

          {/* Weight sliders */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Signal Weights</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: Math.abs(totalWeight - 100) > 5 ? '#fef2f2' : '#f0fdf4',
                  color: Math.abs(totalWeight - 100) > 5 ? '#991b1b' : '#166534' }}>
                Total: {totalWeight}
              </span>
            </div>
            <div className="space-y-4">
              {WEIGHT_META.map(({ key, label, desc, color, icon }) => {
                const val = rankWeights[key] || 0
                const pct = totalWeight > 0 ? Math.round((val / totalWeight) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{icon}</span>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <span className="group relative">
                          <Info className="w-3 h-3 text-gray-300 cursor-help" />
                          <span className="absolute left-5 top-0 hidden group-hover:block whitespace-nowrap text-[11px] bg-gray-800 text-white px-2 py-1 rounded-lg z-10 pointer-events-none">
                            {desc}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{pct}%</span>
                        <span className="text-sm font-bold w-6 text-right" style={{ color }}>{val}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="range" min={0} max={50} step={1} value={val}
                        onChange={e => updateWeight(key, stripInjection(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: color }} />
                      <div className="absolute top-0 left-0 h-2 rounded-full pointer-events-none"
                        style={{ width: `${(val / 50) * 100}%`, backgroundColor: color + '40' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Boost rules */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Boost Rules
            </h3>
            <div className="space-y-3">
              {BOOST_RULES.map(rule => (
                <label key={rule.key} className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 flex-shrink-0">
                    <input type="checkbox" checked={rankRules[rule.key] || false}
                      onChange={e => setRankRules(r => ({ ...r, [rule.key]: e.target.checked }))}
                      className="sr-only" />
                    <div onClick={() => setRankRules(r => ({ ...r, [rule.key]: !r[rule.key] }))}
                      className="w-8 h-5 rounded-full transition-colors flex items-center cursor-pointer"
                      style={{ backgroundColor: rankRules[rule.key] ? '#4f46e5' : '#e5e7eb' }}>
                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5"
                        style={{ transform: rankRules[rule.key] ? 'translateX(12px)' : 'translateX(0)' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{rule.label}</p>
                    <p className="text-xs text-gray-400">{rule.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Live rankings preview ── */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Live Rankings Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Updates in real time as you adjust weights</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                {rankedTalents.length} creators
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {rankedTalents.map((talent, idx) => {
                const tb = TIER_BADGE[talent.tier] || TIER_BADGE['fast-rising']
                const isExpanded = rankExpanded === talent.id
                const topScore = rankedTalents[0].score

                return (
                  <div key={talent.id}>
                    <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      {/* Rank number */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                        style={{
                          backgroundColor: idx === 0 ? '#D4AF37' : idx === 1 ? '#e5e7eb' : idx === 2 ? '#fed7aa' : '#f3f4f6',
                          color: idx < 3 ? '#fff' : '#9ca3af',
                        }}>
                        {idx + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                        style={{ backgroundColor: '#4f46e5' }}>
                        {talent.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{talent.name}</p>
                          {talent.verified && <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400 truncate">{talent.handle}</p>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: tb.bg, color: tb.color }}>
                            {tb.label}
                          </span>
                        </div>
                      </div>

                      {/* Score + bar */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 min-w-[90px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-gray-900">{talent.score}</span>
                          <span className="text-xs text-gray-400">/ 100</span>
                        </div>
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${topScore > 0 ? (talent.score / topScore) * 100 : 0}%`,
                              backgroundColor: idx === 0 ? '#D4AF37' : '#4f46e5',
                            }} />
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button onClick={() => setRankExpanded(isExpanded ? null : talent.id)}
                        className="p-1 text-gray-300 hover:text-gray-600 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Breakdown row */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-gray-50">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Score breakdown</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {WEIGHT_META.map(({ key, label, color, icon }) => {
                            const contrib = talent.breakdown[key] || 0
                            return (
                              <div key={key} className="bg-white rounded-xl p-2.5 border border-gray-100">
                                <p className="text-[10px] text-gray-400 mb-0.5">{icon} {label}</p>
                                <p className="text-sm font-bold" style={{ color }}>+{contrib.toFixed(1)}</p>
                                <div className="h-1 rounded-full mt-1.5 bg-gray-100 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(contrib * 5, 100)}%`, backgroundColor: color }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                          <span>Rating: <strong className="text-gray-700">{talent.rating} ★</strong></span>
                          <span>Campaigns: <strong className="text-gray-700">{talent.campaigns}</strong></span>
                          <span>Followers: <strong className="text-gray-700">{talent.followers.toLocaleString()}</strong></span>
                          <span>Engagement: <strong className="text-gray-700">{talent.engagement}%</strong></span>
                          <span>Location: <strong className="text-gray-700">{talent.location}</strong></span>
                          <span>Profile: <strong className="text-gray-700">{talent.profilePct}%</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer note */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                This ranking is applied in the marketplace discovery feed and brand suggestion panels. Save to publish changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSupport = () => <SupportInbox showToast={showToast} />
  const renderDisputes = () => <DisputesPanel showToast={showToast} onCountChange={setOpenDisputeCount} />

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

  const [features, setFeatures] = useState(() =>
    Object.fromEntries(FEATURE_DEFS.map(f => [f.id, getSetting(f.id) !== false]))
  )
  const [featureSaving, setFeatureSaving] = useState(false)
  const [featureSaved, setFeatureSaved]   = useState(false)
  const [featureChanged, setFeatureChanged] = useState({}) // id → prev value for undo

  function toggleFeature(id) {
    const prev = features[id]
    setFeatureChanged(c => ({ ...c, [id]: prev }))
    setFeatures(f => ({ ...f, [id]: !prev }))
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
                const on = features[id]
                const changed = id in featureChanged
                return (
                  <div key={id} className="flex items-center gap-4 px-5 py-4 transition-colors"
                    style={{ backgroundColor: !on ? '#fef2f2' : changed ? '#f0fdf4' : 'white' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900">{label}</p>
                        {!on && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Disabled</span>}
                        {changed && on && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Re-enabled</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleFeature(id)}
                      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200"
                      style={{ backgroundColor: on ? color : '#d1d5db' }}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                        style={{ transform: on ? 'translateX(24px)' : 'translateX(0)' }} />
                    </button>
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

  const PROCESSORS = [
    { id: 'paystack',    name: 'Paystack',    color: '#0ba4db', bg: '#e0f7fd', desc: 'Recommended for Nigeria & Africa', logo: 'PS' },
    { id: 'flutterwave', name: 'Flutterwave', color: '#f5a623', bg: '#fff8ed', desc: 'Pan-African payment gateway',       logo: 'FW' },
    { id: 'stripe',      name: 'Stripe',      color: '#635bff', bg: '#f0efff', desc: 'Global card & bank payments',       logo: 'ST' },
  ]

  const renderPayments = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-1">Payment Processors</h3>
        <p className="text-sm text-gray-400 mb-5">Configure API keys for each processor. Only enabled processors will be available at checkout.</p>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
          <span className="text-sm font-medium text-gray-600">Environment:</span>
          <div className="flex gap-1 p-0.5 rounded-lg bg-gray-200">
            {['test', 'live'].map(m => (
              <button key={m} onClick={() => setPaymentConfig(c => ({ ...c, mode: m }))}
                className="px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all"
                style={paymentConfig.mode === m
                  ? { backgroundColor: m === 'live' ? '#16a34a' : '#4f46e5', color: '#fff' }
                  : { color: '#64748b' }}>
                {m === 'live' ? '🟢 Live' : '🔵 Test'}
              </button>
            ))}
          </div>
          {paymentConfig.mode === 'live' && (
            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Real transactions active
            </span>
          )}
        </div>

        {/* Processor cards */}
        <div className="space-y-4">
          {PROCESSORS.map(({ id, name, color, bg, desc, logo }) => {
            const cfg = paymentConfig.processors[id]
            const isDefault = paymentConfig.activeProcessor === id
            return (
              <div key={id} className="rounded-xl border-2 transition-all overflow-hidden"
                style={{ borderColor: cfg.enabled ? color : '#e2e8f0' }}>
                {/* Header */}
                <div className="flex items-center gap-4 px-5 py-4" style={{ backgroundColor: cfg.enabled ? bg : '#fafafa' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                    style={{ backgroundColor: color }}>{logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{name}</p>
                      {isDefault && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>Default</span>}
                    </div>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button onClick={() => setPaymentConfig(c => ({ ...c, processors: { ...c.processors, [id]: { ...cfg, enabled: !cfg.enabled } } }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={cfg.enabled
                      ? { backgroundColor: color, color: '#fff' }
                      : { backgroundColor: '#e2e8f0', color: '#64748b' }}>
                    {cfg.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {cfg.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Keys — only shown when enabled */}
                {cfg.enabled && (
                  <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-white">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                        {paymentConfig.mode === 'test' ? 'Test' : 'Live'} Public Key
                      </label>
                      <input type="text" value={cfg.publicKey}
                        onChange={e => setPaymentConfig(c => ({ ...c, processors: { ...c.processors, [id]: { ...cfg, publicKey: stripInjection(e.target.value) } } }))}
                        placeholder={`${id === 'stripe' ? 'pk_' : id === 'paystack' ? 'pk_' : 'FLWPUBK_'}${paymentConfig.mode}_...`}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                        {paymentConfig.mode === 'test' ? 'Test' : 'Live'} Secret Key
                      </label>
                      <div className="relative">
                        <input type={cfg.showSecret ? 'text' : 'password'} value={cfg.secretKey}
                          onChange={e => setPaymentConfig(c => ({ ...c, processors: { ...c.processors, [id]: { ...cfg, secretKey: stripInjection(e.target.value) } } }))}
                          placeholder={`${id === 'stripe' ? 'sk_' : id === 'paystack' ? 'sk_' : 'FLWSECK_'}${paymentConfig.mode}_...`}
                          className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm font-mono outline-none focus:border-indigo-400" />
                        <button onClick={() => setPaymentConfig(c => ({ ...c, processors: { ...c.processors, [id]: { ...cfg, showSecret: !cfg.showSecret } } }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {cfg.showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {!isDefault && (
                      <button onClick={() => setPaymentConfig(c => ({ ...c, activeProcessor: id }))}
                        className="text-xs font-semibold transition-colors"
                        style={{ color }}>
                        Set as default processor →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={savePaymentConfig} disabled={paymentSaving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
        style={{ backgroundColor: paymentSaved ? '#16a34a' : '#4f46e5' }}>
        {paymentSaved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : paymentSaving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Payment Settings</>}
      </button>
    </div>
  )

  const TAB_CONTENT = {
    overview: renderOverview,
    analytics: renderAnalytics,
    users: renderUsers,
    jobs: renderCollabs,
    team: renderTeam,
    approvals: renderApprovals,
    content: () => <CmsEditor />,
    "ai-police": renderAiPolice,
    features: renderFeatures,
    payments: renderPayments,
    financials: renderFinancials,
    legal: renderLegal,
    settings: renderSettings,
    "app-config": renderAppConfig,
    rankings: renderRankings,
    support: renderSupport,
    disputes: renderDisputes,
  };

  if (!adminUser) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#4f46e5" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Brandior</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon, badge, badgeColor }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); if (id === 'financials') loadFinancials() }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: activeTab === id ? "#4f46e5" : "transparent",
                color: activeTab === id ? "#fff" : "#94a3b8",
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && id === "ai-police" && modStats.pending > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: badgeColor || "#ef4444", color: "#fff" }}>
                  {modStats.pending}
                </span>
              )}
              {badge && id === "approvals" && pendingCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                  {pendingCount}
                </span>
              )}
              {badge && id === "disputes" && openDisputeCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: badgeColor || "#ef4444", color: "#fff" }}>
                  {openDisputeCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2.5 px-2">
            <Avatar initials="SA" size="sm" color="#4f46e5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminUser.name}</p>
              <p className="text-xs truncate" style={{ color: "#64748b" }}>Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e293b"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-gray-900 text-lg capitalize">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-400">Brandior Admin Portal · Super Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar initials="SA" size="sm" color="#4f46e5" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{adminUser.name}</p>
                <p className="text-xs text-gray-400">super admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {TAB_CONTENT[activeTab]?.()}
        </div>
      </main>

      {/* Modals */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {addTeamModal && (
        <Modal title={`Add ${addTeamModal === "manager" ? "Manager" : "Staff Member"}`} onClose={() => setAddTeamModal(null)}>
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
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAddTeamModal(null)} className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddTeamMember} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#4f46e5" }}>Add Member</button>
            </div>
          </div>
        </Modal>
      )}

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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tier / Plan</label>
                <select value={editUser.tier} onChange={e => setEditUser(u => ({ ...u, tier: stripInjection(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  <option value="fast-rising">Fast Rising</option>
                  <option value="next-rated">Next Rated</option>
                  <option value="top-rated">Top Rated</option>
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                </select>
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

// ─── SUPPORT INBOX ────────────────────────────────────────────────────────────

function SupportInbox({ showToast }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')

  async function loadTickets() {
    setLoading(true)
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [])

  async function updateStatus(id, status) {
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
    showToast({ message: `Ticket marked as ${status}`, type: 'success' })
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await supabase.from('support_tickets').update({
      admin_reply: reply,
      replied_at: new Date().toISOString(),
      status: 'in_progress',
    }).eq('id', selected.id)
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, admin_reply: reply, status: 'in_progress' } : t))
    setSelected(s => ({ ...s, admin_reply: reply, status: 'in_progress' }))
    setSending(false)
    setReply('')
    showToast({ message: 'Reply saved', type: 'success' })
  }

  const STATUS_COLOR = {
    open: '#ef4444',
    in_progress: '#f59e0b',
    resolved: '#22c55e',
    closed: '#94a3b8',
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Support Inbox
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} total tickets</p>
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{
                backgroundColor: filter === f ? '#4f46e5' : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b',
              }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 500 }}>
        {/* Ticket list */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 600 }}>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No tickets</p>
            </div>
          ) : filtered.map(t => (
            <button key={t.id} onClick={() => { setSelected(t); setReply(t.admin_reply || '') }}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                backgroundColor: selected?.id === t.id ? '#eef2ff' : '#fff',
                border: `1px solid ${selected?.id === t.id ? '#c7d2fe' : '#e2e8f0'}`,
              }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.subject}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white"
                  style={{ backgroundColor: STATUS_COLOR[t.status] || '#94a3b8' }}>
                  {t.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{t.user_name || t.user_email || 'Anonymous'}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">{t.category}</span>
                <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white p-6 flex flex-col gap-4" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selected.subject}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  From: <span className="text-gray-600 font-medium">{selected.user_name || 'Unknown'}</span>
                  {selected.user_email && <> · {selected.user_email}</>}
                  <> · {selected.role}</> · {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {['open','in_progress','resolved','closed'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white capitalize transition-opacity"
                    style={{ backgroundColor: STATUS_COLOR[s], opacity: selected.status === s ? 1 : 0.4 }}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              {selected.message}
            </div>

            {selected.admin_reply && (
              <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <p className="text-xs font-semibold text-indigo-500 mb-1">Your previous reply</p>
                <p className="text-gray-700">{selected.admin_reply}</p>
                {selected.replied_at && <p className="text-[11px] text-gray-400 mt-1">{new Date(selected.replied_at).toLocaleString()}</p>}
              </div>
            )}

            <div className="mt-auto space-y-2">
              <textarea
                value={reply}
                onChange={e => setReply(stripInjection(e.target.value))}
                rows={4}
                placeholder="Type your reply to the user…"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none resize-none"
                style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: '#4f46e5', opacity: sending || !reply.trim() ? 0.5 : 1 }}>
                <Send className="w-4 h-4" />
                {sending ? 'Saving…' : 'Save Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: '1px solid #e2e8f0' }}>
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

const DISPUTE_STATUS_COLOR = {
  open:               '#ef4444',
  awaiting_response:  '#f59e0b',
  under_review:       '#6366f1',
  ai_analyzed:        '#0ea5e9',
  resolved:           '#22c55e',
  closed:             '#94a3b8',
}

const DISPUTE_RECOMMENDATION_LABEL = {
  favor_brand:      'Favor Brand',
  favor_talent:     'Favor Talent',
  split:            'Split / Compromise',
  more_info_needed: 'Needs More Info',
}

function DisputesPanel({ showToast, onCountChange }) {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [analyzing, setAnalyzing] = useState(false)
  const [notes, setNotes] = useState('')
  const [deciding, setDeciding] = useState(false)

  async function loadDisputes() {
    setLoading(true)
    const { data } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false })
    const list = data || []
    setDisputes(list)
    onCountChange?.(list.filter((d) => ['open', 'awaiting_response', 'under_review', 'ai_analyzed'].includes(d.status)).length)
    setLoading(false)
  }

  useEffect(() => { loadDisputes() }, [])

  function select(d) {
    setSelected(d)
    setNotes(d.admin_notes || '')
  }

  async function runAnalysis() {
    if (!selected) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId: selected.id }),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error || 'Analysis failed')
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      setSelected(updated)
      showToast({ message: 'AI analysis complete', type: 'success' })
    } catch (err) {
      showToast({ message: err.message, type: 'error' })
    } finally {
      setAnalyzing(false)
    }
  }

  async function decide(decision) {
    if (!selected) return
    setDeciding(true)
    const adminUser = (() => { try { return JSON.parse(localStorage.getItem('brandiór_user')) } catch { return null } })()
    const update = {
      admin_decision: decision,
      admin_notes: notes,
      status: 'resolved',
      resolved_by: adminUser?.email || adminUser?.name || 'Admin',
      resolved_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('disputes')
      .update(update)
      .eq('id', selected.id)
      .select()
      .single()
    setDeciding(false)
    if (error) { showToast({ message: error.message, type: 'error' }); return }
    setDisputes((prev) => prev.map((d) => (d.id === data.id ? data : d)))
    setSelected(data)
    onCountChange?.(disputes.filter((d) => d.id !== data.id && ['open', 'awaiting_response', 'under_review', 'ai_analyzed'].includes(d.status)).length)
    showToast({ message: 'Resolution recorded', type: 'success' })
  }

  const filtered = filter === 'all' ? disputes : disputes.filter((d) => d.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-500" />
            Disputes
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{disputes.length} total disputes</p>
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'under_review', 'ai_analyzed', 'resolved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{
                backgroundColor: filter === f ? '#4f46e5' : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b',
              }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 500 }}>
        {/* Dispute list */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 700 }}>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No disputes</p>
            </div>
          ) : filtered.map((d) => (
            <button key={d.id} onClick={() => select(d)}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                backgroundColor: selected?.id === d.id ? '#eef2ff' : '#fff',
                border: `1px solid ${selected?.id === d.id ? '#c7d2fe' : '#e2e8f0'}`,
              }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{d.reason}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white"
                  style={{ backgroundColor: DISPUTE_STATUS_COLOR[d.status] || '#94a3b8' }}>
                  {d.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">Raised by {d.raised_by_role}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {d.ai_recommendation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 font-medium">{DISPUTE_RECOMMENDATION_LABEL[d.ai_recommendation]}</span>
                )}
                <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className="flex-1 rounded-2xl bg-white p-6 flex flex-col gap-4 overflow-y-auto" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selected.reason}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Raised by <span className="text-gray-600 font-medium capitalize">{selected.raised_by_role}</span>
                  {' · '}{new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white capitalize"
                style={{ backgroundColor: DISPUTE_STATUS_COLOR[selected.status] }}>
                {selected.status?.replace('_', ' ')}
              </span>
            </div>

            {/* Statements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-semibold text-gray-500 mb-1">Brand's statement</p>
                {selected.brand_statement || <span className="text-gray-400">No statement submitted yet</span>}
              </div>
              <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-semibold text-gray-500 mb-1">Talent's statement</p>
                {selected.talent_statement || <span className="text-gray-400">No statement submitted yet</span>}
              </div>
            </div>

            {/* AI analysis */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Analysis
                </p>
                <button onClick={runAnalysis} disabled={analyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity"
                  style={{ backgroundColor: '#4f46e5', opacity: analyzing ? 0.5 : 1 }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {analyzing ? 'Analyzing…' : selected.ai_analyzed_at ? 'Re-run Analysis' : 'Run Analysis'}
                </button>
              </div>
              {selected.ai_summary ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>{selected.ai_summary}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {DISPUTE_RECOMMENDATION_LABEL[selected.ai_recommendation] || selected.ai_recommendation}
                    </span>
                    <span className="text-xs text-indigo-500 font-medium">{selected.ai_confidence}% confidence</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{selected.ai_reasoning}</p>
                  <p className="text-[11px] text-gray-400">Analyzed {new Date(selected.ai_analyzed_at).toLocaleString()} — this is a non-binding recommendation, final decision is yours.</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No analysis yet. Run the AI to get a recommendation based on the collab brief, messages, and deliverables.</p>
              )}
            </div>

            {/* Admin decision */}
            <div className="mt-auto space-y-2">
              {selected.admin_decision ? (
                <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="text-xs font-semibold text-green-600 mb-1">Resolved: {DISPUTE_RECOMMENDATION_LABEL[selected.admin_decision] || selected.admin_decision}</p>
                  {selected.admin_notes && <p className="text-gray-700">{selected.admin_notes}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">by {selected.resolved_by} on {new Date(selected.resolved_at).toLocaleString()}</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(stripInjection(e.target.value))}
                    rows={3}
                    placeholder="Internal notes about your decision…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none resize-none"
                    style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => decide('favor_brand')} disabled={deciding}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
                      style={{ backgroundColor: '#4f46e5', opacity: deciding ? 0.5 : 1 }}>
                      Favor Brand
                    </button>
                    <button onClick={() => decide('favor_talent')} disabled={deciding}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
                      style={{ backgroundColor: '#0ea5e9', opacity: deciding ? 0.5 : 1 }}>
                      Favor Talent
                    </button>
                    <button onClick={() => decide('split')} disabled={deciding}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
                      style={{ backgroundColor: '#f59e0b', opacity: deciding ? 0.5 : 1 }}>
                      Split
                    </button>
                    <button onClick={() => decide('dismissed')} disabled={deciding}
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
                      style={{ backgroundColor: '#94a3b8', opacity: deciding ? 0.5 : 1 }}>
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: '1px solid #e2e8f0' }}>
            <div className="text-center">
              <Scale className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Select a dispute to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const COLLAB_STATUSES = ['all', 'pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled']

function CollabsPanel({ showToast }) {
  const [collabs, setCollabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  async function loadCollabs() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('collabs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { showToast(error.message, 'error'); setLoading(false); return }
    const list = rows || []
    const ids = [...new Set(list.flatMap((c) => [c.brand_id, c.creator_id]))]
    let nameMap = {}
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, company_name')
        .in('id', ids)
      ;(profiles || []).forEach((p) => { nameMap[p.id] = p.company_name || p.full_name || 'Unknown' })
    }
    setCollabs(list.map((c) => ({
      ...c,
      brandName: nameMap[c.brand_id] || 'Unknown Brand',
      creatorName: nameMap[c.creator_id] || 'Unknown Creator',
    })))
    setLoading(false)
  }

  useEffect(() => { loadCollabs() }, [])

  const filtered = collabs.filter((c) => {
    const matchSearch = !search ||
      c.brandName.toLowerCase().includes(search.toLowerCase()) ||
      c.creatorName.toLowerCase().includes(search.toLowerCase()) ||
      c.content_type?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : c.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Collabs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{collabs.length} total collabs</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {COLLAB_STATUSES.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{ backgroundColor: filter === f ? '#4f46e5' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b' }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by brand, creator or content type..."
            value={search}
            onChange={(e) => setSearch(stripInjection(e.target.value))}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="flex gap-4" style={{ minHeight: 500 }}>
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: 700 }}>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No collabs</p>
            </div>
          ) : filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                backgroundColor: selected?.id === c.id ? '#eef2ff' : '#fff',
                border: `1px solid ${selected?.id === c.id ? '#c7d2fe' : '#e2e8f0'}`,
              }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.content_type}</p>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-gray-500 truncate">{c.brandName} → {c.creatorName}</p>
              <p className="text-xs text-gray-400 mt-1">₦{Number(c.total_amount || 0).toLocaleString()} · {c.created_at ? new Date(c.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="flex-1 rounded-2xl bg-white p-6 overflow-y-auto" style={{ border: '1px solid #e2e8f0', maxHeight: 700 }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.content_type}</h3>
                <p className="text-sm text-gray-500">{selected.brandName} → {selected.creatorName}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={selected.status} />
                <StatusBadge status={selected.payment_status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-900">{selected.duration_label}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-sm font-medium text-gray-900">₦{Number(selected.total_amount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Platform Fee</p>
                <p className="text-sm font-medium text-gray-900">₦{Number(selected.platform_fee || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Creator Payout</p>
                <p className="text-sm font-medium text-gray-900">₦{Number(selected.creator_payout || 0).toLocaleString()}</p>
              </div>
            </div>

            {selected.brief && Object.keys(selected.brief).length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Brief</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm text-gray-700">
                  {selected.brief.productName && <p><span className="font-medium">Product:</span> {selected.brief.productName}</p>}
                  {selected.brief.goal && <p><span className="font-medium">Goal:</span> {selected.brief.goal}</p>}
                  {selected.brief.instructions && <p><span className="font-medium">Instructions:</span> {selected.brief.instructions}</p>}
                  {selected.brief.deadline && <p><span className="font-medium">Deadline:</span> {selected.brief.deadline}</p>}
                </div>
              </div>
            )}

            {selected.revision_reason && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Revision Reason</p>
                <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700">{selected.revision_reason}</div>
              </div>
            )}

            {Array.isArray(selected.delivered_files) && selected.delivered_files.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivered Files</p>
                <div className="space-y-2">
                  {selected.delivered_files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                      <span className="text-gray-700 truncate">{f.name}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0 ml-2">{f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : ''}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-white flex items-center justify-center" style={{ border: '1px solid #e2e8f0' }}>
            <div className="text-center">
              <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Select a collab to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
