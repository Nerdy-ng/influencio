import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare, Search, AlertTriangle, Send, HelpCircle,
  LogOut, Shield, CheckCircle, Clock, X, ChevronDown,
  MessageSquare, ArrowUpRight, User, MapPin, Calendar,
  Instagram, Youtube, Twitter, Flag, FileText
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_TASKS = [
  { id: 1, title: "Review new talent profiles from this week", priority: "High", assignedBy: "Jane Okonkwo", dueDate: "Mar 25, 2025", status: "In Progress" },
  { id: 2, title: "Check flagged job listing #J24 for policy violations", priority: "High", assignedBy: "Jane Okonkwo", dueDate: "Mar 24, 2025", status: "Todo" },
  { id: 3, title: "Respond to support ticket #45 — talent payout issue", priority: "Medium", assignedBy: "Chidi Eze", dueDate: "Mar 26, 2025", status: "Todo" },
  { id: 4, title: "Verify location details for brands in South Africa", priority: "Low", assignedBy: "Jane Okonkwo", dueDate: "Mar 28, 2025", status: "Todo" },
  { id: 5, title: "Update internal spreadsheet for Q1 campaign completions", priority: "Low", assignedBy: "Chidi Eze", dueDate: "Mar 30, 2025", status: "Done" },
];

const MOCK_MY_REQUESTS = [
  { id: 1, type: "Flag content", target: "Job #J07", submittedDate: "Mar 22, 2025", reviewedBy: "Jane Okonkwo", status: "approved", reason: "Content violated misleading info policy." },
  { id: 2, type: "Add note to profile", target: "Biodun Alabi", submittedDate: "Mar 21, 2025", reviewedBy: "Jane Okonkwo", status: "approved", reason: "Note added successfully." },
  { id: 3, type: "Ban user", target: "Kemi Fashola", submittedDate: "Mar 20, 2025", reviewedBy: null, status: "escalated", reason: "Escalated to admin for final decision." },
  { id: 4, type: "Verify talent", target: "Adaeze Okafor", submittedDate: "Mar 18, 2025", reviewedBy: "Jane Okonkwo", status: "escalated", reason: "Escalated — requires admin verification sign-off." },
  { id: 5, type: "Close support ticket", target: "Ticket #38", submittedDate: "Mar 17, 2025", reviewedBy: "Chidi Eze", status: "rejected", reason: "Ticket not yet fully resolved per manager review." },
];

