export function saveSession(session) {
  if (session && session.token) {
    localStorage.setItem("token", session.token);
  }
  if (session && session.user) {
    localStorage.setItem("user", JSON.stringify(session.user));
  }
}

export function getSession() {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (token && user) {
    return { token, user };
  }
  return null;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
