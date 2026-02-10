import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "2rem",
        fontWeight: 700,
        color: "#18181b",
        textDecoration: "none",
        letterSpacing: "2px",
        fontFamily: "fantasy",
        cursor: "pointer",
      }}
      onClick={() => navigate('./HomePage')}
    >
      <FontAwesomeIcon icon={faScrewdriverWrench} />FixHub
    </div >
  );
}

export default function AuthLayout() {
  const location = useLocation();
  const isAuth = ["/get-started", "/sign-in", "/sign-up/client", "/sign-up/provider"].includes(
    location.pathname
  );

  if (!isAuth) return <Outlet />;

  return (
    <div className="min-h-full">
      <div >
        <div className="mx-auto flex max-w-[85rem] items-center py-5">
          <div className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
            <Logo />
          </div>
        </div>
        <div className="h-px w-full bg-zinc-200" />
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
