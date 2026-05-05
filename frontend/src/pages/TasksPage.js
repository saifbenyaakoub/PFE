import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi, faCar,
  faBroom, faLeaf, faBox, faGear, faStar, faLocationDot, faXmark, faCheckCircle, faUser, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { getSession } from "../lib/session";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./services.css"; // Connecting to the newly aligned CSS
import ServicesFilter from "./ServicesFilter";

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
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 32px; height: 32px; fill: #D85A30;"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`,
  className: 'custom-map-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function TasksPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const session = getSession();
  const isProvider = session?.user?.role === "provider";
  const providerCategories = Array.isArray(session?.user?.categories) 
    ? session.user.categories 
    : (session?.user?.categories?.split(',').map(c => c.trim()) || []);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");
  const [selectedTask, setSelectedTask] = useState(null);

  const getInitials = (name = '') => name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const icons = [faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi, faCar, faBroom, faLeaf, faBox, faGear];
  const tunisianCities = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja", 
    "Jendouba", "Kef", "Siliana", "Kairouan", "Kasserine", "Sidi Bouzid", "Sousse", 
    "Monastir", "Mahdia", "Sfax", "Gafsa", "Tozeur", "Kebili", "Gabès", "Medenine", "Tataouine"
  ];

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then(res => res.json())
      .then(data => setItems(data))
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
    if (session) {
      if (item && item.id) {
        if (session.user.role === "provider" && item.client_id) {
          try {
            const response = await fetch("http://localhost:5000/chat/start", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`
              },
              body: JSON.stringify({ userId: session.user.id, partnerId: item.client_id }),
            });
            if (response.ok) {
              navigate("/chat");
              return;
            }
          } catch (err) {
            console.error("Failed to start conversation", err);
          }
        }
        setSelectedTask(item);
      }
    } else {
      navigate('/sign-in');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;    
    const matchesCity = selectedCity ? item.city === selectedCity : true;
    const matchesProviderSkills = isProvider && providerCategories.length > 0
      ? providerCategories.includes(item.category)
      : true;
    return matchesSearch && matchesCategory && matchesCity && matchesProviderSkills;
  });

  const uniqueCategories = [...new Set(items.map(s => s.category).filter(Boolean))];

  return (
    <div className="services-container">
      <div className="services-inner">

        {/* Banner */}
        <div className="services-banner">
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
          <h1>Discover <em>available</em> tasks</h1>
          <p>Browse local requests and start earning on your own terms. Connect directly with clients in your area.</p>
        </div>

        {/* Floating Search */}
        <div className="services-search-wrapper">
          <div className="services-search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search by task title..."
              className="services-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="services-layout">
          
          <aside className="services-sidebar">
            <ServicesFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={uniqueCategories}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              cities={tunisianCities}
            />
          </aside>

          <main className="services-main">
            <div className="services-header">
              <div className="services-header-title">
                <span className="services-tag">Opportunities</span>
                <h2>Available Tasks</h2>
              </div>
              <span className="services-count">{filteredItems.length} results</span>
            </div>

            <div className="tasks-grid">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="task-card"
                  onClick={() => { getSession() ? setSelectedTask(item) : navigate('/sign-in') }} 
                >
                  <div className="task-card-main">
                    {item.client_image ? (
                      <img src={item.client_image} alt={item.client_name} className="task-avatar" />
                    ) : (
                      <div className="task-avatar">{getInitials(item.client_name)}</div>
                    )}
                    
                    <div className="task-info">
                      <h3 className="task-title">{item.title}</h3>
                      <p className="task-client">by <span>{item.client_name}</span></p>
                      <p className="task-desc">{item.description}</p>
                      
                      <div className="task-tags">
                        <span className="task-tag category">{item.category}</span>
                        {item.city && (
                          <span className="task-tag location">
                            <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '6px', opacity: 0.6 }} />
                            {item.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="task-card-aside">
  {/* This will stay at the top */}
  {item.rating ? (
    <div className="task-rating">
      <FontAwesomeIcon icon={faStar} className="star" />
      <span className="task-rating-val">{item.rating}</span>
      <span className="task-rating-max">/ 5.0</span>
    </div>
  ) : (
    <div /> 
  )}

  <button 
    className="task-book-btn"
    onClick={(e) => { 
      e.stopPropagation(); 
      handleAction(item); 
    }}
  >
    Book Now
  </button>
</div>
                </div>
              ))}
            </div>
          </main>
        </div>

      </div>

      {/* Modern Modal */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedTask(null)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="modal-main">
              <div className="modal-map">
                <MapContainer 
                  center={selectedTask.latitude && selectedTask.longitude ? [selectedTask.latitude, selectedTask.longitude] : (selectedTask.city && governorateCoordinates[selectedTask.city] ? governorateCoordinates[selectedTask.city] : [36.8065, 10.1815])} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker 
                    position={selectedTask.latitude && selectedTask.longitude ? [selectedTask.latitude, selectedTask.longitude] : (selectedTask.city && governorateCoordinates[selectedTask.city] ? governorateCoordinates[selectedTask.city] : [36.8065, 10.1815])} 
                    icon={locationIcon}
                  >
                    <Popup>{selectedTask.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <span className="modal-category">{selectedTask.category}</span>
              <h2 className="modal-title">{selectedTask.title}</h2>

              <div className="modal-meta">
                <div className="modal-meta-item">
                  <FontAwesomeIcon icon={faUser} /> Posted by {selectedTask.client_name}
                </div>
                <div className="modal-meta-item">
                  <FontAwesomeIcon icon={faLocationDot} /> {selectedTask.city}
                </div>
              </div>
              
              <p className="modal-desc">{selectedTask.description}</p>
            </div>

            <div className="modal-aside">
              <h3>Ready to help?</h3>
              <p>Confirm your interest and connect directly with the client to finalize details.</p>

              {selectedTask.rating && (
                <div className="task-rating" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FontAwesomeIcon icon={faStar} className="star" />
                  <span className="task-rating-val">{selectedTask.rating}</span>
                  <span className="task-rating-max">/ 5.0</span>
                </div>
              )}

              <button 
                onClick={() => handleAction(selectedTask)}
                className="modal-book-btn"
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Book Now
              </button>

              <div className="modal-notice">
                The client will be notified. You can communicate via the secure chat once they review your interest.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;