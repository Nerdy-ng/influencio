import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Eye, Inbox, Users, Briefcase, BarChart2,
  LogOut, Search, Check, X, AlertTriangle, ChevronRight,
  CheckCircle, XCircle, ArrowUpRight, Clock, Shield, FileText,
  MessageSquare, Send
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_FLAGGED_CONTENT = [
  { id: 1, type: "Job Listing", contentId: "J07", title: "LinkedIn Thought Leadership Posts", flaggedBy: "Tunde Afolabi", reason: "Misleading budget information", timestamp: "2 hours ago", status: "pending" },
  { id: 2, type: "User Profile", contentId: "U09", title: "Biodun Alabi (@biodun_creates)", flaggedBy: "Blessing Eze", reason: "Suspected fake follower counts", timestamp: "3 hours ago", status: "pending" },
  { id: 3, type: "Job Listing", contentId: "J03", title: "YouTube Integration – Summer Campaign", flaggedBy: "Chinwe Obi", reason: "Adult-adjacent content in description", timestamp: "5 hours ago", status: "pending" },
  { id: 4, type: "User Profile", contentId: "U03", title: "Kemi Fashola (@kemi.fashy)", flaggedBy: "Tunde Afolabi", reason: "Spam — repeated applications to same jobs", timestamp: "Yesterday", status: "pending" },
  { id: 5, type: "Message", contentId: "M012", title: "Direct message thread #M012", flaggedBy: "Amaka Nze", reason: "Harassment / inappropriate language", timestamp: "2 days ago", status: "pending" },
];

const MOCK_STAFF_REQUESTS = [
  { id: 1, staff: "Tunde Afolabi", type: "Flag content", description: "Job #J07 has misleading budget. Recommend removal.", target: "Job #J07", timestamp: "1 hour ago", canApprove: true },
  { id: 2, staff: "Blessing Eze", type: "Add note to profile", description: "Adding internal note about Biodun Alabi's suspicious activity pattern.", target: "Biodun Alabi", timestamp: "2 hours ago", canApprove: true },
  { id: 3, staff: "Chinwe Obi", type: "Close support ticket", description: "Ticket #45 resolved — user confirmed campaign terms understood.", target: "Ticket #45", timestamp: "4 hours ago", canApprove: true },
  { id: 4, staff: "Amaka Nze", type: "Ban user", description: "User Kemi Fashola has been sending spam. Recommend permanent ban.", target: "Kemi Fashola", timestamp: "5 hours ago", canApprove: false, adminOnly: true },
  { id: 5, staff: "Musa Garba", type: "Process refund", description: "GTBank cancelled campaign after delivery. ₦400k partial refund.", target: "GTBank Marketing", timestamp: "Yesterday", canApprove: false, adminOnly: true },
  { id: 6, staff: "Tunde Afolabi", type: "Verify talent", description: "Adaeze Okafor has completed all verification requirements.", target: "Adaeze Okafor", timestamp: "2 days ago", canApprove: false, adminOnly: true },
];

const MOCK_USERS = [
  { id: 1, name: "Adaeze Okafor", email: "adaeze@mail.com", role: "Talent", tier: "top-rated", location: "Lagos", joined: "Jan 12, 2025", status: "active", verified: true, avatar: "AO", note: "" },
  { id: 2, name: "Tecno Mobile", email: "brand@tecno.com", role: "Brand", tier: "premium", location: "Abuja", joined: "Feb 3, 2025", status: "active", verified: true, avatar: "TM", note: "" },
  { id: 3, name: "Kemi Fashola", email: "kemi.f@mail.com", role: "Talent", tier: "fast-rising", location: "Port Harcourt", joined: "Mar 1, 2025", status: "active", verified: false, avatar: "KF", note: "Suspected spam activity — monitor closely." },
  { id: 4, name: "GTBank Marketing", email: "mktg@gtbank.com", role: "Brand", tier: "premium", location: "Lagos", joined: "Dec 15, 2024", status: "suspended", verified: true, avatar: "GT", note: "" },
  { id: 5, name: "Emeka Nwosu", email: "emeka@mail.com", role: "Talent", tier: "next-rated", location: "Enugu", joined: "Feb 20, 2025", status: "active", verified: false, avatar: "EN", note: "" },
];

