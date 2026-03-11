import apiClient from "./apiClient";
import { getSession } from "./session";

export async function getProfile() {
  const session = getSession();
  if (!session) throw new Error("No session found");

  const headers = { Authorization: `Bearer ${session.token}` };
  const data = await apiClient.get(`/profile/${session.user.id}`, { headers });
  return data;
}

export async function updateProfile(profileData) {
  const session = getSession();
  if (!session) throw new Error("No session found");

  const headers = { Authorization: `Bearer ${session.token}` };
  const data = await apiClient.put("/profile", profileData, { headers });
  return { success: true, profile: data };
}

export async function uploadProfileImage(imageFile) {
  const session = getSession();
  if (!session) throw new Error("No session found");

  // Send the actual image file as FormData so the server receives binary data
  const formData = new FormData();
  formData.append("profileImage", imageFile);

  const headers = {
    Authorization: `Bearer ${session.token}`,
    // Do NOT set Content-Type manually — the browser sets it automatically
    // with the correct multipart boundary when using FormData
  };

  const response = await apiClient.post(
    `/profile/image/${session.user.id}`,
    formData,   // body (actual file)
    { headers } // config
  );

  return response;
}