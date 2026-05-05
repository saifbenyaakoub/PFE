import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  edit:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  msg:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  plus:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  wrench:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  send:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  users:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
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

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="db-spinner-wrap"><div className="db-spinner" /></div>
);

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "var(--warn)" : "var(--border)", fontSize: 13 }}>★</span>
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
  const [active, setActive] = useState(null);

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
      <div style={{
        display: "flex", width: "100%", maxWidth: 820,
        maxHeight: "calc(100vh - 32px)", borderRadius: "var(--radius-xl)",
        overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        border: "1px solid var(--border)",
      }}>
        {/* Left panel */}
        <div style={{
          width: 260, minWidth: 260, flexShrink: 0,
          background: "var(--ink)", display: "flex", flexDirection: "column",
          alignItems: "center", padding: "36px 24px 28px", position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.6)", borderRadius: 8, width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div style={{ width: 76, height: 76, borderRadius: 18, border: "2px solid rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.3)", flexShrink: 0 }}>
            {profileImageUrl
              ? <img src={profileImageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "var(--accent-dark)", fontFamily: "var(--font-display)" }}>{initials}</div>
            }
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#FAF8F4", margin: "0 0 2px", textAlign: "center" }}>{name}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 24px" }}>Client · FixHub</p>

          {/* Photo upload */}
          <div style={{ width: "100%" }}>
            <p style={{ fontSize: 10.5, fontWeight: 500, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Task Photo <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
            {photoPreview ? (
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src={photoPreview} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 6, color: "#fff", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>✕ Remove</button>
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "20px 12px", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", cursor: "pointer", boxSizing: "border-box" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 400, margin: 0 }}>Click to upload</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", margin: 0 }}>JPG, PNG · max 5MB</p>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* Tips */}
          <div style={{ marginTop: "auto", paddingTop: 24, width: "100%" }}>
            {[
              { icon: "⚡", text: "Get offers in under 2 hours" },
              { icon: "🛡️", text: "Vetted & verified providers" },
              { icon: "💬", text: "Chat directly with providers" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{tip.icon}</span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, background: "var(--card)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "22px 28px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 3px" }}>Post a Task</h2>
            <p style={{ fontSize: 12.5, color: "var(--ink-light)", margin: 0 }}>Fill in the details and get offers fast</p>
          </div>

          <div style={{ flex: 1, padding: "20px 28px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {success ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "var(--success-bg)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Task Posted! 🎉</h3>
                <p style={{ fontSize: 13.5, color: "var(--ink-mid)", marginBottom: 6, maxWidth: 280 }}>Providers will see your task and send offers.</p>
                <p style={{ fontSize: 12, color: "var(--success)", fontWeight: 500, marginBottom: 24 }}>Average response time: under 2 hours</p>
                <button className="db-cta" onClick={onClose}>Back to Dashboard</button>
              </div>
            ) : (
              <>
                <div>
                  <div className="db-form-group">
                    <label className="db-form-label">Task Title *</label>
                    <input className="db-form-input" type="text" value={form.title} placeholder="e.g. Fix leaking pipe in bathroom" onChange={e => setForm({ ...form, title: e.target.value })} maxLength={255} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                      <span style={{ fontSize: 10.5, color: form.title.length > 3 ? "var(--success)" : "transparent" }}>✓ Good title</span>
                      <span style={{ fontSize: 10.5, color: "var(--ink-light)" }}>{form.title.length}/255</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div className="db-form-group" style={{ marginBottom: 0 }}>
                      <label className="db-form-label">Category</label>
                      <select className="db-form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option value="">Select (optional)</option>
                        {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="db-form-group" style={{ marginBottom: 0 }}>
                      <label className="db-form-label">Location</label>
                      <input className="db-form-input" type="text" value={form.location} placeholder="e.g. Tunis, Lac 2" onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                  </div>

                  <div className="db-form-group">
                    <label className="db-form-label">Description *</label>
                    <textarea className="db-form-textarea" value={form.description} placeholder="Describe your task in detail…" onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                      <span style={{ fontSize: 10.5, color: form.description.length > 10 ? "var(--success)" : "transparent" }}>✓ Description complete</span>
                      <span style={{ fontSize: 10.5, color: "var(--ink-light)" }}>{form.description.length} chars</span>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid #F5C6C6", borderRadius: "var(--radius-sm)", padding: "9px 13px", fontSize: 12.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}
                </div>

                <div className="db-modal-actions">
                  <button className="db-cta db-cta--outline" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
                  <button className="db-cta" onClick={handleSubmit} disabled={!valid || loading} style={{ flex: 2, justifyContent: "center", opacity: !valid || loading ? 0.5 : 1, cursor: !valid || loading ? "not-allowed" : "pointer" }}>
                    {loading ? <><div className="db-spinner" style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Publishing…</> : <>{Icon.send} Publish Task</>}
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

// ── AI Chatbot ────────────────────────────────────────────────────────────────
function RecommendationBot({ navigate }) {
  const session = getSession();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm your **FixHub Assistant**. I can recommend service providers or explain your quotations. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

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
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  );

  return (
    <div className="db-card" style={{ padding: 0, display: "flex", flexDirection: "column", height: 440 }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--ink)", color: "#FAF8F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {Icon.wrench}
        </div>
        <div>
          <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-display)" }}>FixHub Assistant</span>
          <span style={{ display: "block", fontSize: 11, color: "var(--success)", fontWeight: 400 }}>● Powered by Gemini</span>
        </div>
        <button onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! How can I help?" }])}
          style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 11.5, color: "var(--ink-light)", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }}>
          Clear
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--ink)", color: "#FAF8F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                {Icon.wrench}
              </div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? "var(--ink)" : "var(--accent-light)",
              color: m.role === "user" ? "#FAF8F4" : "var(--accent-dark)",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
              padding: "9px 13px", fontSize: 13, lineHeight: 1.55,
              border: m.role === "user" ? "none" : "1px solid rgba(216,90,48,0.2)",
              whiteSpace: "pre-wrap",
            }}>
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--ink)", color: "#FAF8F4", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.wrench}</div>
            <div style={{ background: "var(--accent-light)", border: "1px solid rgba(216,90,48,0.2)", borderRadius: "2px 12px 12px 12px", padding: "9px 13px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "botPulse 1.2s ease-in-out infinite", animationDelay: `${n * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ padding: "0 18px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{
              fontSize: 11.5, padding: "5px 10px", borderRadius: 20,
              border: "1px solid var(--border)", color: "var(--ink-mid)",
              background: "var(--cream-alt)", cursor: "pointer",
              fontFamily: "var(--font-body)", transition: "all var(--transition)",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 18px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about providers or your quotations…"
          disabled={loading}
          style={{ flex: 1, padding: "9px 13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", color: "var(--ink)", background: loading ? "var(--cream-alt)" : "var(--card)" }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="db-icon-btn" style={{ width: 38, height: 38, flexShrink: 0 }}>
          {Icon.send}
        </button>
      </div>
      <style>{`@keyframes botPulse{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task }) {
  const tm = TASK_STATUS_META[task.status] || TASK_STATUS_META.open;
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--card)", transition: "box-shadow var(--transition), transform var(--transition)", cursor: "pointer", boxShadow: "var(--shadow-card)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {task.image && <img src={`${API_URL}/${task.image}`} alt={task.title} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", lineHeight: 1.35, flex: 1 }}>{task.title}</span>
          <span className={`db-badge ${tm.cls}`}>{tm.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {task.category && <span style={{ background: "var(--cream-alt)", color: "var(--ink-mid)", padding: "2px 9px", borderRadius: 20, fontSize: 11, border: "1px solid var(--border)" }}>{task.category}</span>}
          <span style={{ fontSize: 11.5, color: "var(--ink-light)", display: "flex", alignItems: "center", gap: 3 }}>{Icon.clock} {task.date}</span>
          {task.budget && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 500, marginLeft: "auto" }}>{task.budget}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          {Icon.users}
          <span style={{ fontSize: 11.5, color: "var(--ink-light)" }}>
            <strong style={{ color: "var(--ink-mid)", fontWeight: 500 }}>{task.applicants}</strong> provider{task.applicants !== 1 ? "s" : ""} applied
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Client Dashboard ──────────────────────────────────────────────────────────
function ClientDashboard() {
  const [tab, setTab] = useState("overview");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [dashError, setDashError] = useState(null);

  const navigate = useNavigate();
  const session  = getSession();
  const user     = session?.user;
  const name     = user?.name || "Client";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl = user?.profileImage ? `${API_URL}/uploads/${user.profileImage}` : null;

  const TABS = [
    { id: "overview", label: "Overview",  icon: Icon.grid },
    { id: "tasks",    label: "My Tasks",  icon: Icon.plus },
    { id: "messages", label: "Messages",  icon: Icon.msg  },
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
    { label: "Completed Jobs",  value: stats.completedJobs  ?? "—", icon: Icon.calendar, color: "var(--success)" },
    { label: "Active Bookings", value: stats.activeBookings ?? "—", icon: Icon.clock,    color: "var(--accent)"  },
    { label: "Posted Tasks",    value: stats.postedTasks    ?? "—", icon: Icon.plus,     color: "var(--warn)"    },
  ];

  return (
    <div className="db-shell">
      {showTaskModal && (
        <PostTaskModal onClose={() => { setShowTaskModal(false); fetchDashboard(); }} session={session} />
      )}

      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <span className="db-brand-icon">{Icon.wrench}</span>
          <span className="db-brand-text">Fix<em>Hub</em></span>
        </div>

        <nav className="db-nav">
          {TABS.map(t => (
            <button key={t.id} className={`db-nav-item${tab === t.id ? " db-nav-item--active" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <button className="db-profile-btn" onClick={() => navigate("/profile")}>
            {profileImageUrl
              ? <img src={profileImageUrl} alt={name} className="db-sidebar-avatar" />
              : <div className="db-sidebar-initials">{initials}</div>
            }
            <div className="db-sidebar-info">
              <span className="db-sidebar-name">{name}</span>
              <span className="db-sidebar-role">Client</span>
            </div>
            {Icon.edit}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="db-page-sub">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loadingDash && <div className="db-spinner" style={{ width: 16, height: 16 }} />}
            <button className="db-cta" onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
          </div>
        </div>

        {dashError && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--danger-bg)", border: "1px solid #F5C6C6", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 13, color: "var(--danger)", margin: 0, flex: 1 }}>{dashError}</p>
            <button className="db-cta" style={{ fontSize: 12, padding: "6px 12px", background: "var(--danger)" }} onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="db-fade">
            <div className="db-kpi-grid">
              {loadingDash
                ? [1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: 90, borderRadius: "var(--radius-lg)" }} />)
                : kpiCards.map((k, i) => (
                  <div className="db-kpi" key={i} style={{ "--kpi-accent": k.color }}>
                    <div className="db-kpi-icon" style={{ background: `color-mix(in srgb,${k.color} 12%,white)`, color: k.color }}>{k.icon}</div>
                    <div className="db-kpi-body">
                      <span className="db-kpi-label">{k.label}</span>
                      <span className="db-kpi-value">{k.value}</span>
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="db-two-col">
              <RecommendationBot navigate={navigate} />
              <div className="db-card" style={{ display: "flex", flexDirection: "column" }}>
                <div className="db-card-head">
                  <h3>Posted Tasks</h3>
                  {!loadingDash && <span className="db-count-badge">{appliedTasks.length} task{appliedTasks.length !== 1 ? "s" : ""}</span>}
                </div>
                {loadingDash ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />)}
                  </div>
                ) : appliedTasks.length === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">{Icon.plus}</div>
                    <p style={{ fontWeight: 500, color: "var(--ink-mid)" }}>No tasks yet</p>
                    <p style={{ fontSize: 12, margin: "0 0 12px" }}>Post your first task to get offers.</p>
                    <button className="db-cta" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", maxHeight: 380 }}>
                    {appliedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MY TASKS ── */}
        {tab === "tasks" && (
          <div className="db-fade">
            <p className="db-page-sub" style={{ marginBottom: 18 }}>
              {loadingDash ? "Loading…" : `${appliedTasks.length} task${appliedTasks.length !== 1 ? "s" : ""} posted`}
            </p>
            {loadingDash ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                {[1,2,3,4,5,6].map(i => <div key={i} className="db-skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />)}
              </div>
            ) : appliedTasks.length === 0 ? (
              <div className="db-card">
                <div className="db-empty">
                  <div className="db-empty-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-light)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-mid)", fontFamily: "var(--font-display)" }}>No tasks posted</p>
                  <p style={{ fontSize: 13, margin: "0 0 16px", maxWidth: 300, color: "var(--ink-light)" }}>Post your first task and receive offers from verified providers.</p>
                  <button className="db-cta" onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                {appliedTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div className="db-fade">
            <Chat />
          </div>
        )}
      </main>
    </div>
  );
}