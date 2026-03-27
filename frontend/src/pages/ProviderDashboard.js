import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";

// ── Icons (inline SVG — no extra deps) ───────────────────────────────────────
const Icon = {
  grid:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  briefcase:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  users:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  dollar:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  map:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  edit:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  msg:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const BOOKINGS = [
  { id: 1, client: "Amine Trabelsi",  service: "Plumbing Repair",    date: "Mar 24, 2026", time: "10:00 AM", amount: 120, status: "confirmed",   city: "Tunis"    },
  { id: 2, client: "Sana Bouazizi",   service: "Electrical Install", date: "Mar 25, 2026", time: "02:00 PM", amount: 200, status: "pending",     city: "Sousse"   },
  { id: 3, client: "Yassine Chahed",  service: "Painting — 2 rooms", date: "Mar 26, 2026", time: "09:00 AM", amount: 350, status: "in-progress", city: "Sfax"     },
  { id: 4, client: "Rania Hamdi",     service: "Carpentry Work",     date: "Mar 20, 2026", time: "11:00 AM", amount: 180, status: "completed",   city: "Tunis"    },
  { id: 5, client: "Mohamed Slim",    service: "Plumbing Repair",    date: "Mar 18, 2026", time: "03:00 PM", amount: 95,  status: "completed",   city: "Bizerte"  },
  { id: 6, client: "Hajer Mansouri",  service: "Cleaning — Full",    date: "Mar 22, 2026", time: "08:00 AM", amount: 75,  status: "cancelled",   city: "Nabeul"   },
];

const SERVICES = [
  { id: 1, name: "Plumbing Repair",    category: "Plumbing",    price: 80,  bookings: 34, rating: 4.9, active: true  },
  { id: 2, name: "Electrical Install", category: "Electrical",  price: 120, bookings: 21, rating: 4.7, active: true  },
  { id: 3, name: "Room Painting",      category: "Painting",    price: 150, bookings: 18, rating: 4.8, active: true  },
  { id: 4, name: "Carpentry Work",     category: "Carpentry",   price: 100, bookings: 12, rating: 4.6, active: false },
];

const REVIEWS = [
  { id: 1, client: "Amine T.",  rating: 5, text: "Excellent work, very professional and on time.", date: "Mar 20", service: "Plumbing" },
  { id: 2, client: "Rania H.",  rating: 5, text: "Did an amazing job on the carpentry, very neat.", date: "Mar 18", service: "Carpentry" },
  { id: 3, client: "Sana B.",   rating: 4, text: "Good service, arrived a bit late but great result.", date: "Mar 15", service: "Electrical" },
];

const STATUS_META = {
  confirmed:   { label: "Confirmed",   color: "#0ea5e9", bg: "#e0f2fe" },
  pending:     { label: "Pending",     color: "#f59e0b", bg: "#fef3c7" },
  "in-progress":{ label: "In Progress", color: "#8b5cf6", bg: "#ede9fe" },
  completed:   { label: "Completed",   color: "#10b981", bg: "#d1fae5" },
  cancelled:   { label: "Cancelled",   color: "#ef4444", bg: "#fee2e2" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < n ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
));

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      background: m.bg, color: m.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
      whiteSpace: "nowrap"
    }}>{m.label}</span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab]           = useState("overview");
  const [filter, setFilter]     = useState("all");
  const navigate                = useNavigate();
  const session                 = getSession();
  const user                    = session?.user;
  const name                    = user?.name || "Provider";
  const initials                = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const API_URL = "http://localhost:5000";

  const profileImageUrl = user?.profileImage 
  ? `${API_URL}/uploads/${user.profileImage}` : null;

  const totalEarnings   = BOOKINGS.filter(b => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const completedCount  = BOOKINGS.filter(b => b.status === "completed").length;
  const activeBookings  = BOOKINGS.filter(b => ["confirmed","in-progress","pending"].includes(b.status)).length;
  const avgRating       = (SERVICES.reduce((s, sv) => s + sv.rating, 0) / SERVICES.length).toFixed(1);

  const filteredBookings = filter === "all" ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  const TABS = [
    { id: "overview",  label: "Overview",   icon: Icon.grid      },
    { id: "bookings",  label: "Bookings",   icon: Icon.calendar  },
    { id: "services",  label: "Services",   icon: Icon.briefcase },
    { id: "customers", label: "Customers",  icon: Icon.users     },
    { id: "reviews",   label: "Reviews",    icon: Icon.star      },
  ];

  return (
    <div className="db-shell">
      <style>{STYLES}</style>

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          FixHub
        </div>

        <nav className="db-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`db-nav-item ${tab === t.id ? "db-nav-item--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <button className="db-profile-btn" onClick={() => navigate("/profile")}>
            {profileImageUrl? 
              <img src={profileImageUrl} alt={name} className="db-sidebar-avatar" />
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
          <button className="db-cta" onClick={() => navigate("/profile")}>
            {Icon.edit} Edit Profile
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="db-fade">
            {/* KPI cards */}
            <div className="db-kpi-grid">
              {[
                { label: "Total Earnings",   value: `${totalEarnings} TND`, icon: Icon.dollar,   accent: "#10b981", trend: "+18% this month" },
                { label: "Completed Jobs",   value: completedCount,         icon: Icon.check,    accent: "#0ea5e9", trend: "+3 this week"    },
                { label: "Active Bookings",  value: activeBookings,         icon: Icon.calendar, accent: "#8b5cf6", trend: "Next: tomorrow"  },
                { label: "Avg. Rating",      value: avgRating + " / 5",     icon: Icon.star,     accent: "#f59e0b", trend: "Based on 85 reviews" },
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
              {/* Upcoming */}
              <div className="db-card">
                <div className="db-card-head">
                  <h3>Upcoming Bookings</h3>
                  <button className="db-link" onClick={() => setTab("bookings")}>View all {Icon.arrow}</button>
                </div>
                {BOOKINGS.filter(b => ["confirmed","pending","in-progress"].includes(b.status)).slice(0, 3).map(b => (
                  <div className="db-booking-row" key={b.id}>
                    <div className="db-booking-avatar">{b.client.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
                    <div className="db-booking-info">
                      <span className="db-booking-client">{b.client}</span>
                      <span className="db-booking-meta">{Icon.clock} {b.date} · {b.time}</span>
                      <span className="db-booking-service">{b.service}</span>
                    </div>
                    <div className="db-booking-right">
                      <StatusBadge status={b.status} />
                      <span className="db-booking-amount">{b.amount} TND</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Services summary */}
              <div className="db-card">
                <div className="db-card-head">
                  <h3>Your Services</h3>
                  <button className="db-link" onClick={() => setTab("services")}>Manage {Icon.arrow}</button>
                </div>
                {SERVICES.map(sv => (
                  <div className="db-service-row" key={sv.id}>
                    <div className="db-service-dot" style={{ background: sv.active ? "#10b981" : "#d1d5db" }} />
                    <div className="db-service-info">
                      <span className="db-service-name">{sv.name}</span>
                      <span className="db-service-meta">{sv.bookings} bookings · {sv.rating}★</span>
                    </div>
                    <span className="db-service-price">{sv.price} TND</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent reviews */}
            <div className="db-card" style={{ marginTop: 24 }}>
              <div className="db-card-head">
                <h3>Recent Reviews</h3>
                <button className="db-link" onClick={() => setTab("reviews")}>View all {Icon.arrow}</button>
              </div>
              <div className="db-reviews-row">
                {REVIEWS.map(r => (
                  <div className="db-review-card" key={r.id}>
                    <div className="db-review-top">
                      <div className="db-review-avatar">{r.client[0]}</div>
                      <div>
                        <div className="db-review-client">{r.client}</div>
                        <Stars n={r.rating} />
                      </div>
                      <span className="db-review-date">{r.date}</span>
                    </div>
                    <p className="db-review-text">"{r.text}"</p>
                    <span className="db-review-tag">{r.service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <div className="db-fade">
            {/* Filter bar */}
            <div className="db-filter-bar">
              {["all","pending","confirmed","in-progress","completed","cancelled"].map(f => (
                <button
                  key={f}
                  className={`db-filter-btn ${filter === f ? "db-filter-btn--active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : STATUS_META[f]?.label}
                  <span className="db-filter-count">
                    {f === "all" ? BOOKINGS.length : BOOKINGS.filter(b => b.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="db-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div className="db-table-client">
                          <div className="db-table-avatar">{b.client.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                          {b.client}
                        </div>
                      </td>
                      <td className="db-table-service">{b.service}</td>
                      <td>
                        <div className="db-table-date">{b.date}</div>
                        <div className="db-table-time">{b.time}</div>
                      </td>
                      <td><span className="db-table-city">{Icon.map} {b.city}</span></td>
                      <td className="db-table-amount">{b.amount} TND</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <div className="db-table-actions">
                          <button className="db-icon-btn" title="View">{Icon.eye}</button>
                          <button className="db-icon-btn" title="Message">{Icon.msg}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="db-empty">No bookings for this filter.</div>
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div className="db-fade">
            <div className="db-card-head" style={{ marginBottom: 20 }}>
              <p className="db-page-sub">Manage the services you offer to clients</p>
              <button className="db-cta">{Icon.plus} Add Service</button>
            </div>
            <div className="db-services-grid">
              {SERVICES.map(sv => (
                <div className="db-svc-card" key={sv.id}>
                  <div className="db-svc-head">
                    <div>
                      <h4 className="db-svc-name">{sv.name}</h4>
                      <span className="db-svc-cat">{sv.category}</span>
                    </div>
                    <div className={`db-svc-toggle ${sv.active ? "db-svc-toggle--on" : ""}`}>
                      <span className="db-svc-toggle-dot" />
                    </div>
                  </div>
                  <div className="db-svc-stats">
                    <div className="db-svc-stat"><span>{sv.bookings}</span><label>Bookings</label></div>
                    <div className="db-svc-stat"><span>{sv.rating}★</span><label>Rating</label></div>
                    <div className="db-svc-stat"><span>{sv.price} TND</span><label>Price</label></div>
                  </div>
                  <div className="db-svc-actions">
                    <button className="db-svc-btn">{Icon.edit} Edit</button>
                    <button className="db-svc-btn db-svc-btn--danger">{Icon.trash} Remove</button>
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <div className="db-svc-card db-svc-card--add">
                <div className="db-svc-add-icon">{Icon.plus}</div>
                <p>Add a new service</p>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <div className="db-fade">
            <div className="db-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Last Service</th>
                    <th>Total Spent</th>
                    <th>Bookings</th>
                    <th>Last Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Map(BOOKINGS.map(b => [b.client, b])).values()].map((b, i) => {
                    const clientBookings = BOOKINGS.filter(x => x.client === b.client);
                    const totalSpent = clientBookings.filter(x => x.status === "completed").reduce((s, x) => s + x.amount, 0);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="db-table-client">
                            <div className="db-table-avatar">{b.client.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                            {b.client}
                          </div>
                        </td>
                        <td className="db-table-service">{b.service}</td>
                        <td className="db-table-amount">{totalSpent} TND</td>
                        <td><span className="db-count-badge">{clientBookings.length}</span></td>
                        <td>
                          <div className="db-table-date">{b.date}</div>
                        </td>
                        <td>
                          <div className="db-table-actions">
                            <button className="db-icon-btn" title="Message">{Icon.msg}</button>
                            <button className="db-icon-btn" title="View history">{Icon.eye}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div className="db-fade">
            {/* Summary bar */}
            <div className="db-rating-summary">
              <div className="db-rating-big">
                <span className="db-rating-num">{avgRating}</span>
                <Stars n={5} />
                <span className="db-rating-count">85 reviews</span>
              </div>
              <div className="db-rating-bars">
                {[5,4,3,2,1].map(n => (
                  <div className="db-rating-bar-row" key={n}>
                    <span>{n}★</span>
                    <div className="db-rating-bar-track">
                      <div className="db-rating-bar-fill" style={{ width: `${[70,20,7,2,1][5-n]}%` }} />
                    </div>
                    <span className="db-rating-bar-pct">{[70,20,7,2,1][5-n]}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-reviews-list">
              {REVIEWS.map(r => (
                <div className="db-review-full" key={r.id}>
                  <div className="db-review-full-top">
                    <div className="db-review-avatar db-review-avatar--lg">{r.client[0]}</div>
                    <div className="db-review-full-info">
                      <span className="db-review-client">{r.client}</span>
                      <Stars n={r.rating} />
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <span className="db-review-tag">{r.service}</span>
                      <div className="db-review-date" style={{ marginTop: 4 }}>{r.date}</div>
                    </div>
                  </div>
                  <p className="db-review-text" style={{ marginTop: 12 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .db-shell {
    display: flex;
    min-height: 100vh;
    background: #f8f9fc;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Sidebar ── */
  .db-sidebar {
    width: 230px;
    min-width: 230px;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .db-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 4px 8px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 20px;
  }

  .db-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

  .db-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: none;
    color: rgba(255,255,255,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .db-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .db-nav-item--active { background: #fff; color: #0a0a0a; font-weight: 700; }
  .db-nav-item--active:hover { background: #f0f0f0; }

  .db-sidebar-footer {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 16px;
    margin-top: 16px;
  }

  .db-profile-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px;
    border-radius: 10px;
    border: none;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
    transition: background 0.15s;
    color: rgba(255,255,255,0.6);
  }
  .db-profile-btn:hover { background: rgba(255,255,255,0.1); }

  .db-sidebar-avatar {
    width: 34px; height: 34px;
    border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
  }
  .db-sidebar-initials {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #555, #222);
    color: #fff; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .db-sidebar-info { flex: 1; text-align: left; min-width: 0; }
  .db-sidebar-name { display: block; font-size: 12.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .db-sidebar-role { display: block; font-size: 11px; color: rgba(255,255,255,0.4); }

  /* ── Main ── */
  .db-main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    min-width: 0;
  }

  .db-topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .db-page-title {
    font-family: 'Sora', sans-serif;
    font-size: 24px;
    font-weight: 800;
    color: #0a0a0a;
    margin-bottom: 3px;
  }
  .db-page-sub { font-size: 13px; color: #9ca3af; }

  .db-cta {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    background: #0a0a0a; color: #fff;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600;
    border: none; cursor: pointer;
    transition: background 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  .db-cta:hover { background: #222; transform: translateY(-1px); }

  .db-fade { animation: dbFade 0.2s ease; }
  @keyframes dbFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* ── KPI grid ── */
  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .db-kpi {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .db-kpi:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

  .db-kpi-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 12%, white);
    color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .db-kpi-body { display: flex; flex-direction: column; min-width: 0; }
  .db-kpi-label { font-size: 11.5px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .db-kpi-value { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #0a0a0a; margin-bottom: 5px; }
  .db-kpi-trend { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #10b981; font-weight: 500; }

  /* ── Two col ── */
  .db-two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }

  /* ── Card ── */
  .db-card {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .db-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .db-card-head h3 {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #0a0a0a;
  }

  .db-link {
    display: inline-flex; align-items: center; gap: 4px;
    background: none; border: none;
    font-size: 12.5px; font-weight: 600; color: #6b7280;
    cursor: pointer; transition: color 0.15s;
  }
  .db-link:hover { color: #0a0a0a; }

  /* ── Booking row ── */
  .db-booking-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f8fafc;
  }
  .db-booking-row:last-child { border-bottom: none; }

  .db-booking-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: #f1f5f9; color: #475569;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; font-family: 'Sora', sans-serif;
    flex-shrink: 0;
  }

  .db-booking-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .db-booking-client { font-size: 13.5px; font-weight: 600; color: #0a0a0a; }
  .db-booking-meta { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #9ca3af; }
  .db-booking-service { font-size: 12px; color: #6b7280; }

  .db-booking-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .db-booking-amount { font-size: 13px; font-weight: 700; color: #0a0a0a; }

  /* ── Service row ── */
  .db-service-row {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 0; border-bottom: 1px solid #f8fafc;
  }
  .db-service-row:last-child { border-bottom: none; }
  .db-service-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-service-info { flex: 1; min-width: 0; }
  .db-service-name { display: block; font-size: 13.5px; font-weight: 600; color: #0a0a0a; }
  .db-service-meta { font-size: 11.5px; color: #9ca3af; }
  .db-service-price { font-size: 13px; font-weight: 700; color: #0a0a0a; white-space: nowrap; }

  /* ── Reviews row ── */
  .db-reviews-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

  .db-review-card {
    background: #f8f9fc; border-radius: 12px;
    padding: 16px; border: 1px solid #f1f5f9;
  }

  .db-review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .db-review-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #0a0a0a; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }
  .db-review-avatar--lg { width: 40px; height: 40px; font-size: 14px; }
  .db-review-client { display: block; font-size: 13px; font-weight: 600; color: #0a0a0a; }
  .db-review-date { font-size: 11px; color: #9ca3af; margin-left: auto; white-space: nowrap; }
  .db-review-text { font-size: 12.5px; color: #4b5563; line-height: 1.5; font-style: italic; }
  .db-review-tag {
    display: inline-block; margin-top: 10px;
    background: #f1f5f9; color: #475569;
    padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }

  /* ── Filter bar ── */
  .db-filter-bar {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;
  }

  .db-filter-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    background: #fff; border: 1px solid #e5e7eb;
    font-size: 12.5px; font-weight: 500; color: #6b7280;
    cursor: pointer; transition: all 0.15s;
  }
  .db-filter-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }
  .db-filter-btn--active { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .db-filter-btn--active .db-filter-count { background: rgba(255,255,255,0.2); color: #fff; }

  .db-filter-count {
    background: #f1f5f9; color: #6b7280;
    padding: 1px 7px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }

  /* ── Table ── */
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.06em;
    background: #f8f9fc; border-bottom: 1px solid #f1f5f9;
  }
  .db-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f8fafc;
    font-size: 13.5px; color: #374151;
    vertical-align: middle;
  }
  .db-table tr:last-child td { border-bottom: none; }
  .db-table tr:hover td { background: #fafafa; }

  .db-table-client { display: flex; align-items: center; gap: 10px; font-weight: 600; color: #0a0a0a; }
  .db-table-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: #f1f5f9; color: #475569;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; font-family: 'Sora', sans-serif;
    flex-shrink: 0;
  }
  .db-table-service { color: #6b7280; font-size: 13px; }
  .db-table-date { font-size: 13px; font-weight: 500; color: #0a0a0a; }
  .db-table-time { font-size: 11.5px; color: #9ca3af; }
  .db-table-city { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: #6b7280; }
  .db-table-amount { font-weight: 700; color: #0a0a0a; }
  .db-table-actions { display: flex; gap: 6px; }
  .db-empty { padding: 32px; text-align: center; color: #9ca3af; font-size: 13.5px; }

  .db-icon-btn {
    width: 30px; height: 30px; border-radius: 7px;
    background: #f1f5f9; border: none; color: #6b7280;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .db-icon-btn:hover { background: #0a0a0a; color: #fff; }

  .db-count-badge {
    display: inline-block;
    background: #f1f5f9; color: #475569;
    padding: 3px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
  }

  /* ── Services grid ── */
  .db-services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 18px;
  }

  .db-svc-card {
    background: #fff; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .db-svc-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  .db-svc-card--add {
    border: 2px dashed #e5e7eb; background: #fafafa;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    cursor: pointer; color: #9ca3af; font-size: 13.5px; font-weight: 500;
    min-height: 180px;
  }
  .db-svc-card--add:hover { border-color: #0a0a0a; color: #0a0a0a; background: #fff; }
  .db-svc-add-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: #f1f5f9; color: #9ca3af;
    display: flex; align-items: center; justify-content: center;
  }

  .db-svc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .db-svc-name { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0a0a0a; margin-bottom: 4px; }
  .db-svc-cat {
    display: inline-block; background: #f1f5f9; color: #475569;
    padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }

  .db-svc-toggle {
    width: 38px; height: 22px; border-radius: 11px;
    background: #e5e7eb; cursor: pointer;
    position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .db-svc-toggle--on { background: #10b981; }
  .db-svc-toggle-dot {
    position: absolute; top: 3px; left: 3px;
    width: 16px; height: 16px; border-radius: 50%; background: #fff;
    transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .db-svc-toggle--on .db-svc-toggle-dot { left: 19px; }

  .db-svc-stats {
    display: flex; gap: 0;
    border: 1px solid #f1f5f9; border-radius: 10px;
    overflow: hidden; margin-bottom: 14px;
  }
  .db-svc-stat {
    flex: 1; padding: 10px 8px; text-align: center;
    border-right: 1px solid #f1f5f9;
  }
  .db-svc-stat:last-child { border-right: none; }
  .db-svc-stat span { display: block; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0a0a0a; }
  .db-svc-stat label { font-size: 10.5px; color: #9ca3af; font-weight: 500; }

  .db-svc-actions { display: flex; gap: 8px; }
  .db-svc-btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px;
    padding: 8px; border-radius: 8px;
    background: #f8f9fc; border: 1px solid #f1f5f9;
    font-size: 12.5px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .db-svc-btn:hover { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .db-svc-btn--danger:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

  /* ── Rating summary ── */
  .db-rating-summary {
    background: #fff; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 24px;
    display: flex; gap: 40px; align-items: center;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .db-rating-big { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 100px; }
  .db-rating-num { font-family: 'Sora', sans-serif; font-size: 48px; font-weight: 800; color: #0a0a0a; line-height: 1; }
  .db-rating-count { font-size: 12px; color: #9ca3af; }

  .db-rating-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .db-rating-bar-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #6b7280; }
  .db-rating-bar-track { flex: 1; height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .db-rating-bar-fill { height: 100%; background: #f59e0b; border-radius: 4px; transition: width 0.5s ease; }
  .db-rating-bar-pct { min-width: 34px; text-align: right; font-weight: 600; }

  .db-reviews-list { display: flex; flex-direction: column; gap: 14px; }
  .db-review-full {
    background: #fff; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .db-review-full-top { display: flex; align-items: center; gap: 12px; }
  .db-review-full-info { display: flex; flex-direction: column; gap: 3px; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .db-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .db-two-col { grid-template-columns: 1fr; }
    .db-reviews-row { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 768px) {
    .db-sidebar { display: none; }
    .db-main { padding: 20px 16px; }
    .db-kpi-grid { grid-template-columns: 1fr 1fr; }
    .db-reviews-row { grid-template-columns: 1fr; }
    .db-rating-summary { flex-direction: column; gap: 20px; }
    .db-table th:nth-child(4), .db-table td:nth-child(4) { display: none; }
  }

  @media (max-width: 480px) {
    .db-kpi-grid { grid-template-columns: 1fr; }
  }
`;