const MOCK_JOBS = [
  { id: "J01", brand: "Tecno Mobile", title: "Instagram Reel Campaign – CAMON 30", platform: "Instagram", budget: "₦850,000", posted: "Mar 18, 2025", status: "active" },
  { id: "J02", brand: "GTBank Marketing", title: "TikTok Brand Awareness Q2", platform: "TikTok", budget: "₦1,200,000", posted: "Mar 15, 2025", status: "pending" },
  { id: "J03", brand: "Pepsi Nigeria", title: "YouTube Integration – Summer Campaign", platform: "YouTube", budget: "₦2,500,000", posted: "Mar 14, 2025", status: "flagged" },
  { id: "J04", brand: "Zara Nigeria", title: "Fashion Week Content Creator", platform: "Instagram", budget: "₦600,000", posted: "Mar 12, 2025", status: "active" },
  { id: "J05", brand: "Flutterwave", title: "Twitter/X Finance Tips Series", platform: "Twitter/X", budget: "₦400,000", posted: "Mar 11, 2025", status: "pending" },
  { id: "J06", brand: "Tecno Mobile", title: "Unboxing Series – Spark 20", platform: "YouTube", budget: "₦750,000", posted: "Mar 9, 2025", status: "active" },
];

const MY_TEAM = [
  { name: "Tunde Afolabi", email: "tunde@brandior.co", avatar: "TA", tasksOpen: 3, lastActive: "Today, 10:02 AM" },
  { name: "Blessing Eze", email: "blessing@brandior.co", avatar: "BE", tasksOpen: 2, lastActive: "Today, 08:45 AM" },
  { name: "Chinwe Obi", email: "chinwe@brandior.co", avatar: "CO", tasksOpen: 1, lastActive: "Yesterday, 5:10 PM" },
];

