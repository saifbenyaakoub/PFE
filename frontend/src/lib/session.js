const KEY = "tm_session";

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
