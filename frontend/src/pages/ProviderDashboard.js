import React, { useState, useEffect, useCallback } from "react";
import ChatPage from "./Chat";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSession } from "../lib/session";
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
  warn:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
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
  pending:     { label: "Pending",      cls: "db-badge--pending"     },
  confirmed:   { label: "Confirmed",    cls: "db-badge--confirmed"   },
  "in-progress": { label: "In Progress", cls: "db-badge--inprogress" },
  completed:   { label: "Completed",    cls: "db-badge--completed"   },
  cancelled:   { label: "Cancelled",    cls: "db-badge--cancelled"   },
};

const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} style={{ color: i < Math.round(n) ? "var(--warn)" : "var(--border)", fontSize: 13 }}>★</span>
));

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.confirmed;
  return <span className={`db-badge ${m.cls}`}>{m.label}</span>;
};

const Spinner = () => <div className="db-spinner-wrap"><div className="db-spinner" /></div>;

// ── Confirm Modal (generic, used for destructive actions like cancel) ─────────
function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = true, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="db-modal" style={{ maxWidth: 420 }}>
        <div className="db-modal-header" style={{ alignItems: "flex-start" }}>
          <div className="db-confirm-modal-icon">{Icon.warn}</div>
          <button className="db-icon-btn" onClick={onClose}>{Icon.x}</button>
        </div>
        <h3 className="db-modal-title" style={{ margin: "0 0 4px" }}>{title}</h3>
        <p className="db-confirm-modal-message">
          {message}
        </p>
        <div className="db-confirm-modal-actions">
          <button className="db-cta db-cta--outline" onClick={onClose}>
            Keep it
          </button>
          <button
            className={`db-cta${danger ? " db-cta--danger" : ""}`}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Cancelling…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Service Modal — two-panel layout matching the client's "Post a Task"
//    modal (dark identity panel on the left, form on the right) ─────────────
const CATEGORIES = ["Plumbing","Electrical","Carpentry","Painting","Cleaning","Gardening","Moving","IT Support","Tutoring","Music Lessons"];

const SERVICE_TIPS = [
  { icon: "📋", text: "Clear titles get more bookings" },
  { icon: "🏷️", text: "Pick the closest matching category" },
  { icon: "✍️", text: "A good description builds trust" },
];

