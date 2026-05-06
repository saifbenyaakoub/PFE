import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
import {
  FaBroom, FaWrench, FaLeaf, FaBox,
  FaShieldAlt, FaStar, FaCheckCircle, FaUsers,
  FaArrowRight, FaSearch, FaMapMarkerAlt, FaUserCheck, FaWallet
} from "react-icons/fa";
import { FaGear } from 'react-icons/fa6';
import { getSession } from "../lib/session";

/* ─── spring helpers ─────────────────────────────── */
const STIFFNESS = 160, DAMPING = 18, MASS = 1;
function springStep(cur, vel, target, dt) {
  const force = -STIFFNESS * (cur - target) - DAMPING * vel;
  const acc   = force / MASS;
  const nv    = vel + acc * dt;
  return { v: nv, c: cur + nv * dt };
}

/* ─── slot layout ────────────────────────────────── */
const SLOTS = [
  { x: -258, y: 38,  rot: -22, scale: 0.80, z: 1, opacity: 0.42 },
  { x: -136, y: 8,   rot: -11, scale: 0.90, z: 3, opacity: 0.70 },
  { x:    0, y: -18, rot:   0, scale: 1.00, z: 5, opacity: 1.00 },
  { x:  136, y: 8,   rot:  11, scale: 0.90, z: 3, opacity: 0.70 },
  { x:  258, y: 38,  rot:  22, scale: 0.80, z: 1, opacity: 0.42 },
];

const CATS = [
  { name: "Cleaning",  icon: "🧹", desc: "Home & office deep cleaning",    bg: "#FEF9EC", lbl: "#92400E", colorClass: "cleaning"  },
  { name: "Handyman",  icon: "🔧", desc: "Repairs & installations",         bg: "#EFF6FF", lbl: "#1E40AF", colorClass: "handyman"  },
  { name: "Gardening", icon: "🌿", desc: "Lawn care & planting",            bg: "#F0FDF4", lbl: "#166534", colorClass: "gardening" },
  { name: "Moving",    icon: "📦", desc: "Safe & reliable relocation",      bg: "#FDF4FF", lbl: "#7E22CE", colorClass: "moving"    },
  { name: "Other",     icon: "⚙️", desc: "Browse all other services",       bg: "#F9FAFB", lbl: "#374151", colorClass: "other"     },
];

