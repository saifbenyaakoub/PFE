import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaBriefcase, FaBars, FaTimes, FaTasks, FaComments, FaThLarge } from 'react-icons/fa';
import { FaScrewdriverWrench } from "react-icons/fa6";
import { getSession, clearSession } from "../lib/session";
import io from 'socket.io-client';
import "./navbar.css";

const ENDPOINT = "http://localhost:5000";

// Parses notification content — plain string or JSON (including quotation shape).
// Returns { title, message, quotation } where quotation is non-null for quotation type.
const parseNotifContent = (raw) => {
  if (!raw) return { title: '', message: '', quotation: null };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.type === 'quotation') {
        const status = parsed.status || 'pending';
        return {
          title: 'Quotation',
          message: `Total: ${parsed.amount ? '$' + parsed.amount : '—'} · ${parsed.duration || ''}`,
          quotation: {
            items: parsed.items || [],
            duration: parsed.duration || '',
            startDate: parsed.startDate || '',
            amount: parsed.amount || '0',
            status,
          }
        };
      }
      const title   = parsed.title   || parsed.subject || parsed.type    || '';
      const message = parsed.message || parsed.body    || parsed.content || parsed.text || '';
      return { title, message: message || title, quotation: null };
    }
  } catch (_) { /* not JSON */ }
  return { title: '', message: raw, quotation: null };
};

