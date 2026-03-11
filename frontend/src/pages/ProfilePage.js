import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../lib/profileApi';
import { clearSession, getSession, saveSession } from "../lib/session";
import MultiSelect from './MultiSelect';

// ── Data ──────────────────────────────────────────────────────────────────────
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
  const [formData, setFormData]               = useState({ name: '', email: '', city: '', categories: [] });
  const [profileImage, setProfileImage]       = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [error, setError]                     = useState(null);
  const [success, setSuccess]                 = useState(false);
  const fileInputRef = useRef(null);

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
        categories: profile?.categories || []
      });
      setProfileImage(profile?.profileImage || null);
      setIsProvider(profile?.role === 'provider');
    } catch (err) {
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
        profileImage: updatedImageUrl
      });

      setProfileImage(updatedImageUrl);
      setNewProfileImage(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);

      // Sync updated name + image into localStorage so the Navbar
      // reflects the new values instantly without a page reload
      const currentSession = getSession();
      if (currentSession) {
        saveSession({
          ...currentSession,
          user: {
            ...currentSession.user,
            name:         formData.name,
            profileImage: updatedImageUrl,
          }
        });
      }
      window.dispatchEvent(new Event('session:updated'));

    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => { clearSession(); window.location.href = "/"; };

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
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const BRAND       = "#000000";
const BRAND_HOVER = "#222222";
const BRAND_LIGHT = "#e5e5e5";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Shell ─────────────────────────────────────── */
  .profile-shell {
    min-height: 100vh;
    background: #f2f2f2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px 16px 60px;
    font-family: 'DM Sans', sans-serif;
  }
  .profile-shell--loading {
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  .loading-text {
    font-size: 13px;
    color: #6b7280;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Card ──────────────────────────────────────── */
  .profile-card {
    width: 100%;
    max-width: 640px;
    background: #fff;
    border-radius: 0 0 20px 20px;
    border: 1px solid #e4e4e4;
    border-top: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.07);
  }

  /* ── Cover ─────────────────────────────────────── */
  .cover {
    position: relative;
    margin: -1px -1px 0 -1px;
    width: calc(100% + 2px);
    height: 200px;
    background-color: ${BRAND};
    background-image:
      radial-gradient(circle at 15% 60%, rgba(255,255,255,0.07) 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(255,255,255,0.09) 0%, transparent 38%),
      repeating-linear-gradient(
        -45deg, transparent, transparent 28px,
        rgba(255,255,255,0.022) 28px, rgba(255,255,255,0.022) 29px
      );
    overflow: hidden;
    border-radius: 20px 20px 0 0;
  }

  .cover-circle {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.1);
    pointer-events: none;
  }
  .cover-circle-1 { width: 220px; height: 220px; top: -80px;  right: -60px; }
  .cover-circle-2 { width: 130px; height: 130px; top:  20px;  right:  80px; }
  .cover-circle-3 { width:  80px; height:  80px; bottom: 30px; right: 200px; opacity: 0.5; }

  /* Sign out */
  .signout-btn {
    position: absolute;
    top: 16px; right: 16px;
    z-index: 10;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 999px;
    font-family: 'Sora', sans-serif;
    font-size: 11.5px; font-weight: 600;
    background: rgba(255,255,255,0.93); color: #dc2626;
    border: 1px solid rgba(255,255,255,0.7);
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    letter-spacing: 0.01em; white-space: nowrap;
  }
  .signout-btn:hover { background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.13); }

  /* Identity block */
  .cover-identity {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0 32px 20px;
    display: flex; align-items: flex-end; gap: 18px;
  }

  /* Avatar */
  .avatar-wrap { position: relative; flex-shrink: 0; }
  .avatar-img,
  .avatar-fallback {
    width: 78px; height: 78px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 4px 18px rgba(0,0,0,0.22);
    object-fit: cover; display: block;
  }
  .avatar-fallback {
    background: linear-gradient(135deg, #333, ${BRAND});
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif;
    font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 1px;
  }
  .camera-btn {
    position: absolute; bottom: 1px; right: 1px;
    width: 26px; height: 26px; border-radius: 50%;
    background: ${BRAND}; border: 2.5px solid #fff;
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .camera-btn:hover { background: ${BRAND_HOVER}; transform: scale(1.12); }

  /* Name + badges */
  .identity-text { padding-bottom: 4px; min-width: 0; }
  .identity-name {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 700; color: #fff;
    line-height: 1.2; text-shadow: 0 1px 8px rgba(0,0,0,0.28);
    margin: 0 0 8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .identity-badges { display: flex; flex-wrap: wrap; gap: 7px; }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 11px; border-radius: 999px;
    font-family: 'Sora', sans-serif;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em;
  }
  .badge-role {
    background: rgba(255,255,255,0.2); color: #fff;
    border: 1px solid rgba(255,255,255,0.35); backdrop-filter: blur(4px);
  }
  .badge-city {
    background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.88);
    border: 1px solid rgba(255,255,255,0.22); backdrop-filter: blur(4px);
  }

  /* ── Form body ──────────────────────────────────── */
  .form-body { padding: 32px; }

  .alert {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 12px;
    font-size: 13px; font-weight: 500;
    margin-bottom: 24px; animation: fadeSlide 0.25s ease;
  }
  .alert-error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  .section-title {
    font-family: 'Sora', sans-serif;
    font-size: 10.5px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
  }
  .section-line { flex: 1; height: 1px; background: #e5e7eb; }

  /* Fields */
  .fields-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 18px; margin-bottom: 28px;
  }
  .field-full  { grid-column: 1 / -1; }
  .field-group { display: flex; flex-direction: column; }
  .field-label {
    font-family: 'Sora', sans-serif;
    font-size: 10.5px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px;
  }
  .field-input {
    border: 1.5px solid #e5e7eb; border-radius: 12px;
    padding: 10px 14px; font-size: 13.5px;
    font-family: 'DM Sans', sans-serif; color: #111827;
    background: #f9fafb; outline: none; width: 100%;
    box-sizing: border-box; appearance: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .field-input::placeholder { color: #9ca3af; }
  .field-input:focus {
    border-color: ${BRAND}; background: #fff;
    box-shadow: 0 0 0 3.5px ${BRAND_LIGHT};
  }

  /* Footer */
  .form-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 20px; border-top: 1px solid #f3f4f6; gap: 16px;
  }
  .footer-hint { font-size: 11.5px; color: #9ca3af; font-style: italic; flex: 1; }

  .save-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 22px; border-radius: 12px;
    background: ${BRAND}; color: #fff;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600;
    border: none; cursor: pointer; white-space: nowrap;
    letter-spacing: 0.01em; flex-shrink: 0;
    transition: background 0.16s, transform 0.12s, box-shadow 0.16s;
  }
  .save-btn:hover:not(:disabled) {
    background: ${BRAND_HOVER}; transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  }
  .save-btn:active:not(:disabled) { transform: translateY(0); }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Spinners */
  .spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 2.5px solid #e5e7eb; border-top-color: ${BRAND};
    animation: spin 0.7s linear infinite;
  }
  .btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .page-footnote {
    margin-top: 18px; font-size: 11px; color: #b0b8c1;
    font-family: 'DM Sans', sans-serif; text-align: center;
  }

  /* ════════════════════════════════════════════════
     RESPONSIVE
     ════════════════════════════════════════════════ */

  /* ── Tablet  ≤ 640px ─────────────────────────── */
  @media (max-width: 640px) {
    .profile-shell  { padding: 24px 12px 48px; }
    .profile-card   { border-radius: 0 0 16px 16px; }
    .cover          { height: 170px; border-radius: 16px 16px 0 0; }
    .cover-identity { padding: 0 22px 18px; gap: 14px; }
    .avatar-img,
    .avatar-fallback { width: 66px; height: 66px; }
    .avatar-fallback { font-size: 18px; }
    .identity-name  { font-size: 17px; margin-bottom: 6px; }
    .fields-grid    { grid-template-columns: 1fr; gap: 14px; }
    .form-body      { padding: 24px 22px; }
    .form-footer    { flex-direction: column; align-items: stretch; gap: 12px; }
    .footer-hint    { text-align: center; }
    .save-btn       { width: 100%; justify-content: center; padding: 12px; }
  }

  /* ── Mobile  ≤ 430px ─────────────────────────── */
  @media (max-width: 430px) {
    .profile-shell  { padding: 0 0 40px; }
    .profile-card   { border-radius: 0; border: none; box-shadow: none; }
    .cover          { height: 155px; border-radius: 0; margin: 0; width: 100%; }
    .cover-circle-3 { display: none; }
    .cover-identity { padding: 0 16px 14px; gap: 10px; }
    .avatar-img,
    .avatar-fallback { width: 58px; height: 58px; }
    .avatar-fallback { font-size: 16px; }
    .camera-btn     { width: 22px; height: 22px; }
    .identity-name  { font-size: 15px; }
    .signout-label  { display: none; }
    .signout-btn    { padding: 7px 10px; }
    .form-body      { padding: 20px 16px; }
    .field-input    { padding: 9px 12px; font-size: 13px; }
    .save-btn       { font-size: 12.5px; }
    .page-footnote  { padding: 0 16px; }
  }

  /* ── Small phones  ≤ 360px ───────────────────── */
  @media (max-width: 360px) {
    .cover          { height: 140px; }
    .cover-circle-2 { display: none; }
    .avatar-img,
    .avatar-fallback { width: 50px; height: 50px; }
    .avatar-fallback { font-size: 14px; }
    .identity-name  { font-size: 14px; }
    .badge          { font-size: 9.5px; padding: 2px 8px; }
    .form-body      { padding: 16px 14px; }
    .field-label    { font-size: 9.5px; }
    .field-input    { padding: 8px 11px; font-size: 12.5px; border-radius: 10px; }
    .save-btn       { padding: 10px; font-size: 12px; border-radius: 10px; }
  }
`;

export default ProfilePage;