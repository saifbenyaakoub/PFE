import React, { useState } from 'react';
import { NavLink, Link } from "react-router-dom";
import { FaHome, FaUser, FaBriefcase, FaBars, FaTimes, FaTasks } from "react-icons/fa";
import { FaScrewdriverWrench } from "react-icons/fa6";
import "./navbar.css";
function Navbar  () {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <FaScrewdriverWrench /> FixHub
      </Link>
      <ul className={isMenuOpen ? "nav-links open" : "nav-links"}>
        <li><NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaHome /> <span>Home</span></NavLink></li>
        <li><NavLink to="/services" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaBriefcase /> <span>Services</span></NavLink></li>
        <li><NavLink to="/tasks" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaTasks /> <span>Tasks</span></NavLink></li>
        <li><NavLink to="/sign-in" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaUser /> <span>Sign in</span></NavLink></li>
        <li><NavLink to="/provider" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}><FaBriefcase /> <span>Provider</span></NavLink></li>
      </ul>
      <div className="menu-icon" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
}

export default Navbar