function ServiceModal({ service, onClose, onSave, providerName, providerImageUrl }) {
  const [form, setForm] = useState({
    title:       service?.title       || "",
    category:    service?.category    || "",
    description: service?.description || "",
  });
  const [saving, setSaving] = useState(false);

  const initials = (providerName || "Provider").trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const isEdit = Boolean(service);
  const valid = form.title.trim().length > 2 && Boolean(form.category);

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="db-svc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="db-svc-modal">

        {/* ── Left panel — dark context, mirrors PostTaskModal ── */}
        <div className="db-svc-modal-left">
          <button className="db-svc-modal-close" onClick={onClose}>{Icon.x}</button>

          <div className="db-svc-modal-left-top">
            <div className="db-svc-modal-avatar">
              {providerImageUrl
                ? <img src={providerImageUrl} alt={providerName} />
                : <span>{initials}</span>
              }
            </div>
            <div className="db-svc-modal-id">
              <p className="db-svc-modal-username">{providerName || "Provider"}</p>
              <p className="db-svc-modal-userrole">Provider · FixHub</p>
            </div>
          </div>

          <ul className="db-svc-modal-tips">
            {SERVICE_TIPS.map((tip, i) => (
              <li key={i}>
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right panel — form ── */}
        <div className="db-svc-modal-right">
          <div className="db-svc-modal-right-head">
            <div>
              <h2>{isEdit ? "Edit Service" : "Add New Service"}</h2>
              <p>{isEdit ? "Update the details clients see" : "Tell clients what you offer"}</p>
            </div>
          </div>

          <div className="db-svc-modal-right-body">
            <div className="db-form-group">
              <label className="db-form-label">Service Name *</label>
              <input
                className="db-form-input"
                type="text"
                value={form.title}
                placeholder="e.g. Plumbing Repair"
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={255}
              />
            </div>

            <div className="db-form-group">
              <label className="db-form-label">Category *</label>
              <select
                className="db-form-select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="db-form-group">
              <label className="db-form-label">Description</label>
              <textarea
                className="db-form-textarea"
                value={form.description}
                placeholder="Describe the service…"
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
              <div className="db-form-hint">
                <span>{form.description.length} chars</span>
              </div>
            </div>

            <div className="db-svc-modal-actions">
              <button className="db-cta db-cta--outline" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
              <button
                className="db-cta"
                onClick={handleSave}
                disabled={!valid || saving}
                style={{ flex: 1, justifyContent: "center", opacity: (!valid || saving) ? 0.5 : 1 }}
              >
                {saving
                  ? <><div className="db-spinner" style={{ width: 13, height: 13, borderWidth: 2, borderTopColor: "#fff" }} /> Saving…</>
                  : <>{Icon.save} {isEdit ? "Save Changes" : "Create Service"}</>
                }
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const BOOKING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", dot: "var(--warn)" },
  { value: "confirmed", label: "Confirmed", dot: "var(--info)" },
  { value: "in-progress", label: "In Progress", dot: "var(--primary, #6366f1)" },
  { value: "completed", label: "Completed", dot: "var(--success)" },
  { value: "cancelled", label: "Cancelled", dot: "var(--danger)" },
];

const STATUS_PROGRESS = {
  pending: 0,
  confirmed: 25,
  "in-progress": 60,
  completed: 100,
  cancelled: 0,
};

const STATUS_PROGRESS_COLOR = {
  pending: "var(--warn)",
  confirmed: "var(--info)",
  "in-progress": "var(--primary)",
  completed: "var(--success)",
  cancelled: "var(--danger)",
};

// Thresholds the drag handle can snap to. "cancelled" is intentionally
// excluded — it stays dropdown-only, never reachable by dragging.
const DRAG_SNAP_STATUSES = ["pending", "confirmed", "in-progress", "completed"];

// Given a raw 0-100 drop position, find the closest of the draggable
// statuses by comparing against each status's defined progress value.
const nearestDragStatus = (pct) => {
  let closest = DRAG_SNAP_STATUSES[0];
  let bestDist = Infinity;
  for (const s of DRAG_SNAP_STATUSES) {
    const dist = Math.abs(STATUS_PROGRESS[s] - pct);
    if (dist < bestDist) {
      bestDist = dist;
      closest = s;
    }
  }
  return closest;
};

function BookingCard({ b, onStatusChange, onCancel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState(b.status);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(STATUS_PROGRESS[b.status] ?? 0);
  const [dragging, setDragging] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const barRef = React.useRef(null);
  const menuRef = React.useRef(null);
  // Tracks the live drag position so the mouseup/touchend handler (which
  // closes over stale state from when the drag started) can read the
  // latest value without waiting on a re-render.
  const dragPctRef = React.useRef(progress);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  React.useEffect(() => {
    setStatus(b.status);
    setProgress(STATUS_PROGRESS[b.status] ?? 0);
  }, [b.status]);

  const handleStatusChange = async (newStatus) => {
    setMenuOpen(false);
    if (newStatus === status) return;

    setUpdating(true);
    try {
      await onStatusChange(b.id, newStatus);
      setStatus(newStatus);
      setProgress(STATUS_PROGRESS[newStatus] ?? 0);
    } finally {
      setUpdating(false);
    }
  };

  const calcPct = (clientX) => {
    if (!barRef.current) return 0;
    const { left, width } = barRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, Math.round(((clientX - left) / width) * 100)));
  };

  // Called once dragging stops: snaps the dropped position to the nearest
  // status threshold and persists it the same way the dropdown menu does,
  // via onStatusChange -> PATCH /bookings/:id/status. If the snapped status
  // is unchanged (e.g. user drags then releases at the same spot), the bar
  // still visually settles back to that status's exact progress value.
  const commitDragStatus = async () => {
    const finalPct = dragPctRef.current;
    const snapped = nearestDragStatus(finalPct);

    if (snapped === status) {
      // No status change, just snap the bar back to the exact value.
      setProgress(STATUS_PROGRESS[snapped] ?? 0);
      return;
    }

    setUpdating(true);
    try {
      await onStatusChange(b.id, snapped);
      setStatus(snapped);
      setProgress(STATUS_PROGRESS[snapped] ?? 0);
    } catch (e) {
      console.error(e);
      // Revert visually if the backend update failed.
      setProgress(STATUS_PROGRESS[status] ?? 0);
    } finally {
      setUpdating(false);
    }
  };

  const onBarMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const startPct = calcPct(e.clientX);
    dragPctRef.current = startPct;
    setProgress(startPct);

    const onMove = (ev) => {
      const pct = calcPct(ev.clientX);
      dragPctRef.current = pct;
      setProgress(pct);
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      commitDragStatus();
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onBarTouchStart = (e) => {
    setDragging(true);
    const startPct = calcPct(e.touches[0].clientX);
    dragPctRef.current = startPct;
    setProgress(startPct);

    const onMove = (ev) => {
      const pct = calcPct(ev.touches[0].clientX);
      dragPctRef.current = pct;
      setProgress(pct);
    };
    const onEnd = () => {
      setDragging(false);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      commitDragStatus();
    };

    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  };

  const sm = STATUS_META[status] || STATUS_META.confirmed;
  const barColor = STATUS_PROGRESS_COLOR[status] || "var(--primary)";
  const clientName = b.client_name || b.client || "Client";
  const serviceName = b.service_name || b.service || "Direct Booking";
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dateStr = b.date
    ? new Date(b.date).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date non definie";

  const amount = b.amount ? `${parseFloat(b.amount).toFixed(0)} TND` : null;

  return (
    <article className={`db-cal-booking-card db-cal-booking-card--${status}`}>
      <div className="db-cal-booking-accent" style={{ background: barColor }} />

      <div className="db-cal-booking-top">
        <div className="db-booking-avatar db-cal-booking-avatar">
          {b.client_image ? (
            <img
              src={resolveImage(b.client_image)}
              alt={clientName}
              className="db-avatar-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>

        <div className="db-cal-booking-main">
          <div className="db-cal-booking-title-row">
            <h4 className="db-cal-booking-client">{clientName}</h4>

            <div className="db-task-status-wrap" ref={menuRef}>
              <button
                type="button"
                className={`db-badge ${sm.cls} db-badge--clickable db-cal-booking-status`}
                onClick={() => setMenuOpen((o) => !o)}
                disabled={updating}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {updating ? (
                  <span className="db-spinner db-cal-booking-status-spinner" />
                ) : (
                  sm.label
                )}
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="db-cal-booking-chevron"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuOpen && (
                <div className="db-status-menu db-cal-booking-menu" role="menu">
                  {BOOKING_STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="menuitem"
                      className={`db-status-menu-item${
                        o.value === status ? " db-status-menu-item--active" : ""
                      }`}
                      onClick={() => handleStatusChange(o.value)}
                    >
                      <span className="db-status-dot" style={{ background: o.dot }} />
                      {o.label}
                      {o.value === status && <span className="db-status-check">{Icon.check}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="db-cal-booking-service">{serviceName}</div>
        </div>
      </div>

      <div className="db-cal-booking-meta-grid">
        <div className="db-cal-booking-meta-item">
          <span className="db-cal-booking-meta-icon">{Icon.calendar}</span>
          <span>{dateStr}</span>
        </div>

        {b.time && (
          <div className="db-cal-booking-meta-item">
            <span className="db-cal-booking-meta-icon">{Icon.clock}</span>
            <span>{b.time}</span>
          </div>
        )}

        {amount && (
          <div className="db-cal-booking-amount">
            <span>{amount}</span>
          </div>
        )}
      </div>

      {b.details && <p className="db-cal-booking-details">{b.details}</p>}

      <div className="db-cal-booking-progress">
        <div className="db-cal-booking-progress-head">
          <span>Progression</span>
          <strong style={{ color: barColor }}>{progress}%</strong>
        </div>

        <div
          ref={barRef}
          className="db-cal-booking-progress-track"
          onMouseDown={onBarMouseDown}
          onTouchStart={onBarTouchStart}
          style={{ "--booking-progress": `${progress}%`, "--booking-progress-color": barColor }}
        >
          <div
            className="db-cal-booking-progress-fill"
            style={{ transition: dragging ? "none" : undefined }}
          />
          <div
            className="db-cal-booking-progress-thumb"
            style={{ transition: dragging ? "none" : undefined }}
          />
        </div>

        <div className="db-cal-booking-steps">
          {[
            ["0%", "Pending"],
            ["25%", "Confirmed"],
            ["60%", "In Progress"],
            ["100%", "Done"],
          ].map(([pct, label]) => (
            <span key={label} className={progress >= parseInt(pct, 10) ? "is-active" : ""}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Cancel — only for active bookings, not completed/cancelled/pending */}
      {["confirmed", "in-progress"].includes(status) && (
        <button
          type="button"
          className="db-cal-booking-cancel-btn"
          onClick={() => setShowCancelConfirm(true)}
          disabled={updating || cancelling}
          style={{
            marginTop: 12, width: "100%", padding: "8px 12px",
            fontSize: 12.5, fontWeight: 600, color: "var(--danger)",
            background: "transparent", border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md, 8px)", cursor: "pointer",
            opacity: (updating || cancelling) ? 0.5 : 1,
          }}
        >
          Cancel booking
        </button>
      )}

      {showCancelConfirm && (
        <ConfirmModal
          title="Cancel this booking?"
          message="If you cancel, you will no longer be able to follow this booking or its task. This cannot be undone."
          confirmLabel="Cancel booking"
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={async () => {
            setCancelling(true);
            try {
              await onCancel(b.id);
              setShowCancelConfirm(false);
            } finally {
              setCancelling(false);
            }
          }}
        />
      )}
    </article>
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
    if (!b.date) return;
    // Use slice(0,10) on the ISO string to get YYYY-MM-DD in UTC,
    // avoiding local-timezone shifts that push dates to the wrong day.
    const key = b.date.slice(0, 10);
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

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBookings();
      else {
        const err = await res.json().catch(() => ({}));
        console.error("Cancel failed:", err.message || res.status);
      }
    } catch (err) { console.error(err); }
  };

  const pad = n => String(n).padStart(2, "0");
  // Build keys from the calendar's own year/month state — no Date constructor needed,
  // so there is no timezone conversion and keys always match b.date.slice(0,10).
  const cellKey = d => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const selectedKey = selectedDay ? cellKey(selectedDay) : null;
  const selectedBookings = selectedKey ? (bookingsByDate[selectedKey] || []) : [];
  const visibleStatuses = ["pending", "confirmed", "in-progress", "completed", "cancelled"];

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
                      {dayBks.slice(0, 3).map((b, idx) => {
                          const dotColor =
                            b.status === "pending"      ? "var(--warn)"    :
                            b.status === "confirmed"    ? "var(--info)"    :
                            b.status === "in-progress"  ? "var(--primary)" :
                            b.status === "completed"    ? "var(--success)" :
                            "var(--danger)";
                          return <span key={idx} className="db-cal-dot" style={{ background: dotColor }} />;
                        })}
                      {dayBks.length > 3 && <span className="db-cal-dot-more">+{dayBks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="db-cal-legend">
            {Object.entries(STATUS_META).map(([k, v]) => {
              const dotColor =
                k === "pending"      ? "var(--warn)"    :
                k === "confirmed"    ? "var(--info)"    :
                k === "in-progress"  ? "var(--primary)" :
                k === "completed"    ? "var(--success)" :
                "var(--danger)";
              return (
                <span key={k} className="db-cal-legend-item">
                  <span className="db-cal-dot" style={{ background: dotColor }} />
                  {v.label}
                </span>
              );
            })}
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
                <BookingCard key={b.id} b={b} onStatusChange={handleStatusUpdate} onCancel={handleCancelBooking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini Calendar Card (Overview) ─────────────────────────────────────────────
function MiniCalendarCard({ bookings, loading, onStatusChange, onCancel, onViewAll }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["M","T","W","T","F","S","S"];

  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startDow  = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const bookingsByDate = {};
  (bookings || []).forEach(b => {
    if (!b.date) return;
    const key = b.date.slice(0, 10);
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });

  const pad = n => String(n).padStart(2, "0");
  const cellKey  = d => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const selKey   = selectedDay ? cellKey(selectedDay) : null;
  const selBookings = selKey ? (bookingsByDate[selKey] || []) : [];

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  return (
    <div className="db-card db-mini-cal">
      <div className="db-card-head">
        <h3>Calendar</h3>
        <button className="db-link" onClick={onViewAll}>View all {Icon.arrow}</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="db-mini-cal-nav">
            <button className="db-icon-btn" onClick={() => changeMonth(-1)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="db-mini-cal-month">{MONTH_NAMES[month]} {year}</span>
            <button className="db-icon-btn" onClick={() => changeMonth(1)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="db-mini-cal-grid">
            {DAY_NAMES.map((d, i) => <div key={i} className="db-mini-cal-dayname">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="db-mini-cal-cell db-mini-cal-cell--empty" />;
              const key = cellKey(day);
              const dayBks = bookingsByDate[key] || [];
              const isToday = key === todayStr;
              const isSel   = selectedDay === day;
              return (
                <button
                  type="button"
                  key={key}
                  className={`db-mini-cal-cell${isToday ? " db-mini-cal-cell--today" : ""}${isSel ? " db-mini-cal-cell--selected" : ""}`}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                >
                  <span>{day}</span>
                  {dayBks.length > 0 && <span className="db-mini-cal-dot" />}
                </button>
              );
            })}
          </div>

          <div className="db-mini-cal-detail">
            {!selectedDay ? (
              <p className="db-empty-small">Select a day to see its bookings.</p>
            ) : selBookings.length === 0 ? (
              <p className="db-empty-small">No bookings on {MONTH_NAMES[month]} {selectedDay}.</p>
            ) : (
              <>
                <p className="db-mini-cal-detail-label">
                  {MONTH_NAMES[month]} {selectedDay} — {selBookings.length} booking{selBookings.length !== 1 ? "s" : ""}
                </p>
                <div className="db-mini-cal-bookings">
                  {selBookings.map(b => <BookingCard key={b.id} b={b} onStatusChange={onStatusChange} onCancel={onCancel} />)}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Provider Dashboard ───────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session  = getSession();
  const user     = session?.user;
  const token    = session?.token;
  const userId   = user?.id;
  const name     = user?.name || "Provider";
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const profileImageUrl = resolveImage(user?.profileImage);

  // On mount, honour ?tab= query param (e.g. from "Book Now" redirect)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setTab(tabParam);
      setSearchParams({}, { replace: true }); // clean up the URL
    }
  }, []);

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
    try { setLoadingBookings(true); const res = await fetch(`${API}/dashboard/provider/${userId}/calendar-bookings`, { headers: authHeaders(token) }); const d = await res.json(); setBookings(Array.isArray(d.data) ? d.data : []); }
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

  const handleCalendarStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { fetchBookings(); fetchStats(); }
    } catch (err) { console.error(err); }
  };

  const handleCalendarCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/cancel`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      if (res.ok) { fetchBookings(); fetchStats(); }
      else {
        const err = await res.json().catch(() => ({}));
        console.error("Cancel failed:", err.message || res.status);
      }
    } catch (err) { console.error(err); }
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
          providerName={name}
          providerImageUrl={profileImageUrl}
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
              {/* Mini Calendar (replaces Booking Requests) */}
              <MiniCalendarCard
                bookings={bookings}
                loading={loadingBookings}
                onStatusChange={handleCalendarStatusUpdate}
                onCancel={handleCalendarCancelBooking}
                onViewAll={() => setTab("calendar")}
              />

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