function Navbar() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen]     = useState(false);
  const [session, setSession]               = useState(() => getSession());
  const [scrolled, setScrolled]             = useState(false);
  const dropdownRef                         = useRef(null);
  const notifsRef                           = useRef(null);
  const navigate                            = useNavigate();
  const socketRef                           = useRef(null);

  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) return img;
    return `http://localhost:5000/uploads/${img}`;
  };

  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!session?.user || !session?.token) return;
    try {
      await fetch(`${ENDPOINT}/chat/notifications/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify({ userId: session.user.id })
      });
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const markOneRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync session
  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('session:updated', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('session:updated', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Outside click closes dropdowns
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (notifsRef.current  && !notifsRef.current.contains(e.target))  setIsNotifsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Notifications + socket
  useEffect(() => {
    if (!session?.user || !session?.token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${ENDPOINT}/chat/notifications?userId=${session.user.id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.map(n => {
            const { title, message, quotation } = parseNotifContent(n.content);
            const rawContent = n.content || '';
            const isQuotation = quotation !== null;
            return {
              id: n.id,
              messageId: n.message_id || null,
              icon: isQuotation
                ? (quotation.status === 'accepted' ? '\u2705' : quotation.status === 'rejected' ? '\u274c' : '\ud83d\udcdd')
                : n.type === 'quotation_update'
                  ? (rawContent.includes('accepted') ? '\u2705' : '\u274c')
                  : '\ud83d\udcac',
              title: isQuotation ? title : n.type !== 'message' ? title : '',
              text: n.type === 'message'
                ? `${n.actor_name || 'New message'}: ${message}`
                : message,
              quotation: isQuotation ? quotation : null,
              time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: n.is_read
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();

    const s = io(ENDPOINT);
    socketRef.current = s;
    s.emit("joinUserNotifications", session.user.id);

    s.on("newMessageNotification", (data) => {
      const { message } = parseNotifContent(data.text);
      setNotifications(prev => [{
        id: data.id || Date.now(),
        icon: "\ud83d\udcac",
        title: '',
        text: data.senderName ? `${data.senderName}: ${message}` : message,
        quotation: null,
        time: "Just now",
        read: false
      }, ...prev]);
    });

    s.on("quotationResponse", (data) => {
      // Update the status of an existing quotation notification in-place
      setNotifications(prev => prev.map(n => {
        if (!n.quotation) return n;
        if (data.messageId && n.messageId && String(n.messageId) !== String(data.messageId)) return n;
        const newStatus = data.status;
        return {
          ...n,
          icon: newStatus === 'accepted' ? '✅' : newStatus === 'rejected' ? '❌' : '📝',
          quotation: { ...n.quotation, status: newStatus },
          read: false,
        };
      }));
    });

    s.on("notification", (data) => {
      const { title, message, quotation } = parseNotifContent(data.text || data.content);
      const isQuotation = quotation !== null;
      setNotifications(prev => [{
        id: data.id || Date.now(),
        icon: isQuotation
          ? (quotation.status === 'accepted' ? '\u2705' : quotation.status === 'rejected' ? '\u274c' : '\ud83d\udcdd')
          : data.icon || "\ud83d\udd14",
        title,
        text: message,
        quotation: isQuotation ? quotation : null,
        time: "Just now",
        read: false
      }, ...prev]);
    });

    return () => s.disconnect();
  }, [session]);

  const toggleMenu     = () => setIsMenuOpen(p => !p);
  const closeMenu      = () => setIsMenuOpen(false);
  const toggleDropdown = () => { setIsDropdownOpen(p => !p); setIsNotifsOpen(false); };
  const toggleNotifs   = () => { setIsNotifsOpen(p => !p);   setIsDropdownOpen(false); };

  const handleSignOut = () => {
    clearSession();
    setIsDropdownOpen(false);
    closeMenu();
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/sign-in');
  };

  const user     = session?.user;
  const name     = user?.name || user?.username || user?.email || '';
  const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (user?.role === 'admin') return null;

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* Logo */}
        <Link to={session ? "/Dashboard" : "/"} className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo-icon"><FaScrewdriverWrench /></span>
          <span className="navbar-logo-text">Fix<em>Hub</em></span>
        </Link>

        {/* Center nav links */}
        <ul className={`navbar-links${isMenuOpen ? ' navbar-links--open' : ''}`}>
          <li>
            <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              <FaHome className="nav-link-icon" /><span>Home</span>
            </NavLink>
          </li>
          {user?.role !== 'provider' && (
            <li>
              <NavLink to="/services" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                <FaBriefcase className="nav-link-icon" /><span>Services</span>
              </NavLink>
            </li>
          )}
          {user?.role !== 'client' && (
            <li>
              <NavLink to="/tasks" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                <FaTasks className="nav-link-icon" /><span>Tasks</span>
              </NavLink>
            </li>
          )}
          {session && (
            <li>
              <NavLink to="/Dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                <FaThLarge className="nav-link-icon" /><span>Dashboard</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Right side */}
        <div className="navbar-right">
          {session ? (
            <div className="navbar-user-wrap">

              {/* Notifications */}
              <div className="notif-wrap" ref={notifsRef}>
                <button className="notif-btn" onClick={toggleNotifs} aria-label="Notifications">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {isNotifsOpen && (
                  <div className="notif-panel">
                    <div className="notif-panel-header">
                      <span className="notif-panel-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            className={`notif-item${n.read ? '' : ' notif-item--unread'}${n.quotation ? ' notif-item--quotation' : ''}`}
                            onClick={() => markOneRead(n.id)}
                          >
                            <span className="notif-item-icon">{n.icon}</span>
                            <div className="notif-item-body">
                              {n.quotation ? (
                                <>
                                  <p className="notif-item-title">
                                    Quotation
                                    <span className={`notif-quotation-badge notif-quotation-badge--${n.quotation.status}`}>
                                      {n.quotation.status}
                                    </span>
                                  </p>
                                  <div className="notif-quotation-card">
                                    {n.quotation.items.slice(0, 2).map((item, i) => (
                                      <div key={i} className="notif-quotation-row">
                                        <span className="notif-quotation-desc">{item.description || item.name || 'Item'}</span>
                                        <span className="notif-quotation-price">${parseFloat(item.unitPrice || item.price || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    {n.quotation.items.length > 2 && (
                                      <p className="notif-quotation-more">+{n.quotation.items.length - 2} more item{n.quotation.items.length - 2 > 1 ? 's' : ''}</p>
                                    )}
                                    <div className="notif-quotation-footer">
                                      <span className="notif-quotation-meta">{n.quotation.duration}{n.quotation.startDate ? ` · ${n.quotation.startDate}` : ''}</span>
                                      <span className="notif-quotation-total">${parseFloat(n.quotation.amount).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </>
                              ) : n.title ? (
                                <>
                                  <p className="notif-item-title">{n.title}</p>
                                  <p className="notif-item-text">{n.text}</p>
                                </>
                              ) : (
                                <p className="notif-item-text">{n.text}</p>
                              )}
                              <span className="notif-item-time">{n.time}</span>
                            </div>
                            {!n.read && <span className="notif-unread-dot" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar + dropdown */}
              <div ref={dropdownRef}>
                <button className="user-trigger" onClick={toggleDropdown}>
                  {resolveImage(user?.profileImage) ? (
                    <img src={resolveImage(user.profileImage)} alt={name} className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-initials">{initials}</div>
                  )}
                  <span className="user-trigger-name">{name.split(' ')[0]}</span>
                  <svg
                    className={`user-chevron${isDropdownOpen ? ' user-chevron--open' : ''}`}
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      {resolveImage(user?.profileImage) ? (
                        <img src={resolveImage(user.profileImage)} alt={name} className="dropdown-avatar-img" />
                      ) : (
                        <div className="dropdown-avatar-initials">{initials}</div>
                      )}
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{name}</span>
                        <span className="dropdown-email">{user?.email || ''}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => { setIsDropdownOpen(false); closeMenu(); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Edit Profile
                    </Link>

                    <div className="dropdown-divider" />

                    <button className="dropdown-item dropdown-signout" onClick={handleSignOut}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-auth-btns">
              <NavLink to="/sign-in" className="btn-signin" onClick={closeMenu}>Sign in</NavLink>
              <NavLink to="/sign-up" className="btn-signup" onClick={closeMenu}>Get started</NavLink>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;