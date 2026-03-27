
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaBriefcase, FaBars, FaTimes, FaTasks, FaBroom, FaWrench, FaLeaf, FaBox, FaComments } from "react-icons/fa";
import { FaScrewdriverWrench, FaGear } from "react-icons/fa6";
import { getSession, clearSession } from "../lib/session";
import "./navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen]       = useState(false);
  const [session, setSession]               = useState(() => getSession());
  const dropdownRef                         = useRef(null);
  const servicesTimeoutRef                  = useRef(null);
  const tasksTimeoutRef                     = useRef(null);
  const navigate                            = useNavigate();

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu     = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu      = () => setIsMenuOpen(false);
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const handleSignOut = () => {
    clearSession();
    setIsDropdownOpen(false);
    closeMenu();
    navigate('/sign-in');
  };

  const user     = session?.user;
  const name     = user?.name || user?.username || user?.email || '';
  const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const API_URL = "http://localhost:5000";
  const profileImageUrl = user?.profileImage 
    ? `${API_URL}/uploads/${user.profileImage}` 
    : null;

  const serviceCategories = [
    { name: "Cleaning", icon: <FaBroom /> },
    { name: "Handyman", icon: <FaWrench /> },
    { name: "Gardening", icon: <FaLeaf /> },
    { name: "Moving", icon: <FaBox /> },
    { name: "Other", icon: <FaGear /> }
  ];

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
  };

  const handleTasksEnter = () => {
    if (tasksTimeoutRef.current) clearTimeout(tasksTimeoutRef.current);
    setIsTasksOpen(true);
  };

  const handleTasksLeave = () => {
    tasksTimeoutRef.current = setTimeout(() => {
      setIsTasksOpen(false);
    }, 150);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <FaScrewdriverWrench /> FixHub
      </Link>

      <div className={isMenuOpen ? "nav-content open" : "nav-content"}>
        <ul className="nav-links">
          <li><NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaHome /> <span>Home</span></NavLink></li>
          <li
            onMouseEnter={handleServicesEnter}
            onMouseLeave={handleServicesLeave}
          >
            <NavLink to="/services" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaBriefcase /> <span>Services</span></NavLink>
            <div
              className={`absolute top-full left-0 w-full bg-[#18181b] border-t border-[#27272a] shadow-xl z-50 flex justify-center transition-all duration-300 ease-in-out ${
                isServicesOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-8 py-5">
                {serviceCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/services?category=${cat.name}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                    onClick={() => { setIsServicesOpen(false); closeMenu(); }}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
          <li
            onMouseEnter={handleTasksEnter}
            onMouseLeave={handleTasksLeave}
          >
            <NavLink to="/tasks" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaTasks /> <span>Tasks</span></NavLink>
            <div
              className={`absolute top-full left-0 w-full bg-[#18181b] border-t border-[#27272a] shadow-xl z-50 flex justify-center transition-all duration-300 ease-in-out ${
                isTasksOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-8 py-5">
                {serviceCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/tasks?category=${cat.name}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                    onClick={() => { setIsTasksOpen(false); closeMenu(); }}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
          <li><NavLink to="/chat" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaComments /> <span>Messages</span></NavLink></li>
        </ul>

        <div className="nav-auth">
          {session ? (
            <div className="nav-user-wrap" ref={dropdownRef}>
              
              {/* ── Trigger ────────────────────────────────────── */}
              <button className="nav-user-trigger" onClick={toggleDropdown}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={name} className="nav-avatar-img" />
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
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt={name} className="nav-dropdown-avatar" />
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
