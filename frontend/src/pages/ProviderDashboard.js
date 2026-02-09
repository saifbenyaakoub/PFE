import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "../components/ui";
import { clearSession, getSession } from "../lib/session";

export default function ProviderDashboard() {
  const nav = useNavigate();
  const session = getSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <h2 className="text-2xl font-semibold">Provider Dashboard</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}. (Demo page)
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            className="w-auto"
            onClick={() => alert("Next: Provider Onboarding wizard")}
          >
            Complete profile
          </Button>
          <Button
            className="w-auto"
            variant="ghost"
            onClick={() => {
              clearSession();
              nav("/", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
