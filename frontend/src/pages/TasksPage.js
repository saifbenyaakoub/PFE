import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi, faCar,
  faBroom, faLeaf, faBox, faGear, faStar,
  faMarker,
  faLocation,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { getSession } from "../lib/session";
import "./services.css";
import ServicesFilter from "./ServicesFilter";

function TasksPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");

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
    const endpoint = "http://localhost:5000/tasks";
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

  const handleAction = (item) => {
    const session = getSession();
    if (session) {
      if (item && item.id) {
        navigate(`/bookingTask/${item.id}`);
      } else {
        console.error("Task ID is missing", item);
      }
    } else {
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
            Browse Tasks
          </h1>
          <p className="subtitle text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Discover available tasks and get the job done
          </p>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="relative max-w-2xl mx-auto -mt-20 mb-16 z-20 px-4">
        <input
          type="text"
          placeholder="Search by task title..."
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
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Available Tasks</h2>
      <span className="px-4 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 shadow-sm">
        {filteredItems.length} results
      </span>
    </div>

    {/* Cards */}
    <div className="grid gap-6">
      {filteredItems.map((item, index) => {
        const initials = getInitials(item.client_name);
        return (
          <div key={item.id || index} className="group flex flex-col md:flex-row items-stretch bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden hover:border-[#0d276f]/30">
            {/* Main Content */}
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 flex-grow">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {item.client_image ? (
                  <img src={item.client_image} alt={item.client_name} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all" />
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
                    by <span className="text-gray-800">{item.client_name}</span>
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
                onClick={() => handleAction(item)}
              >
                Book Now
              </button>
            </div>
          </div>
        )
      })}
    </div>
  </main>
</div>

    </section>
    </div>
  );
}

export default TasksPage;