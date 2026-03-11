import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./booking.css";
import { FaArrowLeft, FaMapMarkerAlt, FaCheckCircle, FaUser } from "react-icons/fa";
import { getSession } from "../lib/session";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://www.svgrepo.com/show/342417/location-pin.svg",
  iconSize: [40, 41],
  iconAnchor: [20, 41],
  popupAnchor: [1, -34],
});

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

function BookingTask() {
  const { taskId } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationInProgress, setApplicationInProgress] = useState(false);

  // Fetch task by ID
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`http://localhost:5000/tasks/${taskId}`);
        if (!res.ok) throw new Error("Task not found");
        const data = await res.json();
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleApplication = async () => {
    const session = getSession();

    if (!session) {
      navigate("/sign-in");
      return;
    }

    if (session.user.role !== "provider") {
      alert("Only providers can apply for tasks.");
      return;
    }

    if (!details) {
      alert("Please provide some details for your application.");
      return;
    }

    setApplicationInProgress(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: task._id,
          provider_id: session.user.id,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error("Application failed.");
      }

      alert("Application submitted successfully!");
      navigate("/tasks");
    } catch (err) {
      setError(err.message);
    } finally {
      setApplicationInProgress(false);
    }
  };

  if (loading) return <div className="service-details-container">Loading task details...</div>;
  if (error && !task) return <div className="service-details-container">Error: {error}</div>;
  if (!task) return <div className="service-details-container">Task not found.</div>;

  const getPosition = () => {
    if (task.latitude && task.longitude) {
      return [task.latitude, task.longitude];
    }
    return task?.governorate && governorateCoordinates[task.governorate] ? governorateCoordinates[task.governorate] : [36.8065, 10.1815];
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
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '420px', width: '100%', borderRadius: '15px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={customIcon}>
                <Popup>
                  {task.title} <br /> {task.address || task.governorate}
                </Popup>
              </Marker>
            </MapContainer>
            <span className="category-badge">{task.category}</span>
          </div>

          <h1>{task.title}</h1>

          {task.client_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#555", marginBottom: "1rem" }}>
              <FaUser /> <span>Posted by {task.client_name}</span>
            </div>
          )}

          {(task.address || task.governorate) && (
            <div className="service-meta">
              <FaMapMarkerAlt /> {task.address || task.governorate}
            </div>
          )}

          <p>{task.description}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="booking-card">
          <h2>Apply for this Task</h2>
          <p className="subtitle">Submit your application</p>

          <label>Your Proposal</label>
          <textarea
            placeholder="Describe why you are a good fit for this task..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
          />

          <button
            className="confirm-btn"
            onClick={handleApplication}
            disabled={applicationInProgress}
          >
            {applicationInProgress ? "Submitting..." : (<><FaCheckCircle /> Submit Application</>)}
          </button>

          {error && <p className="note" style={{ color: "red" }}>{error}</p>}
          <p className="note">The client will be notified of your application.</p>
        </div>
      </div>
    </div>
  );
}

export default BookingTask;