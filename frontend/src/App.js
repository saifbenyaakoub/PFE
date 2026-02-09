import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import ChooseRole from "./pages/ChooseRole";
import SignIn from "./pages/SignIn";
import SignUpClient from "./pages/SignUpClient";
import SignUpProvider from "./pages/SignUpProvider";
import ClientHome from "./pages/ClientHome";
import ProviderDashboard from "./pages/ProviderDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<ChooseRole />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up/client" element={<SignUpClient />} />
        <Route path="/sign-up/provider" element={<SignUpProvider />} />
      </Route>

      <Route path="/client" element={<ClientHome />} />
      <Route path="/provider" element={<ProviderDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
