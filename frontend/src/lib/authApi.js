import apiClient from "./apiClient";

export async function signIn({ email, password }) {
  const data = await apiClient.post("/auth/signin", { email, password });
  return data;
}

export async function signUpClient({ name, email, password, city }) {
  const data = await apiClient.post("/auth/signup/client", { name, email, password, city });
  return data;
}

export async function signUpProvider({ name, email, password, serviceCategory, city }) {
  const data = await apiClient.post("/auth/signup/provider", { name, email, password, serviceCategory, city });
  return data;
}
