import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../lib/profileApi';
import { clearSession, getSession, saveSession } from "../lib/session";
import MultiSelect from './MultiSelect';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './profile.css';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Data ──────────────────────────────────────────────────────────────────────
const cityCoords = {
  "Tunis": [36.8065, 10.1815], "Ariana": [36.8625, 10.1956], "Ben Arous": [36.7531, 10.2222],
  "Manouba": [36.8080, 10.0864], "Nabeul": [36.4561, 10.7335], "Zaghouan": [36.4029, 10.1429],
  "Bizerte": [37.2744, 9.8739], "Béja": [36.7256, 9.1817], "Jendouba": [36.5011, 8.7802],
  "Kef": [36.1822, 8.7148], "Siliana": [36.0840, 9.3708], "Kairouan": [35.6781, 10.0963],
  "Kasserine": [35.1676, 8.8365], "Sidi Bouzid": [35.0382, 9.4849], "Sousse": [35.8256, 10.6369],
  "Monastir": [35.7780, 10.8262], "Mahdia": [35.5047, 11.0622], "Sfax": [34.7406, 10.7603],
  "Gafsa": [34.4250, 8.7842], "Tozeur": [33.9197, 8.1335], "Kebili": [33.7050, 8.9690],
  "Gabès": [33.8815, 10.0982], "Medenine": [33.3549, 10.5055], "Tataouine": [32.9297, 10.4518]
};

const tunisianCities = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
  "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Gafsa", "Tozeur", "Kebili", "Gabès", "Medenine", "Tataouine"
];

