import React from 'react';
import "./home.css";
import { FaBroom, FaWrench, FaUtensils, FaLeaf, FaBox} from "react-icons/fa";
import { FaGear } from 'react-icons/fa6';

function HomePage() {
    const categories = [
  { name: "Cleaning", icon: <FaBroom /> },
  { name: "Handyman", icon: <FaWrench /> },
  { name: "Cooking", icon: <FaUtensils /> },
  { name: "Gardening", icon: <FaLeaf /> },
  { name: "Moving", icon: <FaBox /> },
    { name: "Other", icon: <FaGear /> }
];
  return (
    <div className="home-container">
    <section className="hero">
      <h1>Connect with Trusted Service Providers</h1>
      <p>
        Find reliable professionals for your daily needs.
        From cleaning to handyman services, we've got you covered.
      </p>

      <div className="hero-buttons">
        <button className="primary-btn">Browse Services →</button>
      </div>
    </section>
    <section className="categories">
      <h2>Popular Categories</h2>
      <p className="subtitle">Explore services by category</p>

      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div key={index} className="category-card">
            <div className="icon">{cat.icon}</div>
            <p>{cat.name}</p>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}

export default HomePage;