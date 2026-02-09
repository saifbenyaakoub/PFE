import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, ErrorText, Hint, Input, Label } from "../components/ui";
import { signUpClient } from "../lib/authApi";
import { saveSession } from "../lib/session";

export default function SignUpClient() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
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
      const session = await signUpClient({ name, email, password, city });
      saveSession(session);
      navigate("/client", { replace: true });
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
          <h2 className="text-2xl font-semibold">Create a client account</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Post a request and receive offers from providers.
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Client
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="city">City (optional)</Label>
          <Input id="city" placeholder="Sousse" value={city} onChange={(e) => setCity(e.target.value)} />
          <Hint>This helps us match nearby providers.</Hint>
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
              {show ? "Hide" : "Show"}
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
        Want to offer services?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-up/provider">
          Create provider account
        </Link>
      </div>
    </Card>
  );
}
