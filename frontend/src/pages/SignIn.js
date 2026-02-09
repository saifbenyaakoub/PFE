import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Divider, ErrorText, Hint, Input, Label } from "../components/ui";
import { signIn } from "../lib/authApi";
import { saveSession } from "../lib/session";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("client@demo.com");
  const [password, setPassword] = useState("demo123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const demoAccounts = useMemo(
    () => [
      { title: "Client Account", email: "client@demo.com", password: "demo123" },
      { title: "Provider Account", email: "provider@demo.com", password: "demo123" },
    ],
    []
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await signIn({ email, password });
      saveSession(session);

      // role-based redirect
      navigate(session.user.role === "provider" ? "/provider" : "/client", { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Enter your email and password to access your account.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
          <Hint>Tip: Use demo accounts below to test quickly.</Hint>
        </div>

        <ErrorText>{error}</ErrorText>

        <Button loading={loading} disabled={loading}>
          Sign in
        </Button>

        <div className="text-right text-sm">
          <button
            type="button"
            className="text-zinc-600 hover:text-zinc-900 hover:underline"
            onClick={() => alert("Add forgot password flow later")}
          >
            Forgot password?
          </button>
        </div>
      </form>

      <Divider />

      <div>
        <div className="text-sm font-medium text-zinc-800">Demo accounts</div>
        <div className="mt-3 grid gap-3">
          {demoAccounts.map((a) => (
            <DemoCard
              key={a.title}
              title={a.title}
              email={a.email}
              password={a.password}
              onUse={() => {
                setEmail(a.email);
                setPassword(a.password);
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/">
          Sign up
        </Link>
      </div>
    </Card>
  );
}

function DemoCard({ title, email, password, onUse }) {
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{title}</div>
        <button
          onClick={onUse}
          className="text-xs font-medium text-zinc-700 hover:text-zinc-900 underline"
        >
          Use
        </button>
      </div>
      <div className="mt-2 text-sm text-zinc-600 flex items-center justify-between">
        <span>Email: {email}</span>
        <button onClick={() => copy(email)} className="text-xs hover:underline">
          Copy
        </button>
      </div>
      <div className="text-sm text-zinc-600 flex items-center justify-between">
        <span>Password: {password}</span>
        <button onClick={() => copy(password)} className="text-xs hover:underline">
          Copy
        </button>
      </div>
    </div>
  );
}
