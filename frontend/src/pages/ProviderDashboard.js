import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";

const API = "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────────
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API}/uploads/${img}`;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  grid:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  briefcase: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  chevLeft:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  users:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  dollar:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  calendar:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  trending:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  map:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  edit:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  msg:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  x:         <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  save:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
};

const STATUS_META = {
  confirmed:     { label: "Confirmed",   color: "#0ea5e9", bg: "#e0f2fe" },
  pending:       { label: "Pending",     color: "#f59e0b", bg: "#fef3c7" },
  "in-progress": { label: "In Progress", color: "#8b5cf6", bg: "#ede9fe" },
  completed:     { label: "Completed",   color: "#10b981", bg: "#d1fae5" },
  cancelled:     { label: "Cancelled",   color: "#ef4444", bg: "#fee2e2" },
};

const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < Math.round(n) ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
));

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #f1f5f9", borderTopColor: "#0a0a0a", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Service Modal ─────────────────────────────────────────────────────────────
const CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning", "Gardening", "Moving", "IT Support", "Tutoring", "Music Lessons"];

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState({
    title:        service?.title        || "",
    category:    service?.category    || "",
    description: service?.description || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.category) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700 }}>
            {service ? "Edit Service" : "Add New Service"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>{Icon.x}</button>
        </div>

        {[
          { label: "Service Name", key: "title", type: "text", placeholder: "e.g. Plumbing Repair" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13.5, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Category</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13.5, outline: "none", fontFamily: "'DM Sans',sans-serif", background: "#fff" }}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</label>
          <textarea
            value={form.description}
            placeholder="Describe the service..."
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13.5, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6b7280" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#0a0a0a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : <>{Icon.save} Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Calendar Tab ──────────────────────────────────────────────────────────────
function CalendarTab({ bookings, loading, onStatusChange }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay]   = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const MONTH_NAMES = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
  const DAY_NAMES   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // Build calendar grid (Mon-first)
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startDow  = (firstDay.getDay() + 6) % 7; // 0=Mon
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Group bookings by date string "YYYY-MM-DD"
  const bookingsByDate = {};
  (bookings || []).forEach(b => {
    const raw = b.date;
    if (!raw) return;
    const key = raw.slice(0, 10); // "YYYY-MM-DD"
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });

  const pad = n => String(n).padStart(2, "0");
  const cellKey = d => `${year}-${pad(month + 1)}-${pad(d)}`;

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  // Bookings for selected day
  const selectedKey      = selectedDay ? cellKey(selectedDay) : null;
  const selectedBookings = selectedKey ? (bookingsByDate[selectedKey] || []) : [];

  // Accepted bookings = confirmed + in-progress (shown on calendar)
  const visibleStatuses = ["confirmed", "in-progress", "pending", "completed"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (loading) return <Spinner />;

  return (
    <div className="db-fade">
      <div className="db-cal-wrap">

        {/* ── Calendar panel ── */}
        <div className="db-card db-cal-panel">
          {/* Header */}
          <div className="db-cal-header">
            <button className="db-icon-btn" onClick={prevMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="db-cal-month">{MONTH_NAMES[month]} {year}</span>
            <button className="db-icon-btn" onClick={nextMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day names */}
          <div className="db-cal-grid">
            {DAY_NAMES.map(d => (
              <div key={d} className="db-cal-dayname">{d}</div>
            ))}

            {/* Cells */}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="db-cal-cell db-cal-cell--empty" />;
              const key      = cellKey(day);
              const dayBks   = (bookingsByDate[key] || []).filter(b => visibleStatuses.includes(b.status));
              const isToday  = key === todayStr;
              const isSel    = selectedDay === day && month === currentDate.getMonth();
              return (
                <div
                  key={key}
                  className={`db-cal-cell ${isToday ? "db-cal-cell--today" : ""} ${isSel ? "db-cal-cell--selected" : ""} ${dayBks.length > 0 ? "db-cal-cell--has-events" : ""}`}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                >
                  <span className="db-cal-day-num">{day}</span>
                  {dayBks.length > 0 && (
                    <div className="db-cal-dots">
                      {dayBks.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          className="db-cal-dot"
                          style={{ background: STATUS_META[b.status]?.color || "#9ca3af" }}
                        />
                      ))}
                      {dayBks.length > 3 && <span className="db-cal-dot-more">+{dayBks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="db-cal-legend">
            {Object.entries(STATUS_META).map(([k, v]) => (
              <span key={k} className="db-cal-legend-item">
                <span className="db-cal-dot" style={{ background: v.color }} />
                {v.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="db-cal-detail">
          {!selectedDay ? (
            <div className="db-card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
                Select a day to see<br/>its bookings
              </p>
            </div>
          ) : (
            <div className="db-card" style={{ height: "100%", overflow: "auto" }}>
              <div className="db-card-head">
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700 }}>
                  {MONTH_NAMES[month]} {selectedDay}, {year}
                </h3>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""}</span>
              </div>

              {selectedBookings.length === 0 ? (
                <p className="db-empty-small">No bookings on this day.</p>
              ) : (
                selectedBookings.map(b => (
                  <div key={b.id} className="db-cal-booking-card">
                    <div className="db-cal-booking-top">
                      <div className="db-booking-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                        {(b.client_name || b.client || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a" }}>{b.client_name || b.client}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{b.service_name || b.service}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="db-cal-booking-meta">
                      <span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:3}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {b.time || "—"}
                      </span>
                      {b.city && (
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:3}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {b.city}
                        </span>
                      )}
                    </div>

                    {/* Status changer */}
                    <select
                      value={b.status}
                      onChange={e => onStatusChange(b.id, e.target.value)}
                      style={{
                        marginTop: 10, width: "100%",
                        padding: "6px 10px", borderRadius: 8,
                        border: "1.5px solid #e5e7eb", fontSize: 12,
                        fontWeight: 600, cursor: "pointer", outline: "none",
                        background: STATUS_META[b.status]?.bg,
                        color: STATUS_META[b.status]?.color,
                      }}
                    >
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [tab, setTab]       = useState("overview");
  const navigate            = useNavigate();
  const session             = getSession();
  const user                = session?.user;
  const token               = session?.token;
  const userId              = user?.id;
  const name                = user?.name || "Provider";
  const initials            = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl     = resolveImage(user?.profileImage);

  // ── State ─────────────────────────────────────────────────────────────────
  const [stats,     setStats]     = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [services,  setServices]  = useState([]);
  const [reviews,   setReviews]   = useState([]);
  console.log("🚀 ~ ProviderDashboard ~ reviews:", reviews)
  const [ratingSummary, setRatingSummary] = useState(null);

  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingReviews,  setLoadingReviews]  = useState(true);

  const [serviceModal, setServiceModal] = useState(null); // null | "add" | serviceObject

  // ── Fetch functions ────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      console.log(userId);
      const res = await fetch(`${API}/dashboard/stats/${userId}?role=provider`, { headers: authHeaders(token) });
      const data = await res.json();
      console.log(data)
      setStats(data);
    } catch { setStats(null); }
    finally { setLoadingStats(false); }
  }, [userId, token]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch(`${API}/bookings/provider/${userId}`, { headers: authHeaders(token) });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch { setBookings([]); }
    finally { setLoadingBookings(false); }
  }, [userId, token]);

  const fetchServices = useCallback(async () => {
    try {
      setLoadingServices(true);
      const res = await fetch(`${API}/services/provider/${userId}`, { headers: authHeaders(token) });
      const data = await res.json();
      const rows = data?.data ?? data;
      setServices(Array.isArray(rows) ? rows : []);
    } catch { setServices([]); }
    finally { setLoadingServices(false); }
  }, [userId, token]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const [revRes, sumRes] = await Promise.all([
        fetch(`${API}/reviews/provider/${userId}`,        { headers: authHeaders(token) }),
        fetch(`${API}/reviews/summary/${userId}`,         { headers: authHeaders(token) }),
      ]);
      const revData = await revRes.json();
      const sumData = await sumRes.json();
      setReviews(Array.isArray(revData.data) ? revData.data : []);
      setRatingSummary(sumData.data);
    } catch { setReviews([]); }
    finally { setLoadingReviews(false); }
  }, [userId, token]);

  // Load everything on mount
  useEffect(() => {
    if (!userId) return;
    fetchStats();
    fetchBookings();
    fetchServices();
    fetchReviews();
  }, [fetchStats, fetchBookings, fetchServices, fetchReviews]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await fetch(`${API}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  // Accept → confirmed (appears in calendar)
  const handleAcceptBooking = async (bookingId) => {
    try {
      await fetch(`${API}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ status: "confirmed" }),
      });
      fetchBookings();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  // Decline → deleted entirely
  const handleDeclineBooking = async (bookingId) => {
    try {
      await fetch(`${API}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      fetchBookings();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleToggleService = async (serviceId) => {
    try {
      await fetch(`${API}/services/${serviceId}/toggle`, {
        method: "PATCH",
        headers: authHeaders(token),
      });
      fetchServices();
    } catch (err) { console.error(err); }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Remove this service?")) return;
    try {
      await fetch(`${API}/services/${serviceId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      fetchServices();
      fetchStats();
    } catch (err) { console.error(err); }
  };

const handleSaveService = async (form) => {
  const isEdit = serviceModal && serviceModal !== "add";
  const url    = isEdit ? `${API}/services/${serviceModal.id}` : `${API}/services`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({ 
        title: form.title,
        category: form.category,
        description: form.description
        
      }),
    });
    console.log(response);
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await response.text();
      console.error("Erreur serveur (HTML) :", textError);
      throw new Error("Erreur de connexion au serveur.");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erreur lors de l'enregistrement");
    }

    // Succès
    setServiceModal(null);
    fetchServices();
    fetchStats();
  } catch (err) {
    console.error("Erreur de sauvegarde :", err);
  }
};

  // ── Derived data ───────────────────────────────────────────────────────────
  const upcomingBookings = bookings.filter(b => b.status === "pending");

  const recentReviews = reviews.slice(0, 3);

  const TABS = [
    { id: "overview",  label: "Overview",  icon: Icon.grid      },
    { id: "calendar",  label: "Calendar",  icon: Icon.calendar  },
    { id: "services",  label: "Services",  icon: Icon.briefcase },
    { id: "reviews",   label: "Reviews",   icon: Icon.star      },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="db-shell">
      <style>{STYLES}</style>

      {/* Service modal */}
      {serviceModal && (
        <ServiceModal
          service={serviceModal === "add" ? null : serviceModal}
          onClose={() => setServiceModal(null)}
          onSave={handleSaveService}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          FixHub
        </div>

        <nav className="db-nav">
          {TABS.map(t => (
            <button key={t.id} className={`db-nav-item ${tab === t.id ? "db-nav-item--active" : ""}`} onClick={() => setTab(t.id)}>
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
              <span className="db-sidebar-role">Provider</span>
            </div>
            {Icon.edit}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="db-main">

        {/* Top bar */}
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="db-page-sub">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button className="db-cta" onClick={() => setServiceModal("add")}>
            {Icon.plus} Create Service
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="db-fade">
            {/* KPI cards */}
            <div className="db-kpi-grid">
              {loadingStats ? <Spinner /> : [
                { label: "Total Earnings",  value: `${stats?.total_earnings  ?? 0} TND`, icon: Icon.dollar,   accent: "#10b981", trend: `${stats?.total_reviews ?? 0} reviews`    },
                { label: "Completed Jobs",  value: stats?.completed_jobs  ?? 0,          icon: Icon.check,    accent: "#0ea5e9", trend: `${stats?.active_bookings ?? 0} active`   },
                { label: "Active Bookings", value: stats?.active_bookings ?? 0,          icon: Icon.calendar, accent: "#8b5cf6", trend: "Pending + confirmed"                      },
                { label: "Avg. Rating",     value: `${stats?.avg_rating ?? "—"} / 5`,   icon: Icon.star,     accent: "#f59e0b", trend: `${stats?.total_reviews ?? 0} reviews`    },
              ].map((k, i) => (
                <div className="db-kpi" key={i} style={{ "--accent": k.accent }}>
                  <div className="db-kpi-icon">{k.icon}</div>
                  <div className="db-kpi-body">
                    <span className="db-kpi-label">{k.label}</span>
                    <span className="db-kpi-value">{k.value}</span>
                    <span className="db-kpi-trend">{Icon.trending} {k.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="db-two-col">
              {/* Upcoming bookings */}
              <div className="db-card">
                <div className="db-card-head">
                  <h3>Booking Requests</h3>
                  <button className="db-link" onClick={() => setTab("calendar")}>View all {Icon.arrow}</button>
                </div>
                {loadingBookings ? <Spinner /> : upcomingBookings.length === 0
                  ? <p className="db-empty-small">No pending booking requests.</p>
                  : upcomingBookings.map(b => (
                    <div className="db-booking-row" key={b.id}>
                      <div className="db-booking-avatar">
                        {(b.client_name || b.client || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="db-booking-info">
                        <span className="db-booking-client">{b.client_name || b.client}</span>
                        <span className="db-booking-meta">
                          {Icon.clock} {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {b.time}
                        </span>
                        <span className="db-booking-service">{b.service_name || b.service}</span>
                      </div>
                      <div className="db-booking-right">
                        <button
                          className="db-accept-btn"
                          onClick={() => handleAcceptBooking(b.id)}
                          title="Accept booking"
                        >
                          {Icon.check} Accept
                        </button>
                        <button
                          className="db-decline-btn"
                          onClick={() => handleDeclineBooking(b.id)}
                          title="Decline booking"
                        >
                          {Icon.x} Decline
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Services summary */}
              <div className="db-card">
                <div className="db-card-head">
                  <h3>Your Services</h3>
                  <button className="db-link" onClick={() => setTab("services")}>Manage {Icon.arrow}</button>
                </div>
                {loadingServices ? <Spinner /> : services.length === 0
                  ? <p className="db-empty-small">No services yet.</p>
                  : services.map(sv => (
                    <div className="db-service-row" key={sv.id}>
                      <div className="db-service-dot" style={{ background: sv.is_active ? "#10b981" : "#d1d5db" }} />
                      <div className="db-service-info">
                        <span className="db-service-name">{sv.title}</span>
                        <span className="db-service-meta">{sv.total_bookings ?? 0} bookings · {sv.avg_rating ?? "—"}★</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent reviews */}
            <div className="db-card" style={{ marginTop: 24 }}>
              <div className="db-card-head">
                <h3>Recent Reviews</h3>
                <button className="db-link" onClick={() => setTab("reviews")}>View all {Icon.arrow}</button>
              </div>
              {loadingReviews ? <Spinner /> : recentReviews.length === 0
                ? <p className="db-empty-small">No reviews yet.</p>
                : (
                  <div className="db-reviews-row">
                    {recentReviews.map(r => (
                      <div className="db-review-card" key={r.id}>
                        <div className="db-review-top">
                          <div className="db-review-avatar">{(r.client_name || r.client || "?")[0].toUpperCase()}</div>
                          <div>
                            <div className="db-review-client">{r.client_name || r.client}</div>
                            <Stars n={r.rating} />
                          </div>
                          <span className="db-review-date">
                            {new Date(r.created_at || r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="db-review-text">"{r.comment || r.text}"</p>
                        <span className="db-review-tag">{r.service_name || r.service}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "calendar" && (
          <CalendarTab
            bookings={bookings}
            loading={loadingBookings}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div className="db-fade">
            <div className="db-card-head" style={{ marginBottom: 20 }}>
              <p className="db-page-sub">Manage the services you offer to clients</p>
            </div>
            {loadingServices ? <Spinner /> : (
              <div className="db-services-grid">
                {services.map(sv => (
                  <div className="db-svc-card" key={sv.id}>
                    <div className="db-svc-head">
                      <div>
                        <h4 className="db-svc-name">{sv.title}</h4>
                        <span className="db-svc-cat">{sv.category}</span>
                      </div>
                      <div
                        className={`db-svc-toggle ${sv.is_active ? "db-svc-toggle--on" : ""}`}
                        onClick={() => handleToggleService(sv.id)}
                        title={sv.is_active ? "Deactivate" : "Activate"}
                      >
                        <span className="db-svc-toggle-dot" />
                      </div>
                    </div>
                    <div className="db-svc-stats">
                      <div className="db-svc-stat"><span>{sv.total_bookings ?? 0}</span><label>Bookings</label></div>
                      <div className="db-svc-stat"><span>{sv.avg_rating ?? "—"}★</span><label>Rating</label></div>
                    </div>
                    <div className="db-svc-actions">
                      <button className="db-svc-btn" onClick={() => setServiceModal(sv)}>{Icon.edit} Edit</button>
                      <button className="db-svc-btn db-svc-btn--danger" onClick={() => handleDeleteService(sv.id)}>{Icon.trash} Remove</button>
                    </div>
                  </div>
                ))}

                {/* Add new card */}
                <div className="db-svc-card db-svc-card--add" onClick={() => setServiceModal("add")}>
                  <div className="db-svc-add-icon">{Icon.plus}</div>
                  <p>Add a new service</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div className="db-fade">
            {loadingReviews ? <Spinner /> : (
              <>
                {/* Summary bar */}
                <div className="db-rating-summary">
                  <div className="db-rating-big">
                    <span className="db-rating-num">{ratingSummary?.avg_rating ?? "—"}</span>
                    <Stars n={parseFloat(ratingSummary?.avg_rating ?? 0)} />
                    <span className="db-rating-count">{ratingSummary?.total ?? 0} reviews</span>
                  </div>
                  <div className="db-rating-bars">
                    {[5, 4, 3, 2, 1].map(n => {
                      const key   = ["five","four","three","two","one"][5 - n];
                      const count = parseInt(ratingSummary?.[key] ?? 0);
                      const total = parseInt(ratingSummary?.total ?? 1);
                      const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div className="db-rating-bar-row" key={n}>
                          <span>{n}★</span>
                          <div className="db-rating-bar-track">
                            <div className="db-rating-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="db-rating-bar-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="db-reviews-list">
                  {reviews.length === 0
                    ? <p className="db-empty-small" style={{ textAlign: "center", padding: 32 }}>No reviews yet.</p>
                    : reviews.map(r => (
                      <div className="db-review-full" key={r.id}>
                        <div className="db-review-full-top">
                          <div className="db-review-avatar db-review-avatar--lg">
                            {(r.client_name || r.client || "?")[0].toUpperCase()}
                          </div>
                          <div className="db-review-full-info">
                            <span className="db-review-client">{r.client_name || r.client}</span>
                            <Stars n={r.rating} />
                          </div>
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <span className="db-review-tag">{r.service_name || r.service}</span>
                            <div className="db-review-date" style={{ marginTop: 4 }}>
                              {new Date(r.created_at || r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </div>
                          </div>
                        </div>
                        <p className="db-review-text" style={{ marginTop: 12 }}>"{r.comment || r.text}"</p>
                      </div>
                    ))
                  }
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ── Styles (identiques à l'original) ─────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .db-shell { display: flex; min-height: 100vh; background: #f8f9fc; font-family: 'DM Sans', sans-serif; }
  .db-sidebar { width: 230px; min-width: 230px; background: #0a0a0a; display: flex; flex-direction: column; padding: 24px 16px; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .db-brand { display: flex; align-items: center; gap: 10px; color: #fff; font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; padding: 4px 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 20px; }
  .db-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .db-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: none; color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-align: left; width: 100%; }
  .db-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .db-nav-item--active { background: #fff; color: #0a0a0a; font-weight: 700; }
  .db-nav-item--active:hover { background: #f0f0f0; }
  .db-sidebar-footer { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; margin-top: 16px; }
  .db-profile-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; border-radius: 10px; border: none; background: rgba(255,255,255,0.05); cursor: pointer; transition: background 0.15s; color: rgba(255,255,255,0.6); }
  .db-profile-btn:hover { background: rgba(255,255,255,0.1); }
  .db-sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0; }
  .db-sidebar-initials { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #555, #222); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .db-sidebar-info { flex: 1; text-align: left; min-width: 0; }
  .db-sidebar-name { display: block; font-size: 12.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .db-sidebar-role { display: block; font-size: 11px; color: rgba(255,255,255,0.4); }
  .db-main { flex: 1; padding: 32px; overflow-y: auto; min-width: 0; }
  .db-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
  .db-page-title { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; color: #0a0a0a; margin-bottom: 3px; }
  .db-page-sub { font-size: 13px; color: #9ca3af; }
  .db-cta { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; background: #0a0a0a; color: #fff; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: background 0.16s, transform 0.12s; white-space: nowrap; }
  .db-cta:hover { background: #222; transform: translateY(-1px); }
  .db-fade { animation: dbFade 0.2s ease; }
  @keyframes dbFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .db-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .db-kpi { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; display: flex; gap: 14px; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; }
  .db-kpi:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .db-kpi-icon { width: 40px; height: 40px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 12%, white); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .db-kpi-body { display: flex; flex-direction: column; min-width: 0; }
  .db-kpi-label { font-size: 11.5px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .db-kpi-value { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #0a0a0a; margin-bottom: 5px; }
  .db-kpi-trend { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #10b981; font-weight: 500; }
  .db-two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }
  .db-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .db-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .db-card-head h3 { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #0a0a0a; }
  .db-link { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; font-size: 12.5px; font-weight: 600; color: #6b7280; cursor: pointer; transition: color 0.15s; }
  .db-link:hover { color: #0a0a0a; }
  .db-booking-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
  .db-booking-row:last-child { border-bottom: none; }
  .db-booking-avatar { width: 38px; height: 38px; border-radius: 10px; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'Sora', sans-serif; flex-shrink: 0; }
  .db-booking-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .db-booking-client { font-size: 13.5px; font-weight: 600; color: #0a0a0a; }
  .db-booking-meta { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #9ca3af; }
  .db-booking-service { font-size: 12px; color: #6b7280; }
  .db-booking-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .db-booking-amount { font-size: 13px; font-weight: 700; color: #0a0a0a; }
  .db-service-row { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid #f8fafc; }
  .db-service-row:last-child { border-bottom: none; }
  .db-service-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-service-info { flex: 1; min-width: 0; }
  .db-service-name { display: block; font-size: 13.5px; font-weight: 600; color: #0a0a0a; }
  .db-service-meta { font-size: 11.5px; color: #9ca3af; }
  .db-service-price { font-size: 13px; font-weight: 700; color: #0a0a0a; white-space: nowrap; }
  .db-reviews-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .db-review-card { background: #f8f9fc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; }
  .db-review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .db-review-avatar { width: 32px; height: 32px; border-radius: 50%; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .db-review-avatar--lg { width: 40px; height: 40px; font-size: 14px; }
  .db-review-client { display: block; font-size: 13px; font-weight: 600; color: #0a0a0a; }
  .db-review-date { font-size: 11px; color: #9ca3af; margin-left: auto; white-space: nowrap; }
  .db-review-text { font-size: 12.5px; color: #4b5563; line-height: 1.5; font-style: italic; }
  .db-review-tag { display: inline-block; margin-top: 10px; background: #f1f5f9; color: #475569; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .db-filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  .db-filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; background: #fff; border: 1px solid #e5e7eb; font-size: 12.5px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
  .db-filter-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }
  .db-filter-btn--active { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .db-filter-btn--active .db-filter-count { background: rgba(255,255,255,0.2); color: #fff; }
  .db-filter-count { background: #f1f5f9; color: #6b7280; padding: 1px 7px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; background: #f8f9fc; border-bottom: 1px solid #f1f5f9; }
  .db-table td { padding: 14px 16px; border-bottom: 1px solid #f8fafc; font-size: 13.5px; color: #374151; vertical-align: middle; }
  .db-table tr:last-child td { border-bottom: none; }
  .db-table tr:hover td { background: #fafafa; }
  .db-table-client { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #0a0a0a; }
  .db-table-avatar { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; font-family: 'Sora', sans-serif; flex-shrink: 0; }
  .db-table-service { color: #6b7280; font-size: 13px; }
  .db-table-date { font-size: 13px; font-weight: 500; color: #0a0a0a; }
  .db-table-time { font-size: 11.5px; color: #9ca3af; }
  .db-table-city { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: #6b7280; }
  .db-table-amount { font-weight: 700; color: #0a0a0a; }
  .db-table-actions { display: flex; gap: 6px; }
  .db-empty { padding: 32px; text-align: center; color: #9ca3af; font-size: 13.5px; }
  .db-empty-small { padding: 16px 0; text-align: center; color: #9ca3af; font-size: 13px; }
  .db-icon-btn { width: 30px; height: 30px; border-radius: 7px; background: #f1f5f9; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
  .db-icon-btn:hover { background: #0a0a0a; color: #fff; }
  .db-count-badge { display: inline-block; background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .db-services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
  .db-svc-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; }
  .db-svc-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .db-svc-card--add { border: 2px dashed #e5e7eb; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; color: #9ca3af; font-size: 13.5px; font-weight: 500; min-height: 180px; }
  .db-svc-card--add:hover { border-color: #0a0a0a; color: #0a0a0a; background: #fff; }
  .db-svc-add-icon { width: 40px; height: 40px; border-radius: 10px; background: #f1f5f9; color: #9ca3af; display: flex; align-items: center; justify-content: center; }
  .db-svc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .db-svc-name { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0a0a0a; margin-bottom: 4px; }
  .db-svc-cat { display: inline-block; background: #f1f5f9; color: #475569; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .db-svc-toggle { width: 38px; height: 22px; border-radius: 11px; background: #e5e7eb; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
  .db-svc-toggle--on { background: #10b981; }
  .db-svc-toggle-dot { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .db-svc-toggle--on .db-svc-toggle-dot { left: 19px; }
  .db-svc-stats { display: flex; gap: 0; border: 1px solid #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
  .db-svc-stat { flex: 1; padding: 10px 8px; text-align: center; border-right: 1px solid #f1f5f9; }
  .db-svc-stat:last-child { border-right: none; }
  .db-svc-stat span { display: block; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0a0a0a; }
  .db-svc-stat label { font-size: 10.5px; color: #9ca3af; font-weight: 500; }
  .db-svc-actions { display: flex; gap: 8px; }
  .db-svc-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px; border-radius: 8px; background: #f8f9fc; border: 1px solid #f1f5f9; font-size: 12.5px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
  .db-svc-btn:hover { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .db-svc-btn--danger:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
  .db-rating-summary { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 24px; display: flex; gap: 40px; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .db-rating-big { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 100px; }
  .db-rating-num { font-family: 'Sora', sans-serif; font-size: 48px; font-weight: 800; color: #0a0a0a; line-height: 1; }
  .db-rating-count { font-size: 12px; color: #9ca3af; }
  .db-rating-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .db-rating-bar-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #6b7280; }
  .db-rating-bar-track { flex: 1; height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .db-rating-bar-fill { height: 100%; background: #f59e0b; border-radius: 4px; transition: width 0.5s ease; }
  .db-rating-bar-pct { min-width: 34px; text-align: right; font-weight: 600; }
  .db-reviews-list { display: flex; flex-direction: column; gap: 14px; }
  .db-review-full { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .db-review-full-top { display: flex; align-items: center; gap: 12px; }
  .db-review-full-info { display: flex; flex-direction: column; gap: 3px; }
  @media (max-width: 1100px) { .db-kpi-grid { grid-template-columns: repeat(2, 1fr); } .db-two-col { grid-template-columns: 1fr; } .db-reviews-row { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 768px) { .db-sidebar { display: none; } .db-main { padding: 20px 16px; } .db-kpi-grid { grid-template-columns: 1fr 1fr; } .db-reviews-row { grid-template-columns: 1fr; } .db-rating-summary { flex-direction: column; gap: 20px; } .db-table th:nth-child(4), .db-table td:nth-child(4) { display: none; } }
  @media (max-width: 480px) { .db-kpi-grid { grid-template-columns: 1fr; } }

  .db-accept-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 8px; border: none;
    background: #d1fae5; color: #065f46;
    font-size: 12px; font-weight: 700; cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .db-accept-btn:hover { background: #a7f3d0; }
  .db-decline-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 8px; border: none;
    background: #fee2e2; color: #991b1b;
    font-size: 12px; font-weight: 700; cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .db-decline-btn:hover { background: #fecaca; }
  @keyframes spin { to { transform: rotate(360deg); } }
  /* ── Calendar ── */
  .db-cal-wrap { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
  .db-cal-panel { flex: 1; }
  .db-cal-detail { min-height: 400px; }
  .db-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .db-cal-month { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #0a0a0a; }
  .db-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 16px; }
  .db-cal-dayname { text-align: center; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 0; }
  .db-cal-cell { min-height: 68px; border-radius: 10px; padding: 8px 6px 6px; cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .db-cal-cell--empty { cursor: default; }
  .db-cal-cell:not(.db-cal-cell--empty):hover { background: #f8f9fc; border-color: #e5e7eb; }
  .db-cal-cell--today .db-cal-day-num { background: #0a0a0a; color: #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
  .db-cal-cell--selected { background: #f0f4ff; border-color: #0a0a0a; }
  .db-cal-cell--has-events { background: #fafafa; }
  .db-cal-day-num { font-size: 13px; font-weight: 600; color: #374151; line-height: 1; }
  .db-cal-dots { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center; }
  .db-cal-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .db-cal-dot-more { font-size: 9px; color: #9ca3af; font-weight: 600; }
  .db-cal-legend { display: flex; flex-wrap: wrap; gap: 10px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
  .db-cal-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #6b7280; }
  .db-cal-booking-card { padding: 12px; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 10px; background: #fafafa; }
  .db-cal-booking-card:last-child { margin-bottom: 0; }
  .db-cal-booking-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .db-cal-booking-meta { display: flex; gap: 14px; font-size: 12px; color: #6b7280; }
  @media (max-width: 900px) { .db-cal-wrap { grid-template-columns: 1fr; } .db-cal-detail { min-height: unset; } }

`;