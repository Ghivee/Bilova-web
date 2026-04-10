import React from 'react';
import { Home, Activity, BookOpen, User } from 'lucide-react';

const BottomNav = ({ active, setActive }) => {
    const navItems = [
        { id: 'beranda', icon: Home, label: 'BERANDA' },
        { id: 'gejala', icon: Activity, label: 'GEJALA' },
        { id: 'edukasi', icon: BookOpen, label: 'EDUKASI' },
        { id: 'profil', icon: User, label: 'PROFIL' }
    ];

    return (
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
            {navItems.map((item) => {
                const isActive = active === item.id;
                return (
                    <button
                        key={item.id} onClick={() => setActive(item.id)}
                        className="flex flex-col items-center justify-center w-16 py-2 gap-1.5 transition-all"
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#DFF0EE] text-[#138476]' : 'text-slate-400 hover:bg-slate-50'}`}>
                            <item.icon size={22} className={isActive ? 'fill-[#138476]/20' : ''} />
                        </div>
                        <span className={`text-[9px] font-extrabold tracking-wider ${isActive ? 'text-[#138476]' : 'text-slate-400'}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;