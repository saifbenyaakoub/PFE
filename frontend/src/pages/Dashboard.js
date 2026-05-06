import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import ProviderDashboard from "./ProviderDashboard";
import AdminDashboard from "./AdminDashboard";
import Chat from "./Chat";
import "./dashboard.css";

// ── Smart router ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const session = getSession();
  const role = session?.user?.role;
  if (role === "admin")    return <AdminDashboard />;
  if (role === "provider") return <ProviderDashboard />;
  return <ClientDashboard />;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  grid:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  search:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  calendar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  star:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  edit:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  msg:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  plus:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  wrench:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  send:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  users:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  close:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  photo:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  warn:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const TASK_STATUS_META = {
  open:          { label: "Open",        cls: "db-badge--open"        },
  "in-progress": { label: "In Progress", cls: "db-badge--in-progress" },
  closed:        { label: "Closed",      cls: "db-badge--closed"      },
  completed:     { label: "Completed",   cls: "db-badge--completed"   },
  cancelled:     { label: "Cancelled",   cls: "db-badge--cancelled"   },
};

const ENDPOINT = "http://localhost:5000";
const API_URL  = ENDPOINT;

const TASK_CATEGORIES = [
  "Plumbing","Electrical","Carpentry","Painting","Cleaning",
  "Gardening","Moving","IT Support","Tutoring","Music Lessons","Other",
];

const SUGGESTIONS = [
  "🔍 Recommend me a provider in Tunis",
  "📋 Explain my latest quotation",
  "⭐ Who has the best ratings for painting?",
  "📅 What have I booked before?",
];

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "var(--warn)" : "var(--border2)", fontSize: 13 }}>★</span>
    ))}
  </span>
);

