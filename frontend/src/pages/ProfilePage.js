import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../lib/profileApi';
import MultiSelect from './MultiSelect';

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

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isProvider, setIsProvider] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    categories: []
  });

  const [profileImage, setProfileImage] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setFormData({
        name: profile?.name || '',
        email: profile?.email || '',
        city: profile?.city || '',
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setNewProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let updatedImageUrl = profileImage;

      if (newProfileImage) {
        const uploadResult = await uploadProfileImage(newProfileImage);
        if (!uploadResult.success) throw new Error();
        updatedImageUrl = uploadResult.imageUrl;
      }

      const result = await updateProfile({
        ...formData,
        categories: isProvider ? formData.categories : [],
        profileImage: updatedImageUrl
      });

      if (!result.success) throw new Error();

      setProfileImage(updatedImageUrl);
      setNewProfileImage(null);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl font-semibold mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Profile Image */}
        <div className="flex items-center gap-6">
          <img
            src={
              newProfileImage
                ? URL.createObjectURL(newProfileImage)
                : profileImage || "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border"
          />
          <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Change Photo
            <input
              type="file"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select City</option>
            {tunisianCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Categories (Provider Only) */}
        {isProvider && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Service Categories
            </label>
            <MultiSelect
              options={allCategories.map(c => ({ label: c, value: c }))}
              selectedValues={formData.categories}
              setSelectedValues={(vals) =>
                setFormData({ ...formData, categories: vals })
              }
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;