const allCategories = [
  "Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning",
  "Gardening", "Moving", "IT Support", "Tutoring", "Music Lessons"
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const SignOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
function ProfilePage() {
  const [loading, setLoading]                 = useState(true);
  const [isProvider, setIsProvider]           = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [formData, setFormData]               = useState({ name: '', email: '', city: '', latitude: '', longitude: '', categories: [] });
  const [profileImage, setProfileImage]       = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [error, setError]                     = useState(null);
  const [showMap, setShowMap]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const fileInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (!newProfileImage) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(newProfileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newProfileImage]);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setFormData({
        name:       profile?.name       || '',
        email:      profile?.email      || '',
        city:       profile?.city       || '',
        latitude:   profile?.latitude   || '',
        longitude:  profile?.longitude  || '',
        categories: profile?.categories || [],
        role:       profile?.role       || ''
      });
      setProfileImage(profile?.profileImage || null);
      setIsProvider(profile?.role === 'provider');
    } catch (err) {
      console.log(err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setNewProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      let updatedImageUrl = profileImage;

      if (newProfileImage) {
        const res = await uploadProfileImage(newProfileImage);
        updatedImageUrl = res.imageUrl;
      }

      await updateProfile({
        ...formData,
        categories:   isProvider ? formData.categories : [],
        profileImage: updatedImageUrl,
        latitude:     formData.latitude,
        longitude:    formData.longitude,
      });

      setProfileImage(updatedImageUrl);
      setNewProfileImage(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);

      const currentSession = getSession();
      if (currentSession) {
        const filename = updatedImageUrl.includes('/')
          ? updatedImageUrl.split('/').pop()
          : updatedImageUrl;
        saveSession({
          ...currentSession,
          user: {
            ...currentSession.user,
            name:         formData.name,
            latitude:     formData.latitude,
            longitude:    formData.longitude,
            categories:   isProvider ? formData.categories : [],
            profileImage: filename,
          }
        });
      }
      window.dispatchEvent(new Event('session:updated'));

    } catch(err) {
      console.log(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => { clearSession(); window.location.href = "/"; };

  // ── Leaflet Initialization ────────────────────────────────────────────────
  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      const initialCoords = (formData.latitude && formData.longitude)
        ? [formData.latitude, formData.longitude]
        : cityCoords[formData.city] || [36.8065, 10.1815];

      const map = L.map(mapContainerRef.current).setView(initialCoords, 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker(initialCoords, { draggable: true }).addTo(map);

      const initialPopupContent = formData.city
        ? `<b>${formData.city}</b>`
        : `<b>Location</b><br />`;
      marker.bindPopup(initialPopupContent).openPopup();

      const updateLocation = async (lat, lng) => {
        marker.setLatLng([lat, lng]);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const addr = data.address;
          const foundCity = addr.city || addr.town || addr.village || addr.state_district;

          if (foundCity && tunisianCities.includes(foundCity)) {
            setFormData(prev => ({ ...prev, city: foundCity }));
            marker.bindPopup(`<b>${foundCity}</b><br/>City Updated`).openPopup();
          }
        } catch (err) {
          console.error("Geocoding error:", err);
        }
      };

      map.on('click', (e) => updateLocation(e.latlng.lat, e.latlng.lng));
      marker.on('dragend', (e) => updateLocation(e.target.getLatLng().lat, e.target.getLatLng().lng));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="profile-shell profile-shell--loading">
        <div className="spinner" />
        <p className="loading-text">Loading profile…</p>
      </div>
    );
  }

  const avatarSrc = previewUrl || profileImage || null;
  const initials  = formData.name
    ? formData.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* ── Page shell — matches home-wrap width & spacing ── */}
      <div className="profile-shell">

        {/* ── Profile Card (cover + form) ── */}
        <div className="profile-card card">

          {/* ── Cover — dark header matching home's cta-card / search-dark ── */}
          <div className="profile-cover">
            {/* Decorative rings matching home's cta-ring */}
            <div className="profile-cover-ring" style={{ animationDelay: '0s' }} />
            <div className="profile-cover-ring" style={{ animationDelay: '1.66s' }} />
            <div className="profile-cover-ring" style={{ animationDelay: '3.33s' }} />

            {/* Decorative circles */}
            <div className="cover-circle cover-circle-1" />
            <div className="cover-circle cover-circle-2" />
            <div className="cover-circle cover-circle-3" />

            {/* Pulsing dots — matching home eyebrow badge dot */}
            <div className="cover-dots">
              <span className="cover-dot" />
              <span className="cover-dot" />
              <span className="cover-dot" />
            </div>

            {/* Sign out */}
            <button type="button" onClick={handleSignOut} className="signout-btn">
              <SignOutIcon />
              <span className="signout-label">Sign out</span>
            </button>

            {/* Identity block */}
            <div className="cover-identity">
              <div className="avatar-wrap">
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="avatar-img" />
                  : <div className="avatar-fallback">{initials}</div>
                }
                <button type="button" className="camera-btn"
                  onClick={() => fileInputRef.current?.click()} title="Change photo">
                  <CameraIcon />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleImageChange} style={{ display: 'none' }} />
                <span className="online-indicator" />
              </div>

              <div className="identity-text">
                {/* Eyebrow label — matching home's .eyebrow pattern */}
                <span className="profile-eyebrow">Your Account</span>
                <h1 className="identity-name">{formData.name || 'Your Name'}</h1>
                <div className="identity-badges">
                  <span className="badge badge-role">
                    {isProvider ? 'Provider' : 'Client'}
                  </span>
                  {formData.city && (
                    <span className="badge badge-city">
                      <MapPinIcon />
                      {formData.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats strip — mirrors home's stats-row ── */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">0</span>
              <span className="profile-stat-label">Bookings</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">0</span>
              <span className="profile-stat-label">Reviews</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">—</span>
              <span className="profile-stat-label">Rating</span>
            </div>
          </div>

          {/* ── Form body ── */}
          <div className="form-body card-pad">

            {error && (
              <div className="profile-alert profile-alert--error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="profile-alert profile-alert--success">
                <CheckIcon />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section header — matches home's eyebrow + section-split pattern */}
              <div className="profile-section-header">
                <div className="eyebrow">Personal Info</div>
                <div className="section-line" />
              </div>

              <div className="fields-grid">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="e.g. Ahmed Ben Ali"
                    className="field-input" required />
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className="field-input" required />
                </div>

                <div className="field-group">
                  <label className="field-label">City</label>
                  <select name="city" value={formData.city}
                    onChange={handleChange} className="field-input" required>
                    <option value="">Select your city</option>
                    {tunisianCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formData.city && (
                    <button type="button" className="show-map-btn" onClick={() => setShowMap(true)}>
                      <MapPinIcon />
                      Show on Map
                    </button>
                  )}
                </div>

                {isProvider && (
                  <div className="field-group field-full">
                    <label className="field-label">Service Categories</label>
                    <MultiSelect
                      options={allCategories}
                      selectedValues={formData.categories}
                      onChange={(vals) => setFormData({ ...formData, categories: vals })}
                      placeholder="Select categories"
                    />
                  </div>
                )}
              </div>

              {/* Footer — save btn matches home's btn-cta / btn-dark-sm */}
              <div className="form-footer">
                <span className="footer-hint">Changes are saved to your account immediately.</span>
                <button type="submit" disabled={saving} className="btn-cta profile-save-btn">
                  {saving
                    ? <><div className="btn-spinner" /> Saving…</>
                    : <><SaveIcon /> Save changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Map Modal ── */}
      {showMap && (
        <div className="map-modal-overlay" onClick={() => setShowMap(false)}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Location</div>
                <h3 className="map-modal-title">Map of {formData.city}</h3>
              </div>
              <button className="map-modal-close-btn" onClick={() => setShowMap(false)}>
                &times;
              </button>
            </div>
            <div ref={mapContainerRef} className="map-placeholder" style={{ zIndex: 1 }} />
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;