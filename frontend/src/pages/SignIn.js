import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Divider, ErrorText, Input, Label } from "../components/ui";
import { signIn } from "../lib/authApi";
import { saveSession } from "../lib/session";
import { Eye, EyeOff } from "lucide-react";
export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("client@demo.com");
  const [password, setPassword] = useState("demo123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await signIn({ email, password });
      saveSession(session);

      // role-based redirect
      navigate(session.user.role === "provider" ? "/provider" : "/client", { replace: true });
    } catch (err) {
      // API client handles toast.error automatically.
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
          <div className="flex items-center gap-1">
            <Label htmlFor="email">Email</Label>
            <span className="text-red-500 font-bold">*</span>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-1">
            <Label htmlFor="password">Password</Label>
            <span className="text-red-500 font-bold">*</span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Enter your password"
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
              {show ? <Eye /> : <EyeOff />}
            </button>
          </div>
        </div>

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
      <div className="mt-6 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/get-started">
          Sign up
        </Link>
      </div>
    </Card>
  );
}