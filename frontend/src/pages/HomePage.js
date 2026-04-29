import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
import { FaBroom, FaWrench, FaLeaf, FaBox, FaShieldAlt, FaStar, FaCheckCircle, FaUsers, FaArrowRight} from "react-icons/fa";
import { FaGear } from 'react-icons/fa6';
import { getSession } from "../lib/session";

function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const categories = [
    { name: "Cleaning", icon: <FaBroom />, colorClass: "cleaning", description: "Find top-rated cleaning professionals for your home or office." },
    { name: "Handyman", icon: <FaWrench />, colorClass: "handyman", description: "Get help with repairs, installations, and other odd jobs." },
    { name: "Gardening", icon: <FaLeaf />, colorClass: "gardening", description: "Book gardeners for lawn care, planting, and maintenance." },
    { name: "Moving", icon: <FaBox />, colorClass: "moving", description: "Find reliable movers to help with your relocation." },
    { name: "Other", icon: <FaGear />, colorClass: "other", description: "Explore a variety of other professional services." }
  ];

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Verified Providers",
    description:
      "All service providers are verified and background-checked for your safety"
  },
  {
    icon: <FaStar />,
    title: "Quality Guaranteed",
    description:
      "Read reviews and ratings from real customers to make informed decisions"
  },
  {
    icon: <FaCheckCircle />,
    title: "Easy Booking",
    description:
      "Book services in minutes with our simple and intuitive platform"
  },
  {
    icon: <FaUsers />,
    title: "Task Tracking",
    description:
      "Track your tasks in real-time and communicate directly with providers"
  }
];

const slideImages = [
  "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Cleaning
  "https://images.pexels.com/photos/5691597/pexels-photo-5691597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Handyman
  "https://images.pexels.com/photos/6195951/pexels-photo-6195951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Gardening
  "https://images.pexels.com/photos/424620/pexels-photo-424620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",   // Moving
  "https://images.pexels.com/photos/8952545/pexels-photo-8952545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"    // Other
];

  useEffect(() => {
    const session = getSession();
    if (session?.user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prevIndex => (prevIndex + 1) % categories.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [categories.length]);

  const handleExplore = () => {
    const session = getSession();
    navigate(session ? '/services' : '/sign-in');
  };

  return (

    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Connect with Trusted Service Providers</h1>
          <p>
            Find reliable professionals for your daily needs. From cleaning to
            handyman services, we've got you covered.
          </p>
          <button className="cta-button hero-cta" onClick={handleExplore}>
            Explore Services <FaArrowRight />
          </button>
        </div>
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
      </section>

      <section className="categories">
        <h2>Popular Categories</h2>
        <p className="subtitle">Hover to explore, click to see services</p>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-card ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                const session = getSession();
                if (session) {
                  navigate(`/services?category=${cat.name}`);
                } else {
                  navigate('/sign-in');
                }
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className={`icon ${cat.colorClass}`}>{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p className="description">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>




    



    <section className="why-section">
      <h2>Why Choose FixHub ?</h2>
      <p className="subtitle">
        The best platform for service connections
      </p>
      <div className="why-grid">
        {features.map((feature, index) => (
          <div key={index} className="why-card">
            <div className="why-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))} 
      </div>
    </section>


    <section className="cta-section">
      <h2>Ready to Get Started?</h2>
      <p>
        Join thousands of satisfied customers and providers on FixHub today.
      </p>

      <button className="cta-button" onClick={handleExplore}>
        Find a Service Provider <FaArrowRight />
      </button>
    </section>
    </div>
  );
}

export default HomePage;