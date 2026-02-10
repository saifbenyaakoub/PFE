import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/session";
import "./services.css"
function ServicesPage() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/services")
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  const handleBookNow = (service) => {
    const session = getSession();
    if (session) {
      // User is signed in, proceed with booking logic.
      alert(`Initiating booking for: ${service.title}`);
    } else {
      // User is not signed in, redirect to sign-in page.
      navigate('/sign-in');
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-center p-10">

    <section className="services-page">
      <h1>Browse Services</h1>

      <input
        type="text"
        placeholder="Search by service title..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-img" style={{ backgroundImage: `url(${service.image_url || 'https://via.placeholder.com/300x200.png?text=Service'})` }}></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p>Provider: {service.provider_name}</p>
              <p className="price">${service.price}</p>
              <button onClick={() => handleBookNow(service)}>Book Now</button>
            </div>
          ))}
        </div>
    </section>
    </div>
  );
}

export default ServicesPage;