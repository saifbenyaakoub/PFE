import React, { useState, useEffect, useCallback } from "react";
import ChatPage from "./Chat";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import StatusDropdown from "./StatusDropdown";
import "./providerDashboard.css";

const API = "http://localhost:5000";

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
  grid:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  briefcase: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  calendar:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  star:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  dollar:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  check:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  edit:      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  msg:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  x:         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  save:      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  trending:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  wrench:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

const STATUS_META = {
  confirmed: { label: "Confirmed", cls: "db-badge--confirmed" },
  completed: { label: "Completed", cls: "db-badge--completed" },
  cancelled: { label: "Cancelled", cls: "db-badge--cancelled" },
};

const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < Math.round(n) ? "var(--warn)" : "var(--border)", fontSize: 13 }}>★</span>
));

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.confirmed;
  return <span className={`db-badge ${m.cls}`}>{m.label}</span>;
};

const Spinner = () => <div className="db-spinner-wrap"><div className="db-spinner" /></div>;

// ── Service Modal ─────────────────────────────────────────────────────────────
const CATEGORIES = ["Plumbing","Electrical","Carpentry","Painting","Cleaning","Gardening","Moving","IT Support","Tutoring","Music Lessons"];

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       service?.title       || "",
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
    <div className="db-modal-overlay">
      <div className="db-modal">
        <div className="db-modal-header">
          <h3 className="db-modal-title">{service ? "Edit Service" : "Add New Service"}</h3>
          <button className="db-icon-btn" onClick={onClose}>{Icon.x}</button>
        </div>

        <div className="db-form-group">
          <label className="db-form-label">Service Name *</label>
          <input className="db-form-input" type="text" value={form.title} placeholder="e.g. Plumbing Repair" onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="db-form-group">
          <label className="db-form-label">Category *</label>
          <select className="db-form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="db-form-group">
          <label className="db-form-label">Description</label>
          <textarea className="db-form-textarea" value={form.description} placeholder="Describe the service…" onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>

        <div className="db-modal-actions">
          <button className="db-cta db-cta--outline" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
          <button className="db-cta" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : <>{Icon.save} Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────