const MOCK_TICKETS = [
  {
    id: "TKT-001",
    user: "Adaeze Okafor",
    userRole: "Talent",
    subject: "Payment not received for completed campaign",
    priority: "High",
    created: "Mar 20, 2025",
    status: "open",
    thread: [
      { from: "Adaeze Okafor", message: "Hi, I completed the Tecno Mobile campaign on March 15th but I haven't received payment yet. It's been 5 days.", time: "Mar 20, 9:14 AM", isUser: true },
      { from: "You", message: "Hi Adaeze, thank you for reaching out. I'm looking into this now and will update you within 24 hours.", time: "Mar 20, 11:32 AM", isUser: false },
      { from: "Adaeze Okafor", message: "Thank you! I appreciate it. Please let me know as soon as possible.", time: "Mar 20, 11:45 AM", isUser: true },
    ],
  },
  {
    id: "TKT-002",
    user: "Tecno Mobile",
    userRole: "Brand",
    subject: "Talent didn't post content on agreed date",
    priority: "Medium",
    created: "Mar 19, 2025",
    status: "open",
    thread: [
      { from: "Tecno Mobile", message: "Our influencer was supposed to post on March 18th but there's no post visible on Instagram.", time: "Mar 19, 2:05 PM", isUser: true },
      { from: "You", message: "We're looking into this. Can you share the campaign ID so we can track it?", time: "Mar 19, 3:20 PM", isUser: false },
    ],
  },
  {
    id: "TKT-003",
    user: "Kemi Fashola",
    userRole: "Talent",
    subject: "Account suspended without notice",
    priority: "High",
    created: "Mar 18, 2025",
    status: "open",
    thread: [
      { from: "Kemi Fashola", message: "My account was suspended but I didn't receive any email or warning. I need this resolved urgently.", time: "Mar 18, 10:00 AM", isUser: true },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color = "#0ea5e9" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    High: { bg: "#fee2e2", color: "#dc2626" },
    Medium: { bg: "#fef3c7", color: "#d97706" },
    Low: { bg: "#dcfce7", color: "#16a34a" },
  };
  const s = map[priority] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    escalated: { bg: "#ede9fe", color: "#7c3aed", label: "Escalated" },
    open: { bg: "#dbeafe", color: "#1d4ed8", label: "Open" },
    closed: { bg: "#f1f5f9", color: "#64748b", label: "Closed" },
    Todo: { bg: "#f1f5f9", color: "#475569", label: "Todo" },
    "In Progress": { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" },
    Done: { bg: "#dcfce7", color: "#16a34a", label: "Done" },
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
      style={{ backgroundColor: type === "success" ? "#16a34a" : type === "info" ? "#0ea5e9" : "#dc2626" }}
    >
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

const MOCK_SEARCH_RESULTS = [
  { id: "U01", name: "Adaeze Okafor", handle: "@adaeze_creates", role: "Talent", tier: "top-rated", location: "Lagos, Nigeria", joined: "Jan 12, 2025", socials: ["Instagram: 142K", "TikTok: 89K"], avatar: "AO" },
  { id: "U02", name: "Tecno Mobile", handle: "@tecnomobile_ng", role: "Brand", tier: "premium", location: "Abuja, Nigeria", joined: "Feb 3, 2025", socials: ["Instagram: Business", "Twitter: Verified"], avatar: "TM" },
  { id: "U03", name: "Kemi Fashola", handle: "@kemi.fashy", role: "Talent", tier: "fast-rising", location: "Port Harcourt", joined: "Mar 1, 2025", socials: ["Instagram: 23K", "YouTube: 8K"], avatar: "KF" },
];

const NAV_ITEMS = [
  { id: "tasks", label: "My Tasks", Icon: CheckSquare },
  { id: "lookup", label: "User Lookup", Icon: Search },
  { id: "flag", label: "Flag Content", Icon: AlertTriangle },
  { id: "requests", label: "My Requests", Icon: Send, badge: true },
  { id: "support", label: "Support", Icon: HelpCircle, badge: true },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StaffPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tasks");
  const [staffUser, setStaffUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Tasks
  const [tasks, setTasks] = useState(MOCK_TASKS);

  // User Lookup
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [flagUserOpen, setFlagUserOpen] = useState(false);
  const [flagUserReason, setFlagUserReason] = useState("");
  const [flagUserDesc, setFlagUserDesc] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addNoteText, setAddNoteText] = useState("");

  // Flag Content
  const [flagForm, setFlagForm] = useState({ type: "", id: "", reason: "", description: "" });
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // My Requests
  const [myRequests, setMyRequests] = useState(MOCK_MY_REQUESTS);

  // Support
  const [tickets] = useState(MOCK_TICKETS);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [ticketThreads, setTicketThreads] = useState(
    MOCK_TICKETS.reduce((acc, t) => ({ ...acc, [t.id]: t.thread }), {})
  );

  const pendingRequests = myRequests.filter((r) => r.status === "pending").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;

  useEffect(() => {
    const role = localStorage.getItem("brandiór_admin_role");
    const user = localStorage.getItem("brandiór_admin_user");
    if (role !== "staff") {
      navigate("/admin/login");
      return;
    }
    if (user) setStaffUser(JSON.parse(user));
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

  const handleTaskStatus = (id, status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    showToast("Task status updated.");
  };

  const handleLookup = (e) => {
    e.preventDefault();
    const q = lookupQuery.toLowerCase().trim();
    const found = MOCK_SEARCH_RESULTS.find(
      (u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.id.toLowerCase() === q
    );
    setLookupResult(found || null);
    setLookupSearched(true);
    setFlagUserOpen(false);
    setAddNoteOpen(false);
  };

  const handleFlagUser = () => {
    if (!flagUserReason) return;
    const newReq = {
      id: Date.now(),
      type: "Flag content",
      target: lookupResult.name,
      submittedDate: "Today",
      reviewedBy: null,
      status: "pending",
      reason: "",
    };
    setMyRequests((prev) => [newReq, ...prev]);
    setFlagUserOpen(false);
    setFlagUserReason("");
    setFlagUserDesc("");
    showToast("Flag submitted to manager queue.", "info");
  };

  const handleAddNote = () => {
    if (!addNoteText.trim()) return;
    setAddNoteOpen(false);
    setAddNoteText("");
    showToast("Note submitted for manager review.", "info");
  };

  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagForm.type || !flagForm.id || !flagForm.reason) return;
    const newReq = {
      id: Date.now(),
      type: "Flag content",
      target: `${flagForm.type} #${flagForm.id}`,
      submittedDate: "Today",
      reviewedBy: null,
      status: "pending",
      reason: "",
    };
    setMyRequests((prev) => [newReq, ...prev]);
    setFlagForm({ type: "", id: "", reason: "", description: "" });
    setFlagSubmitted(true);
    setTimeout(() => setFlagSubmitted(false), 4000);
    showToast("Flag submitted. Managers will review within 24 hours.", "info");
  };

  const handleTicketReply = (ticketId) => {
    if (!replyText.trim()) return;
    const msg = { from: "You", message: replyText, time: "Just now", isUser: false };
    setTicketThreads((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] || []), msg] }));
    setReplyText("");
    showToast("Reply sent.");
  };

  // ─── TABS ─────────────────────────────────────────────────────────────────

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">My Assigned Tasks</h3>
        <p className="text-sm text-gray-500">
          {tasks.filter((t) => t.status === "Done").length} / {tasks.length} completed
        </p>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 cursor-pointer"
              style={{
                borderColor: task.status === "Done" ? "#16a34a" : "#d1d5db",
                backgroundColor: task.status === "Done" ? "#16a34a" : "transparent",
              }}
              onClick={() => handleTaskStatus(task.id, task.status === "Done" ? "Todo" : "Done")}
            >
              {task.status === "Done" && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm mb-1 ${task.status === "Done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <span className="text-xs text-gray-400">by {task.assignedBy}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {task.dueDate}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <select
                value={task.status}
                onChange={(e) => handleTaskStatus(task.id, e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-200 text-xs outline-none text-gray-600"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLookup = () => (
    <div className="space-y-4 max-w-2xl">
      <form onSubmit={handleLookup} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, handle, or user ID..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-gray-200 outline-none focus:border-sky-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#0ea5e9" }}
          >
            Search
          </button>
        </div>
      </form>

      {lookupSearched && !lookupResult && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No user found for "{lookupQuery}"</p>
        </div>
      )}

      {lookupResult && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar initials={lookupResult.avatar} size="lg" color={lookupResult.role === "Brand" ? "#0ea5e9" : "#7c3aed"} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="font-bold text-gray-900 text-lg">{lookupResult.name}</h3>
                <span className="text-sm text-gray-500">{lookupResult.handle}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>{lookupResult.role}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {lookupResult.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {lookupResult.joined}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Tier: <span className="font-medium text-gray-600">{lookupResult.tier}</span></p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Social Accounts</p>
            <div className="flex gap-2 flex-wrap">
              {lookupResult.socials.map((s) => (
                <span key={s} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => { setFlagUserOpen(true); setAddNoteOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50"
            >
              <Flag className="w-4 h-4" /> Flag this user
            </button>
            <button
              onClick={() => { setAddNoteOpen(true); setFlagUserOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" /> Add internal note
            </button>
            <p className="self-center text-xs text-gray-400 ml-auto">View-only profile</p>
          </div>

          {flagUserOpen && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">Flag User — {lookupResult.name}</p>
              <select
                value={flagUserReason}
                onChange={(e) => setFlagUserReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-red-400"
              >
                <option value="">Select reason...</option>
                <option value="Spam">Spam</option>
                <option value="Misleading">Misleading information</option>
                <option value="Inappropriate">Inappropriate content</option>
                <option value="Fraud">Suspected fraud</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={flagUserDesc}
                onChange={(e) => setFlagUserDesc(e.target.value)}
                placeholder="Additional details..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-red-400 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setFlagUserOpen(false)} className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleFlagUser} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#dc2626" }}>Submit Flag</button>
              </div>
            </div>
          )}

          {addNoteOpen && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Internal Note — {lookupResult.name}</p>
              <textarea
                value={addNoteText}
                onChange={(e) => setAddNoteText(e.target.value)}
                placeholder="Add internal note visible to managers and admins only..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400 resize-none"
              />
              <p className="text-xs text-gray-400">Visible to managers and admins only. Not shown to the user.</p>
              <div className="flex gap-2">
                <button onClick={() => setAddNoteOpen(false)} className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddNote} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#0ea5e9" }}>Submit Note</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderFlagContent = () => (
    <div className="max-w-lg space-y-4">
      <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-sky-700">
          Your flags are reviewed by managers within 24 hours. Use this form to report policy violations, suspicious activity, or inappropriate content.
        </p>
      </div>

      {flagSubmitted && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Flag submitted successfully. A manager will review it within 24 hours.</p>
        </div>
      )}

      <form onSubmit={handleFlagSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-900">Flag Content</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Type</label>
          <select
            value={flagForm.type}
            onChange={(e) => setFlagForm((f) => ({ ...f, type: e.target.value }))}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400"
          >
            <option value="">Select type...</option>
            <option value="User Profile">User Profile</option>
            <option value="Job Listing">Job Listing</option>
            <option value="Message">Message</option>
            <option value="Comment">Comment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Content ID / URL</label>
          <input
            type="text"
            value={flagForm.id}
            onChange={(e) => setFlagForm((f) => ({ ...f, id: e.target.value }))}
            placeholder="e.g. J07 or U03 or paste URL"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
          <select
            value={flagForm.reason}
            onChange={(e) => setFlagForm((f) => ({ ...f, reason: e.target.value }))}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400"
          >
            <option value="">Select reason...</option>
            <option value="Spam">Spam</option>
            <option value="Misleading">Misleading information</option>
            <option value="Inappropriate">Inappropriate content</option>
            <option value="Fraud">Fraud / Scam</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={flagForm.description}
            onChange={(e) => setFlagForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#0ea5e9" }}
        >
          Submit Flag
        </button>
      </form>
    </div>
  );

  const renderMyRequests = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">My Submitted Requests</h3>
        <p className="text-sm text-gray-500">{myRequests.length} total</p>
      </div>

      {myRequests.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Send className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">You haven't submitted any requests yet.</p>
        </div>
      )}

      {myRequests.map((req) => (
        <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900 text-sm">{req.type}</span>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Target: <span className="font-medium text-gray-800">{req.target}</span>
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span>Submitted: {req.submittedDate}</span>
                {req.reviewedBy && <span>Reviewed by: <span className="font-medium text-gray-600">{req.reviewedBy}</span></span>}
              </div>
              {req.reason && (
                <p className="text-xs text-gray-500 mt-1.5 italic">"{req.reason}"</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-4">
      {!activeTicket ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Open Tickets <span className="ml-1 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#0ea5e9" }}>{openTickets}</span></h3>
            <p className="text-xs text-gray-400">Cannot close tickets without manager approval</p>
          </div>

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-sky-200 transition-colors"
              onClick={() => setActiveTicket(ticket)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-gray-400">{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">
                    From: <span className="font-medium">{ticket.user}</span> ({ticket.userRole}) · {ticket.created}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{ticketThreads[ticket.id]?.length || 0} messages in thread</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 flex-shrink-0" />
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTicket(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className="w-4 h-4 rotate-90" /> Back to tickets
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Ticket header */}
            <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: "#f8fafc" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-gray-400">{activeTicket.id}</span>
                    <PriorityBadge priority={activeTicket.priority} />
                    <StatusBadge status={activeTicket.status} />
                  </div>
                  <p className="font-semibold text-gray-900">{activeTicket.subject}</p>
                  <p className="text-sm text-gray-500">From: {activeTicket.user} ({activeTicket.userRole}) · {activeTicket.created}</p>
                </div>
                <button
                  onClick={() => {
                    showToast("Ticket escalated to manager.", "info");
                    setActiveTicket(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 text-purple-700 hover:bg-purple-50 flex-shrink-0"
                >
                  <ArrowUpRight className="w-3 h-3" /> Escalate
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {(ticketThreads[activeTicket.id] || []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${msg.isUser ? "rounded-tl-none" : "rounded-tr-none"}`}
                    style={{
                      backgroundColor: msg.isUser ? "#f1f5f9" : "#0ea5e9",
                      color: msg.isUser ? "#374151" : "#fff",
                    }}
                  >
                    <p className="font-semibold text-xs mb-1 opacity-70">{msg.from}</p>
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <div className="flex gap-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-sky-400 resize-none"
                />
                <button
                  onClick={() => handleTicketReply(activeTicket.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 self-end"
                  style={{ backgroundColor: "#0ea5e9" }}
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Cannot close tickets without manager approval.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TAB_CONTENT = {
    tasks: renderTasks,
    lookup: renderLookup,
    flag: renderFlagContent,
    requests: renderMyRequests,
    support: renderSupport,
  };

  if (!staffUser) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0ea5e9" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Brandiór</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Staff Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => {
            const badgeCount = id === "requests" ? pendingRequests : id === "support" ? openTickets : 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: activeTab === id ? "#0ea5e9" : "transparent",
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
            <Avatar initials="SM" size="sm" color="#0ea5e9" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{staffUser.name}</p>
              <p className="text-xs truncate" style={{ color: "#64748b" }}>Staff</p>
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
            <p className="text-xs text-gray-400">Brandiór Admin Portal · Staff</p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar initials="SM" size="sm" color="#0ea5e9" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{staffUser.name}</p>
              <p className="text-xs text-gray-400">staff</p>
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

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
