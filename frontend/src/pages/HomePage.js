import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
import { FaBroom, FaWrench, FaUtensils, FaLeaf, FaBox,FaShieldAlt, FaStar, FaCheckCircle, FaUsers, FaArrowRight} from "react-icons/fa";
import { FaGear } from 'react-icons/fa6';

function HomePage() {

  const navigate = useNavigate();
  const categories = [
  { name: "Cleaning", icon: <FaBroom style={{ color: "saddlebrown" }} /> },
  { name: "Handyman", icon: <FaWrench style={{ color: "slategray" }} /> },
  { name: "Cooking", icon: <FaUtensils style={{ color: "gray" }} /> },
  { name: "Gardening", icon: <FaLeaf style={{ color: "green" }}/> },
  { name: "Moving", icon: <FaBox style={{ color: "peru" }} /> },
    { name: "Other", icon: <FaGear style={{ color: "darkslategray" }} /> }
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
  "https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5691597/pexels-photo-5691597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/6195951/pexels-photo-6195951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://img.freepik.com/premium-photo/plumber-fixing-white-sink-pipe-with-adjustable-wrench_926199-1981248.jpg?w=2000",
];

  return (

    <div className="home-container">
    <section className="hero">
      <div className="hero-content">
        <h1>Connect with Trusted Service Providers</h1>
        <p>
          Find reliable professionals for your daily needs.
          From cleaning to handyman services, we've got you covered.
        </p>
      </div>
      <div className="hero-slider">
        <div className="slider-track">
          {slideImages.map((src, index) => (
            <div className="slide" key={index}>
              <img src={src} alt={`Service example ${index + 1}`} />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {slideImages.map((src, index) => (
            <div className="slide" key={`clone-${index}`}>
              <img src={src} alt={`Service example ${index + 1}`} />
            </div>
          ))}
        </div>
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



    <section className="why-section">
      <h2>Why Choose TaskConnect?</h2>
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
        Join thousands of satisfied customers and providers on TaskConnect today.
      </p>

      <button className="cta-button" onClick={() => navigate('/services')}>
        Find a Service Provider <FaArrowRight />
      </button>
    </section>
    </div>
  );
}

export default HomePage;