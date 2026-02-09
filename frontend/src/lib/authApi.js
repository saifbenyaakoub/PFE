// Mock API (frontend only).
// Later replace with real fetch calls to your Express backend.

const demoUsers = [
  { email: "client@demo.com", password: "demo123", role: "client", name: "Demo Client" },
  { email: "provider@demo.com", password: "demo123", role: "provider", name: "Demo Provider" },
];

export async function signIn({ email, password }) {
  await sleep(450);

  const found = demoUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) {
    const err = new Error("Email or password is incorrect.");
    err.status = 401;
    throw err;
  }

  const token = "demo.jwt.token";
  return {
    token,
    user: { email: found.email, role: found.role, name: found.name },
  };
}

export async function signUpClient({ name, email, password, city }) {
  await sleep(550);

  if (!email.includes("@")) throw new Error("Please enter a valid email.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  return {
    token: "demo.jwt.token",
    user: { name, email, role: "client", city },
  };
}

export async function signUpProvider({ name, email, password, category, city }) {
  await sleep(650);

  if (!category) throw new Error("Please choose a service category.");
  return {
    token: "demo.jwt.token",
    user: { name, email, role: "provider", category, city },
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
