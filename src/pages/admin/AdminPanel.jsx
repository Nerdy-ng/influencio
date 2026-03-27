import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Shield, Bell, Tag,
  DollarSign, Settings, LogOut, ChevronDown, Search, X,
  CheckCircle, XCircle, AlertTriangle, MoreVertical, Plus,
  TrendingUp, Activity, Check, ArrowUpRight, Eye, ShieldAlert, Pencil, Save, Globe
} from "lucide-react";
import AdminModerationDashboard from "../../components/AdminModerationDashboard";
import { getModerationStats } from "../../utils/moderationEngine";
import CmsEditor from "../../components/admin/CmsEditor";
import { LOGO_SLOTS, getLogo, setLogo, removeLogo } from "../../lib/brandSettings";
import { getAllSettings, saveAllSettings } from "../../lib/siteSettings";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 1, name: "Adaeze Okafor", email: "adaeze@mail.com", role: "Talent", tier: "top-rated", location: "Lagos", joined: "Jan 12, 2025", status: "active", avatar: "AO", verified: true },
  { id: 2, name: "Tecno Mobile", email: "brand@tecno.com", role: "Brand", tier: "premium", location: "Abuja", joined: "Feb 3, 2025", status: "active", avatar: "TM", verified: true },
  { id: 3, name: "Kemi Fashola", email: "kemi.f@mail.com", role: "Talent", tier: "fast-rising", location: "Port Harcourt", joined: "Mar 1, 2025", status: "active", avatar: "KF", verified: false },
  { id: 4, name: "GTBank Marketing", email: "mktg@gtbank.com", role: "Brand", tier: "premium", location: "Lagos", joined: "Dec 15, 2024", status: "suspended", avatar: "GT", verified: true },
  { id: 5, name: "Emeka Nwosu", email: "emeka@mail.com", role: "Talent", tier: "next-rated", location: "Enugu", joined: "Feb 20, 2025", status: "active", avatar: "EN", verified: false },
  { id: 6, name: "Zara Nigeria", email: "hello@zaraNg.com", role: "Brand", tier: "standard", location: "Lagos", joined: "Jan 28, 2025", status: "active", avatar: "ZN", verified: true },
  { id: 7, name: "Ngozi Adeyemi", email: "ngozi@mail.com", role: "Talent", tier: "top-rated", location: "Ibadan", joined: "Nov 5, 2024", status: "active", avatar: "NA", verified: true },
  { id: 8, name: "Flutterwave", email: "campaigns@flutterwave.com", role: "Brand", tier: "premium", location: "Lagos", joined: "Oct 10, 2024", status: "active", avatar: "FW", verified: true },
  { id: 9, name: "Biodun Alabi", email: "biodun@mail.com", role: "Talent", tier: "fast-rising", location: "Kano", joined: "Mar 10, 2025", status: "active", avatar: "BA", verified: false },
  { id: 10, name: "Pepsi Nigeria", email: "marketing@pepsi.ng", role: "Brand", tier: "premium", location: "Lagos", joined: "Sep 1, 2024", status: "suspended", avatar: "PN", verified: true },
];

