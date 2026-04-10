import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, color = '#138476' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="transparent" />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference} strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex items-center justify-center font-bold text-2xl" style={{ color }}>
                {percentage}%
            </div>
        </div>
    );
};

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
    const baseStyle = "w-full py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]";
    const variants = {
        primary: `bg-[#138476] text-white shadow-lg shadow-teal-500/30`,
        secondary: `bg-[#E2E8F0] text-slate-700`,
        outline: `border-2 border-[#138476] text-[#138476]`,
        ghost: `text-[#138476] bg-transparent hover:bg-teal-50`
    };

    return (
        <motion.button whileTap={{ scale: 0.97 }} type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </motion.button>
    );
};

export const InputField = ({ icon: Icon, type = 'text', placeholder, rightIcon, ...props }) => (
    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-4 w-full flex items-center gap-3 shadow-sm focus-within:border-[#138476] focus-within:ring-1 focus-within:ring-[#138476] transition-all">
        {Icon && <Icon size={20} className="text-slate-400" />}
        <input
            type={type} placeholder={placeholder}
            className="bg-transparent flex-1 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            {...props}
        />
        {rightIcon}
    </div>
);

export const Header = ({ title, showBack, onBack, rightElement }) => (
    <div className="flex items-center justify-between py-4 px-6 bg-transparent sticky top-0 z-10">
        <div className="flex items-center gap-3">
            {showBack && (
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200/50 transition">
                    <ChevronLeft size={24} className="text-[#138476]" />
                </button>
            )}
            <h1 className="text-lg font-bold text-[#138476] uppercase tracking-wide">{title}</h1>
        </div>
        {rightElement || (
            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&backgroundColor=e2e8f0" alt="Avatar" className="w-full h-full object-cover" />
            </div>
        )}
    </div>
);