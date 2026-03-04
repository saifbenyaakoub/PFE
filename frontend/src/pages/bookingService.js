import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./booking.css";
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaCheckCircle, FaUser } from "react-icons/fa";
import { getSession } from "../lib/session";

function BookingService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // ✅ Fetch service by ID
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:5000/services/${id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // ✅ Handle booking
  const handleBooking = async () => {
    const session = getSession();

    if (!session) {
      navigate("/sign-in");
      return;
    }

    if (session.user.role !== "client") {
      alert("Only clients can book services.");
      return;
    }

    if (!date || !time) {
      alert("Please select a preferred date and time.");
      return;
    }

    setBookingInProgress(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: service.id,          // ✅ PostgreSQL ID
          client_id: session.user.id,
          date,
          time,
          details,
          total_price: totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed.");
      }

      alert("Booking confirmed successfully!");
      navigate("/tasks");

    } catch (err) {
      setError(err.message);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return <div className="service-details-container">Loading service details...</div>;
  }

  if (error && !service) {
    return <div className="service-details-container">Error: {error}</div>;
  }

  if (!service) {
    return <div className="service-details-container">Service not found.</div>;
  }


  const totalPrice = Number(service.rate) 

  return (
    <div className="service-details-container">

      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="content-wrapper">

        {/* LEFT SIDE */}
        <div className="left-section">
          <div className="image-wrapper">
            <img
              src={
                service.image_url ||
                "https://images.unsplash.com/photo-1581578731548-c64695cc6952"
              }
              alt={service.title}
            />
            <span className="category-badge">
              {service.category}
            </span>
          </div>

          <h1>{service.title}</h1>

          {service.provider_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#555", marginBottom: "1rem" }}>
              <FaUser className="text-gray-500" /> <span>{service.provider_name}</span>
            </div>
          )}


          <div className="service-meta">
            <span><FaMapMarkerAlt /> {service.governorate}</span>
          </div>

          <p>{service.description}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="booking-card">
          <h2>Book This Service</h2>
          <p className="subtitle">Schedule your service appointment</p>

          <label>Preferred Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Preferred Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <label>Additional Details</label>
          <textarea
            placeholder="Describe your requirements..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />


          <button
            className="confirm-btn"
            onClick={handleBooking}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? "Booking..." : (
              <>
                <FaCheckCircle /> Confirm Booking
              </>
            )}
          </button>

          {error && (
            <p className="note" style={{ color: "red" }}>
              {error}
            </p>
          )}

          <p className="note">
            You'll be able to communicate with the provider after booking.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingService;