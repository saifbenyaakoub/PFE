
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaBriefcase, FaBars, FaTimes, FaTasks } from 'react-icons/fa';
import { FaScrewdriverWrench } from "react-icons/fa6";
import { getSession, clearSession } from "../lib/session";
import "./navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen]     = useState(false);
  const [session, setSession]               = useState(() => getSession());
  const dropdownRef                         = useRef(null);
  const notifsRef                           = useRef(null);
  const navigate                            = useNavigate();

  // Mock notifications — replace with real API call
  const [notifications, setNotifications] = useState([
    { id:1, read:false, icon:"📋", text:'A provider applied to your task "Fix leaking pipe"', time:"2 min ago" },
    { id:2, read:false, icon:"✅", text:"Your booking with Karim Mejri is confirmed",          time:"1 hr ago"  },
    { id:3, read:false, icon:"⭐", text:"Nour Belhaj left you a review",                       time:"3 hr ago"  },
    { id:4, read:true,  icon:"🔧", text:'Your task "Electrical panel" is in progress',         time:"Yesterday" },
    { id:5, read:true,  icon:"💬", text:"New message from Ines Ferchichi",                     time:"Yesterday" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markOneRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  // Reactive session — updates navbar avatar/name after profile save
  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('session:updated', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('session:updated', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setIsNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu     = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu      = () => setIsMenuOpen(false);
  const toggleDropdown = () => { setIsDropdownOpen(prev => !prev); setIsNotifsOpen(false); };
  const toggleNotifs   = () => { setIsNotifsOpen(prev => !prev);   setIsDropdownOpen(false); };

  const handleSignOut = () => {
    clearSession();
    setIsDropdownOpen(false);
    closeMenu();
    navigate('/sign-in');
  };

  const user     = session?.user;
  const name     = user?.name || user?.username || user?.email || '';
  const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <FaScrewdriverWrench /> FixHub
      </Link>

      <div className={isMenuOpen ? "nav-content open" : "nav-content"}>
        <ul className="nav-links">
          <li><NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaHome /> <span>Home</span></NavLink></li>
          <li>
            <NavLink to="/services" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaBriefcase /> <span>Services</span></NavLink>
          </li>
          <li>
            <NavLink to="/tasks" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaTasks /> <span>Tasks</span></NavLink>
          </li>
        </ul>

        <div className="nav-auth">
          {session ? (
            <div className="nav-user-wrap" ref={dropdownRef}>
              
              {/* ── Bell ───────────────────────────────────────── */}
              <div className="nav-notif-wrap" ref={notifsRef}>
                <button
                  className="nav-notif-btn"
                  onClick={toggleNotifs}
                  aria-label="Notifications"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="nav-notif-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* ── Notification panel ─────────────────────── */}
                {isNotifsOpen && (
                  <div className="nav-notif-panel">
                    <div className="nav-notif-panel-header">
                      <span className="nav-notif-panel-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="nav-notif-markall" onClick={markAllRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="nav-notif-list">
                      {notifications.length === 0 ? (
                        <div className="nav-notif-empty">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            className={`nav-notif-item ${n.read ? "" : "nav-notif-item--unread"}`}
                            onClick={() => markOneRead(n.id)}
                          >
                            <span className="nav-notif-icon">{n.icon}</span>
                            <div className="nav-notif-body">
                              <p className="nav-notif-text">{n.text}</p>
                              <span className="nav-notif-time">{n.time}</span>
                            </div>
                            {!n.read && <span className="nav-notif-dot" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Trigger ────────────────────────────────────── */}
              <button className="nav-user-trigger" onClick={toggleDropdown}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={name} className="nav-avatar-img" />
                ) : (
                  <div className="nav-avatar-initials">{initials}</div>
                )}
                <span className="nav-user-name">{name}</span>
                <svg
                  className={`nav-chevron ${isDropdownOpen ? 'nav-chevron--open' : ''}`}
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* ── Dropdown ───────────────────────────────────── */}
              {isDropdownOpen && (
                <div className="nav-dropdown">

                  <div className="nav-dropdown-header">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={name} className="nav-dropdown-avatar" />
                    ) : (
                      <div className="nav-dropdown-initials">{initials}</div>
                    )}
                    <div className="nav-dropdown-info">
                      <span className="nav-dropdown-name">{name}</span>
                      <span className="nav-dropdown-email">{user?.email || ''}</span>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  <Link
                    to="Dashboard"
                    className="nav-dropdown-item"
                    onClick={() => { setIsDropdownOpen(false); closeMenu(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="nav-dropdown-item"
                    onClick={() => { setIsDropdownOpen(false); closeMenu(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Edit Profile
                  </Link>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item nav-dropdown-signout" onClick={handleSignOut}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>

                </div>
              )}
            </div>
          ) : (
            <NavLink to="/sign-in" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
              <FaUser /> <span>Sign in</span>
            </NavLink>
          )}
        </div>
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
}

export default Navbar;