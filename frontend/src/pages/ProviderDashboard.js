import React, { useState } from "react";
import "./providerDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faCheckCircle,
  faCalendar,
  faStar,
  faEye,
  faBriefcase,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Track your performance and manage your services</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Earnings</span>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <h2>$90</h2>
          <p className="positive">+12.5% from last month</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Completed Tasks</span>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h2>1</h2>
          <p className="positive">+8 this week</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Active Bookings</span>
            <FontAwesomeIcon icon={faCalendar} />
          </div>
          <h2>3</h2>
          <p>Scheduled this week</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Client Satisfaction</span>
            <FontAwesomeIcon icon={faStar} />
          </div>
          <h2>4.9/5.0</h2>
          <p>Based on 127 reviews</p>
        </div>
      </div>

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "recent" ? "active" : ""}
          onClick={() => setActiveTab("recent")}
        >
          Recent Bookings
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile Stats
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "overview" && <Overview />}
      {activeTab === "recent" && <RecentBookings />}
      {activeTab === "profile" && <ProfileStats />}
    </div>
  );
}

/* ===============================
   OVERVIEW TAB
================================= */

function Overview() {
  return (
    <div className="dashboard-content">

      {/* Upcoming Schedule */}
      <div className="card">
        <h3>Upcoming Schedule</h3>
        <p className="subtitle">Your next appointments</p>

        <div className="schedule-item">
          <div className="date">
            <span className="day">08</span>
            <span className="month">FEB</span>
          </div>
          <div className="info">
            <h4>Deep House Cleaning</h4>
            <p>123 Market St, San Francisco</p>
            <div className="badge">10:00 AM</div>
            <span className="price">$140</span>
          </div>
        </div>

        <div className="schedule-item">
          <div className="date">
            <span className="day">05</span>
            <span className="month">FEB</span>
          </div>
          <div className="info">
            <h4>Daily Dog Walking</h4>
            <p>456 Pine St, San Francisco</p>
            <div className="badge">09:00 AM</div>
            <span className="price">$60</span>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ===============================
   RECENT BOOKINGS TAB
================================= */

function RecentBookings() {
  return (
    <div className="tab-card bookings-card">
      <h3>Recent Bookings</h3>
      <p className="subtitle">
        Latest service requests and completions
      </p>

      <BookingItem
        title="Deep House Cleaning"
        status="accepted"
        amount="$140"
        date="Feb 08, 2026 • 10:00 AM"
        address="123 Market St, San Francisco"
      />

      <BookingItem
        title="Daily Dog Walking"
        status="in-progress"
        amount="$30"
        date="Feb 05, 2026 • 03:00 PM"
        address="456 Pine St, San Francisco"
      />

      <BookingItem
        title="Fix Leaky Faucet"
        status="completed"
        amount="$90"
        date="Feb 02, 2026 • 02:00 PM"
        address="123 Market St, San Francisco"
      />
    </div>
  );
}

function BookingItem({ title, status, amount, date, address }) {
  return (
    <div className="booking-item">
      <div>
        <div className="booking-header">
          <h4>{title}</h4>
          <span className={`status ${status}`}>{status}</span>
        </div>

        <p className="booking-date">{date}</p>
        <p className="booking-address">{address}</p>
      </div>

      <div className="booking-right">
        <span className="amount">{amount}</span>
        <button className="details-btn">View Details ↗</button>
      </div>
    </div>
  );
}

/* ===============================
   PROFILE STATS TAB
================================= */

function ProfileStats() {
  return (
    <div className="tab-card profile-card">
      <h3>Profile Statistics</h3>
      <p className="subtitle">
        Your public profile performance
      </p>

      <div className="profile-header">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="profile"
          className="profile-avatar"
        />

        <div className="profile-info">
          <h2>Sarah Johnson</h2>
          <p>House Cleaning</p>
          <p className="rating">⭐ 4.9 (127 reviews)</p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faEye} />
          </div>
          <h2>1,247</h2>
          <p>Profile Views</p>
        </div>

        <div className="profile-stat">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBriefcase} />
          </div>
          <h2>156</h2>
          <p>Total Jobs</p>
        </div>

        <div className="profile-stat">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <h2>94%</h2>
          <p>Success Rate</p>
        </div>
      </div>

      <button className="edit-profile-btn">Edit Profile</button>
    </div>
  );
}

export default Dashboard;
