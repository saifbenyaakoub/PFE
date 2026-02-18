import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from '../pages/navbar';
import './MainLayout.css';

export default function AuthLayout() {
  
  const location = useLocation();
  const isAuth = ["/get-started", "/sign-in", "/sign-up/client", "/sign-up/provider"].includes(
    location.pathname
  );

  if (!isAuth) return <Outlet />;

  return (
    <div className="min-h-full">
      <div >
        <Navbar />
        <div className="h-px w-full bg-zinc-200" />
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md sm:max-w-lg">
            <div key={location.pathname} className="page-fade-in">
              <Outlet />
            </div>
            <div className="mt-6 text-center text-xs text-zinc-500">
              By continuing you agree to our Terms & Privacy .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
