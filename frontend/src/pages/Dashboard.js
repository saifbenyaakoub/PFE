import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import ProviderDashboard from "./ProviderDashboard";

// ── Smart router ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const session = getSession();
  const role    = session?.user?.role;
  if (role === "provider") return <ProviderDashboard />;
  return <ClientDashboard />;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  grid:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  search:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  heart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  star:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  map:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrow:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  edit:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  msg:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  repeat:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  wrench:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

const STATUS_META = {
  confirmed:     { label: "Confirmed",    color: "#0ea5e9", bg: "#e0f2fe" },
  pending:       { label: "Pending",      color: "#f59e0b", bg: "#fef3c7" },
  "in-progress": { label: "In Progress",  color: "#8b5cf6", bg: "#ede9fe" },
  completed:     { label: "Completed",    color: "#10b981", bg: "#d1fae5" },
  cancelled:     { label: "Cancelled",    color: "#ef4444", bg: "#fee2e2" },
};

const MY_BOOKINGS = [
  { id:1, provider:"Karim Mejri",    service:"Plumbing Repair",    date:"Mar 26, 2026", time:"10:00 AM", amount:120, status:"confirmed",   city:"Tunis",  rating:null },
  { id:2, provider:"Nour Belhaj",    service:"Electrical Install", date:"Mar 28, 2026", time:"02:00 PM", amount:200, status:"pending",     city:"Sousse", rating:null },
  { id:3, provider:"Slim Gharbi",    service:"Room Painting",      date:"Mar 20, 2026", time:"09:00 AM", amount:350, status:"completed",   city:"Sfax",   rating:5   },
  { id:4, provider:"Ines Ferchichi", service:"Deep Cleaning",      date:"Mar 18, 2026", time:"11:00 AM", amount:75,  status:"completed",   city:"Tunis",  rating:4   },
  { id:5, provider:"Karim Mejri",    service:"Plumbing Repair",    date:"Mar 10, 2026", time:"03:00 PM", amount:95,  status:"completed",   city:"Tunis",  rating:5   },
  { id:6, provider:"Ines Ferchichi", service:"Deep Cleaning",      date:"Mar 22, 2026", time:"08:00 AM", amount:75,  status:"cancelled",   city:"Nabeul", rating:null },
];

const SAVED_PROVIDERS = [
  { id:1, name:"Karim Mejri",    category:"Plumbing",   rating:4.9, jobs:34, city:"Tunis"  },
  { id:2, name:"Nour Belhaj",    category:"Electrical", rating:4.7, jobs:21, city:"Sousse" },
  { id:3, name:"Ines Ferchichi", category:"Cleaning",   rating:4.8, jobs:56, city:"Tunis"  },
];

const APPLIED_TASKS = [
  { id:1, title:"Fix leaking pipe in bathroom",   category:"Plumbing",   budget:"120 TND", applicants:4, date:"Apr 05, 2026", status:"open",      image:null },
  { id:2, title:"Electrical panel installation",  category:"Electrical", budget:"250 TND", applicants:2, date:"Apr 07, 2026", status:"in-progress",image:null },
  { id:3, title:"Full apartment deep cleaning",   category:"Cleaning",   budget:"90 TND",  applicants:7, date:"Apr 08, 2026", status:"open",       image:null },
];

const TASK_STATUS_META = {
  open:        { label:"Open",        color:"#10b981", bg:"#d1fae5" },
  "in-progress":{ label:"In Progress",color:"#8b5cf6", bg:"#ede9fe" },
  closed:      { label:"Closed",      color:"#6b7280", bg:"#f1f5f9" },
};