const RECENT_ACTIONS = [
  { text: "You approved Tunde's flag on Job #J07", time: "1 hr ago" },
  { text: "You rejected Musa's refund request for GTBank", time: "3 hrs ago" },
  { text: "You escalated Adaeze verification request to admin", time: "Yesterday" },
  { text: "You approved Blessing's note on Biodun's profile", time: "2 days ago" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color = "#7c3aed" }) {
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
    pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    flagged: { bg: "#fee2e2", color: "#dc2626", label: "Flagged" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Toast({ message, type = "success" }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
      style={{ backgroundColor: type === "success" ? "#16a34a" : type === "info" ? "#7c3aed" : "#dc2626" }}
    >
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

function NoteModal({ user, onClose, onSave }) {
  const [note, setNote] = useState(user.note || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Internal Note — {user.name}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Add internal note visible only to managers and admins..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">This note is only visible to managers and admins.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(note)} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#7c3aed" }}>Save Note</button>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "content", label: "Content Review", Icon: Eye, badge: true },
  { id: "queue", label: "Staff Queue", Icon: Inbox, badge: true },
  { id: "users", label: "Users", Icon: Users },
  { id: "jobs", label: "Jobs", Icon: Briefcase },
  { id: "reports", label: "Reports", Icon: BarChart2 },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ManagerPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [managerUser, setManagerUser] = useState(null);
  const [toast, setToast] = useState(null);

  const [flaggedContent, setFlaggedContent] = useState(MOCK_FLAGGED_CONTENT);
  const [staffRequests, setStaffRequests] = useState(MOCK_STAFF_REQUESTS);
  const [staffRequestHistory, setStaffRequestHistory] = useState([]);
  const [users, setUsers] = useState(MOCK_USERS);
  const [jobs, setJobs] = useState(MOCK_JOBS);

  const [userSearch, setUserSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [noteModal, setNoteModal] = useState(null);

  const pendingContent = flaggedContent.filter((f) => f.status === "pending").length;
  const pendingRequests = staffRequests.filter((r) => r.status !== "approved" && r.status !== "rejected" && r.status !== "escalated").length;

  useEffect(() => {
    const role = localStorage.getItem("brandiór_admin_role");
    const user = localStorage.getItem("brandiór_admin_user");
    if (role !== "manager") {
      navigate("/admin/login");
      return;
    }
    if (user) setManagerUser(JSON.parse(user));
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

  const handleContentAction = (id, action) => {
    setFlaggedContent((prev) => prev.map((f) => f.id === id ? { ...f, status: action } : f));
    if (action === "escalated") showToast("Escalated to admin for review.", "info");
    else showToast(`Content ${action === "approved" ? "approved and kept" : "removed"} successfully.`);
  };

  const handleStaffRequest = (id, action) => {
    const req = staffRequests.find((r) => r.id === id);
    setStaffRequests((prev) => prev.filter((r) => r.id !== id));
    setStaffRequestHistory((prev) => [{ ...req, decision: action, reviewedAt: "Just now" }, ...prev]);
    if (action === "escalated") showToast("Escalated to admin approval queue.", "info");
    else showToast(`Request ${action}.`);
  };

  const handleJobAction = (jobId, action) => {
    const statusMap = { approve: "active", reject: "flagged" };
    if (statusMap[action]) {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: statusMap[action] } : j));
      showToast(`Job ${action}d.`);
    }
  };

  const handleSaveNote = (userId, note) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, note } : u));
    setNoteModal(null);
    showToast("Note saved.");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.brand.toLowerCase().includes(jobSearch.toLowerCase())
  );

  // ─── TABS ───────────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Staff Requests", value: pendingRequests, color: "#7c3aed" },
          { label: "Flagged Content", value: pendingContent, color: "#ef4444" },
          { label: "Users Reviewed Today", value: "12", color: "#0ea5e9" },
          { label: "Open Reports", value: "3", color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Your Team</h3>
          <div className="space-y-3">
            {MY_TEAM.map((member) => (
              <div key={member.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <Avatar initials={member.avatar} size="sm" color="#7c3aed" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-400">Last active: {member.lastActive}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}>
                  {member.tasksOpen} tasks
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Your Recent Actions</h3>
          <div className="space-y-3">
            {RECENT_ACTIONS.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#7c3aed" }} />
                <div>
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentReview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Flagged Content
          {pendingContent > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#ef4444" }}>{pendingContent}</span>
          )}
        </h3>
        <p className="text-sm text-gray-500">Flagged by your staff team</p>
      </div>

      {flaggedContent.filter((f) => f.status === "pending").length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-gray-500">No flagged content to review.</p>
        </div>
      )}

      {flaggedContent.filter((f) => f.status === "pending").map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>{item.type}</span>
                <span className="font-medium text-gray-900 text-sm">{item.title}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Reason:</span> {item.reason}
              </p>
              <p className="text-xs text-gray-400">Flagged by <span className="font-medium text-gray-600">{item.flaggedBy}</span> · {item.timestamp}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
              <button
                onClick={() => handleContentAction(item.id, "approved")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: "#16a34a" }}
              >
                <Check className="w-3 h-3" /> Keep
              </button>
              <button
                onClick={() => handleContentAction(item.id, "removed")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                <X className="w-3 h-3" /> Remove
              </button>
              <button
                onClick={() => handleContentAction(item.id, "escalated")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      ))}

      {flaggedContent.filter((f) => f.status !== "pending").length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reviewed</h4>
          {flaggedContent.filter((f) => f.status !== "pending").map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <StatusBadge status={item.status === "escalated" ? "pending" : item.status === "approved" ? "active" : "flagged"} />
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400">{item.type} · {item.flaggedBy}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStaffQueue = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Staff Requests
        {pendingRequests > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#d97706" }}>{pendingRequests}</span>
        )}
      </h3>

      {staffRequests.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-gray-500">No pending staff requests.</p>
        </div>
      )}

      {staffRequests.map((req) => (
        <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-semibold text-gray-900 text-sm">{req.staff}</span>
                <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Staff</span>
                <span className="px-2 py-0.5 text-xs rounded-full font-semibold" style={{ backgroundColor: req.canApprove ? "#dcfce7" : "#fee2e2", color: req.canApprove ? "#16a34a" : "#dc2626" }}>
                  {req.type}
                </span>
                {!req.canApprove && (
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                    <Shield className="w-3 h-3" /> Requires Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{req.description}</p>
              <p className="text-xs text-gray-400">Target: <span className="font-medium text-gray-700">{req.target}</span> · {req.timestamp}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
              {req.canApprove ? (
                <>
                  <button
                    onClick={() => handleStaffRequest(req.id, "approved")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: "#16a34a" }}
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleStaffRequest(req.id, "rejected")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStaffRequest(req.id, "escalated")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  <ArrowUpRight className="w-3 h-3" /> Escalate to Admin
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {staffRequestHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Decision History</h4>
          {staffRequestHistory.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: r.decision === "approved" ? "#dcfce7" : r.decision === "escalated" ? "#ede9fe" : "#fee2e2",
                  color: r.decision === "approved" ? "#16a34a" : r.decision === "escalated" ? "#7c3aed" : "#dc2626",
                }}
              >
                {r.decision}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{r.type} — {r.target}</p>
                <p className="text-xs text-gray-400">from {r.staff} · {r.reviewedAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-gray-200 outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <Avatar initials={user.avatar} size="md" color={user.role === "Brand" ? "#0ea5e9" : "#7c3aed"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  {user.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  <StatusBadge status={user.status} />
                  <span className="text-xs text-gray-500 font-medium">{user.tier}</span>
                </div>
                <p className="text-sm text-gray-500">{user.email} · {user.location} · Joined {user.joined}</p>
                {user.note && (
                  <div className="mt-2 px-3 py-2 rounded-lg text-xs text-yellow-800" style={{ backgroundColor: "#fefce8", border: "1px solid #fde047" }}>
                    <span className="font-semibold">Internal note:</span> {user.note}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => setNoteModal(user)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Add Note
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50"
                  title="Requires Admin approval"
                >
                  <Shield className="w-3 h-3" /> Suspend (Admin)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-gray-200 outline-none focus:border-purple-400"
          />
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.brand} · {job.id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{job.platform}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{job.budget}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button className="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">View</button>
                      <button
                        onClick={() => handleJobAction(job.id, "approve")}
                        className="px-2 py-1 text-xs rounded-md text-white"
                        style={{ backgroundColor: "#16a34a" }}
                      >Approve</button>
                      <button
                        onClick={() => handleJobAction(job.id, "reject")}
                        className="px-2 py-1 text-xs rounded-md text-white"
                        style={{ backgroundColor: "#d97706" }}
                      >Reject</button>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50"
                        title="Only admin can add Urgent/Featured labels"
                      >
                        <Shield className="w-3 h-3" /> Request Label
                      </button>
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

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-5">Weekly Campaign Overview</h3>
        <div className="flex items-end gap-3 h-40">
          {[
            { day: "Mon", campaigns: 4, height: 40 },
            { day: "Tue", campaigns: 7, height: 70 },
            { day: "Wed", campaigns: 12, height: 100 },
            { day: "Thu", campaigns: 9, height: 75 },
            { day: "Fri", campaigns: 15, height: 130 },
            { day: "Sat", campaigns: 6, height: 50 },
            { day: "Sun", campaigns: 3, height: 30 },
          ].map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{d.campaigns}</span>
              <div className="w-full rounded-t-md" style={{ height: `${d.height}px`, backgroundColor: "#7c3aed", opacity: 0.8 }} />
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Talents</h3>
          <div className="space-y-3">
            {[
              { name: "Adaeze Okafor", campaigns: 8, earnings: "₦3.2M" },
              { name: "Ngozi Adeyemi", campaigns: 6, earnings: "₦2.4M" },
              { name: "Emeka Nwosu", campaigns: 5, earnings: "₦2.0M" },
            ].map((t, i) => (
              <div key={t.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: ["#7c3aed", "#a855f7", "#c084fc"][i] }}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.campaigns} campaigns</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">{t.earnings}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Top Brands by Campaigns</h3>
          <div className="space-y-3">
            {[
              { name: "Tecno Mobile", campaigns: 14, spend: "₦8.5M" },
              { name: "Pepsi Nigeria", campaigns: 11, spend: "₦6.2M" },
              { name: "Flutterwave", campaigns: 9, spend: "₦4.1M" },
            ].map((b, i) => (
              <div key={b.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: ["#0ea5e9", "#38bdf8", "#7dd3fc"][i] }}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.campaigns} campaigns</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">{b.spend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Flagged Content Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Reviewed This Week", value: 14, color: "#7c3aed" },
            { label: "Removed", value: 3, color: "#dc2626" },
            { label: "Escalated to Admin", value: 2, color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: s.color + "10" }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TAB_CONTENT = {
    overview: renderOverview,
    content: renderContentReview,
    queue: renderStaffQueue,
    users: renderUsers,
    jobs: renderJobs,
    reports: renderReports,
  };

  if (!managerUser) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#7c3aed" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Brandiór</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Manager Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => {
            const badgeCount = id === "content" ? pendingContent : id === "queue" ? pendingRequests : 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: activeTab === id ? "#7c3aed" : "transparent",
                  color: activeTab === id ? "#fff" : "#94a3b8",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && badgeCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2.5 px-2">
            <Avatar initials="PM" size="sm" color="#7c3aed" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{managerUser.name}</p>
              <p className="text-xs truncate" style={{ color: "#64748b" }}>Manager</p>
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

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-400">Brandiór Admin Portal · Manager</p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar initials="PM" size="sm" color="#7c3aed" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{managerUser.name}</p>
              <p className="text-xs text-gray-400">manager</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {TAB_CONTENT[activeTab]?.()}
        </div>
      </main>

      {noteModal && (
        <NoteModal
          user={noteModal}
          onClose={() => setNoteModal(null)}
          onSave={(note) => handleSaveNote(noteModal.id, note)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
