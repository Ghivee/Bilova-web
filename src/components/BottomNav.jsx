import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Stethoscope, BookOpen, UserCircle2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoSrc from '../assets/Bilova_Logo.png';

const navItems = [
  { to: '/', icon: Home, label: 'Beranda', end: true },
  { to: '/gejala', icon: Stethoscope, label: 'Gejala' },
  { to: '/edukasi', icon: BookOpen, label: 'Edukasi' },
  { to: '/profil', icon: UserCircle2, label: 'Profil' },
];

const BottomNav = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* ─── Mobile: Bottom bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#EDD9F5] pb-safe shadow-bilova-sm">
        <div className="flex justify-around px-2 py-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${isActive ? 'text-[#8B2C8C]' : 'text-[#B090C0]'}`
              }>
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#EDD9F5]' : 'hover:bg-[#EDD9F5]/60'}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-black">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ─── Desktop: Left Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-[#EDD9F5] flex-shrink-0 z-40 h-dvh sticky top-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#EDD9F5]">
          <img src={logoSrc} alt="BiLova" className="h-10 w-auto object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isActive ? 'bg-[#8B2C8C] text-white shadow-bilova-sm' : 'text-[#6B4B7B] hover:bg-[#EDD9F5]'
                }`
              }>
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin shortcut */}
        {isAdmin && (
          <div className="px-3 pb-4">
            <button onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#8B2C8C] to-[#C85CA0] text-white font-bold text-sm shadow-bilova-sm hover:opacity-90 transition">
              <LayoutDashboard size={16} /> Panel Admin
            </button>
          </div>
        )}
        <div className="pb-4" />
      </aside>
    </>
  );
};

export default BottomNav;