import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
import { FaBroom, FaWrench, FaLeaf, FaBox, FaShieldAlt, FaStar, FaCheckCircle, FaUsers, FaArrowRight, FaSearch, FaMapMarkerAlt, FaUserCheck, FaWallet } from "react-icons/fa";
import { FaGear } from 'react-icons/fa6';
import { getSession } from "../lib/session";

function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { name: "Cleaning", icon: <FaBroom />, colorClass: "cleaning", description: "Top-rated cleaning professionals for home or office." },
    { name: "Handyman", icon: <FaWrench />, colorClass: "handyman", description: "Repairs, installations, and all kinds of odd jobs." },
    { name: "Gardening", icon: <FaLeaf />, colorClass: "gardening", description: "Lawn care, planting, trimming and maintenance." },
    { name: "Moving", icon: <FaBox />, colorClass: "moving", description: "Reliable movers to help with your next relocation." },
    { name: "Other", icon: <FaGear />, colorClass: "other", description: "Explore a variety of other professional services." }
  ];

  const features = [
    { icon: <FaShieldAlt />, title: "Verified Providers", description: "All service providers are background-checked for your peace of mind." },
    { icon: <FaStar />, title: "Quality Guaranteed", description: "Read honest reviews and ratings from real verified customers." },
    { icon: <FaCheckCircle />, title: "Easy Booking", description: "Book the service you need in minutes with our intuitive platform." },
    { icon: <FaUsers />, title: "Task Tracking", description: "Track jobs in real-time and message providers directly." }
  ];

  const slideImages = [
    "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/5691597/pexels-photo-5691597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/6195951/pexels-photo-6195951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/424620/pexels-photo-424620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/8952545/pexels-photo-8952545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  ];

  const stats = [
    { value: "12k+", label: "Verified Providers" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "48hr", label: "Avg. Match Time" }
  ];

  const testimonials = [
    { quote: "Found a cleaner in under an hour. Booking was seamless and the service was outstanding. Will definitely use again.", name: "Nour Ben Ali", role: "Client · Tunis", initials: "NB", colorBg: "#E6F1FB", colorText: "#185FA5", stars: 5 },
    { quote: "As a handyman, FixHub gave me steady work without cold outreach. My bookings doubled in the first two months.", name: "Karim Mejri", role: "Provider · Sfax", initials: "KM", colorBg: "#E1F5EE", colorText: "#0F6E56", stars: 5 },
    { quote: "The task tracking feature is a game changer. I always know where things stand — no more chasing providers.", name: "Leila Trabelsi", role: "Client · Sousse", initials: "LT", colorBg: "#FAEEDA", colorText: "#854F0B", stars: 4 }
  ];

  const providerSteps = [
    { num: "01", icon: <FaUserCheck />, iconBg: "#FAECE7", iconColor: "#993C1D", title: "Create your profile", desc: "Sign up and describe your skills, experience, and availability in minutes." },
    { num: "02", icon: <FaShieldAlt />, iconBg: "#E1F5EE", iconColor: "#0F6E56", title: "Get verified", desc: "Complete our quick background check to earn the trusted verified badge." },
    { num: "03", icon: <FaMapMarkerAlt />, iconBg: "#E6F1FB", iconColor: "#185FA5", title: "Receive requests", desc: "Clients find you and send job requests directly to your dashboard." },
    { num: "04", icon: <FaWallet />, iconBg: "#FAEEDA", iconColor: "#854F0B", title: "Get paid safely", desc: "Funds released via escrow once the client confirms the job is done." }
  ];

  const popularSearches = ["House Cleaning", "Plumbing", "Garden Trim", "Furniture Assembly", "Moving Help", "Painting"];

  useEffect(() => {
    const session = getSession();
    if (session?.user) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % categories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const handleExplore = () => {
    const session = getSession();
    navigate(session ? '/services' : '/sign-in');
  };

  const handleCategoryClick = (catName) => {
    const session = getSession();
    navigate(session ? `/services?category=${catName}` : '/sign-in');
  };

  const handleSearch = (query) => {
    const q = query || searchQuery;
    if (!q.trim()) return;
    const session = getSession();
    navigate(session ? `/services?search=${encodeURIComponent(q)}` : '/sign-in');
  };

  return (
    <div className="home-container">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 40,000+ clients
          </div>
          <h1 className="hero-title">
            Connect with <em>trusted</em> service providers
          </h1>
          <p className="hero-subtitle">
            From cleaning to handyman services — find reliable professionals
            for every need, fast and hassle-free.
          </p>
          <button className="cta-button hero-cta" onClick={handleExplore}>
            Explore Services <FaArrowRight className="cta-arrow" />
          </button>
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div className="hero-stat" key={i}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container">
            {slideImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`${categories[index].name} service`}
                className={`hero-image ${index === activeIndex ? 'visible' : ''}`}
              />
            ))}
          </div>
          {/* floating active category label */}
          <div className="hero-float-label">
            <span className="float-icon">{categories[activeIndex].icon}</span>
            <span className="float-name">{categories[activeIndex].name}</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories">
        <div className="section-header">
          <span className="section-tag">What we offer</span>
          <h2>Popular Categories</h2>
          <p className="subtitle">Hover to explore, click to book</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-card ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className={`cat-icon-wrap ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <h3>{cat.name}</h3>
              <p className="description">{cat.description}</p>
              <span className="cat-arrow"><FaArrowRight /></span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY FIXHUB ── */}
      <section className="why-section">
        <div className="why-inner">
          <div className="section-header">
            <span className="section-tag">Why FixHub</span>
            <h2>Built around your trust</h2>
            <p className="subtitle">The best platform for reliable service connections</p>
          </div>
          <div className="why-grid">
            {features.map((feature, index) => (
              <div key={index} className="why-card">
                <div className="why-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART SEARCH ── */}
      <section className="search-section">
        <div className="search-inner">
          <div className="section-header">
            <span className="section-tag">Find services near you</span>
            <h2>What do you need done?</h2>
            <p className="subtitle">Search by service type or browse popular requests below</p>
          </div>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="e.g. deep cleaning, pipe repair, garden trim..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button className="search-btn" onClick={() => handleSearch()}>
              Search
            </button>
          </div>
          <div className="popular-pills">
            <span className="pills-label">Popular:</span>
            {popularSearches.map((term, i) => (
              <button key={i} className="search-pill" onClick={() => handleSearch(term)}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="testimonials-inner">
          <div className="section-header">
            <span className="section-tag">Real reviews</span>
            <h2>What our users say</h2>
            <p className="subtitle">Trusted by clients and providers across Tunisia</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className={s < t.stars ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
                <p className="testi-quote">"{t.quote}"</p>
                <div className="testi-person">
                  <div className="testi-avatar" style={{ background: t.colorBg, color: t.colorText }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME A PROVIDER ── */}
      <section className="provider-section">
        <div className="provider-inner">
          <div className="provider-header">
            <div>
              <span className="section-tag">For professionals</span>
              <h2 className="provider-title">Start earning with FixHub</h2>
              <p className="subtitle">Join thousands of verified providers already growing their business.</p>
            </div>
            <div className="provider-header-actions">
              <button className="cta-button" onClick={() => navigate('/sign-up?role=provider')}>
                Join as a Provider <FaArrowRight className="cta-arrow" />
              </button>
              <span className="provider-note">Free to join · No monthly fees</span>
            </div>
          </div>
          <div className="provider-steps">
            {providerSteps.map((step, i) => (
              <div key={i} className="provider-step-card">
                <span className="step-num">{step.num}</span>
                <div className="step-icon" style={{ background: step.iconBg, color: step.iconColor }}>
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-deco cta-deco-1" />
          <div className="cta-deco cta-deco-2" />
          <h2>Ready to get started?</h2>
          <p>Join thousands of satisfied customers and providers on FixHub today.</p>
          <button className="cta-button cta-white" onClick={handleExplore}>
            Find a Service Provider <FaArrowRight className="cta-arrow" />
          </button>
        </div>
      </section>

    </div>
  );
}

export default HomePage;