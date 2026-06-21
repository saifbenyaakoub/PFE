import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSession } from "../lib/session";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./services.css";
import ServicesFilter from "./ServicesFilter";
import {
  faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faStar, faLocationDot, faXmark, faCheckCircle, faUser, faSearch,
  faSprayCan, faTaxi, faCar, faBroom, faLeaf, faBox, faGear, faTag
} from '@fortawesome/free-solid-svg-icons';

const icons = [faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi, faCar, faBroom, faLeaf, faBox, faGear];

const ENDPOINT = "http://localhost:5000";

const governorateCoordinates = {
  "Tunis": [36.8065, 10.1815], "Ariana": [36.8665, 10.1647], "Ben Arous": [36.746, 10.228],
  "Manouba": [36.808, 10.096], "Nabeul": [36.456, 10.735], "Zaghouan": [36.403, 10.144],
  "Bizerte": [37.2744, 9.8739], "Béja": [36.7256, 9.1817], "Jendouba": [36.501, 8.780],
  "Kef": [36.174, 8.704], "Siliana": [36.083, 9.367], "Kairouan": [35.678, 10.096],
  "Kasserine": [35.167, 8.833], "Sidi Bouzid": [35.033, 9.500], "Sousse": [35.825, 10.641],
  "Monastir": [35.765, 10.826], "Mahdia": [35.504, 11.062], "Sfax": [34.740, 10.760],
  "Gafsa": [34.425, 8.784], "Tozeur": [33.919, 8.134], "Kebili": [33.705, 8.969],
  "Gabès": [33.881, 10.098], "Medenine": [33.355, 10.505], "Tataouine": [32.930, 10.451]
};

const locationIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width:32px;height:32px;fill:#D85A30;"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`,
  className: 'custom-map-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Same pattern as Navbar.js — resolves a relative upload path or passes through
// absolute/blob/data URLs untouched.
const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("data:")) return img;
  return `${ENDPOINT}/uploads/${img}`;
};

// The /services endpoint may alias the provider's image under different keys
// depending on the backend JOIN. Try profileImage first (same field Navbar.js
// uses on the user object), then fall back to other common aliases.
const getProviderImage = (item) =>
  item.profileImage || item.provider_image || item.provider_profileImage || item.providerImage || null;

function ServicesPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");
  const [selectedService, setSelectedService] = useState(null);
  const [sortBy, setSortBy] = useState("");

  const getInitials = (name = '') =>
    name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedService]);

  useEffect(() => {
    fetch("http://localhost:5000/services")
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedCity, setSearchParams]);

  const handleAction = async (item) => {
    const session = getSession();
    if (!session) return navigate('/sign-in');

    if (session.user.role === "client" && item.provider_id) {
      try {
        const response = await fetch("http://localhost:5000/chat/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.token}`
          },
          body: JSON.stringify({ userId: session.user.id, partnerId: item.provider_id }),
        });
        if (response.ok) return navigate("/dashboard?tab=messages");
      } catch (err) {
        console.error("Chat start failed", err);
      }
    }
    setSelectedService(item);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesCity = !selectedCity || item.city === selectedCity;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const sortedAndFilteredItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "Highest Rated") return (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0);
    if (sortBy === "Most Popular (Hires)") return (parseInt(b.hire_count) || 0) - (parseInt(a.hire_count) || 0);
    if (sortBy === "Newest") return b.id - a.id;
    return 0;
  });

  const uniqueCategories = [...new Set(items.map(s => s.category).filter(Boolean))];
  const tunisianCities = Object.keys(governorateCoordinates);

  return (
    <div className="services-container">
      <div className="services-inner">

        {/* ── Banner ── */}
        <header className="services-banner">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="floating-icon" style={{
              left: `${Math.random() * 90}%`,
              "--icon-size": `${Math.random() * 40 + 30}px`,
              animationDelay: `-${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}>
              <FontAwesomeIcon icon={icons[i % icons.length]} />
            </div>
          ))}
          <h1>Find the <em>perfect</em> professional</h1>
          <p>Connect with trusted experts for your home or business needs</p>
        </header>

        {/* ── Search ── */}
        <div className="services-search-wrapper">
          <div className="services-search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search by service title..."
              className="services-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Layout ── */}
        <div className="services-layout">
          <aside className="services-sidebar">
            <ServicesFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={uniqueCategories}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              cities={tunisianCities}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </aside>

          <main className="services-main">
            <div className="services-header">
              <div className="services-header-title">
                <span className="services-tag">Marketplace</span>
                <h2>Available Services</h2>
              </div>
              <span className="services-count">{sortedAndFilteredItems.length} results</span>
            </div>

            <div className="tasks-grid">
              {sortedAndFilteredItems.map((item) => (
                <article
                  key={item.id}
                  className="task-card"
                  onClick={() => getSession() ? setSelectedService(item) : navigate('/sign-in')}
                >
                  {/* ── Card body row: content + aside ── */}
                  <div className="task-card-body">
                    <div className="task-card-content">

                      {/* Avatar + title row */}
                      <div className="task-card-top">
                        {resolveImage(getProviderImage(item)) ? (
                          <img
                            src={resolveImage(getProviderImage(item))}
                            alt={item.provider_name}
                            className="task-avatar task-avatar-img"
                          />
                        ) : (
                          <div className="task-avatar">{getInitials(item.provider_name)}</div>
                        )}
                        <div className="task-card-meta">
                          <h3 className="task-title">{item.title}</h3>
                          <p className="task-client">by <span>{item.provider_name}</span></p>
                        </div>
                      </div>

                      <p className="task-desc">{item.description}</p>

                      {/* Tags row */}
                      <div className="task-tags">
                        {item.category && (
                          <span className="task-tag task-tag--category">
                            <FontAwesomeIcon icon={faTag} />
                            {item.category}
                          </span>
                        )}
                        {item.city && (
                          <span className="task-tag task-tag--location">
                            <FontAwesomeIcon icon={faLocationDot} />
                            {item.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Action aside ── */}
                    <div className="task-card-aside">
                      {item.review_count > 0 ? (
                        <div className="rating-widget">
                          <div className="rating-stars">
                            {[1,2,3,4,5].map(n => (
                              <FontAwesomeIcon
                                key={n}
                                icon={faStar}
                                className={n <= Math.round(parseFloat(item.rate)) ? "rstar rstar--on" : "rstar rstar--off"}
                              />
                            ))}
                          </div>
                          <div className="rating-score-row">
                            <span className="rating-score">{parseFloat(item.rate).toFixed(1)}</span>
                            <span className="rating-outof">/ 5</span>
                          </div>
                          <span className="rating-count">{item.review_count} {parseInt(item.review_count) === 1 ? 'review' : 'reviews'}</span>
                        </div>
                      ) : (
                        <div className="rating-widget rating-widget--new">
                          <span className="new-badge-dot" />
                          <span className="new-badge-label">New</span>
                          <span className="new-badge-sub">No reviews yet</span>
                        </div>
                      )}
                      <button
                        className="task-book-btn"
                        onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── Modal via portal ── */}
      {selectedService && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedService(null)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="modal-main">
              <div className="modal-map">
                <MapContainer
                  center={governorateCoordinates[selectedService.city] || [36.8065, 10.1815]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={governorateCoordinates[selectedService.city] || [36.8065, 10.1815]}
                    icon={locationIcon}
                  />
                </MapContainer>
              </div>

              <span className="modal-category">{selectedService.category}</span>
              <h2 className="modal-title">{selectedService.title}</h2>

              <div className="modal-meta">
                <div className="modal-meta-poster">
                  {resolveImage(getProviderImage(selectedService)) ? (
                    <img
                      src={resolveImage(getProviderImage(selectedService))}
                      alt={selectedService.provider_name}
                      className="modal-poster-avatar modal-poster-avatar-img"
                    />
                  ) : (
                    <div className="modal-poster-avatar">{getInitials(selectedService.provider_name)}</div>
                  )}
                  <span>{selectedService.provider_name}</span>
                </div>
                {selectedService.city && (
                  <div className="modal-meta-item">
                    <FontAwesomeIcon icon={faLocationDot} /> {selectedService.city}
                  </div>
                )}
              </div>

              <p className="modal-desc">{selectedService.description}</p>
            </div>

            <aside className="modal-aside">
              <h3>Book Service</h3>
              <p>The provider will be notified of your request instantly.</p>

              {selectedService.review_count > 0 ? (
                <div className="rating-widget rating-widget--modal">
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(n => (
                      <FontAwesomeIcon
                        key={n}
                        icon={faStar}
                        className={n <= Math.round(parseFloat(selectedService.rate)) ? "rstar rstar--on" : "rstar rstar--off"}
                      />
                    ))}
                  </div>
                  <div className="rating-score-row">
                    <span className="rating-score">{parseFloat(selectedService.rate).toFixed(1)}</span>
                    <span className="rating-outof">/ 5</span>
                  </div>
                  <span className="rating-count">{selectedService.review_count} {parseInt(selectedService.review_count) === 1 ? 'review' : 'reviews'}</span>
                </div>
              ) : (
                <div className="rating-widget rating-widget--new rating-widget--modal">
                  <span className="new-badge-dot" />
                  <span className="new-badge-label">New Provider</span>
                  <span className="new-badge-sub">Be the first to review!</span>
                </div>
              )}

              <button className="modal-book-btn" onClick={() => handleAction(selectedService)}>
                <FontAwesomeIcon icon={faCheckCircle} /> Confirm Booking
              </button>

              <div className="modal-notice">
                Communication will be available via chat once confirmed.
              </div>
            </aside>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ServicesPage;