import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const UserLayout = () => {
  const location = useLocation();
  return (
    /* Full-height layout — never overflows except page content */
    <div className="flex h-dvh overflow-hidden bg-[#FCF7FF]">
      {/* Subtle background decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#EDD9F5]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-56 h-56 bg-[#D4A8E0]/20 rounded-full blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <BottomNav />

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto lg:ml-64 xl:ml-72 relative z-10 scroll-area">
        {/* Page content */}
        <div className="pb-24 lg:pb-8" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
