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

      {/* Main scrollable content (flex-1 handles the width correctly when navbar is beside it) */}
      <main className="flex-1 w-full overflow-y-auto relative z-10 scroll-area">
        {/* Page content */}
        <div className="pb-24 lg:pb-8 flex justify-center w-full" key={location.pathname}>
          <div className="w-full max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
