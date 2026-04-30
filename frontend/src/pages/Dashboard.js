import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import ProviderDashboard from "./ProviderDashboard";
import AdminDashboard from "./AdminDashboard";

// ── Smart router ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const session = getSession();
  const role    = session?.user?.role;
  if (role === "admin") return <AdminDashboard />;
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

const TASK_STATUS_META = {
  open:          { label:"Open",        color:"#10b981", bg:"#d1fae5" },
  "in-progress": { label:"In Progress", color:"#8b5cf6", bg:"#ede9fe" },
  closed:        { label:"Closed",      color:"#6b7280", bg:"#f1f5f9" },
  completed:     { label:"Completed",   color:"#10b981", bg:"#d1fae5" },
  cancelled:     { label:"Cancelled",   color:"#ef4444", bg:"#fee2e2" },
};


const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < n ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
));

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return <span style={{ background:m.bg, color:m.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{m.label}</span>;
};

const ENDPOINT = "http://localhost:5000";


// ── PostTaskModal ─────────────────────────────────────────────────────────────
const TASK_CATEGORIES = [
  "Plumbing","Electrical","Carpentry","Painting","Cleaning",
  "Gardening","Moving","IT Support","Tutoring","Music Lessons","Other",
];

function PostTaskModal({ onClose, session }) {
  const [form, setForm]             = useState({ title: "", description: "", category: "", location: ""});
  const [image, setPhoto]           = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");
  const [activeField, setActiveField] = useState(null);

  const user    = session?.user;
  const name    = user?.name || "Client";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const API_URL = "http://localhost:5000";
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
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title",       form.title.trim());
      formData.append("description", form.description.trim());
      if (form.category) formData.append("category", form.category);
      if (form.location) formData.append("location", form.location);
      if (image)         formData.append("image",    image);
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

  const inputStyle = (field, extra = {}) => ({
    width: "100%", padding: "9px 12px",
    borderRadius: 8,
    border: `1.5px solid ${activeField === field ? "#0a0a0a" : "#e5e7eb"}`,
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    outline: "none", color: "#0a0a0a",
    background: "#fff",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
    ...extra,
  });

  const labelStyle = {
    display: "block", fontSize: 10.5, fontWeight: 700,
    color: "#6b7280", textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: 5,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(10,10,10,0.65)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        display: "flex",
        width: "100%", maxWidth: 820,
        maxHeight: "calc(100vh - 32px)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
        animation: "dbFade 0.22s cubic-bezier(0.34,1.1,0.64,1)",
      }}>

        {/* ── LEFT PANEL — Client identity + task photo ── */}
        <div style={{
          width: 260, minWidth: 260, flexShrink: 0,
          background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 60%, #0f3460 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          padding: "36px 24px 28px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }}/>
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(14,165,233,0.08)" }}/>

          {/* Close button */}
          <button onClick={onClose} style={{
            position:"absolute", top:14, right:14,
            background:"rgba(255,255,255,0.1)", border:"none", cursor:"pointer",
            color:"rgba(255,255,255,0.7)", borderRadius:8, width:30, height:30,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Client avatar */}
          <div style={{ position:"relative", marginBottom:14, zIndex:1 }}>
            <div style={{
              width:80, height:80, borderRadius:20,
              border:"3px solid rgba(255,255,255,0.15)",
              overflow:"hidden", flexShrink:0,
              boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              ) : (
                <div style={{
                  width:"100%", height:"100%",
                  background:"linear-gradient(135deg,#0ea5e9,#0284c7)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26, fontWeight:800, color:"#fff",
                  fontFamily:"'Sora',sans-serif",
                }}>{initials}</div>
              )}
            </div>
            {/* Online dot */}
            <div style={{
              position:"absolute", bottom:4, right:4,
              width:14, height:14, borderRadius:"50%",
              background:"#10b981", border:"2.5px solid #0a0a0a",
            }}/>
          </div>

          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 2px", textAlign:"center", zIndex:1 }}>{name}</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:"0 0 24px", zIndex:1 }}>Client · FixHub</p>

          {/* Task photo upload */}
          <div style={{ width:"100%", zIndex:1 }}>
            <p style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
              Task Photo <span style={{fontWeight:400,textTransform:"none"}}>(optional)</span>
            </p>

            {photoPreview ? (
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"2px solid rgba(255,255,255,0.12)" }}>
                <img src={photoPreview} alt="preview" style={{ width:"100%", height:130, objectFit:"cover", display:"block" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }}/>
                <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{
                  position:"absolute", top:8, right:8,
                  background:"rgba(0,0,0,0.6)", border:"none", borderRadius:6,
                  color:"#fff", padding:"4px 9px", fontSize:11, fontWeight:700, cursor:"pointer",
                  backdropFilter:"blur(4px)",
                }}>✕ Remove</button>
                <p style={{ position:"absolute", bottom:8, left:10, fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:600, margin:0 }}>Photo added ✓</p>
              </div>
            ) : (
              <label style={{
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:8, width:"100%", padding:"22px 12px",
                borderRadius:12, border:"1.5px dashed rgba(255,255,255,0.15)",
                background:"rgba(255,255,255,0.04)",
                cursor:"pointer", transition:"all 0.15s", boxSizing:"border-box",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(14,165,233,0.6)"; e.currentTarget.style.background="rgba(14,165,233,0.06)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              >
                <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:600, margin:"0 0 2px" }}>Click to upload</p>
                  <p style={{ fontSize:10.5, color:"rgba(255,255,255,0.25)", margin:0 }}>JPG, PNG, WEBP · max 5 MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }}/>
              </label>
            )}
          </div>

          {/* Tips */}
          <div style={{ marginTop:"auto", paddingTop:24, width:"100%", zIndex:1 }}>
            {[
              { icon:"⚡", text:"Get offers in under 2 hours" },
              { icon:"🛡️", text:"Vetted & verified providers" },
              { icon:"💬", text:"Chat directly with providers" },
            ].map((tip, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
                <span style={{ fontSize:14 }}>{tip.icon}</span>
                <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", lineHeight:1.4 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ── */}
        <div style={{
          flex:1, background:"#fff",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
        }}>

          {/* Form header */}
          <div style={{
            padding:"24px 28px 18px",
            borderBottom:"1px solid #f1f5f9",
            flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:"#0a0a0a", color:"#fff",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:"#0a0a0a", margin:0 }}>Post a Task</h2>
                <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Fill in the details and get offers fast</p>
              </div>
            </div>
          </div>

          {/* Form body — no scroll, compact fields */}
          <div style={{ flex:1, padding:"20px 28px", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

            {success ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", textAlign:"center" }}>
                <div style={{
                  width:64, height:64, borderRadius:20,
                  background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",
                  margin:"0 auto 16px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 8px 24px rgba(16,185,129,0.2)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:"#0a0a0a", marginBottom:8 }}>Task Posted! 🎉</h3>
                <p style={{ fontSize:13.5, color:"#6b7280", marginBottom:6, maxWidth:280 }}>
                  Providers in your area will see your task and send you offers.
                </p>
                <p style={{ fontSize:12, color:"#10b981", fontWeight:600, marginBottom:24 }}>Average response time: under 2 hours</p>
                <button onClick={onClose} style={{
                  padding:"11px 36px", borderRadius:10, border:"none",
                  background:"#0a0a0a", color:"#fff",
                  fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
                  cursor:"pointer", transition:"transform 0.15s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                >Back to Dashboard</button>
              </div>
            ) : (
              <>
                <div>
                  {/* Row 1 — Title */}
                  <div style={{ marginBottom:14 }}>
                    <label style={labelStyle}>Task Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      placeholder="e.g. Fix leaking pipe in bathroom"
                      onChange={e => setForm({...form, title: e.target.value})}
                      onFocus={()=>setActiveField("title")}
                      onBlur={()=>setActiveField(null)}
                      maxLength={255}
                      style={inputStyle("title")}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                      <span style={{ fontSize:10.5, color: form.title.length > 3 ? "#10b981" : "transparent" }}>✓ Good title</span>
                      <span style={{ fontSize:10.5, color:"#d1d5db" }}>{form.title.length}/255</span>
                    </div>
                  </div>

                  {/* Row 2 — Category + Location (side by side) */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        onFocus={()=>setActiveField("category")}
                        onBlur={()=>setActiveField(null)}
                        style={inputStyle("category", { color: form.category ? "#0a0a0a" : "#9ca3af", cursor:"pointer" })}
                      >
                        <option value="">Select (optional)</option>
                        {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Location</label>
                      <input
                        type="text"
                        value={form.location}
                        placeholder="e.g. Tunis, Lac 2"
                        onChange={e => setForm({...form, location: e.target.value})}
                        onFocus={()=>setActiveField("location")}
                        onBlur={()=>setActiveField(null)}
                        style={inputStyle("location")}
                      />
                    </div>
                  </div>

                  {/* Row 3 — Description */}
                  <div style={{ marginBottom:14 }}>
                    <label style={labelStyle}>Description *</label>
                    <textarea
                      value={form.description}
                      placeholder="Describe your task in detail — urgency, materials needed, any requirements..."
                      onChange={e => setForm({...form, description: e.target.value})}
                      onFocus={()=>setActiveField("description")}
                      onBlur={()=>setActiveField(null)}
                      rows={3}
                      style={inputStyle("description", { resize:"none", lineHeight:1.5 })}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                      <span style={{ fontSize:10.5, color: form.description.length > 10 ? "#10b981" : "transparent" }}>✓ Description complete</span>
                      <span style={{ fontSize:10.5, color:"#d1d5db" }}>{form.description.length} chars</span>
                    </div>
                  </div>
                  {/* Error */}
                  {error && (
                    <div style={{
                      background:"#fef2f2", color:"#b91c1c",
                      border:"1px solid #fecaca", borderRadius:8,
                      padding:"9px 13px", fontSize:12.5, marginBottom:12,
                      display:"flex", alignItems:"center", gap:8,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div style={{ display:"flex", gap:10, paddingTop:4 }}>
                  <button onClick={onClose} style={{
                    flex:1, padding:"11px", borderRadius:9,
                    border:"1.5px solid #e5e7eb", background:"#fff",
                    fontSize:13, fontWeight:600, cursor:"pointer", color:"#6b7280",
                    fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="#0a0a0a"; e.currentTarget.style.color="#0a0a0a"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#6b7280"; }}
                  >Cancel</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!valid || loading}
                    style={{
                      flex:2.5, padding:"11px", borderRadius:9, border:"none",
                      background: valid && !loading ? "#0a0a0a" : "#e5e7eb",
                      color: valid && !loading ? "#fff" : "#9ca3af",
                      fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
                      cursor: valid && !loading ? "pointer" : "not-allowed",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      transition:"all 0.15s",
                      boxShadow: valid && !loading ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
                    }}
                    onMouseEnter={e=>{ if(valid && !loading) e.currentTarget.style.transform="translateY(-1px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width:13, height:13, borderRadius:"50%",
                          border:"2px solid rgba(255,255,255,0.3)",
                          borderTopColor:"#fff",
                          animation:"spin 0.7s linear infinite",
                        }}/>
                        Publishing task…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Publish Task
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dbFade { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}

// ── FixHub Assistant Chatbot ──────────────────────────────────────────────────
const SUGGESTIONS = [
  "🔍 Recommend me a provider in Tunis",
  "📋 Explain my latest quotation",
  "⭐ Who has the best ratings for painting?",
  "📅 What have I booked before?",
];

function RecommendationBot({ navigate }) {
  const session = getSession();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm your **FixHub Assistant**. I can recommend service providers or explain your quotations. How can I help?" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
        body: JSON.stringify({
          message: userText,
          userId:  session?.user?.id,
        }),
      });
      console.log("AI response status:", res.status);
      const data  = await res.json();
      console.log("AI response data:", data);
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);
console.log("KEY EXISTS:", !!process.env.GEMINI_API_KEY);
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Renders **bold** markdown
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="db-card db-bot-card" style={{ padding: 0, display: "flex", flexDirection: "column", height: 440 }}>

      {/* Header */}
      <div className="db-bot-header" style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <div className="db-bot-avatar" style={{ background: "#0a0a0a" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div>
          <span className="db-bot-name">FixHub Assistant</span>
          <span className="db-bot-status">● Powered by Gemini</span>
        </div>
        <button
          style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 11.5, color: "#9ca3af", cursor: "pointer", fontWeight: 600, padding: "4px 8px", borderRadius: 6, transition: "background 0.15s" }}
          onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! I'm your **FixHub Assistant**. How can I help?" }])}
          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? "#0a0a0a" : "#f0f7ff",
              color: m.role === "user" ? "#fff" : "#1e40af",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
              padding: "9px 13px", fontSize: 13, lineHeight: 1.55,
              border: m.role === "user" ? "none" : "1px solid #dbeafe",
              whiteSpace: "pre-wrap",
            }}>
              {renderText(m.content)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div style={{ background: "#f0f7ff", border: "1px solid #dbeafe", borderRadius: "2px 12px 12px 12px", padding: "9px 13px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: "#93c5fd", animation: "botPulse 1.2s ease-in-out infinite", animationDelay: `${n * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestion buttons — only before first message */}
      {showSuggestions && (
        <div style={{ padding: "0 18px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{
              fontSize: 11.5, padding: "5px 10px", borderRadius: 20,
              border: "1px solid #dbeafe", color: "#1e40af",
              background: "#f0f7ff", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
              onMouseLeave={e => e.currentTarget.style.background = "#f0f7ff"}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 18px 14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about providers or your quotations…"
          disabled={loading}
          style={{
            flex: 1, padding: "9px 13px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", outline: "none",
            color: "#0a0a0a", transition: "border-color 0.15s",
            background: loading ? "#f9fafb" : "#fff",
          }}
          onFocus={e => e.target.style.borderColor = "#0ea5e9"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none",
            background: input.trim() && !loading ? "#0a0a0a" : "#e5e7eb",
            color: input.trim() && !loading ? "#fff" : "#9ca3af",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            flexShrink: 0, transition: "background 0.15s",
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
  const [tab, setTab]                   = useState("overview");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [dashData, setDashData]         = useState(null);   // { stats, appliedTasks }
  const [loadingDash, setLoadingDash]   = useState(true);
  const [dashError, setDashError]       = useState(null);

  const navigate        = useNavigate();
  const session         = getSession();
  const user            = session?.user;
  const name            = user?.name || "Client";
  const initials        = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const API_URL         = "http://localhost:5000";
  const profileImageUrl = user?.profileImage ? `${API_URL}/uploads/${user.profileImage}` : null;

  const TABS = [
    { id: "overview", label: "Overview", icon: Icon.grid },
    { id: "tasks",    label: "My Tasks", icon: Icon.plus },
  ];

  // ── Fetch dashboard data ────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoadingDash(true);
    setDashError(null);
    try {
      const res = await fetch(`${API_URL}/dashboard/client/${user.id}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      console.log("🚀 ~ fetchDashboard ~ res:", res)
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur chargement dashboard");
      }
      const json = await res.json();
      setDashData(json.data);  // { stats: {...}, appliedTasks: [...] }
    } catch (err) {
      console.error(err);
      setDashError(err.message);
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [user?.id]);

  // ── Destructure API data with safe fallbacks ────────────────────────────────
  const stats        = dashData?.stats        || {};
  const appliedTasks = dashData?.appliedTasks || [];

  const totalSpent      = stats.totalSpent      ?? "—";
  const completedJobs   = stats.completedJobs   ?? "—";
  const activeBookings  = stats.activeBookings  ?? "—";
  const postedTasks     = stats.postedTasks     ?? "—";

  // ── Skeleton KPI card ───────────────────────────────────────────────────────
  const KpiSkeleton = () => (
    <div className="db-kpi" style={{"--accent":"#e5e7eb"}}>
      <div className="db-kpi-icon" style={{background:"#f1f5f9"}}/>
      <div className="db-kpi-body">
        <span className="db-kpi-label" style={{background:"#f1f5f9",borderRadius:4,display:"block",width:80,height:10,marginBottom:8}}/>
        <span className="db-kpi-value" style={{background:"#f1f5f9",borderRadius:4,display:"block",width:50,height:22}}/>
      </div>
    </div>
  );

  // ── Task card ───────────────────────────────────────────────────────────────
  const TaskCard = ({ task }) => {
    const tm = TASK_STATUS_META[task.status] || TASK_STATUS_META.open;
    return (
      <div style={{
        border:"1px solid #f1f5f9", borderRadius:12, overflow:"hidden",
        background:"#fff", transition:"box-shadow 0.2s, transform 0.2s", cursor:"pointer",
        boxShadow:"0 1px 3px rgba(0,0,0,.04)",
      }}
        onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.09)"; e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)"; e.currentTarget.style.transform="translateY(0)"; }}
      >
        {task.image && (
          <div style={{position:"relative"}}>
            <img src={`${API_URL}/${task.image}`} alt={task.title} style={{width:"100%",height:90,objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.3),transparent)"}}/>
          </div>
        )}
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:"#0a0a0a",lineHeight:1.35,flex:1}}>{task.title}</span>
            <span style={{
              background:tm.bg, color:tm.color,
              padding:"2px 9px", borderRadius:20, fontSize:10.5, fontWeight:700,
              whiteSpace:"nowrap", flexShrink:0,
            }}>{tm.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
            {task.category && (
              <span style={{background:"#f1f5f9",color:"#475569",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>
                {task.category}
              </span>
            )}
            <span style={{fontSize:11.5,color:"#9ca3af",display:"flex",alignItems:"center",gap:3}}>
              {Icon.clock} {task.date}
            </span>
            {task.budget && (
              <span style={{fontSize:12,color:"#10b981",fontWeight:700,marginLeft:"auto"}}>
                {task.budget}
              </span>
            )}
          </div>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            paddingTop:8, borderTop:"1px solid #f8fafc",
          }}>
            <div style={{
              width:20, height:20, borderRadius:6,
              background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{fontSize:11.5,color:"#9ca3af"}}>
              <strong style={{color:"#374151",fontWeight:700}}>{task.applicants}</strong> provider{task.applicants !== 1 ? "s" : ""} applied
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ── Error state ─────────────────────────────────────────────────────────────
  const ErrorBanner = () => (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      background:"#fef2f2", border:"1px solid #fecaca",
      borderRadius:12, padding:"14px 18px", marginBottom:20,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div style={{flex:1}}>
        <p style={{fontSize:13,fontWeight:600,color:"#b91c1c",margin:0}}>{dashError}</p>
        <p style={{fontSize:12,color:"#f87171",margin:"2px 0 0"}}>Impossible de charger les données du dashboard.</p>
      </div>
      <button onClick={fetchDashboard} style={{
        padding:"6px 14px", borderRadius:8, border:"1px solid #fecaca",
        background:"#fff", color:"#b91c1c", fontSize:12, fontWeight:600,
        cursor:"pointer", transition:"background 0.15s",
      }}
        onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
        onMouseLeave={e=>e.currentTarget.style.background="#fff"}
      >Réessayer</button>
    </div>
  );

  return (
    <div className="db-shell">
      <style>{STYLES}</style>

      {showTaskModal && (
        <PostTaskModal
          onClose={() => { setShowTaskModal(false); fetchDashboard(); }}
          session={session}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-brand">{Icon.wrench} FixHub</div>
        <nav className="db-nav">
          {TABS.map(t => (
            <button key={t.id}
              className={`db-nav-item ${tab === t.id ? "db-nav-item--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
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
            {profileImageUrl
              ? <img src={profileImageUrl} alt={name} className="db-sidebar-avatar"/>
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

      {/* ── Main ── */}
      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="db-page-sub">
              {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            {loadingDash && (
              <span style={{fontSize:12, color:"#9ca3af", display:"flex", alignItems:"center", gap:6}}>
                <div style={{
                  width:12, height:12, borderRadius:"50%",
                  border:"2px solid #e5e7eb", borderTopColor:"#0a0a0a",
                  animation:"spin 0.7s linear infinite",
                }}/>
                Chargement…
              </span>
            )}
            <button className="db-cta" onClick={() => setShowTaskModal(true)}>
              {Icon.plus} Post a Task
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {dashError && <ErrorBanner />}

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div className="db-fade">

            {/* KPI Cards */}
            <div className="db-kpi-grid">
              {loadingDash ? (
                [1,2,3,4].map(i => <KpiSkeleton key={i}/>)
              ) : (
                [
                  { label:"Total Spent",      value: totalSpent !== "—" ? `${Number(totalSpent).toLocaleString()} TND` : "—", icon:Icon.check,    accent:"#0ea5e9" },
                  { label:"Completed Jobs",   value: completedJobs,   icon:Icon.calendar, accent:"#10b981" },
                  { label:"Active Bookings",  value: activeBookings,  icon:Icon.clock,    accent:"#8b5cf6" },
                  { label:"Posted Tasks",     value: postedTasks,     icon:Icon.plus,     accent:"#f59e0b" },
                ].map((k, i) => (
                  <div className="db-kpi" key={i} style={{"--accent": k.accent}}>
                    <div className="db-kpi-icon">{k.icon}</div>
                    <div className="db-kpi-body">
                      <span className="db-kpi-label">{k.label}</span>
                      <span className="db-kpi-value">{k.value}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Two-column: Chatbot + Applied Tasks */}
            <div className="db-two-col">
              <RecommendationBot navigate={navigate} />

              {/* Applied Tasks panel */}
              <div className="db-card" style={{display:"flex", flexDirection:"column"}}>
                <div className="db-card-head">
                  <h3>Posted Tasks</h3>
                  {!loadingDash && (
                    <span style={{
                      background:"#f1f5f9", color:"#6b7280",
                      padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                    }}>
                      {appliedTasks.length} task{appliedTasks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingDash ? (
                  /* Skeleton tasks */
                  <div style={{display:"flex", flexDirection:"column", gap:10}}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        height:90, borderRadius:12,
                        background:"linear-gradient(90deg,#f1f5f9 25%,#e9edf2 50%,#f1f5f9 75%)",
                        backgroundSize:"200% 100%",
                        animation:"shimmer 1.4s ease-in-out infinite",
                      }}/>
                    ))}
                  </div>
                ) : appliedTasks.length === 0 ? (
                  <div style={{
                    flex:1, display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    padding:"32px 16px", textAlign:"center",
                  }}>
                    <div style={{
                      width:52, height:52, borderRadius:14,
                      background:"#f1f5f9", display:"flex",
                      alignItems:"center", justifyContent:"center", marginBottom:12,
                    }}>
                      {Icon.plus}
                    </div>
                    <p style={{fontSize:13.5, fontWeight:600, color:"#374151", marginBottom:4}}>No tasks yet</p>
                    <p style={{fontSize:12, color:"#9ca3af", marginBottom:16}}>Post your first task and get offers from providers.</p>
                    <button className="db-cta" style={{fontSize:12, padding:"8px 16px"}}
                      onClick={() => setShowTaskModal(true)}
                    >
                      {Icon.plus} Post a Task
                    </button>
                  </div>
                ) : (
                  <div style={{display:"flex", flexDirection:"column", gap:10, overflowY:"auto", maxHeight:380}}>
                    {appliedTasks.map(task => <TaskCard key={task.id} task={task}/>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ MY TASKS (full view) ══ */}
        {tab === "tasks" && (
          <div className="db-fade">
            <div style={{marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <p style={{fontSize:13, color:"#6b7280"}}>
                {loadingDash ? "Chargement…" : `${appliedTasks.length} tâche${appliedTasks.length !== 1 ? "s" : ""} publiée${appliedTasks.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {loadingDash ? (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16}}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{
                    height:160, borderRadius:12,
                    background:"linear-gradient(90deg,#f1f5f9 25%,#e9edf2 50%,#f1f5f9 75%)",
                    backgroundSize:"200% 100%", animation:"shimmer 1.4s ease-in-out infinite",
                  }}/>
                ))}
              </div>
            ) : appliedTasks.length === 0 ? (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", padding:"60px 20px", textAlign:"center",
                background:"#fff", borderRadius:16, border:"1px solid #f1f5f9",
              }}>
                <div style={{
                  width:64, height:64, borderRadius:18,
                  background:"#f1f5f9", display:"flex",
                  alignItems:"center", justifyContent:"center", marginBottom:16,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3 style={{fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:"#0a0a0a", marginBottom:6}}>Aucune tâche publiée</h3>
                <p style={{fontSize:13.5, color:"#6b7280", marginBottom:20, maxWidth:300}}>
                  Publiez votre première tâche et recevez des offres de prestataires vérifiés.
                </p>
                <button className="db-cta" onClick={() => setShowTaskModal(true)}>{Icon.plus} Post a Task</button>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16}}>
                {appliedTasks.map(task => <TaskCard key={task.id} task={task}/>)}
              </div>
            )}
          </div>
        )}
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body { font-family: 'DM Sans', sans-serif; }
  .font-sora { font-family: 'Sora', sans-serif; }

  .db-shell{display:flex;min-height:100vh;background:#f8f9fc}
  .db-sidebar{width:230px;min-width:230px;background:#0a0a0a;display:flex;flex-direction:column;padding:24px 16px;position:sticky;top:0;height:100vh;overflow-y:auto}
  .db-brand{display:flex;align-items:center;gap:10px;color:#fff;font-family:'Sora',sans-serif;font-size:18px;font-weight:800;padding:4px 8px 24px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:20px; font-family: 'Sora', sans-serif;}
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
  @media(max-width:768px){
    .db-shell{flex-direction:column}
    .db-sidebar{width:100%;min-width:0;height:auto;position:relative;padding:12px;border-bottom:1px solid rgba(255,255,255,.1)}
    .db-brand{padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.07)}
    .db-nav{flex-direction:row;overflow-x:auto;padding-bottom:4px;gap:8px}
    .db-nav-item{padding:8px 12px;white-space:nowrap;width:auto}
    .db-quick-actions, .db-sidebar-footer{display:none}
    .db-main{padding:20px 16px}.db-kpi-grid{grid-template-columns:1fr 1fr}.db-reviews-row{grid-template-columns:1fr}}
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