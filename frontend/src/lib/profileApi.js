// Mock API for profile management

export async function getProfile() {
  // In a real app, you'd fetch this from the backend.
  // Here, we'll return a mock profile.
  console.log('Fetching mock profile...');
  return {
    name: 'John Doe',
    email: 'john.doe@example.com',
    city: 'Tunis',
    role: 'provider',
    categories: ['Plumbing', 'Electrical'],
    profileImage: 'https://via.placeholder.com/150',
  };
}

export async function updateProfile(profileData) {
  // In a real app, you'd send this to the backend.
  console.log('Updating profile with:', profileData);
  // Simulate a successful update
  return { success: true, profile: profileData };
}

export async function uploadProfileImage(imageFile) {
  // In a real app, you'd upload this to the backend.
  console.log('Uploading profile image:', imageFile);
  // Simulate a successful upload and return a new image URL
  return { success: true, imageUrl: URL.createObjectURL(imageFile) };
}
