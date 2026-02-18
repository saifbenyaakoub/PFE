import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan, faTaxi ,faCar,
  faBroom,faLeaf,faBox,faUtensils,faGear, faStar, faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import { getSession } from "../lib/session";
import "./services.css"
import ServicesFilter from "./ServicesFilter";

function TasksPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const navigate = useNavigate();

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

  const icons = [faHammer, faWrench, faRuler, faPaintBrush, faFaucet, faSprayCan,faTaxi,faCar,faBroom,faLeaf,faBox,faUtensils,faGear,];

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
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, []);

  const handleAction = (item) => {
    const session = getSession();
    if (session) {
      alert(`Initiating application for: ${item.title}`);
    } else {
      navigate('/sign-in');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;    
    const matchesCity = selectedCity ? item.governorate === selectedCity : true;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const uniqueCategories = [...new Set(items.map(s => s.category).filter(Boolean))];

  return (
    <div className="text-center p-4 md:p-10">

    <section className="services-page">
      <div className="animated-banner">
        {iconDetails.map((details, i) => {
          const icon = icons[i % icons.length];
          return (
            <div key={i} className="floating-icon" style={{
              left: details.left,
              "--icon-size": `${details.size}px`,
              animationDelay: details.delay,
              animationDuration: details.duration,
            }}><FontAwesomeIcon icon={icon} /></div>
          );
        })}
        <div className="banner-content">
          <h1>Browse Tasks</h1>
          <p className="subtitle">Find jobs that match your skills</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by task title..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

        <div className="flex flex-col md:flex-row min-h-screen gap-6">
          <ServicesFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={uniqueCategories}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={tunisianCities}
          />

          <main className="w-full md:w-3/4 p-2 md:p-6">
            <h1 className="text-2xl font-bold mb-4 text-left">{filteredItems.length} Tasks Available</h1>

            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <div key={item._id || index} className="flex flex-col md:flex-row items-start md:items-center p-4 border rounded-lg justify-between bg-white shadow-sm hover:shadow-md transition-shadow gap-4">
                  <div className="flex items-start md:items-center gap-4 w-full">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl bg-green-100 text-green-600">
                       <FontAwesomeIcon icon={faBriefcase} className="text-green-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      {item.client_name && (
                        <p className="text-gray-500 text-sm flex items-center mb-1">
                          {`Posted by: ${item.client_name}`}
                        </p>
                      )}
                      
                      <p className="text-gray-600 text-sm">{item.category || "General"}</p>
                      <p className="text-gray-500 text-sm">{item.description}</p>
                      {item.governorate && <p className="text-gray-400 text-xs mt-1">{item.governorate}</p>}
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0">
                    {item.rate && <p className="font-bold text-lg mb-1"><FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1 inline-block" />{item.rate}</p>}
                    <button
                      className="w-full md:w-auto px-4 py-2 rounded-md transition-colors bg-green-600 text-white hover:bg-green-700"
                      onClick={() => handleAction(item)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

    </section>
    </div>
  );
}

export default TasksPage;