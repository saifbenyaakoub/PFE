import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../lib/profileApi';
import { clearSession, getSession, saveSession } from "../lib/session";
import MultiSelect from './MultiSelect';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [showMap, setShowMap]                 = useState(false); // New state for map modal
  const [success, setSuccess]                 = useState(false);
  const fileInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  // Revocable object URL — avoids memory leaks on repeated image changes
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
        role:profile?.role||''
      });
      setProfileImage(profile?.profileImage || null);
      setIsProvider(profile?.role === 'provider');
    } catch (err) {
      console.log(err)
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

      // Upload new image if one was selected
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

      // Sync updated name + image into localStorage so the Navbar
      // reflects the new values instantly without a page reload
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
      console.log(err)
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => { clearSession(); window.location.href = "/"; };

  // ── Leaflet Initialization ────────────────────────────────────────────────
  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      // Use saved coordinates if available, otherwise city coords, otherwise default to Tunis
      const initialCoords = (formData.latitude && formData.longitude)
        ? [formData.latitude, formData.longitude]
        : cityCoords[formData.city] || [36.8065, 10.1815];
      
      // Initialize map
      const map = L.map(mapContainerRef.current).setView(initialCoords, 12);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add a draggable marker
      const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
      
      // Initial popup content
      const initialPopupContent = formData.city
        ? `<b>${formData.city}</b>`
        : `<b>Location</b><br />`;
      marker.bindPopup(initialPopupContent).openPopup();

      const updateLocation = async (lat, lng) => {
        marker.setLatLng([lat, lng]);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng })); // Update lat/lng in form data

        try {
          // Reverse Geocoding using Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const addr = data.address; //
          const foundCity = addr.city || addr.town || addr.village || addr.state_district;

          // If the found city is in our supported list, update the form
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
  }, [showMap]); // Depend only on showMap to avoid re-initializing while interacting 

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="profile-shell profile-shell--loading">
          <div className="spinner" />
          <p className="loading-text">Loading profile…</p>
        </div>
      </>
    );
  }

  const avatarSrc = previewUrl || profileImage || null;
  const initials  = formData.name
    ? formData.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-shell">
        <div className="profile-card">

          {/* ── Cover ───────────────────────────────────────────── */}
          <div className="cover">
            <div className="cover-circle cover-circle-1" />
            <div className="cover-circle cover-circle-2" />
            <div className="cover-circle cover-circle-3" />

            <button type="button" onClick={handleSignOut} className="signout-btn">
              <SignOutIcon />
              <span className="signout-label">Sign out</span>
            </button>

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
              </div>

              <div className="identity-text">
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

          {/* ── Form body ───────────────────────────────────────── */}
          <div className="form-body">

            {error && (
              <div className="alert alert-error">
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
              <div className="alert alert-success">
                <CheckIcon />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="section-header">
                <span className="section-title">Personal Information</span>
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

              <div className="form-footer">
                <span className="footer-hint">Changes are saved to your account immediately.</span>
                <button type="submit" disabled={saving} className="save-btn">
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

      {/* Map Modal */}
      {showMap && (
        <div className="map-modal-overlay" onClick={() => setShowMap(false)}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <h3>Map of {formData.city}</h3>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const BRAND       = "#000000";
const BRAND_HOVER = "#222222";
const BRAND_LIGHT = "#e5e5e5";

// Replace the entire STYLES constant in ProfilePage.js with this:

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ═══════════════════════════════════════════════
     PROFILE PAGE — aligned with dashboard design
     ═══════════════════════════════════════════════ */

  .profile-shell {
    min-height: 100vh;
    background: #E8E8E4;
    background-image:
      radial-gradient(circle at 12% 12%, rgba(22,163,74,.08), transparent 15%),
      radial-gradient(circle at 88% 18%, rgba(245,158,11,.08), transparent 16%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 32px 16px 80px;
    font-family: 'Inter', sans-serif;
    color: #111110;
  }

  .profile-shell--loading {
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .loading-text {
    font-size: 13.5px;
    color: #88887E;
    font-weight: 500;
  }

  /* ── Back Navigation ─────────────────────────── */
  .profile-back {
    width: 100%;
    max-width: 680px;
    margin-bottom: 16px;
  }

  .profile-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    color: #88887E;
    text-decoration: none;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,.9);
    box-shadow: 0 2px 12px rgba(17,17,16,.06);
    transition: all .18s;
    cursor: pointer;
  }

  .profile-back-link:hover {
    color: #111110;
    background: #FFFFFF;
    box-shadow: 0 4px 16px rgba(17,17,16,.1);
    transform: translateX(-2px);
  }

  /* ── Card ──────────────────────────────────────── */
  .profile-card {
    width: 100%;
    max-width: 680px;
    background: #FFFFFF;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 18px 48px rgba(17,17,16,.09);
    border: 1.5px solid #E0E0DA;
  }

  /* ── Cover (dark header) ───────────────────────── */
  .cover {
    position: relative;
    width: 100%;
    height: 220px;
    background: #111110;
    background-image:
      radial-gradient(circle at 15% 60%, rgba(22,163,74,.15) 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(245,158,11,.1) 0%, transparent 38%),
      radial-gradient(circle at 50% 80%, rgba(37,99,235,.08) 0%, transparent 40%),
      repeating-linear-gradient(
        -45deg, transparent, transparent 28px,
        rgba(255,255,255,0.015) 28px, rgba(255,255,255,0.015) 29px
      );
    overflow: hidden;
  }

  /* Decorative circles */
  .cover-circle {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.06);
    pointer-events: none;
  }

  .cover-circle-1 { width: 280px; height: 280px; top: -100px; right: -80px; }
  .cover-circle-2 { width: 160px; height: 160px; top: 30px; right: 100px; opacity: 0.6; }
  .cover-circle-3 { width: 100px; height: 100px; bottom: 40px; right: 220px; opacity: 0.35; }

  /* Floating dots decoration */
  .cover-dots {
    position: absolute;
    top: 20px;
    left: 24px;
    display: flex;
    gap: 6px;
    opacity: 0.5;
  }

  .cover-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    animation: dotPulse 2s ease-in-out infinite;
  }

  .cover-dot:nth-child(2) { animation-delay: 0.3s; }
  .cover-dot:nth-child(3) { animation-delay: 0.6s; }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  /* Sign out */
  .signout-btn {
    position: absolute;
    top: 16px; right: 16px;
    z-index: 10;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 100px;
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 600;
    background: rgba(255,255,255,0.9);
    color: #DC2626;
    border: 1.5px solid rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all .18s;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .signout-btn:hover {
    background: #FFFFFF;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    transform: translateY(-1px);
    border-color: rgba(255,255,255,0.8);
  }

  /* Identity block */
  .cover-identity {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0 32px 24px;
    display: flex; align-items: flex-end; gap: 18px;
  }

  /* Avatar */
  .avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-img,
  .avatar-fallback {
    width: 84px; height: 84px;
    border-radius: 50%;
    border: 3.5px solid #FFFFFF;
    box-shadow: 0 6px 24px rgba(0,0,0,0.3);
    object-fit: cover; display: block;
    transition: transform .3s cubic-bezier(.34,1.2,.64,1);
  }

  .avatar-wrap:hover .avatar-img,
  .avatar-wrap:hover .avatar-fallback {
    transform: scale(1.05);
  }

  .avatar-fallback {
    background: linear-gradient(135deg, #444440, #111110);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 26px; font-weight: 800; color: #FFFFFF;
    letter-spacing: 1px;
  }

  .camera-btn {
    position: absolute; bottom: 3px; right: 3px;
    width: 28px; height: 28px; border-radius: 50%;
    background: #111110; border: 2.5px solid #FFFFFF;
    display: flex; align-items: center; justify-content: center;
    color: #FFFFFF; cursor: pointer;
    transition: all .18s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }

  .camera-btn:hover {
    background: #16A34A;
    transform: scale(1.15);
  }

  /* Online indicator */
  .online-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #16A34A;
    border: 2.5px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(22,163,74,.4);
  }

  /* Name + badges */
  .identity-text {
    padding-bottom: 4px;
    min-width: 0;
  }

  .identity-name {
    font-family: 'Inter', sans-serif;
    font-size: 24px; font-weight: 900; color: #FFFFFF;
    line-height: 1.15;
    text-shadow: 0 2px 12px rgba(0,0,0,0.35);
    margin: 0 0 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: -.03em;
  }

  .identity-email {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 10px;
    display: block;
  }

  .identity-badges {
    display: flex; flex-wrap: wrap; gap: 8px;
  }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 100px;
    font-family: 'Inter', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
  }

  .badge-role {
    background: rgba(22,163,74,.25);
    color: #FFFFFF;
    border: 1px solid rgba(22,163,74,.4);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .badge-city {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  /* ── Stats Row ─────────────────────────────────── */
  .profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #E0E0DA;
    border-top: 1.5px solid #E0E0DA;
  }

  .profile-stat {
    background: #F7F7F3;
    padding: 16px 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background .18s;
  }

  .profile-stat:hover {
    background: #F2F2EE;
  }

  .profile-stat-value {
    font-size: 20px;
    font-weight: 900;
    color: #111110;
    letter-spacing: -.03em;
    line-height: 1;
  }

  .profile-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: #88887E;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  /* ── Form body ──────────────────────────────────── */
  .form-body {
    padding: 32px 36px;
  }

  .alert {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 14px;
    font-size: 13px; font-weight: 500;
    margin-bottom: 24px;
    animation: fadeSlide .25s ease;
  }

  .alert-error {
    background: #FEF2F2;
    color: #DC2626;
    border: 1.5px solid #FCA5A5;
  }

  .alert-success {
    background: #F0FDF4;
    color: #16A34A;
    border: 1.5px solid #BBF7D0;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 12px; font-weight: 800;
    color: #111110;
    letter-spacing: -.02em;
    white-space: nowrap;
  }

  .section-line {
    flex: 1; height: 1.5px;
    background: #E0E0DA;
    border-radius: 1px;
  }

  /* Fields grid */
  .fields-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 18px; margin-bottom: 28px;
  }

  .field-full {
    grid-column: 1 / -1;
  }

  .field-group {
    display: flex; flex-direction: column;
  }

  .field-label {
    font-size: 11px; font-weight: 700;
    color: #88887E;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .field-input {
    border: 1.5px solid #E0E0DA;
    border-radius: 14px;
    padding: 11px 16px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: #111110;
    background: #F2F2EE;
    outline: none; width: 100%;
    box-sizing: border-box; appearance: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }

  .field-input::placeholder {
    color: #C0C0B8;
  }

  .field-input:focus {
    border-color: #CCCCCA;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(17,17,16,.04);
  }

  select.field-input {
    cursor: pointer;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2388887E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
  }

  textarea.field-input {
    resize: vertical;
    min-height: 80px;
    line-height: 1.55;
  }

  /* Footer */
  .form-footer {
    display: flex; align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1.5px solid #E0E0DA;
    gap: 16px;
  }

  .footer-hint {
    font-size: 12px;
    color: #88887E;
    flex: 1;
  }

  .save-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px; border-radius: 100px;
    background: #111110; color: #FFFFFF;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 700;
    border: none; cursor: pointer; white-space: nowrap;
    letter-spacing: 0.01em; flex-shrink: 0;
    transition: background .2s, transform .2s, box-shadow .2s;
  }

  .save-btn:hover:not(:disabled) {
    background: #333333;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .save-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Show map button */
  .show-map-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    background: #F2F2EE;
    color: #111110;
    border: 1.5px solid #E0E0DA;
    cursor: pointer;
    margin-top: 10px;
    width: fit-content;
    transition: all .18s;
  }

  .show-map-btn:hover {
    background: #EAEAE6;
    border-color: #CCCCCA;
  }

  /* Map modal */
  .map-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(17,17,16,.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    animation: modalFadeIn .2s ease both;
  }

  @keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .map-modal-content {
    background: #FFFFFF;
    border-radius: 22px;
    padding: 32px;
    width: 100%;
    max-width: 700px;
    box-shadow: 0 32px 80px rgba(0,0,0,.14);
    border: 1px solid rgba(255,255,255,.12);
    position: relative;
    animation: modalPopIn .3s cubic-bezier(.34,1.2,.64,1) both;
  }

  @keyframes modalPopIn {
    from { opacity: 0; transform: scale(.96) translateY(12px); }
    to   { opacity: 1; transform: none; }
  }

  .map-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }

  .map-modal-header h3 {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #111110;
    margin: 0;
    letter-spacing: -.03em;
  }

  .map-modal-close-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: #F2F2EE;
    border: 1.5px solid #E0E0DA;
    font-size: 20px;
    cursor: pointer;
    color: #88887E;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .18s;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .map-modal-close-btn:hover {
    background: #EAEAE6;
    color: #111110;
  }

  .map-placeholder {
    width: 100%;
    height: 400px;
    background: #F2F2EE;
    border-radius: 14px;
    border: 1.5px solid #E0E0DA;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #88887E;
    overflow: hidden;
  }

  /* Spinners */
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2.5px solid #E0E0DA;
    border-top-color: #111110;
    animation: spin 0.7s linear infinite;
  }

  .btn-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #FFFFFF;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .page-footnote {
    margin-top: 20px;
    font-size: 11.5px;
    color: #88887E;
    text-align: center;
    font-weight: 500;
  }

  /* ═══════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════ */

  @media (max-width: 640px) {
    .profile-shell  { padding: 20px 10px 60px; }
    .profile-back   { padding: 0 4px; margin-bottom: 12px; }
    .profile-card   { border-radius: 16px; }
    .cover          { height: 180px; }
    .cover-dots     { display: none; }
    .cover-identity { padding: 0 20px 18px; gap: 14px; }
    .avatar-img,
    .avatar-fallback { width: 66px; height: 66px; }
    .avatar-fallback { font-size: 18px; }
    .identity-name  { font-size: 18px; }
    .identity-email { display: none; }
    .profile-stats  { grid-template-columns: repeat(3, 1fr); }
    .profile-stat-value { font-size: 16px; }
    .fields-grid    { grid-template-columns: 1fr; gap: 14px; }
    .form-body      { padding: 24px 20px; }
    .form-footer    { flex-direction: column; align-items: stretch; gap: 14px; }
    .footer-hint    { text-align: center; }
    .save-btn       { width: 100%; justify-content: center; padding: 13px; }
  }

  @media (max-width: 430px) {
    .profile-shell  { padding: 0 0 40px; }
    .profile-back   { display: none; }
    .profile-card   { border-radius: 0; box-shadow: none; border: none; }
    .cover          { height: 155px; }
    .cover-circle-3 { display: none; }
    .cover-identity { padding: 0 16px 14px; gap: 10px; }
    .avatar-img,
    .avatar-fallback { width: 56px; height: 56px; }
    .avatar-fallback { font-size: 16px; }
    .camera-btn     { width: 24px; height: 24px; }
    .online-indicator { width: 10px; height: 10px; top: 2px; right: 2px; }
    .identity-name  { font-size: 16px; margin-bottom: 2px; }
    .signout-label  { display: none; }
    .signout-btn    { padding: 7px 12px; font-size: 11px; top: 10px; right: 10px; }
    .profile-stats  { grid-template-columns: repeat(3, 1fr); }
    .profile-stat   { padding: 12px 8px; }
    .profile-stat-value { font-size: 15px; }
    .profile-stat-label  { font-size: 9px; }
    .form-body      { padding: 20px 16px; }
    .field-input    { padding: 10px 14px; font-size: 13px; }
    .save-btn       { font-size: 12.5px; padding: 11px; }
    .page-footnote  { padding: 0 16px; }
  }
`;
export default ProfilePage;