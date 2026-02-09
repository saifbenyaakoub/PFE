import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Pill } from "../components/ui";

export default function ChooseRole() {
  const [role, setRole] = useState("client");
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Welcome</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Choose what you want to do. We’ll show the right signup form.
          </p>
        </div>
        <Pill>Fast • Simple • Clear</Pill>
      </div>

      <div className="mt-6 grid gap-3">
        <RoleCard
          selected={role === "client"}
          title="Client"
          desc="I want to find and hire service providers"
          onClick={() => setRole("client")}
        />
        <RoleCard
          selected={role === "provider"}
          title="Provider"
          desc="I want to offer my services to clients"
          onClick={() => setRole("provider")}
        />
      </div>

      <div className="mt-6">
        <Button
          onClick={() =>
            navigate(role === "client" ? "/sign-up/client" : "/sign-up/provider")
          }
        >
          Continue
        </Button>

        <div className="mt-4 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-in">
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RoleCard({ selected, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        selected ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200 hover:bg-zinc-50",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "h-4 w-4 rounded-full border",
            selected ? "border-zinc-900 bg-zinc-900" : "border-zinc-300 bg-white",
          ].join(" ")}
        />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-zinc-600">{desc}</div>
        </div>
      </div>
    </button>
  );
}
