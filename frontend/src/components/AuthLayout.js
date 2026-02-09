import React from "react";
import { Outlet, useLocation } from "react-router-dom";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white grid place-items-center font-bold">
        T
      </div>
      <div>
        <div className="font-semibold leading-5">FixHub</div>
      </div>
    </div>
  );
}

export default function AuthLayout() {
  const location = useLocation();
  const isAuth = ["/", "/sign-in", "/sign-up/client", "/sign-up/provider"].includes(
    location.pathname
  );

  if (!isAuth) return <Outlet />;

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="hidden lg:block">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-semibold leading-tight">
                Simple, friendly authentication for clients and providers.
              </h1>
              <p className="mt-3 text-zinc-600">
                Built to be easy for users who aren’t familiar with web platforms:
                clear role choice, minimal steps, and clean forms.
              </p>

              <div className="mt-8 grid gap-4">
                <Feature
                  title="Role-first flow"
                  desc="Users choose Client or Provider, then see the right form."
                />
                <Feature
                  title="Minimal signup"
                  desc="Provider onboarding happens after account creation — less drop-off."
                />
                <Feature
                  title="Professional UX"
                  desc="Validation, feedback states, and demo accounts for easy testing."
                />
              </div>

              <div className="mt-10 rounded-2xl bg-zinc-900 p-5 text-white">
                <div className="text-sm font-medium">Pro tip</div>
                <div className="mt-1 text-sm text-zinc-200">
                  Keep signup lightweight. Collect extra provider details in a
                  2–3 step onboarding after login.
                </div>
              </div>
            </div>
          </div>

          <div>
            <Outlet />
            <div className="mt-6 text-center text-xs text-zinc-500">
              By continuing you agree to our Terms & Privacy (demo).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-zinc-600 mt-1">{desc}</div>
    </div>
  );
}