// ── PostTaskModal ─────────────────────────────────────────────────────────────
function PostTaskModal({ onClose, session }) {
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "" });
  const [image, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user;
  const name = user?.name || "Client";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl = user?.profileImage ? `${API_URL}/uploads/${user.profileImage}` : null;
  const valid = form.title.trim().length > 3 && form.description.trim().length > 10;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("title",       form.title.trim());
      fd.append("description", form.description.trim());
      if (form.category) fd.append("category", form.category);
      if (form.location) fd.append("location", form.location);
      if (image)         fd.append("image", image);
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed to post task"); }
      setSuccess(true);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="db-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="db-modal">

        {/* ── Left panel — dark context ── */}
        <div className="db-modal-left">
          <button className="db-modal-close" onClick={onClose}>{Icon.close}</button>

          {/* Avatar */}
          <div className="db-modal-avatar">
            {profileImageUrl
              ? <img src={profileImageUrl} alt={name} />
              : <span>{initials}</span>
            }
          </div>
          <p className="db-modal-username">{name}</p>
          <p className="db-modal-userrole">Client · FixHub</p>

          {/* Photo upload */}
          <div className="db-modal-upload-wrap">
            <p className="db-modal-upload-label">
              Task Photo <span className="db-modal-upload-opt">(optional)</span>
            </p>
            {photoPreview ? (
              <div className="db-modal-photo-preview">
                <img src={photoPreview} alt="preview" />
                <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}>✕ Remove</button>
              </div>
            ) : (
              <label className="db-modal-photo-drop">
                {Icon.photo}
                <span>Click to upload</span>
                <span className="db-modal-photo-hint">JPG, PNG · max 5MB</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* Trust tips */}
          <ul className="db-modal-tips">
            {[
              { icon: "⚡", text: "Get offers in under 2 hours" },
              { icon: "🛡️", text: "Vetted & verified providers" },
              { icon: "💬", text: "Chat directly with providers" },
            ].map((tip, i) => (
              <li key={i}>
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right panel — form ── */}
        <div className="db-modal-right">
          <div className="db-modal-right-head">
            <div>
              <h2>Post a Task</h2>
              <p>Fill in the details and get offers fast</p>
            </div>
          </div>

          <div className="db-modal-right-body">
            {success ? (
              <div className="db-modal-success">
                <div className="db-modal-success-icon">{Icon.check}</div>
                <h3>Task Posted! 🎉</h3>
                <p>Providers will see your task and send offers.</p>
                <p className="db-modal-success-note">Average response time: under 2 hours</p>
                <button className="db-cta" onClick={onClose}>Back to Dashboard</button>
              </div>
            ) : (
              <>
                <div className="db-form-group">
                  <label className="db-form-label">Task Title *</label>
                  <input
                    className="db-form-input"
                    type="text"
                    value={form.title}
                    placeholder="e.g. Fix leaking pipe in bathroom"
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    maxLength={255}
                  />
                  <div className="db-form-hint">
                    <span style={{ color: form.title.length > 3 ? "var(--green)" : "transparent" }}>✓ Good title</span>
                    <span>{form.title.length}/255</span>
                  </div>
                </div>

                <div className="db-form-row">
                  <div className="db-form-group">
                    <label className="db-form-label">Category</label>
                    <select className="db-form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select (optional)</option>
                      {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="db-form-group">
                    <label className="db-form-label">Location</label>
                    <input
                      className="db-form-input"
                      type="text"
                      value={form.location}
                      placeholder="e.g. Tunis, Lac 2"
                      onChange={e => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">Description *</label>
                  <textarea
                    className="db-form-textarea"
                    value={form.description}
                    placeholder="Describe your task in detail…"
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                  />
                  <div className="db-form-hint">
                    <span style={{ color: form.description.length > 10 ? "var(--green)" : "transparent" }}>✓ Description complete</span>
                    <span>{form.description.length} chars</span>
                  </div>
                </div>

                {error && (
                  <div className="db-form-error">
                    {Icon.warn}
                    <span>{error}</span>
                  </div>
                )}

                <div className="db-modal-actions">
                  <button className="db-cta db-cta--outline" onClick={onClose}>Cancel</button>
                  <button
                    className="db-cta"
                    onClick={handleSubmit}
                    disabled={!valid || loading}
                    style={{ flex: 1, justifyContent: "center", opacity: (!valid || loading) ? 0.5 : 1 }}
                  >
                    {loading
                      ? <><div className="db-spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} /> Publishing…</>
                      : <>{Icon.send} Publish Task</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── AI Recommendation Bot ─────────────────────────────────────────────────────
function RecommendationBot() {
  const session = getSession();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm your **FixHub Assistant**. I can recommend service providers or explain your quotations. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);
  const hasScrolledRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, userId: session?.user?.id }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally { setLoading(false); }
  };

  const renderText = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  );

  return (
    <div className="db-card db-bot">
      {/* Header */}
      <div className="db-bot-head">
        <div className="db-bot-avatar">{Icon.wrench}</div>
        <div className="db-bot-meta">
          <span className="db-bot-name">FixHub Assistant</span>
          <span className="db-bot-status">● Powered by Gemini</span>
        </div>
        <button
          className="db-bot-clear"
          onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! How can I help?" }])}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="db-bot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`db-bot-row db-bot-row--${m.role}`}>
            {m.role === "assistant" && (
              <div className="db-bot-bubble-icon">{Icon.wrench}</div>
            )}
            <div className={`db-bot-bubble db-bot-bubble--${m.role}`}>
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="db-bot-row db-bot-row--assistant">
            <div className="db-bot-bubble-icon">{Icon.wrench}</div>
            <div className="db-bot-bubble db-bot-bubble--assistant db-bot-bubble--typing">
              {[0, 1, 2].map(n => (
                <span key={n} className="db-bot-dot" style={{ animationDelay: `${n * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="db-bot-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="db-bot-pill" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="db-bot-input-row">
        <input
          className="db-bot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about providers or your quotations…"
          disabled={loading}
        />
        <button
          className="db-icon-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {Icon.send}
        </button>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task }) {
  const tm = TASK_STATUS_META[task.status] || TASK_STATUS_META.open;
       
  return (
    <div className="db-task-card">
      {task.image && (
        <img src={`${API_URL}${task.image}`} alt={task.title} className="db-task-img" />
      )}
      <div className="db-task-body">
        <div className="db-task-top">
          <span className="db-task-title">{task.title}</span>
          <span className={`db-badge ${tm.cls}`}>{tm.label}</span>
        </div>
        <div className="db-task-meta">
          {task.category && <span className="db-task-cat">{task.category}</span>}
          <span className="db-task-date">{Icon.clock} {task.date}</span>
          {task.budget && <span className="db-task-budget">{task.budget}</span>}
        </div>
        <div className="db-task-footer">
          {Icon.users}
          <span>
            <strong>{task.applicants}</strong> provider{task.applicants !== 1 ? "s" : ""} applied
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Client Dashboard ──────────────────────────────────────────────────────────
function ClientDashboard() {
  const [tab, setTab]               = useState("overview");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [dashData, setDashData]     = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [dashError, setDashError]   = useState(null);

  const navigate = useNavigate();
  const session  = getSession();
  const user     = session?.user;
  const name     = user?.name || "Client";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl = user?.profileImage ? `${API_URL}/uploads/${user.profileImage}` : null;

  const TABS = [
    { id: "overview", label: "Overview",  icon: Icon.grid     },
    { id: "tasks",    label: "My Tasks",  icon: Icon.calendar },
    { id: "messages", label: "Messages",  icon: Icon.msg      },
  ];

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoadingDash(true); setDashError(null);
    try {
      const res = await fetch(`${API_URL}/dashboard/client/${user.id}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error loading dashboard"); }
      const json = await res.json();
      setDashData(json.data);
    } catch (err) { setDashError(err.message); } finally { setLoadingDash(false); }
  };

  useEffect(() => { fetchDashboard(); }, [user?.id]);

  const stats        = dashData?.stats        || {};
  const appliedTasks = dashData?.appliedTasks || [];

  const kpiCards = [
    { label: "Total Spent",     value: stats.totalSpent !== undefined ? `${Number(stats.totalSpent).toLocaleString()} TND` : "—", icon: Icon.check,    color: "var(--info)"    },
    { label: "Completed Jobs",  value: stats.completedJobs  ?? "—", icon: Icon.calendar, color: "var(--green)"   },
    { label: "Active Bookings", value: stats.activeBookings ?? "—", icon: Icon.clock,    color: "var(--warn)"    },
    { label: "Posted Tasks",    value: stats.postedTasks    ?? "—", icon: Icon.plus,     color: "var(--ink3)"    },
  ];

  const currentTab = TABS.find(t => t.id === tab);

  return (
    <div className="db-page">
      {showTaskModal && (
        <PostTaskModal onClose={() => { setShowTaskModal(false); fetchDashboard(); }} session={session} />
      )}

      {/* ── Sidebar navigation for dashboard ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-inner">

          {/* Logo */}
          <Link className="db-logo" to="/">
            <span className="db-logo-icon">{Icon.wrench}</span>
            <span className="db-logo-text">Fix<em>Hub</em></span>
          </Link>

          {/* Tab nav — pill style matching site navbar links */}
          <p className="db-sidebar-note">Manage your tasks, messages, and service requests in one place.</p>
          <nav className="db-sidebar-nav">
            {TABS.map(t => (
              <button
                type="button"
                key={t.id}
                className={`db-sidebar-link${tab === t.id ? " db-sidebar-link--active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="db-sidebar-footer">
            {loadingDash && <div className="db-spinner" style={{ width: 14, height: 14 }} />}
            <button className="db-cta" onClick={() => setShowTaskModal(true)}>
              {Icon.plus} Post a Task
            </button>
            <button className="db-user-pill" onClick={() => navigate("/profile")}>
              {profileImageUrl
                ? <img src={profileImageUrl} alt={name} className="db-user-avatar" />
                : <span className="db-user-initials">{initials}</span>
              }
              <span className="db-user-name">{name}</span>
            </button>
          </div>

        </div>

      </aside>

      {/* ── Main scrollable content area ── */}
      <main className="db-main">

        {/* Page title row */}
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{currentTab?.label}</h1>
            <p className="db-page-sub">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Error banner */}
        {dashError && (
          <div className="db-error-banner">
            {Icon.warn}
            <p>{dashError}</p>
            <button className="db-cta" style={{ fontSize: 12, padding: "6px 12px", background: "var(--danger)" }} onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="db-fade">

            {/* KPI row */}
            <div className="db-kpi-grid">
              {loadingDash
                ? [1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: 90, borderRadius: "var(--r)" }} />)
                : kpiCards.map((k, i) => (
                  <div className="db-kpi" key={i} style={{ "--kpi-accent": k.color }}>
                    <div className="db-kpi-icon" style={{ background: `color-mix(in srgb,${k.color} 12%,white)`, color: k.color }}>
                      {k.icon}
                    </div>
                    <div className="db-kpi-body">
                      <span className="db-kpi-label">{k.label}</span>
                      <span className="db-kpi-value">{k.value}</span>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Two-column: bot + recent tasks */}
            <div className="db-two-col">
              <RecommendationBot />

              <div className="db-card">
                <div className="db-card-head">
                  <h3>Recent Tasks</h3>
                  {!loadingDash && (
                    <span className="db-count-badge">
                      {appliedTasks.length} task{appliedTasks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingDash ? (
                  <div className="db-stack">
                    {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: 80, borderRadius: "var(--r-sm)" }} />)}
                  </div>
                ) : appliedTasks.length === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">{Icon.plus}</div>
                    <p style={{ fontWeight: 600, color: "var(--ink2)" }}>No tasks yet</p>
                    <p style={{ fontSize: 12, color: "var(--ink3)", margin: "2px 0 14px" }}>Post your first task to get offers.</p>
                    <button className="db-cta" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => setShowTaskModal(true)}>
                      {Icon.plus} Post a Task
                    </button>
                  </div>
                ) : (
                  <div className="db-stack db-stack--scroll">
                    {appliedTasks.slice(0, 5).map(task => <TaskCard key={task.id} task={task} />)}
                    {appliedTasks.length > 5 && (
                      <button className="db-see-all" onClick={() => setTab("tasks")}>
                        See all {appliedTasks.length} tasks {Icon.arrow}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── MY TASKS ── */}
        {tab === "tasks" && (
          <div className="db-fade">
            <p className="db-section-count">
              {loadingDash ? "Loading…" : `${appliedTasks.length} task${appliedTasks.length !== 1 ? "s" : ""} posted`}
            </p>

            {loadingDash ? (
              <div className="db-task-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="db-skeleton" style={{ height: 160, borderRadius: "var(--r)" }} />
                ))}
              </div>
            ) : appliedTasks.length === 0 ? (
              <div className="db-card">
                <div className="db-empty">
                  <div className="db-empty-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <p style={{ fontWeight: 600, color: "var(--ink2)" }}>No tasks posted</p>
                  <p style={{ fontSize: 13, color: "var(--ink3)", margin: "2px 0 16px", maxWidth: 300, textAlign: "center" }}>
                    Post your first task and receive offers from verified providers.
                  </p>
                  <button className="db-cta" onClick={() => setShowTaskModal(true)}>
                    {Icon.plus} Post a Task
                  </button>
                </div>
              </div>
            ) : (
              <div className="db-task-grid">
                {appliedTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div className="db-fade db-messages-wrap">
            <Chat />
          </div>
        )}

      </main>
    </div>
  );
}