import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../pages/navbar';
import Footer from '../pages/footer';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <div key={location.pathname} className="page-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;