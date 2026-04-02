import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./booking.css";
import { FaArrowLeft, FaMapMarkerAlt, FaCheckCircle, FaUser } from "react-icons/fa";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { getSession } from "../lib/session";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faLocationDot.icon[0]} ${faLocationDot.icon[1]}" style="width: 40px; height: 40px; fill: #d32f2f; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"><path d="${faLocationDot.icon[4]}" /></svg>`,
  className: 'custom-map-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});
function BookingService() {
  const {serviceId}= useParams();

  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const minDate = `${year}-${month}-${day}`;

  // Fetch service by ID
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:5000/services/${serviceId}`);
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
  }, [serviceId]);

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

    if (!date) {
      alert("Please select a preferred date and time.");
      return;
    }

    if (date < minDate) {
      alert("You cannot book a date in the past.");
      return;
    }

    setBookingInProgress(true);
    setError("");

    try {
    
      const bookingData = {
        service_id: service.id,
        client_id: session.user.id,
        date,
        details,
      };

      const response = await fetch("http://localhost:5000/bookings", { // Adjust endpoint if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
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

  if (loading) return <div className="service-details-container">Loading service details...</div>;
  if (error && !service) return <div className="service-details-container">Error: {error}</div>;
  if (!service) return <div className="service-details-container">Service not found.</div>;

  const getPosition = () => {
    if (service.latitude && service.longitude) {
      return [service.latitude, service.longitude];
    }
    return service?.city && governorateCoordinates[service.city] ? governorateCoordinates[service.city] : [36.8065, 10.1815];
  };
  const position = getPosition();

  return (
    <div className="service-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="content-wrapper">
        {/* LEFT SIDE */}
        <div className="left-section">
          <div className="image-wrapper">
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '420px', width: '100%', borderRadius: '15px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={locationIcon}>
                <Popup>
                  {service.title} <br /> {service.city}
                </Popup>
              </Marker>
            </MapContainer>
            <span className="category-badge">{service.category}</span>
          </div>

          <h1>{service.title}</h1>

          {service.provider_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#555", marginBottom: "1rem" }}>
              <FaUser className="text-gray-500" /> <span>{service.provider_name}</span>
            </div>
          )}

          {service.city && (
            <div className="service-meta">
              <FaMapMarkerAlt /> {service.city}
            </div>
          )}

          <p>{service.description}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="booking-card">
          <h2>Book This Service</h2>
          <p className="subtitle">Schedule your service appointment</p>

          <label>Preferred Date</label>
          <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />

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
            {bookingInProgress ? "Booking..." : (<><FaCheckCircle /> Confirm Booking</>)}
          </button>

          {error && <p className="note" style={{ color: "red" }}>{error}</p>}
          <p className="note">You'll be able to communicate with the provider after booking.</p>
        </div>
      </div>
    </div>
  );
}

export default BookingService;