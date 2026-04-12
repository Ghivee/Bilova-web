import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';

const UserLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center font-['Manrope'] overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-[#F7F9FA] min-h-screen relative overflow-hidden md:rounded-[3rem] md:h-[90vh] md:min-h-[800px] md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default UserLayout;
