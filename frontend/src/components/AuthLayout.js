import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";


function Logo() {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-zinc-900 tracking-[2px] font-[fantasy] no-underline">
      <div>
        <FontAwesomeIcon icon={faScrewdriverWrench} className="text-sm" />
      </div>
      <div>
        <div className="font-fantasy leading-5">FixHub</div>
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

        <div className="min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md sm:max-w-lg">
            <Outlet />
            <div className="mt-6 text-center text-xs text-zinc-500">
              By continuing you agree to our Terms & Privacy .
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