const MOCK_JOBS = [
  { id: "J01", brand: "Tecno Mobile", title: "Instagram Reel Campaign – CAMON 30", platform: "Instagram", budget: "₦850,000", posted: "Mar 18, 2025", status: "active", labels: ["Featured"] },
  { id: "J02", brand: "GTBank Marketing", title: "TikTok Brand Awareness Q2", platform: "TikTok", budget: "₦1,200,000", posted: "Mar 15, 2025", status: "pending", labels: [] },
  { id: "J03", brand: "Pepsi Nigeria", title: "YouTube Integration – Summer Campaign", platform: "YouTube", budget: "₦2,500,000", posted: "Mar 14, 2025", status: "flagged", labels: ["Urgent"] },
  { id: "J04", brand: "Zara Nigeria", title: "Fashion Week Content Creator", platform: "Instagram", budget: "₦600,000", posted: "Mar 12, 2025", status: "active", labels: [] },
  { id: "J05", brand: "Flutterwave", title: "Twitter/X Finance Tips Series", platform: "Twitter/X", budget: "₦400,000", posted: "Mar 11, 2025", status: "pending", labels: [] },
  { id: "J06", brand: "Tecno Mobile", title: "Unboxing Series – Spark 20", platform: "YouTube", budget: "₦750,000", posted: "Mar 9, 2025", status: "active", labels: ["Staff Pick"] },
  { id: "J07", brand: "GTBank Marketing", title: "LinkedIn Thought Leadership Posts", platform: "LinkedIn", budget: "₦300,000", posted: "Mar 7, 2025", status: "flagged", labels: [] },
  { id: "J08", brand: "Pepsi Nigeria", title: "Naija Vibes Music Collaboration", platform: "Instagram", budget: "₦1,800,000", posted: "Mar 5, 2025", status: "active", labels: ["Featured", "Staff Pick"] },
];

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
  { id: 3, requester: "Blessing Eze", requesterRole: "Staff", type: "Delete Job", description: "Job J07 contains prohibited content – adult-adjacent materials.", target: "Job #J07", timestamp: "5 hours ago", status: "pending" },
  { id: 4, requester: "Chidi Eze", requesterRole: "Manager", type: "Feature Job", description: "Pepsi Naija Vibes campaign is high quality and deserves featured placement.", target: "Job #J08", timestamp: "Yesterday", status: "pending" },
  { id: 5, requester: "Fatima Bello", requesterRole: "Manager", type: "Process Refund", description: "Brand cancelled campaign 48hrs after talent delivered. Partial refund requested.", target: "GTBank Marketing", timestamp: "2 days ago", status: "pending" },
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

