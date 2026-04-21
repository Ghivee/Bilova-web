import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LineChart, BookOpen, UserCircle2, Bot, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NutriSeaLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-cyan-400 flex items-center justify-center shadow-sm">
      <span className="text-white font-black text-sm">N</span>
    </div>
    <div className="leading-none">
      <p className="font-black text-sky-700 text-base tracking-tight">NutriSea</p>
      <p className="font-bold text-slate-400 text-[9px] uppercase tracking-widest">Gizi Anak</p>
    </div>
  </div>
);

const navItems = [
  { to: '/', icon: Home, label: 'Beranda', end: true },
  { to: '/tumbuh-kembang', icon: LineChart, label: 'Tumbuh Kembang' },
  { to: '/edukasi', icon: BookOpen, label: 'Edukasi' },
  { to: '/nutri-bot', icon: Bot, label: 'Nutri-Bot' },
  { to: '/profil', icon: UserCircle2, label: 'Profil' },
];

const BottomNav = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* ─── Mobile: Bottom bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-sky-100 pb-safe shadow-nutrisea-sm">
        <div className="flex justify-around px-1 py-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1.5 rounded-2xl transition-all ${isActive ? 'text-sky-600' : 'text-slate-400'}`
              }>
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-sky-100' : 'hover:bg-sky-50'}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[9px] font-black">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ─── Desktop: Left Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-sky-100 flex-shrink-0 z-40 h-dvh sticky top-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-sky-100">
          <NutriSeaLogo />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isActive ? 'bg-sky-600 text-white shadow-nutrisea-sm' : 'text-slate-600 hover:bg-sky-50'
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-sm shadow-nutrisea-sm hover:opacity-90 transition">
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