const Stars = ({ n }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < n ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return <span style={{ background:m.bg, color:m.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{m.label}</span>;
};


// ── PostTaskModal ─────────────────────────────────────────────────────────────
const TASK_CATEGORIES = [
  "Plumbing","Electrical","Carpentry","Painting","Cleaning",
  "Gardening","Moving","IT Support","Tutoring","Music Lessons","Other",
];

function PostTaskModal({ onClose, session }) {
  const [form, setForm]       = useState({ title: "", description: "", category: "" });
  const [photo, setPhoto]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const valid = form.title.trim().length > 3 && form.description.trim().length > 10;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title",       form.title.trim());
      formData.append("description", form.description.trim());
      if (form.category) formData.append("category", form.category);
      if (photo)         formData.append("photo", photo);
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token}` },
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to post task");
      }
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Overlay (fixed positioned via inline style to avoid iframe issues) ──────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        animation: "dbFade 0.2s ease",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#0ea5e9", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:"#0a0a0a", margin:0 }}>Post a Task</h2>
              <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Describe what you need done</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            color:"#9ca3af", borderRadius:8, padding:6,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>

          {success ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{
                width:56, height:56, borderRadius:"50%",
                background:"#d1fae5", margin:"0 auto 14px",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:"#0a0a0a", marginBottom:6 }}>Task Posted!</h3>
              <p style={{ fontSize:13.5, color:"#6b7280", marginBottom:20 }}>
                Providers will be able to see your task and reach out to you.
              </p>
              <button onClick={onClose} style={{
                padding:"10px 28px", borderRadius:10, border:"none",
                background:"#0a0a0a", color:"#fff",
                fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
                cursor:"pointer",
              }}>Done</button>
            </div>
          ) : (
            <>
              {/* Title */}
              <div style={{ marginBottom:16 }}>
                <label style={{
                  display:"block", fontSize:11, fontWeight:700,
                  color:"#6b7280", textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:6,
                }}>Task Title *</label>
                <input
                  type="text"
                  value={form.title}
                  placeholder="e.g. Fix leaking pipe in bathroom"
                  onChange={e => setForm({...form, title: e.target.value})}
                  maxLength={255}
                  style={{
                    width:"100%", padding:"10px 13px", borderRadius:10,
                    border: `1.5px solid ${form.title.length > 3 ? "#d1fae5" : "#e5e7eb"}`,
                    fontSize:13.5, fontFamily:"'DM Sans',sans-serif",
                    outline:"none", color:"#0a0a0a",
                    transition:"border-color 0.15s",
                  }}
                />
                <p style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>
                  {form.title.length}/255 characters
                </p>
              </div>

              {/* Category */}
              <div style={{ marginBottom:16 }}>
                <label style={{
                  display:"block", fontSize:11, fontWeight:700,
                  color:"#6b7280", textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:6,
                }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  style={{
                    width:"100%", padding:"10px 13px", borderRadius:10,
                    border:"1.5px solid #e5e7eb", fontSize:13.5,
                    fontFamily:"'DM Sans',sans-serif", outline:"none",
                    color: form.category ? "#0a0a0a" : "#9ca3af",
                    background:"#fff", cursor:"pointer",
                  }}
                >
                  <option value="">Select a category (optional)</option>
                  {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom:20 }}>
                <label style={{
                  display:"block", fontSize:11, fontWeight:700,
                  color:"#6b7280", textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:6,
                }}>Description *</label>
                <textarea
                  value={form.description}
                  placeholder="Describe your task in detail — location, urgency, any specific requirements..."
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={4}
                  style={{
                    width:"100%", padding:"10px 13px", borderRadius:10,
                    border: `1.5px solid ${form.description.length > 10 ? "#d1fae5" : "#e5e7eb"}`,
                    fontSize:13.5, fontFamily:"'DM Sans',sans-serif",
                    outline:"none", color:"#0a0a0a", resize:"vertical",
                    lineHeight:1.5, transition:"border-color 0.15s",
                  }}
                />
                <p style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>
                  Minimum 10 characters · {form.description.length} typed
                </p>
              </div>

              {/* Photo */}
              <div style={{ marginBottom:20 }}>
                <label style={{
                  display:"block", fontSize:11, fontWeight:700,
                  color:"#6b7280", textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:6,
                }}>Photo <span style={{color:"#d1d5db",fontWeight:500,textTransform:"none"}}>(optional)</span></label>

                {photoPreview ? (
                  <div style={{ position:"relative", borderRadius:10, overflow:"hidden", border:"1.5px solid #d1fae5" }}>
                    <img src={photoPreview} alt="preview" style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}/>
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{
                      position:"absolute", top:8, right:8,
                      background:"rgba(0,0,0,0.55)", border:"none", borderRadius:6,
                      color:"#fff", padding:"4px 8px", fontSize:11, fontWeight:700, cursor:"pointer",
                    }}>✕ Remove</button>
                  </div>
                ) : (
                  <label style={{
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    gap:6, width:"100%", padding:"20px 13px", borderRadius:10,
                    border:"1.5px dashed #d1d5db", background:"#f9fafb",
                    cursor:"pointer", transition:"border-color 0.15s",
                  }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#0ea5e9"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#d1d5db"}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize:12.5, color:"#9ca3af", fontWeight:500 }}>Click to upload a photo</span>
                    <span style={{ fontSize:11, color:"#d1d5db" }}>JPG, PNG, WEBP · max 5 MB</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }}/>
                  </label>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background:"#fef2f2", color:"#b91c1c",
                  border:"1px solid #fecaca", borderRadius:10,
                  padding:"10px 14px", fontSize:13, marginBottom:16,
                  display:"flex", alignItems:"center", gap:8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Footer */}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={onClose} style={{
                  flex:1, padding:"11px", borderRadius:10,
                  border:"1.5px solid #e5e7eb", background:"#fff",
                  fontSize:13, fontWeight:600, cursor:"pointer", color:"#6b7280",
                  fontFamily:"'DM Sans',sans-serif",
                }}>Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={!valid || loading}
                  style={{
                    flex:2, padding:"11px", borderRadius:10, border:"none",
                    background: valid ? "#0ea5e9" : "#e5e7eb",
                    color: valid ? "#fff" : "#9ca3af",
                    fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
                    cursor: valid ? "pointer" : "not-allowed",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    transition:"background 0.15s",
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width:13, height:13, borderRadius:"50%",
                        border:"2px solid rgba(255,255,255,0.3)",
                        borderTopColor:"#fff",
                        animation:"spin 0.7s linear infinite",
                      }}/>
                      Posting…
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Post Task
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── FixHub Assistant Chatbot ──────────────────────────────────────────────────
function RecommendationBot({ navigate }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Bonjour ! Je suis **FixHub Assistant**. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur nos services, la réservation, ou la publication de tâches." }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are FixHub Assistant, a helpful customer support chatbot for FixHub — a platform connecting clients with home service providers (plumbing, electrical, cleaning, painting, carpentry, etc.) in Tunisia. Answer clearly and concisely in the same language the user writes in (French or English). Help users with booking services, posting tasks, understanding pricing, finding providers, and general platform questions. Keep responses friendly, short, and practical.",
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Je n'ai pas pu répondre, veuillez réessayer.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Erreur de connexion. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Simple markdown bold renderer
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{fontWeight:700}}>{p.slice(2,-2)}</strong>
        : p
    );
  };

  return (
    <div className="db-card db-bot-card" style={{padding:0,display:"flex",flexDirection:"column",height:420}}>
      {/* Header */}
      <div className="db-bot-header" style={{padding:"16px 18px",borderBottom:"1px solid #f1f5f9",flexShrink:0}}>
        <div className="db-bot-avatar" style={{background:"#0a0a0a"}}>
          {/* Tools icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div>
          <span className="db-bot-name">FixHub Assistant</span>
          <span className="db-bot-status">● En ligne</span>
        </div>
        <button
          style={{marginLeft:"auto",background:"none",border:"none",fontSize:11.5,color:"#9ca3af",cursor:"pointer",fontWeight:600,padding:"4px 8px",borderRadius:6,transition:"background 0.15s"}}
          onClick={() => setMessages([{ role:"assistant", content:"👋 Bonjour ! Je suis **FixHub Assistant**. Comment puis-je vous aider aujourd'hui ?" }])}
          onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
        >Effacer</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:"flex",justifyContent: m.role==="user" ? "flex-end" : "flex-start"}}>
            {m.role === "assistant" && (
              <div style={{width:26,height:26,borderRadius:8,background:"#0a0a0a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginRight:8,marginTop:2}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth:"78%",
              background: m.role==="user" ? "#0a0a0a" : "#f0f7ff",
              color: m.role==="user" ? "#fff" : "#1e40af",
              borderRadius: m.role==="user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
              padding:"9px 13px",
              fontSize:13,
              lineHeight:1.55,
              border: m.role==="user" ? "none" : "1px solid #dbeafe",
            }}>
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:8,background:"#0a0a0a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div style={{background:"#f0f7ff",border:"1px solid #dbeafe",borderRadius:"2px 12px 12px 12px",padding:"9px 13px",display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(n=>(
                <div key={n} style={{width:6,height:6,borderRadius:"50%",background:"#93c5fd",animation:"botPulse 1.2s ease-in-out infinite",animationDelay:`${n*0.2}s`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"12px 18px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8,flexShrink:0}}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question…"
          disabled={loading}
          style={{
            flex:1,padding:"9px 13px",borderRadius:10,
            border:"1.5px solid #e5e7eb",fontSize:13,
            fontFamily:"'DM Sans',sans-serif",outline:"none",
            color:"#0a0a0a",transition:"border-color 0.15s",
            background: loading ? "#f9fafb" : "#fff",
          }}
          onFocus={e=>e.target.style.borderColor="#0ea5e9"}
          onBlur={e=>e.target.style.borderColor="#e5e7eb"}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width:38,height:38,borderRadius:10,border:"none",
            background: input.trim() && !loading ? "#0a0a0a" : "#e5e7eb",
            color: input.trim() && !loading ? "#fff" : "#9ca3af",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            flexShrink:0,transition:"background 0.15s",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <style>{`@keyframes botPulse{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

// ── RatingWidget ──────────────────────────────────────────────────────────────
function RatingWidget({ providerId, providerName }) {
  const [hovered,   setHovered]   = useState(0);
  const [selected,  setSelected]  = useState(0);
  const [feedback,  setFeedback]  = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    // TODO: POST /reviews { providerId, rating: selected, comment: feedback }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="db-rating-done">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Thanks for your review!</span>
      </div>
    );
  }

  return (
    <div className="db-rating-widget">
      <p className="db-rating-widget-label">Rate {providerName.split(" ")[0]}</p>

      {/* Star selector */}
      <div className="db-rating-stars">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            className="db-rating-star-btn"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24"
              fill={(hovered || selected) >= n ? "#f59e0b" : "none"}
              stroke={(hovered || selected) >= n ? "#f59e0b" : "#d1d5db"}
              strokeWidth="1.5"
              style={{ transition: "all 0.1s", transform: hovered === n ? "scale(1.2)" : "scale(1)" }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        ))}
        {selected > 0 && (
          <span className="db-rating-label-txt">
            {["","Poor","Fair","Good","Very good","Excellent"][selected]}
          </span>
        )}
      </div>

      {/* Feedback textarea */}
      <textarea
        className="db-rating-textarea"
        placeholder="Share your experience (optional)..."
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        rows={2}
      />

      <button
        className="db-rating-submit"
        onClick={handleSubmit}
        disabled={!selected}
      >
        Submit Review
      </button>
    </div>
  );
}