/* ─── FanCarousel component ──────────────────────── */
function FanCarousel({ activeIdx, onPick }) {
  const stageRef  = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef(null);
  const dragRef   = useRef(null);

  /* spring state: one per card */
  const sp = useRef(
    CATS.map((_, i) => ({
      x: SLOTS[i].x, y: SLOTS[i].y + 90,   /* start below */
      vx: 0, vy: 0,
      rot: SLOTS[i].rot, vrot: 0,
      scale: SLOTS[i].scale, vscale: 0,
      opacity: 0, vop: 0,
    }))
  );

  /* target for each card given current activeIdx */
  const getTarget = useCallback((cardIdx, ai) => {
    const offset  = cardIdx - ai;
    const slotIdx = ((2 + offset) % CATS.length + CATS.length) % CATS.length;
    const s       = SLOTS[slotIdx];
    return {
      x:       s.x,
      y:       s.y,
      rot:     s.rot,
      scale:   cardIdx === ai ? 1.07 : s.scale,
      z:       s.z,
      opacity: s.opacity,
    };
  }, []);

  /* DOM refs for each card */
  const cardRefs = useRef([]);

  /* build cards once */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.innerHTML = '';
    cardRefs.current = [];

    CATS.forEach((cat, i) => {
      const el = document.createElement('div');
      el.className = 'fc';
      el.dataset.idx = i;
      el.innerHTML = `
        <div class="fc-icon">${cat.icon}</div>
        <div class="fc-label">${cat.name}</div>
        <div class="fc-desc">${cat.desc}</div>`;
      el.addEventListener('click',        () => onPick(i));
      el.addEventListener('pointerenter', () => onPick(i));
      stage.appendChild(el);
      cardRefs.current.push(el);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* animation loop */
  useEffect(() => {
    const loop = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;

      sp.current.forEach((s, i) => {
        const tg = getTarget(i, activeIdx);
        const rx = springStep(s.x,       s.vx,     tg.x,       dt);
        const ry = springStep(s.y,       s.vy,     tg.y,       dt);
        const rr = springStep(s.rot,     s.vrot,   tg.rot,     dt);
        const rs = springStep(s.scale,   s.vscale, tg.scale,   dt);
        const ro = springStep(s.opacity, s.vop,    tg.opacity, dt);
        s.x = rx.c; s.vx = rx.v;
        s.y = ry.c; s.vy = ry.v;
        s.rot = rr.c; s.vrot = rr.v;
        s.scale = rs.c; s.vscale = rs.v;
        s.opacity = ro.c; s.vop = ro.v;

        const el = cardRefs.current[i];
        if (!el) return;
        el.style.transform  = `translate(${s.x}px,${s.y}px) rotate(${s.rot}deg) scale(${s.scale})`;
        el.style.opacity    = s.opacity;
        el.style.zIndex     = Math.round(tg.z);
        el.style.boxShadow  = i === activeIdx
          ? `0 ${16 + Math.abs(s.vy) * 4}px 48px rgba(0,0,0,.14), 0 4px 12px rgba(0,0,0,.07)`
          : '0 2px 10px rgba(0,0,0,.055)';
        el.style.background = i === activeIdx ? CATS[i].bg : '';
        el.style.borderColor= i === activeIdx ? 'rgba(0,0,0,.07)' : '';
        el.classList.toggle('active', i === activeIdx);
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIdx, getTarget]);

  /* drag to swipe */
  const onPointerDown = (e) => { dragRef.current = { startX: e.clientX, ai: activeIdx }; };
  const onPointerUp   = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 44) {
      onPick(((activeIdx + (dx < 0 ? 1 : -1)) + CATS.length) % CATS.length);
    }
    dragRef.current = null;
  };

  return (
    <div
      className="fan-section"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="fan-stage" ref={stageRef} />
      <div className="fan-dots">
        {CATS.map((_, i) => (
          <button
            key={i}
            className={`fan-dot${i === activeIdx ? ' active' : ''}`}
            onClick={() => onPick(i)}
            aria-label={CATS[i].name}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── CountUp ────────────────────────────────────── */
function CountUp({ target, duration = 1100 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref      = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      let s = 0;
      const step = target / (duration / 16);
      const iv = setInterval(() => {
        s = Math.min(s + step, target);
        setVal(Math.round(s));
        if (s >= target) clearInterval(iv);
      }, 16);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}</span>;
}

/* ─── ScrollReveal wrapper ───────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref  = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); obs.disconnect(); }
    }, { threshold: 0.07 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`rv${on ? ' rv-on' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── HomePage ───────────────────────────────────── */
function HomePage() {
  const [activeIndex, setActiveIndex]   = useState(2);
  const [searchQuery, setSearchQuery]   = useState('');
  const autoRef = useRef(null);
  const navigate = useNavigate();

  /* redirect if already logged in */
  useEffect(() => {
    const session = getSession();
    if (session?.user) navigate('/', { replace: true });
  }, [navigate]);

  /* auto-rotate fan */
  const scheduleAuto = useCallback(() => {
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      setActiveIndex(p => (p + 1) % CATS.length);
    }, 3600);
  }, []);

  useEffect(() => {
    scheduleAuto();
    return () => clearTimeout(autoRef.current);
  }, [activeIndex, scheduleAuto]);

  const handlePick = (i) => { setActiveIndex(i); scheduleAuto(); };

  const handleExplore = () => {
    const s = getSession();
    navigate(s ? '/services' : '/sign-in');
  };
  const handleCategoryClick = (name) => {
    const s = getSession();
    navigate(s ? `/services?category=${name}` : '/sign-in');
  };
  const handleSearch = (q) => {
    const query = q || searchQuery;
    if (!query.trim()) return;
    const s = getSession();
    navigate(s ? `/services?search=${encodeURIComponent(query)}` : '/sign-in');
  };

  const stats = [
    { value: 12, suffix: "k+", label: "Verified Providers"  },
    { value: 98, suffix: "%",  label: "Client Satisfaction" },
    { value: 48, suffix: "hr", label: "Avg. Match Time"     },
  ];

  const features = [
    { icon: <FaShieldAlt />,   title: "Verified Providers", description: "All providers background-checked for your peace of mind."      },
    { icon: <FaStar />,        title: "Quality Guaranteed",  description: "Honest reviews and ratings from real verified customers."      },
    { icon: <FaCheckCircle />, title: "Easy Booking",        description: "Book the service you need in minutes — no hassle at all."      },
    { icon: <FaUsers />,       title: "Real-Time Tracking",  description: "Track jobs live and message providers directly from the app."  },
  ];

  const testimonials = [
    { quote: "Found a cleaner in under an hour. Booking was seamless and the service was outstanding. Will definitely use again.", name: "Nour Ben Ali",    role: "Client · Tunis",   initials: "NB", avatarBg: "#FEF3C7", avatarColor: "#92400E", stars: 5 },
    { quote: "FixHub gave me steady work without cold outreach. My bookings doubled in the first two months on the platform.",     name: "Karim Mejri",    role: "Provider · Sfax",  initials: "KM", avatarBg: "#DCFCE7", avatarColor: "#166534", stars: 5 },
    { quote: "The task tracking feature is a game changer. I always know exactly where things stand — no more chasing providers.", name: "Leila Trabelsi", role: "Client · Sousse",  initials: "LT", avatarBg: "#DBEAFE", avatarColor: "#1E40AF", stars: 4 },
  ];

  const providerSteps = [
    { num: "01", icon: <FaUserCheck />,  iconBg: "#FEF3C7", iconColor: "#92400E", title: "Create your profile", desc: "Sign up and describe your skills, experience, and availability in minutes."    },
    { num: "02", icon: <FaShieldAlt />,  iconBg: "#DCFCE7", iconColor: "#166534", title: "Get verified",        desc: "Complete our quick background check to earn the trusted verified badge."     },
    { num: "03", icon: <FaMapMarkerAlt />,iconBg:"#DBEAFE", iconColor: "#1E40AF", title: "Receive requests",    desc: "Clients find you and send job requests directly through chats."          },
    { num: "04", icon: <FaWallet />,     iconBg: "#FDF4FF", iconColor: "#7E22CE", title: "Start earning !",     desc: "Start earning money by providing quality services on our platform."        },
  ];

  const popularSearches = ["House Cleaning", "Plumbing", "Garden Trim", "Furniture Assembly", "Moving Help", "Painting"];

  return (
    <div className="home-wrap">

      {/* ── HERO CARD ── */}
      <Reveal className="hero-card">
        <div className="hero-top">

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 40,000+ clients across Tunisia
          </div>

          <h1 className="hero-h">
            Connect with<br />
            <em className="hero-italic">trusted</em> service<br />
            providers
          </h1>

          <p className="hero-sub">
            From cleaning to handyman — find verified professionals
            for every need, fast and hassle-free.
          </p>

          <div className="hero-actions">
            <button className="btn-cta" onClick={handleExplore}>
              Explore Services <FaArrowRight />
            </button>
            <button className="btn-out" onClick={() => navigate('/sign-up?role=provider')}>
              Join as Provider
            </button>
          </div>

          <div className="trust-row">
            {["Background-checked", "Escrow payments", "Real-time tracking", "Free to browse"].map(t => (
              <span key={t} className="trust-item">
                <span className="trust-tick">✓</span>{t}
              </span>
            ))}
          </div>

          {/* Fan carousel */}
          <FanCarousel activeIdx={activeIndex} onPick={handlePick} />
        </div>

        {/* Stats bar */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div className="stat-cell" key={i}>
              <div className="stat-num">
                <CountUp target={s.value} />{s.suffix}
              </div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── MARQUEE ── */}
      <Reveal delay={80} className="mq-wrap">
        <div className="mq-track">
          {["Professional Cleaning","Expert Handyman","Garden & Landscaping","Furniture Assembly","Reliable Moving","Plumbing & Electrical","Interior Painting","Appliance Repair",
            "Professional Cleaning","Expert Handyman","Garden & Landscaping","Furniture Assembly","Reliable Moving","Plumbing & Electrical","Interior Painting","Appliance Repair"
          ].map((t, i) => (
            <span key={i} className="mq-item">
              <span className="mq-dot" />{t}
            </span>
          ))}
        </div>
      </Reveal>

      {/* ── BENTO GRID ── */}
      <div className="bento">

        {/* Why FixHub — tall */}
        <Reveal delay={80} className="card bento-tall">
          <div className="card-pad">
            <div className="eyebrow">Why FixHub</div>
            <h2 className="card-h">Built around<br /><span className="fade">your trust</span></h2>
            <p className="card-p">Every feature designed to make hiring safe and seamless.</p>
            <div className="feat-list">
              {features.map((f, i) => (
                <div className="feat-row" key={i}>
                  <span className="feat-n">0{i + 1}</span>
                  <div>
                    <div className="feat-t">{f.title}</div>
                    <div className="feat-d">{f.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Top Providers */}
        <Reveal delay={160} className="card">
          <div className="card-pad-sm">
            <div className="eyebrow">Top Rated</div>
            <div className="prov-header">
              <h2 className="card-h" style={{ fontSize: 22 }}>
                Trusted<br /><span className="fade">providers</span>
              </h2>
              <button className="btn-dark-sm" onClick={() => navigate('/services')}>Browse →</button>
            </div>
            <div className="prov-list">
              {[
                { initials:"AM", name:"Amine Mejri",    cat:"Cleaning · Tunis",   bg:"#FEF3C7", color:"#92400E", rating:"4.9" },
                { initials:"SB", name:"Sonia Belhaj",   cat:"Gardening · Sousse", bg:"#DCFCE7", color:"#166534", rating:"4.8" },
                { initials:"KT", name:"Karim Trabelsi", cat:"Handyman · Sfax",    bg:"#DBEAFE", color:"#1E40AF", rating:"5.0" },
                { initials:"LB", name:"Lina Bouaziz",   cat:"Moving · Monastir",  bg:"#FCE7F3", color:"#9D174D", rating:"4.7" },
              ].map((p, i) => (
                <div className="prow" key={i}>
                  <div className="prow-l">
                    <div className="prow-ava" style={{ background: p.bg, color: p.color }}>{p.initials}</div>
                    <div>
                      <div className="prow-name">{p.name}</div>
                      <div className="prow-cat">{p.cat}</div>
                    </div>
                  </div>
                  <div className="prow-r">
                    <span className="badge-v">✓ Verified</span>
                    <span className="prow-rating">★ {p.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Search — wide */}
        <Reveal delay={240} className="search-dark bento-wide">
          <div className="eyebrow" style={{ color: '#555' }}>Find Services Near You</div>
          <h2 className="card-h" style={{ color: '#fff' }}>
            What do you need <span style={{ color: '#444' }}>done?</span>
          </h2>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Search by service type or tap a popular request
          </p>
          <div className="sbar">
            <FaSearch style={{ color: '#555', flexShrink: 0 }} />
            <input
              id="homeSearch"
              placeholder="e.g. deep cleaning, pipe repair, garden trim..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={() => handleSearch()}>Search</button>
          </div>
          <div className="pills">
            {popularSearches.map((t, i) => (
              <button key={i} className="pill" onClick={() => handleSearch(t)}>{t}</button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── TESTIMONIALS ── */}
      <Reveal delay={80} className="card">
        <div className="card-pad">
          <div className="section-split">
            <div>
              <div className="eyebrow">Real Reviews</div>
              <h2 className="card-h">What our <span className="fade">users say</span></h2>
            </div>
            <div className="rating-summary">
              <span className="rating-star">★</span>
              4.9 avg · 2,400+ reviews
            </div>
          </div>
          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 80} className="tc">
                <div className="tc-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                <p className="tc-q">"{t.quote}"</p>
                <div className="tc-author">
                  <div className="tc-av" style={{ background: t.avatarBg, color: t.avatarColor }}>{t.initials}</div>
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-role">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── BECOME A PROVIDER ── */}
      <Reveal delay={80} className="card">
        <div className="card-pad">
          <div className="section-split">
            <div>
              <div className="eyebrow">For Professionals</div>
              <h2 className="card-h">Start earning <span className="fade">with FixHub</span></h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn-cta" style={{ fontSize: 14, padding: '11px 22px' }} onClick={() => navigate('/sign-up?role=provider')}>
                Join as Provider <FaArrowRight />
              </button>
              <div className="provider-note">Free · No monthly fees</div>
            </div>
          </div>
          <div className="steps-grid">
            {providerSteps.map((step, i) => (
              <Reveal key={i} delay={i * 80} className="step-card">
                <div className="step-n">Step {step.num}</div>
                <div className="step-ico" style={{ background: step.iconBg, color: step.iconColor }}>
                  {step.icon}
                </div>
                <div className="step-t">{step.title}</div>
                <div className="step-d">{step.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── FINAL CTA ── */}
      <Reveal delay={80} className="cta-card">
        <div className="cta-ring" style={{ animationDelay: '0s' }} />
        <div className="cta-ring" style={{ animationDelay: '1.66s' }} />
        <div className="cta-ring" style={{ animationDelay: '3.33s' }} />
        <div className="cta-inner">
          <div className="cta-badge">
            <span className="hero-badge-dot" />
            Ready to start?
          </div>
          <h2>Join FixHub <span style={{ color: '#444' }}>today</span></h2>
          <p>Thousands of clients and providers across Tunisia trust FixHub.</p>
          <div className="cta-btns">
            <button className="btn-white" onClick={handleExplore}>Find a Provider →</button>
            <button className="btn-ghost-dark" onClick={() => navigate('/how')}>Learn More</button>
          </div>
        </div>
      </Reveal>

    </div>
  );
}

export default HomePage;