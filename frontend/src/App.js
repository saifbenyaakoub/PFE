import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthLayout from "./components/AuthLayout";
import MainLayout from "./components/MainLayout";
import ChooseRole from "./pages/ChooseRole";
import SignIn from "./pages/SignIn";
import SignUpClient from "./pages/SignUpClient";
import SignUpProvider from "./pages/SignUpProvider";
import ClientHome from "./pages/ClientHome";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import BookingService from "./pages/bookingService";
import BookingTask from './pages/bookingTask';


export default function App() {
  return (
    <>
    <Toaster position="top-right" />
   
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/client" element={<ClientHome />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookingService/:serviceId" element={<BookingService />} />
        <Route path="/bookingTask/:taskId" element={<BookingTask />} />
    
      </Route>

        <Route element={<AuthLayout />}>
          <Route path="/get-started" element={<ChooseRole />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up/client" element={<SignUpClient />} />
          <Route path="/sign-up/provider" element={<SignUpProvider />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