// ── Client Dashboard ──────────────────────────────────────────────────────────
function ClientDashboard() {
  const [tab, setTab]           = useState("overview");
  const [filter, setFilter]     = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const navigate            = useNavigate();
  const session             = getSession();
  const user                = session?.user;
  const name                = user?.name || "Client";
  const initials            = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const API_URL = "http://localhost:5000";

  const profileImageUrl = user?.profileImage 
  ? `${API_URL}/uploads/${user.profileImage}` : null;

  const totalSpent     = MY_BOOKINGS.filter(b => b.status === "completed").reduce((s,b) => s+b.amount, 0);
  const completedCount = MY_BOOKINGS.filter(b => b.status === "completed").length;
  const activeCount    = MY_BOOKINGS.filter(b => ["confirmed","pending","in-progress"].includes(b.status)).length;
  const postedTasksCount = 3; // placeholder — replace with real API data

  const filteredBookings = filter === "all" ? MY_BOOKINGS : MY_BOOKINGS.filter(b => b.status === filter);

  const TABS = [
    { id:"overview", label:"Overview",    icon:Icon.grid  },
    { id:"saved",    label:"My Tasks",    icon:Icon.plus  },
  ];

  return (
    <div className="db-shell">
      <style>{STYLES}</style>

      {showTaskModal && <PostTaskModal onClose={() => setShowTaskModal(false)} session={session} />}

      <aside className="db-sidebar">
        <div className="db-brand">{Icon.wrench} FixHub</div>
        <nav className="db-nav">
          {TABS.map(t => (
            <button key={t.id} className={`db-nav-item ${tab===t.id?"db-nav-item--active":""}`} onClick={() => setTab(t.id)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-quick-actions">
          <p className="db-quick-label">Quick Actions</p>
          <button className="db-quick-btn" onClick={() => navigate("/services")}>{Icon.search} Book a Service</button>
          <button className="db-quick-btn" onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
        </div>

        <div className="db-sidebar-footer">
          <button className="db-profile-btn" onClick={() => navigate("/profile")}>
            {profileImageUrl ? <img src={profileImageUrl} alt={name} className="db-sidebar-avatar"/> : <div className="db-sidebar-initials">{initials}</div>}
            <div className="db-sidebar-info">
              <span className="db-sidebar-name">{name}</span>
              <span className="db-sidebar-role">Client</span>
            </div>
            {Icon.edit}
          </button>
        </div>
      </aside>

      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{TABS.find(t=>t.id===tab)?.label}</h1>
            <p className="db-page-sub">{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
          <button className="db-cta" onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="db-fade">
            <div className="db-kpi-grid">
              {[
                { label:"Total Spent",       value:`${totalSpent} TND`, icon:Icon.check,    accent:"#0ea5e9" },
                { label:"Completed Jobs",    value:completedCount,      icon:Icon.calendar, accent:"#10b981" },
                { label:"Active Bookings",   value:activeCount,         icon:Icon.clock,    accent:"#8b5cf6" },
                { label:"Posted Tasks",      value:postedTasksCount,    icon:Icon.plus,     accent:"#f59e0b" },
              ].map((k,i) => (
                <div className="db-kpi" key={i} style={{"--accent":k.accent}}>
                  <div className="db-kpi-icon">{k.icon}</div>
                  <div className="db-kpi-body">
                    <span className="db-kpi-label">{k.label}</span>
                    <span className="db-kpi-value">{k.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="db-two-col">
              <RecommendationBot navigate={navigate} />

              <div className="db-card">
                <div className="db-card-head">
                  <h3>Applied Tasks</h3>
                  <span style={{fontSize:12,color:"#9ca3af",fontWeight:600}}>{APPLIED_TASKS.length} tasks</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {APPLIED_TASKS.map(task => {
                    const tm = TASK_STATUS_META[task.status] || TASK_STATUS_META.open;
                    return (
                      <div key={task.id} style={{
                        border:"1px solid #f1f5f9",borderRadius:12,overflow:"hidden",
                        background:"#fafbfc",transition:"box-shadow 0.2s",cursor:"pointer",
                      }}
                        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
                        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                      >
                        {task.image && (
                          <img src={task.image} alt={task.title} style={{width:"100%",height:80,objectFit:"cover"}}/>
                        )}
                        <div style={{padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:6}}>
                            <span style={{fontSize:13,fontWeight:700,color:"#0a0a0a",lineHeight:1.3,flex:1}}>{task.title}</span>
                            <span style={{background:tm.bg,color:tm.color,padding:"2px 8px",borderRadius:20,fontSize:10.5,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{tm.label}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                            <span style={{background:"#f1f5f9",color:"#475569",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>{task.category}</span>
                            <span style={{fontSize:11.5,color:"#6b7280",display:"flex",alignItems:"center",gap:3}}>{Icon.clock} {task.date}</span>
                            <span style={{fontSize:11.5,color:"#10b981",fontWeight:700,marginLeft:"auto"}}>{task.budget}</span>
                          </div>
                          <div style={{marginTop:8,fontSize:11.5,color:"#9ca3af"}}>
                            <span style={{fontWeight:600,color:"#6b7280"}}>{task.applicants}</span> providers applied
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* SAVED PROVIDERS */}
        {tab === "saved" && (
          <div className="db-fade">
            <div className="db-services-grid">
              {SAVED_PROVIDERS.map(p => (
                <div className="db-svc-card" key={p.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                    <div className="db-provider-avatar db-provider-avatar--lg">{p.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                    <div>
                      <div className="db-svc-name">{p.name}</div>
                      <span className="db-svc-cat">{p.category}</span>
                    </div>
                    <div style={{marginLeft:"auto",color:"#ef4444",cursor:"pointer"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                  </div>
                  <div className="db-svc-stats">
                    <div className="db-svc-stat"><span>★ {p.rating}</span><label>Rating</label></div>
                    <div className="db-svc-stat"><span>{p.jobs}</span><label>Jobs Done</label></div>
                    <div className="db-svc-stat"><span>{p.city}</span><label>City</label></div>
                  </div>
                  <RatingWidget providerId={p.id} providerName={p.name} />
                </div>
              ))}
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .db-shell{display:flex;min-height:100vh;background:#f8f9fc;font-family:'DM Sans',sans-serif}
  .db-sidebar{width:230px;min-width:230px;background:#0a0a0a;display:flex;flex-direction:column;padding:24px 16px;position:sticky;top:0;height:100vh;overflow-y:auto}
  .db-brand{display:flex;align-items:center;gap:10px;color:#fff;font-family:'Sora',sans-serif;font-size:18px;font-weight:800;padding:4px 8px 24px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:20px}
  .db-nav{display:flex;flex-direction:column;gap:4px;flex:1}
  .db-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:none;color:rgba(255,255,255,.5);font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;transition:all .15s;text-align:left;width:100%}
  .db-nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
  .db-nav-item--active{background:#fff;color:#0a0a0a;font-weight:700}
  .db-quick-actions{border-top:1px solid rgba(255,255,255,.07);padding-top:16px;margin-top:16px;display:flex;flex-direction:column;gap:8px}
  .db-quick-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.1em;padding:0 4px;margin-bottom:4px}
  .db-quick-btn{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
  .db-quick-btn:hover{background:rgba(255,255,255,.12);color:#fff}
  .db-sidebar-footer{border-top:1px solid rgba(255,255,255,.07);padding-top:16px;margin-top:16px}
  .db-profile-btn{display:flex;align-items:center;gap:10px;width:100%;padding:8px;border-radius:10px;border:none;background:rgba(255,255,255,.05);cursor:pointer;transition:background .15s;color:rgba(255,255,255,.6)}
  .db-profile-btn:hover{background:rgba(255,255,255,.1)}
  .db-sidebar-avatar{width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.15);flex-shrink:0}
  .db-sidebar-initials{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#555,#222);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .db-sidebar-info{flex:1;text-align:left;min-width:0}
  .db-sidebar-name{display:block;font-size:12.5px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .db-sidebar-role{display:block;font-size:11px;color:rgba(255,255,255,.4)}
  .db-main{flex:1;padding:32px;overflow-y:auto;min-width:0}
  .db-topbar{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px}
  .db-page-title{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:#0a0a0a;margin-bottom:3px}
  .db-page-sub{font-size:13px;color:#9ca3af}
  .db-cta{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;background:#0a0a0a;color:#fff;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .15s;white-space:nowrap}
  .db-cta:hover{transform:translateY(-1px)}
  .db-cta--blue{background:#0ea5e9}.db-cta--blue:hover{background:#0284c7}
  .db-fade{animation:dbFade .2s ease}
  @keyframes dbFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .db-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
  .db-kpi{background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:20px;display:flex;gap:14px;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s}
  .db-kpi:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.07)}
  .db-kpi-icon{width:40px;height:40px;border-radius:10px;background:color-mix(in srgb,var(--accent) 12%,white);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .db-kpi-body{display:flex;flex-direction:column;min-width:0}
  .db-kpi-label{font-size:11.5px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
  .db-kpi-value{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0a0a0a}
  .db-two-col{display:grid;grid-template-columns:1.4fr 1fr;gap:20px}
  .db-card{background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:22px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
  .db-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .db-card-head h3{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0a0a0a}
  .db-link{display:inline-flex;align-items:center;gap:4px;background:none;border:none;font-size:12.5px;font-weight:600;color:#6b7280;cursor:pointer;transition:color .15s}
  .db-link:hover{color:#0a0a0a}
  .db-booking-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f8fafc}
  .db-booking-row:last-child{border-bottom:none}
  .db-booking-avatar{width:38px;height:38px;border-radius:10px;background:#f1f5f9;color:#475569;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
  .db-booking-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
  .db-booking-client{font-size:13.5px;font-weight:600;color:#0a0a0a}
  .db-booking-meta{display:flex;align-items:center;gap:4px;font-size:11.5px;color:#9ca3af}
  .db-booking-service{font-size:12px;color:#6b7280}
  .db-booking-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
  .db-booking-amount{font-size:13px;font-weight:700;color:#0a0a0a}
  .db-provider-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
  .db-provider-avatar--lg{width:46px;height:46px;font-size:14px}
  .db-service-row{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f8fafc}
  .db-service-row:last-child{border-bottom:none}
  .db-service-info{flex:1;min-width:0}
  .db-service-name{display:block;font-size:13.5px;font-weight:600;color:#0a0a0a}
  .db-service-meta{font-size:11.5px;color:#9ca3af}
  .db-reviews-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .db-review-card{background:#f8f9fc;border-radius:12px;padding:16px;border:1px solid #f1f5f9}
  .db-review-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .db-review-avatar{width:32px;height:32px;border-radius:50%;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
  .db-review-avatar--lg{width:40px;height:40px;font-size:14px}
  .db-review-client{display:block;font-size:13px;font-weight:600;color:#0a0a0a}
  .db-review-date{font-size:11px;color:#9ca3af;margin-left:auto;white-space:nowrap}
  .db-review-tag{display:inline-block;background:#f1f5f9;color:#475569;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;margin-top:4px}
  .db-reviews-list{display:flex;flex-direction:column;gap:14px}
  .db-review-full{background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
  .db-review-full-top{display:flex;align-items:center;gap:12px}
  .db-review-full-info{display:flex;flex-direction:column;gap:4px}
  .db-rate-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;background:#fef3c7;color:#b45309;border:1px solid #fde68a;font-size:12px;font-weight:600;cursor:pointer}
  .db-rate-btn--full{width:100%;justify-content:center;padding:10px;border-radius:10px;font-size:13px}
  .db-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .db-filter-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:#fff;border:1px solid #e5e7eb;font-size:12.5px;font-weight:500;color:#6b7280;cursor:pointer;transition:all .15s}
  .db-filter-btn:hover{border-color:#0a0a0a;color:#0a0a0a}
  .db-filter-btn--active{background:#0a0a0a;color:#fff;border-color:#0a0a0a}
  .db-filter-btn--active .db-filter-count{background:rgba(255,255,255,.2);color:#fff}
  .db-filter-count{background:#f1f5f9;color:#6b7280;padding:1px 7px;border-radius:20px;font-size:11px;font-weight:600}
  .db-table{width:100%;border-collapse:collapse}
  .db-table th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;background:#f8f9fc;border-bottom:1px solid #f1f5f9}
  .db-table td{padding:14px 16px;border-bottom:1px solid #f8fafc;font-size:13.5px;color:#374151;vertical-align:middle}
  .db-table tr:last-child td{border-bottom:none}
  .db-table tr:hover td{background:#fafafa}
  .db-table-client{display:flex;align-items:center;gap:10px;font-weight:600;color:#0a0a0a}
  .db-table-avatar{width:32px;height:32px;border-radius:8px;background:#f1f5f9;color:#475569;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
  .db-table-service{color:#6b7280;font-size:13px}
  .db-table-date{font-size:13px;font-weight:500;color:#0a0a0a}
  .db-table-time{font-size:11.5px;color:#9ca3af}
  .db-table-city{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:#6b7280}
  .db-table-amount{font-weight:700;color:#0a0a0a}
  .db-table-actions{display:flex;gap:6px}
  .db-empty{padding:32px;text-align:center;color:#9ca3af;font-size:13.5px}
  .db-icon-btn{width:30px;height:30px;border-radius:7px;background:#f1f5f9;border:none;color:#6b7280;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
  .db-icon-btn:hover{background:#0a0a0a;color:#fff}
  .db-services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
  .db-svc-card{background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s}
  .db-svc-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
  .db-svc-name{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:#0a0a0a;margin-bottom:4px}
  .db-svc-cat{display:inline-block;background:#f1f5f9;color:#475569;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600}
  .db-svc-stats{display:flex;border:1px solid #f1f5f9;border-radius:10px;overflow:hidden;margin-bottom:14px}
  .db-svc-stat{flex:1;padding:10px 8px;text-align:center;border-right:1px solid #f1f5f9}
  .db-svc-stat:last-child{border-right:none}
  .db-svc-stat span{display:block;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:#0a0a0a}
  .db-svc-stat label{font-size:10.5px;color:#9ca3af;font-weight:500}
  .db-svc-actions{display:flex;gap:8px}
  .db-svc-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:8px;background:#f8f9fc;border:1px solid #f1f5f9;font-size:12.5px;font-weight:600;color:#475569;cursor:pointer;transition:all .15s}
  .db-svc-btn:hover{background:#0a0a0a;color:#fff;border-color:#0a0a0a}
  .db-svc-btn--primary{background:#0ea5e9;color:#fff;border-color:#0ea5e9}
  .db-svc-btn--primary:hover{background:#0284c7;border-color:#0284c7}
  @media(max-width:1100px){.db-kpi-grid{grid-template-columns:repeat(2,1fr)}.db-two-col{grid-template-columns:1fr}.db-reviews-row{grid-template-columns:1fr 1fr}}
  @media(max-width:768px){.db-sidebar{display:none}.db-main{padding:20px 16px}.db-kpi-grid{grid-template-columns:1fr 1fr}.db-reviews-row{grid-template-columns:1fr}}
  @media(max-width:480px){.db-kpi-grid{grid-template-columns:1fr}}
  /* ── RecommendationBot ── */
  .db-bot-card { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .db-bot-header { display: flex; align-items: center; gap: 10px; }
  .db-bot-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .db-bot-name { display: block; font-size: 13px; font-weight: 700; color: #0a0a0a; font-family: 'Sora', sans-serif; }
  .db-bot-status { display: block; font-size: 11px; color: #10b981; font-weight: 600; }
  .db-bot-back { margin-left: auto; background: none; border: none; font-size: 12px; color: #6b7280; cursor: pointer; font-weight: 600; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; }
  .db-bot-back:hover { background: #f1f5f9; color: #0a0a0a; }
  .db-bot-bubble { background: #f0f7ff; border-radius: 0 12px 12px 12px; padding: 12px 14px; border: 1px solid #dbeafe; }
  .db-bot-msg { font-size: 13.5px; color: #1e40af; line-height: 1.5; }
  .db-bot-opts { display: flex; flex-direction: column; gap: 7px; }
  .db-bot-opt { text-align: left; padding: 9px 14px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: #fff; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .db-bot-opt:hover { border-color: #0ea5e9; color: #0284c7; background: #f0f9ff; transform: translateX(3px); }

  /* ── RatingWidget ── */
  .db-rating-widget { padding-top: 14px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 10px; }
  .db-rating-widget-label { font-size: 11.5px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
  .db-rating-stars { display: flex; align-items: center; gap: 2px; }
  .db-rating-star-btn { background: none; border: none; cursor: pointer; padding: 2px; line-height: 0; }
  .db-rating-label-txt { font-size: 12px; font-weight: 700; color: #f59e0b; margin-left: 6px; }
  .db-rating-textarea { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1.5px solid #e5e7eb; font-size: 13px; font-family: 'DM Sans', sans-serif; resize: none; outline: none; color: #374151; background: #fafafa; }
  .db-rating-textarea:focus { border-color: #0ea5e9; background: #fff; }
  .db-rating-submit { width: 100%; padding: 9px; border-radius: 9px; border: none; background: #0a0a0a; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; transition: background 0.15s, opacity 0.15s; }
  .db-rating-submit:hover:not(:disabled) { background: #222; }
  .db-rating-submit:disabled { opacity: 0.4; cursor: not-allowed; }
  .db-rating-done { display: flex; align-items: center; gap: 7px; padding: 10px 0 4px; font-size: 13px; font-weight: 600; color: #10b981; }

`;