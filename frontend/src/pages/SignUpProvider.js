import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, ErrorText, Hint, Input, Label } from "../components/ui";
import { signUpProvider } from "../lib/authApi";
import { saveSession } from "../lib/session";
import { Eye, EyeOff } from "lucide-react";

const CATEGORIES = ["Plumbing", "Cleaning", "Electrician", "Carpentry", "Moving", "Painting"];

export default function SignUpProvider() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await signUpProvider({ name, email, password, category, city });
      saveSession(session);
      navigate("/provider", { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Create a provider account</h2>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Provider
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="category">Service category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            required
          >
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Hint>You can add more categories later in onboarding.</Hint>
        </div>

        <div>
          <Label htmlFor="city">City / Service area</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600 hover:text-zinc-900"
            >
              {show ? <Eye/> : <EyeOff/>}
            </button>
          </div>
        </div>

        <ErrorText>{error}</ErrorText>

        <Button loading={loading} disabled={loading}>
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-in">
          Sign in
        </Link>
      </div>

      <div className="mt-3 text-center text-sm text-zinc-600">
        Need a service instead?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-up/client">
          Create client account
        </Link>
      </div>
    </Card>
  );
}
