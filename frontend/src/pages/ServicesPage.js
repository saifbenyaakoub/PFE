import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi ,faCar,
  faBroom,faLeaf,faBox,faGear, faStar,
  faLocationDot, faXmark, faCheckCircle, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { getSession } from "../lib/session";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./services.css"
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
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 40px; height: 40px; fill: #d32f2f; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`,
  className: 'custom-map-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

function ServicesPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");

  // Modal & Booking State
  const [selectedService, setSelectedService] = useState(null);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const getInitials = (name = '') => name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const iconDetails = [
    { left: '10%', size: 45, delay: '0s', duration: '20s' },
    { left: '30%', size: 70, delay: '-2s', duration: '25s' },
    { left: '50%', size: 50, delay: '-4s', duration: '22s' },
    { left: '70%', size: 65, delay: '-6s', duration: '24s' },
    { left: '90%', size: 55, delay: '-8s', duration: '21s' },
    { left: '20%', size: 80, delay: '-10s', duration: '23s' },
    { left: '40%', size: 40, delay: '-12s', duration: '19s' },
    { left: '60%', size: 75, delay: '-14s', duration: '26s' },
    { left: '80%', size: 60, delay: '-16s', duration: '22s' },
    { left: '15%', size: 50, delay: '-1s', duration: '24s' },
    { left: '35%', size: 65, delay: '-3s', duration: '20s' },
    { left: '55%', size: 45, delay: '-5s', duration: '25s' },
    { left: '75%', size: 70, delay: '-7s', duration: '21s' },
    { left: '95%', size: 55, delay: '-9s', duration: '23s' },
    { left: '5%', size: 80, delay: '-11s', duration: '26s' },
    { left: '25%', size: 40, delay: '-13s', duration: '19s' },
    { left: '45%', size: 60, delay: '-15s', duration: '22s' },
    { left: '65%', size: 50, delay: '-17s', duration: '24s' },
    { left: '85%', size: 75, delay: '-19s', duration: '20s' },
    { left: '12%', size: 55, delay: '-18s', duration: '25s' },
  ];

  const icons = [faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan,faTaxi,faCar,faBroom,faLeaf,faBox,faGear,];

  const tunisianCities = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Kairouan",
    "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Gafsa", "Tozeur", "Kebili", "Gabès", "Medenine", "Tataouine"
  ];

  useEffect(() => {
    const endpoint = "http://localhost:5000/services";
    fetch(endpoint)
      .then(res => res.json())
      .then(data =>  setItems(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (selectedCity) {
      params.set('city', selectedCity);
    }
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedCity, setSearchParams]);

  const handleAction = async (item) => {
    const session = getSession();
    if (session) {
      if (item && item.id) {
        if (session.user.role === "client" && item.provider_id) {
          try {
            const response = await fetch("http://localhost:5000/chat/start", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`
              },
              body: JSON.stringify({
                userId: session.user.id,
                partnerId: item.provider_id
              }),
            });
            if (response.ok) {
              navigate("/chat");
              return;
            }
          } catch (err) {
            console.error("Failed to start conversation", err);
          }
        }
        setSelectedService(item);
      } else {
        console.error("Service ID is missing", item);
      }
    } else {
      // User is not signed in, redirect to sign-in page.
      navigate('/sign-in');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;    
    const matchesCity = selectedCity ? item.city === selectedCity : true;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const uniqueCategories = [...new Set(items.map(s => s.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">

    <section className="services-page max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Modern Banner */}
      <div className="animated-banner relative overflow-hidden rounded-[2rem] mb-12 bg-gray-900 text-white shadow-2xl ring-1 ring-white/10">
        {iconDetails.map((details, i) => {
          const icon = icons[i % icons.length];
          return (
            <div key={i} className="floating-icon absolute text-white/10" style={{
              left: details.left,
              "--icon-size": `${details.size}px`,
              animationDelay: details.delay,
              animationDuration: details.duration,
            }}><FontAwesomeIcon icon={icon} /></div>
          );
        })}
        <div className="banner-content relative z-10 py-20 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Browse Services
          </h1>
          <p className="subtitle text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Find the best professionals for your needs
          </p>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="relative max-w-2xl mx-auto -mt-20 mb-16 z-20 px-4">
        <input
          type="text"
          placeholder="Search by service title..."
          className="search-input w-full px-8 py-5 rounded-2xl shadow-xl border-0 ring-1 ring-gray-100 focus:ring-4 focus:ring-blue-500/20 text-gray-700 placeholder-gray-400 text-lg transition-all bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
  {/* Sidebar */}
  <ServicesFilter
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    categories={uniqueCategories}
    selectedCity={selectedCity}
    setSelectedCity={setSelectedCity}
    cities={tunisianCities}
  />

  {/* Main content */}
  <main className="w-full md:w-3/4">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Available Services</h2>
      <span className="px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 shadow-sm">
        {filteredItems.length} results
      </span>
    </div>

    {/* Cards */}
    <div className="grid gap-6">
      {filteredItems.map((item, index) => {
        const initials = getInitials(item.provider_name);
        const itemPosition = item.latitude && item.longitude 
          ? [item.latitude, item.longitude] 
          : (item.city && governorateCoordinates[item.city] ? governorateCoordinates[item.city] : [36.8065, 10.1815]);

        return (
          <div 
            key={item.id || index} 
            onClick={() => { 
              if (getSession()) {
                setSelectedService(item); 
              } else { navigate('/sign-in'); }
            }} 
            className="group flex flex-col md:flex-row items-stretch bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden hover:border-[#0d276f]/30 cursor-pointer"
          >
            {/* Main Content */}
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 flex-grow">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {item.provider_image ? (
                  <img src={item.provider_image} alt={item.provider_name} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white font-bold text-xl shadow-sm ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
                    {initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-left space-y-3 flex-grow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#0d276f] transition-colors">{item.title}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    by <span className="text-gray-800">{item.provider_name}</span>
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {item.category}
                  </span>
                  {item.city && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                      <FontAwesomeIcon icon={faLocationDot} className="mr-1.5 opacity-60" />
                      {item.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Aside Content */}
            <div className="flex flex-col justify-between items-end p-6 bg-gray-50/50 md:w-48 md:border-l border-gray-100 gap-4">
              {item.rate && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 w-full justify-center md:justify-end">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                  <span className="font-bold text-gray-900">{item.rate}</span>
                  <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
                </div>
              )}
              <button
                className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-lg shadow-gray-900/10 hover:bg-[#0d276f] hover:shadow-[#0d276f]/20 active:scale-[0.98] transition-all duration-200 mt-auto"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleAction(item); 
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        )
      })}
    </div>
  </main>

  {/* Booking Modal (Content from BookingService.js) */}
  {selectedService && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[95vh]">
        <button 
          onClick={() => setSelectedService(null)}
          className="absolute top-6 right-6 z-[110] bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all border border-gray-100"
        >
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-gray-800" />
        </button>

        {/* Left Section: Service Info & Map */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="rounded-3xl overflow-hidden shadow-inner bg-gray-100 mb-8 border border-gray-100 h-80">
            <MapContainer 
              center={selectedService.latitude && selectedService.longitude ? [selectedService.latitude, selectedService.longitude] : (selectedService.city && governorateCoordinates[selectedService.city] ? governorateCoordinates[selectedService.city] : [36.8065, 10.1815])} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker 
                position={selectedService.latitude && selectedService.longitude ? [selectedService.latitude, selectedService.longitude] : (selectedService.city && governorateCoordinates[selectedService.city] ? governorateCoordinates[selectedService.city] : [36.8065, 10.1815])} 
                icon={locationIcon}
              >
                <Popup>{selectedService.title}</Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="space-y-4">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{selectedService.category}</span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedService.title}</h2>
            
            <div className="flex flex-wrap gap-6 items-center text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                <span>Offered by {selectedService.provider_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-red-500" />
                <span>{selectedService.city}</span>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed pt-4 border-t border-gray-100">
              <p>{selectedService.description}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Action */}
        <div className="md:w-[22rem] bg-gray-50/80 p-8 md:p-10 border-l border-gray-100 flex flex-col shrink-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Book This Service</h3>
          <p className="text-sm text-gray-500 mb-8 font-medium">Confirm your interest</p>

          <div className="space-y-6">
            <button 
              onClick={() => handleAction(selectedService)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/20 hover:bg-[#0d276f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Book Now
            </button>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mt-4">
              <p className="text-[11px] text-blue-600 font-semibold leading-relaxed text-center">
                The provider will be notified. You can communicate via chat once they review your request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

    </section>
    </div>
  );
}

export default ServicesPage;