function LabelBadge({ label }) {
  const map = {
    Urgent: { bg: "#fee2e2", color: "#dc2626" },
    Featured: { bg: "#ede9fe", color: "#7c3aed" },
    "Staff Pick": { bg: "#dbeafe", color: "#1d4ed8" },
  };
  const s = map[label] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-1" style={{ backgroundColor: s.bg, color: s.color }}>
      {label}
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
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "users", label: "Users", Icon: Users },
  { id: "jobs", label: "Job Board", Icon: Briefcase },
  { id: "team", label: "Team", Icon: Shield },
  { id: "approvals", label: "Approvals", Icon: Bell, badge: true },
  { id: "labels", label: "Labels", Icon: Tag },
  { id: "content", label: "Content", Icon: Globe },
  { id: "ai-police", label: "AI Police", Icon: ShieldAlert, badge: true, badgeColor: "#ef4444" },
  { id: "financials", label: "Financials", Icon: DollarSign },
  { id: "legal", label: "Legal", Icon: Pencil },
  { id: "settings", label: "Settings", Icon: Settings },
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

  // State for various tabs
  const [users, setUsers] = useState(MOCK_USERS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [managers, setManagers] = useState(MOCK_MANAGERS);
  const [staffList, setStaffList] = useState(MOCK_STAFF);
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [platformFee, setPlatformFee] = useState(() => getAllSettings().platformFee || "10");
  const [legalDocs, setLegalDocs] = useState({
    terms: localStorage.getItem('brandior_legal_terms') || DEFAULT_TERMS,
    privacy: localStorage.getItem('brandior_legal_privacy') || DEFAULT_PRIVACY,
    cookies: localStorage.getItem('brandior_legal_cookies') || DEFAULT_COOKIES,
  })
  const [activeLegalDoc, setActiveLegalDoc] = useState('terms')

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
    }
  });
  const [logos, setLogos] = useState({
    header: getLogo('header'),
    footer: getLogo('footer'),
    auth:   getLogo('auth'),
  })

  function handleLogoUpload(slot, e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target.result
      setLogo(slot, url)
      setLogos(prev => ({ ...prev, [slot]: url }))
    }
    reader.readAsDataURL(file)
  }

  function handleLogoRemove(slot) {
    removeLogo(slot)
    setLogos(prev => ({ ...prev, [slot]: '' }))
  }

  // Search/filter state
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All");
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");

  // Modal state
  const [addTeamModal, setAddTeamModal] = useState(null); // 'manager' | 'staff'
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [editUser, setEditUser] = useState(null);   // user object being edited
  const [editJob, setEditJob] = useState(null);     // job object being edited

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const [modStats, setModStats] = useState({ pending: 0 });

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("brandiór_admin_user");
    localStorage.removeItem("brandiór_admin_role");
    navigate("/admin/login");
  };

  const handleApprovalAction = (id, action) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setApprovalHistory((prev) => [{ ...item, status: action, reviewedAt: "Just now" }, ...prev]);
    showToast(`Request ${action === "approved" ? "approved" : "rejected"} successfully.`);
  };

  const handleBanUser = (userId) => {
    setConfirmModal({
      title: "Ban User",
      message: "Are you sure you want to permanently ban this user? This action cannot be undone.",
      onConfirm: () => {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "banned" } : u));
        setConfirmModal(null);
        showToast("User has been banned.");
      },
    });
  };

  const handleSuspendUser = (userId) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u));
    showToast("User status updated.");
  };

  const handleVerifyUser = (userId) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verified: true } : u));
    showToast("User verified successfully.");
  };

  const handleChangeTier = (userId, tier) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, tier } : u));
    showToast("Tier updated.");
  };

  const handleJobAction = (jobId, action) => {
    if (action === "delete") {
      setConfirmModal({
        title: "Delete Job",
        message: "Are you sure you want to delete this job posting? This is permanent.",
        onConfirm: () => {
          setJobs((prev) => prev.filter((j) => j.id !== jobId));
          setConfirmModal(null);
          showToast("Job deleted.");
        },
      });
      return;
    }
    const statusMap = { approve: "active", reject: "flagged" };
    if (statusMap[action]) {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: statusMap[action] } : j));
      showToast(`Job ${action}d.`);
    }
  };

  const handleToggleLabel = (jobId, label) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const has = j.labels.includes(label);
        return { ...j, labels: has ? j.labels.filter((l) => l !== label) : [...j.labels, label] };
      })
    );
  };

  const handleSaveUser = () => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
    showToast("User profile updated successfully.");
  };

  const handleSaveJob = () => {
    setJobs(prev => prev.map(j => j.id === editJob.id ? editJob : j));
    setEditJob(null);
    showToast("Job listing updated successfully.");
  };

  const handleAddTeamMember = () => {
    if (!newMember.name || !newMember.email) return;
    const member = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: addTeamModal === "manager" ? "Manager" : "Staff",
      status: "Active",
      lastLogin: "Never",
      avatar: newMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };
    if (addTeamModal === "manager") setManagers((prev) => [...prev, member]);
    else setStaffList((prev) => [...prev, member]);
    setAddTeamModal(null);
    setNewMember({ name: "", email: "" });
    showToast(`${addTeamModal === "manager" ? "Manager" : "Staff"} added successfully.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter =
      userFilter === "All" ? true :
      userFilter === "Talents" ? u.role === "Talent" :
      userFilter === "Brands" ? u.role === "Brand" :
      userFilter === "Suspended" ? u.status === "suspended" : true;
    return matchSearch && matchFilter;
  });

  const filteredJobs = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.brand.toLowerCase().includes(jobSearch.toLowerCase());
    const matchFilter =
      jobFilter === "All" ? true :
      jobFilter === "Active" ? j.status === "active" :
      jobFilter === "Pending Review" ? j.status === "pending" :
      jobFilter === "Flagged" ? j.status === "flagged" : true;
    return matchSearch && matchFilter;
  });

  // ─── TABS ─────────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "#4f46e5" },
          { label: "Active Campaigns", value: "34", icon: Activity, color: "#0ea5e9" },
          { label: "Total Revenue", value: "₦48.2M", icon: DollarSign, color: "#16a34a" },
          { label: "Pending Approvals", value: pendingCount, icon: Bell, color: "#d97706" },
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
            {ACTIVITY_FEED.map((a) => (
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

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Talents", "Brands", "Suspended"].map((f) => (
              <button
                key={f}
                onClick={() => setUserFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: userFilter === f ? "#4f46e5" : "#f1f5f9",
                  color: userFilter === f ? "#fff" : "#64748b",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier/Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.avatar} size="sm" color={user.role === "Brand" ? "#0ea5e9" : "#4f46e5"} />
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
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: user.role === "Brand" ? "#dbeafe" : "#ede9fe", color: user.role === "Brand" ? "#1d4ed8" : "#7c3aed" }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                    <p className="text-xs text-gray-400 mt-0.5">{user.tier}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.location}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setEditUser({ ...user })}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-white"
                        style={{ backgroundColor: "#4f46e5" }}>
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

  const renderJobs = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Pending Review", "Flagged"].map((f) => (
              <button
                key={f}
                onClick={() => setJobFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: jobFilter === f ? "#4f46e5" : "#f1f5f9", color: jobFilter === f ? "#fff" : "#64748b" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Labels</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.brand} · {job.id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{job.platform}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{job.budget}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{job.posted}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3">{job.labels.map((l) => <LabelBadge key={l} label={l} />)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setEditJob({ ...job })}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-white"
                        style={{ backgroundColor: "#4f46e5" }}>
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleJobAction(job.id, "approve")} className="px-2 py-1.5 text-xs rounded-lg text-white font-medium" style={{ backgroundColor: "#16a34a" }}>Approve</button>
                      <button onClick={() => handleJobAction(job.id, "reject")} className="px-2 py-1.5 text-xs rounded-lg text-white font-medium" style={{ backgroundColor: "#d97706" }}>Reject</button>
                      <button onClick={() => handleJobAction(job.id, "delete")} className="px-2 py-1.5 text-xs rounded-lg text-white font-medium" style={{ backgroundColor: "#dc2626" }}>Delete</button>
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
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
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

  const renderLabels = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
        <Tag className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-indigo-900 text-sm">Admin-Controlled Labels</p>
          <p className="text-sm text-indigo-700 mt-0.5">Labels are admin-controlled signals visible to talents and brands. Only you can assign Urgent, Featured, and Staff Pick labels to job listings.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-4">Job Title</span>
            <span className="col-span-2">Brand</span>
            <span className="col-span-2 text-center">Urgent</span>
            <span className="col-span-2 text-center">Featured</span>
            <span className="col-span-2 text-center">Staff Pick</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {jobs.map((job) => (
            <div key={job.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.id}</p>
                </div>
                <div className="col-span-2 text-xs text-gray-600">{job.brand}</div>
                <div className="col-span-2 flex justify-center">
                  <Toggle checked={job.labels.includes("Urgent")} onChange={() => handleToggleLabel(job.id, "Urgent")} />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Toggle checked={job.labels.includes("Featured")} onChange={() => handleToggleLabel(job.id, "Featured")} />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Toggle checked={job.labels.includes("Staff Pick")} onChange={() => handleToggleLabel(job.id, "Staff Pick")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancials = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Platform Revenue", value: "₦48,200,000", color: "#16a34a" },
          { label: "Pending Payouts", value: "₦6,800,000", color: "#d97706" },
          { label: "Completed Payouts", value: "₦41,400,000", color: "#4f46e5" },
          { label: "Platform Fee", value: `${platformFee}%`, color: "#0ea5e9" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Platform Fee Setting</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Commission Fee (%):</label>
          <input
            type="number"
            value={platformFee}
            onChange={(e) => setPlatformFee(e.target.value)}
            className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
            min="1" max="50"
          />
          <button
            onClick={() => { saveAllSettings({ platformFee }); showToast("Platform fee updated successfully.") }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#4f46e5" }}
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["ID", "Talent", "Brand", "Amount", "Fee", "Net", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{t.talent}</td>
                  <td className="px-4 py-3 text-gray-600">{t.brand}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{t.amount}</td>
                  <td className="px-4 py-3 text-red-500">{t.fee}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{t.net}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(slot, e)} />
                  {logos[slot] ? 'Replace' : 'Upload'}
                </label>
                {logos[slot] && (
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
            onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
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
        <div className="flex flex-wrap gap-2">
          {settings.countries.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              <CheckCircle className="w-3.5 h-3.5" /> {c}
            </span>
          ))}
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400">
            <Plus className="w-3.5 h-3.5" /> Add Country
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          saveAllSettings({ ...settings, platformFee })
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

  const TAB_CONTENT = {
    overview: renderOverview,
    users: renderUsers,
    jobs: renderJobs,
    team: renderTeam,
    approvals: renderApprovals,
    labels: renderLabels,
    content: () => <CmsEditor />,
    "ai-police": renderAiPolice,
    financials: renderFinancials,
    legal: renderLegal,
    settings: renderSettings,
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
              <p className="text-white font-bold text-sm leading-none">Brandiór</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon, badge, badgeColor }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
            <p className="text-xs text-gray-400">Brandiór Admin Portal · Super Admin</p>
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
                onChange={(e) => setNewMember((m) => ({ ...m, name: e.target.value }))}
                placeholder="Jane Okonkwo"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember((m) => ({ ...m, email: e.target.value }))}
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
                <input value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                <input value={editUser.location} onChange={e => setEditUser(u => ({ ...u, location: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tier / Plan</label>
                <select value={editUser.tier} onChange={e => setEditUser(u => ({ ...u, tier: e.target.value }))}
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
                <select value={editUser.status} onChange={e => setEditUser(u => ({ ...u, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Verified</label>
                <select value={editUser.verified ? "yes" : "no"} onChange={e => setEditUser(u => ({ ...u, verified: e.target.value === "yes" }))}
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

      {/* ── Edit Job Modal ── */}
      {editJob && (
        <Modal title="Edit Job Listing" onClose={() => setEditJob(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ backgroundColor: "#eef2ff" }}>
              <Pencil className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <p className="text-xs text-indigo-700 font-medium">Admin override — edits bypass normal submission workflow.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Job Title</label>
              <input value={editJob.title} onChange={e => setEditJob(j => ({ ...j, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                <input value={editJob.brand} onChange={e => setEditJob(j => ({ ...j, brand: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Platform</label>
                <select value={editJob.platform} onChange={e => setEditJob(j => ({ ...j, platform: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  {["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Budget</label>
                <input value={editJob.budget} onChange={e => setEditJob(j => ({ ...j, budget: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select value={editJob.status} onChange={e => setEditJob(j => ({ ...j, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400">
                  {["active", "pending review", "flagged", "closed"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Labels</label>
              <div className="flex gap-2 flex-wrap">
                {["Urgent", "Featured", "Staff Pick"].map(lbl => {
                  const has = editJob.labels?.includes(lbl)
                  return (
                    <button key={lbl} type="button"
                      onClick={() => setEditJob(j => ({ ...j, labels: has ? j.labels.filter(l => l !== lbl) : [...(j.labels || []), lbl] }))}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                      style={{ backgroundColor: has ? "#4f46e5" : "#f1f5f9", color: has ? "#fff" : "#64748b", borderColor: has ? "#4f46e5" : "#e2e8f0" }}>
                      {has ? "✓ " : ""}{lbl}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Admin Note</label>
              <textarea rows={2} placeholder="Reason for edit (visible to managers only)…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditJob(null)} className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveJob}
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