function CalendarTab({ bookings, loading, fetchBookings }) {
  const session = getSession();
  const token   = session?.token;
  const today   = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const bookingsByDate = {};
  (bookings || []).forEach(b => {
    const key = b.date?.slice(0, 10);
    if (!key) return;
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchBookings();
    } catch (err) { console.error(err); }
  };

  const pad = n => String(n).padStart(2, "0");
  const cellKey = d => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const selectedKey = selectedDay ? cellKey(selectedDay) : null;
  const selectedBookings = selectedKey ? (bookingsByDate[selectedKey] || []) : [];
  const visibleStatuses = ["confirmed", "completed", "cancelled"];

  if (loading) return <Spinner />;

  return (
    <div className="db-fade">
      <div className="db-cal-wrap">
        {/* Calendar panel */}
        <div className="db-card db-cal-panel">
          <div className="db-cal-header">
            <button className="db-icon-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="db-cal-month">{MONTH_NAMES[month]} {year}</span>
            <button className="db-icon-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="db-cal-grid">
            {DAY_NAMES.map(d => <div key={d} className="db-cal-dayname">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="db-cal-cell db-cal-cell--empty" />;
              const key = cellKey(day);
              const dayBks = (bookingsByDate[key] || []).filter(b => visibleStatuses.includes(b.status));
              const isToday = key === todayStr;
              const isSel   = selectedDay === day;
              return (
                <div key={key}
                  className={`db-cal-cell${isToday ? " db-cal-cell--today" : ""}${isSel ? " db-cal-cell--selected" : ""}${dayBks.length > 0 ? " db-cal-cell--has-events" : ""}`}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                >
                  <span className="db-cal-day-num">{day}</span>
                  {dayBks.length > 0 && (
                    <div className="db-cal-dots">
                      {dayBks.slice(0, 3).map((b, idx) => (
                        <span key={idx} className="db-cal-dot" style={{ background: STATUS_META[b.status]?.cls === "db-badge--confirmed" ? "var(--info)" : b.status === "completed" ? "var(--success)" : "var(--danger)" }} />
                      ))}
                      {dayBks.length > 3 && <span className="db-cal-dot-more">+{dayBks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="db-cal-legend">
            {Object.entries(STATUS_META).map(([k, v]) => (
              <span key={k} className="db-cal-legend-item">
                <span className="db-cal-dot" style={{ background: k === "confirmed" ? "var(--info)" : k === "completed" ? "var(--success)" : "var(--danger)" }} />
                {v.label}
              </span>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="db-cal-detail">
          {!selectedDay ? (
            <div className="db-card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p style={{ fontSize: 13, color: "var(--ink-light)", textAlign: "center" }}>Select a day to see<br />its bookings</p>
            </div>
          ) : (
            <div className="db-card" style={{ height: "100%", overflowY: "auto" }}>
              <div className="db-card-head">
                <h3>{MONTH_NAMES[month]} {selectedDay}, {year}</h3>
                <span className="db-count-badge">{selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""}</span>
              </div>
              {selectedBookings.length === 0 ? (
                <p className="db-empty-small">No bookings on this day.</p>
              ) : selectedBookings.map(b => (
                <div key={b.id} className="db-cal-booking-card">
                  <div className="db-cal-booking-top">
                    <div className="db-booking-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                      {b.client_image
                        ? <img src={resolveImage(b.client_image)} alt={b.client_name} className="db-avatar-img" onError={e => e.target.style.display = "none"} />
                        : (b.client_name || "Client").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{b.client_name || b.client}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-mid)" }}>{b.service_name || b.service}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="db-cal-booking-meta">
                    <span>{Icon.clock} {b.time || "—"}</span>
                    {b.city && <span>{b.city}</span>}
                  </div>
                  <StatusDropdown booking={b} onStatusChange={handleStatusUpdate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Provider Dashboard ───────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();
  const session  = getSession();
  const user     = session?.user;
  const token    = session?.token;
  const userId   = user?.id;
  const name     = user?.name || "Provider";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl = resolveImage(user?.profileImage);

  const [stats,           setStats]           = useState(null);
  const [bookings,        setBookings]        = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [services,        setServices]        = useState([]);
  const [reviews,         setReviews]         = useState([]);
  const [ratingSummary,   setRatingSummary]   = useState(null);
  const [serviceModal,    setServiceModal]    = useState(null);

  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingReviews,  setLoadingReviews]  = useState(true);

  const fetchStats = useCallback(async () => {
    try { setLoadingStats(true); const res = await fetch(`${API}/dashboard/stats/${userId}?role=provider`, { headers: authHeaders(token) }); setStats(await res.json()); }
    catch { setStats(null); } finally { setLoadingStats(false); }
  }, [userId, token]);

  const fetchBookings = useCallback(async () => {
    try { setLoadingBookings(true); const res = await fetch(`${API}/bookings/provider/${userId}`, { headers: authHeaders(token) }); const d = await res.json(); setBookings(Array.isArray(d) ? d : []); }
    catch { setBookings([]); } finally { setLoadingBookings(false); }
  }, [userId, token]);

  const fetchBookingRequests = useCallback(async () => {
    try { setLoadingRequests(true); const res = await fetch(`${API}/dashboard/provider/${userId}/booking-requests`, { headers: authHeaders(token) }); const d = await res.json(); setBookingRequests(Array.isArray(d.data) ? d.data : []); }
    catch { setBookingRequests([]); } finally { setLoadingRequests(false); }
  }, [userId, token]);

  const fetchServices = useCallback(async () => {
    try { setLoadingServices(true); const res = await fetch(`${API}/services/provider/${userId}`, { headers: authHeaders(token) }); const d = await res.json(); const rows = d?.data ?? d; setServices(Array.isArray(rows) ? rows : []); }
    catch { setServices([]); } finally { setLoadingServices(false); }
  }, [userId, token]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const [revRes, sumRes] = await Promise.all([
        fetch(`${API}/reviews/provider/${userId}`, { headers: authHeaders(token) }),
        fetch(`${API}/reviews/summary/${userId}`,  { headers: authHeaders(token) }),
      ]);
      const revData = await revRes.json();
      const sumData = await sumRes.json();
      setReviews(Array.isArray(revData.data) ? revData.data : []);
      setRatingSummary(sumData.data);
    } catch { setReviews([]); } finally { setLoadingReviews(false); }
  }, [userId, token]);

  useEffect(() => {
    if (!userId) return;
    fetchStats(); fetchBookings(); fetchServices(); fetchReviews(); fetchBookingRequests();
  }, [fetchStats, fetchBookings, fetchServices, fetchReviews, fetchBookingRequests]);

  const handleAcceptBooking = async (id) => {
    try { const r = await fetch(`${API}/dashboard/bookings/${id}/status`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify({ status: "confirmed" }) }); if (r.ok) { fetchBookingRequests(); fetchStats(); } } catch (e) { console.error(e); }
  };

  const handleDeclineBooking = async (id) => {
    if (!window.confirm("Decline this booking request?")) return;
    try { const r = await fetch(`${API}/dashboard/bookings/${id}`, { method: "DELETE", headers: authHeaders(token) }); if (r.ok) { fetchBookingRequests(); fetchStats(); } } catch (e) { console.error(e); }
  };

  const handleToggleService = async (id) => {
    try { await fetch(`${API}/services/${id}/toggle`, { method: "PATCH", headers: authHeaders(token) }); fetchServices(); } catch (e) { console.error(e); }
  };

  const handleDeleteService = async (id) => {
    try { await fetch(`${API}/services/${id}`, { method: "DELETE", headers: authHeaders(token) }); fetchServices(); fetchStats(); } catch (e) { console.error(e); }
  };

  const handleSaveService = async (form) => {
    const isEdit = serviceModal && serviceModal !== "add";
    const url    = isEdit ? `${API}/services/${serviceModal.id}` : `${API}/services`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { ...authHeaders(token), "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      setServiceModal(null); fetchServices(); fetchStats();
    } catch (e) { console.error(e); }
  };

  const TABS = [
    { id: "overview",  label: "Overview",  icon: Icon.grid      },
    { id: "calendar",  label: "Calendar",  icon: Icon.calendar  },
    { id: "services",  label: "Services",  icon: Icon.briefcase },
    { id: "reviews",   label: "Reviews",   icon: Icon.star      },
    { id: "messages",  label: "Messages",  icon: Icon.msg       },
  ];

  const kpiCards = loadingStats ? [] : [
    { label: "Total Earnings",  value: `${stats?.total_earnings  ?? 0} TND`, icon: Icon.dollar,   color: "var(--success)" },
    { label: "Completed Jobs",  value: stats?.completed_jobs  ?? 0,          icon: Icon.check,    color: "var(--info)"    },
    { label: "Active Bookings", value: stats?.active_bookings ?? 0,          icon: Icon.calendar, color: "var(--accent)"  },
    { label: "Avg. Rating",     value: `${stats?.avg_rating   ?? "—"} / 5`,  icon: Icon.star,     color: "var(--warn)"    },
  ];

  const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#14b8a6"];

  return (
    <div className="db-page">
      {serviceModal && (
        <ServiceModal
          service={serviceModal === "add" ? null : serviceModal}
          onClose={() => setServiceModal(null)}
          onSave={handleSaveService}
        />
      )}

      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <span className="db-brand-icon">{Icon.wrench}</span>
          <span className="db-brand-text">Fix<em>Hub</em></span>
        </div>
        <nav className="db-sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`db-sidebar-link${tab === t.id ? " db-sidebar-link--active" : ""}`} onClick={() => setTab(t.id)}>
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

      {/* Main */}
      <main className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="db-page-sub">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <button className="db-cta" onClick={() => setServiceModal("add")}>{Icon.plus} Create Service</button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="db-fade">
            <div className="db-kpi-grid">
              {loadingStats
                ? [1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: 90, borderRadius: "var(--radius-lg)" }} />)
                : kpiCards.map((k, i) => (
                  <div className="db-kpi" key={i} style={{ "--kpi-accent": k.color }}>
                    <div className="db-kpi-icon" style={{ background: `color-mix(in srgb,${k.color} 12%,white)`, color: k.color }}>{k.icon}</div>
                    <div className="db-kpi-body">
                      <span className="db-kpi-label">{k.label}</span>
                      <span className="db-kpi-value">{k.value}</span>
                      {k.trend && <span className="db-kpi-trend">{Icon.trending} {k.trend}</span>}
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="db-two-col">
              {/* Booking requests */}
              <div className="db-card">
                <div className="db-card-head">
                  <h3>Booking Requests</h3>
                  <button className="db-link" onClick={() => setTab("calendar")}>View all {Icon.arrow}</button>
                </div>
                {loadingRequests ? <Spinner /> : bookingRequests.length === 0
                  ? <p className="db-empty-small">No pending booking requests.</p>
                  : bookingRequests.map(b => (
                    <div className="db-booking-row" key={b.id}>
                      <div className="db-booking-avatar">
                        {b.client_image
                          ? <img src={resolveImage(b.client_image)} alt={b.client_name} className="db-avatar-img" onError={e => e.target.style.display = "none"} />
                          : (b.client_name || "Client").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                        }
                      </div>
                      <div className="db-booking-info">
                        <span className="db-booking-client">{b.client_name || b.client}</span>
                        {b.amount && <span className="db-booking-price">{b.amount} TND</span>}
                        <span className="db-booking-meta">{Icon.clock} {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {b.time}</span>
                        <span className="db-booking-service">{b.service_name || b.service}</span>
                        {b.details && (
                          <div className="db-booking-details-text"><strong>Client details:</strong> {b.details}</div>
                        )}
                      </div>
                      <div className="db-booking-right">
                        <button className="db-accept-btn" onClick={() => handleAcceptBooking(b.id)}>{Icon.check} Accept</button>
                        <button className="db-decline-btn" onClick={() => handleDeclineBooking(b.id)}>{Icon.x} Decline</button>
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
                      <div className="db-service-dot" style={{ background: sv.is_active ? "var(--success)" : "var(--border)" }} />
                      <div className="db-service-info">
                        <span className="db-service-name">{sv.title}</span>
                        <span className="db-service-meta">{sv.total_bookings ?? 0} bookings · {sv.avg_rating ?? "—"}★</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="db-card" style={{ marginTop: 20 }}>
              <div className="db-card-head">
                <h3>Recent Reviews</h3>
                <button className="db-link" onClick={() => setTab("reviews")}>View all {Icon.arrow}</button>
              </div>
              {loadingReviews ? <Spinner /> : reviews.slice(0, 3).length === 0
                ? <p className="db-empty-small">No reviews yet.</p>
                : (
                  <div className="db-reviews-row">
                    {reviews.slice(0, 3).map(r => (
                      <div className="db-review-card" key={r.id}>
                        <div className="db-review-top">
                          <div className="db-review-avatar">
                            {r.client_image
                              ? <img src={resolveImage(r.client_image)} alt={r.client_name} className="db-avatar-img" onError={e => e.target.style.display = "none"} />
                              : (r.client_name || "C").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                            }
                          </div>
                          <div>
                            <span className="db-review-client">{r.client_name || r.client}</span>
                            <Stars n={r.rating} />
                          </div>
                          <span className="db-review-date">{new Date(r.created_at || r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
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
        {tab === "calendar" && <CalendarTab bookings={bookings} loading={loadingBookings} fetchBookings={fetchBookings} />}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div className="db-fade">
            <p className="db-page-sub" style={{ marginBottom: 20 }}>Manage the services you offer to clients</p>
            {loadingServices ? <Spinner /> : (
              <div className="db-services-grid">
                {services.map(sv => (
                  <div className="db-svc-card" key={sv.id}>
                    <div className="db-svc-head">
                      <div>
                        <h4 className="db-svc-name">{sv.title}</h4>
                        <span className="db-svc-cat">{sv.category}</span>
                      </div>
                      <div className={`db-svc-toggle${sv.is_active ? " db-svc-toggle--on" : ""}`} onClick={() => handleToggleService(sv.id)} title={sv.is_active ? "Deactivate" : "Activate"}>
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
              <div className="db-rv-shell">
                {/* Summary */}
                <div className="db-rv-summary">
                  <div className="db-card db-rv-hero">
                    <div className="db-rv-score">{ratingSummary?.avg_rating ?? "—"}</div>
                    <div className="db-rv-stars">
                      {Array.from({ length: 5 }, (_, i) => {
                        const filled = i < Math.round(parseFloat(ratingSummary?.avg_rating ?? 0));
                        return <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={filled ? "var(--warn)" : "none"} stroke={filled ? "var(--warn)" : "var(--border)"} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
                      })}
                    </div>
                    <p className="db-rv-total">Based on <strong>{ratingSummary?.total ?? 0}</strong> reviews</p>
                    <div className="db-rv-kpi-row">
                      <div className="db-rv-kpi"><span>{ratingSummary?.five ?? 0}</span><label>5-star</label></div>
                      <div className="db-rv-kpi-sep" />
                      <div className="db-rv-kpi"><span>{(+( ratingSummary?.four ?? 0)) + (+( ratingSummary?.three ?? 0))}</span><label>3-4 star</label></div>
                      <div className="db-rv-kpi-sep" />
                      <div className="db-rv-kpi"><span>{(+(ratingSummary?.two ?? 0)) + (+(ratingSummary?.one ?? 0))}</span><label>1-2 star</label></div>
                    </div>
                  </div>

                  <div className="db-card" style={{ marginTop: 16 }}>
                    <p className="db-rv-breakdown-title">Rating breakdown</p>
                    {[5,4,3,2,1].map(n => {
                      const key   = ["five","four","three","two","one"][5 - n];
                      const count = +(ratingSummary?.[key] ?? 0);
                      const total = +(ratingSummary?.total ?? 1);
                      const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div className="db-rv-bar-row" key={n}>
                          <div className="db-rv-bar-label">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--warn)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {n}
                          </div>
                          <div className="db-rv-bar-track"><div className="db-rv-bar-fill" style={{ width: `${pct}%` }} /></div>
                          <span className="db-rv-bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="db-rv-list">
                  {reviews.length === 0 ? (
                    <div className="db-card">
                      <div className="db-empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <p style={{ fontWeight: 500, color: "var(--ink-mid)" }}>No reviews yet</p>
                        <p style={{ fontSize: 12.5, color: "var(--ink-light)", textAlign: "center" }}>Complete jobs to start receiving client reviews</p>
                      </div>
                    </div>
                  ) : reviews.map((r, idx) => {
                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const dateStr = new Date(r.created_at || r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <div className="db-rv-card" key={r.id}>
                        <div className="db-rv-card-top">
                          <div className="db-rv-card-avatar" style={{ background: avatarColor }}>
                            {r.client_image
                              ? <img src={resolveImage(r.client_image)} alt={r.client_name} className="db-avatar-img" onError={e => e.target.style.display = "none"} />
                              : (r.client_name || "C").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                            }
                          </div>
                          <div className="db-rv-card-meta">
                            <span className="db-rv-card-name">{r.client_name || r.client}</span>
                            <div className="db-rv-card-stars">
                              {Array.from({ length: 5 }, (_, i) => (
                                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < r.rating ? "var(--warn)" : "none"} stroke={i < r.rating ? "var(--warn)" : "var(--border)"} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              ))}
                              <span className="db-rv-card-rating">{r.rating}.0</span>
                            </div>
                          </div>
                          <div className="db-rv-card-right">
                            <span className="db-rv-card-service">{r.service_name || r.service}</span>
                            <span className="db-rv-card-date">{dateStr}</span>
                          </div>
                        </div>
                        {(r.comment || r.text) && (
                          <div className="db-rv-card-quote">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--border)" style={{ flexShrink: 0, marginTop: 2 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                            <p className="db-rv-card-text">{r.comment || r.text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && <div className="db-fade"><ChatPage /></div>}
      </main>
    </div>
  );
}

const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#14b8a6"];