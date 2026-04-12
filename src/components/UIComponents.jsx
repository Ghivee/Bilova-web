import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';

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

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    const baseStyle = "w-full py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: `bg-[#138476] text-white shadow-lg shadow-teal-500/30`,
        secondary: `bg-[#E2E8F0] text-slate-700`,
        outline: `border-2 border-[#138476] text-[#138476]`,
        ghost: `text-[#138476] bg-transparent hover:bg-teal-50`,
        danger: `bg-red-500 text-white shadow-lg shadow-red-500/30`
    };

    return (
        <motion.button whileTap={{ scale: disabled ? 1 : 0.97 }} type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </motion.button>
    );
};

export const InputField = ({ icon: Icon, type = 'text', placeholder, rightIcon, value, onChange, name, ...props }) => (
    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-4 w-full flex items-center gap-3 shadow-sm focus-within:border-[#138476] focus-within:ring-1 focus-within:ring-[#138476] transition-all">
        {Icon && <Icon size={20} className="text-slate-400 shrink-0" />}
        <input
            type={type} placeholder={placeholder} value={value} onChange={onChange} name={name}
            className="bg-transparent flex-1 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            {...props}
        />
        {rightIcon}
    </div>
);

// Header tanpa foto profil — dipakai di semua halaman kecuali Beranda
export const Header = ({ title, showBack, onBack, rightElement, showLogo = false }) => (
    <div className="flex items-center justify-between py-4 px-6 bg-transparent sticky top-0 z-10">
        <div className="flex items-center gap-3">
            {showBack && (
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200/50 transition">
                    <ChevronLeft size={24} className="text-[#138476]" />
                </button>
            )}
            <h1 className="text-lg font-bold text-[#138476] uppercase tracking-wide">{title}</h1>
        </div>
        {rightElement || <div />}
    </div>
);

export const Notification = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed top-6 left-6 right-6 z-[100] p-4 rounded-2xl border shadow-lg flex items-center justify-between ${styles[type]}`}
    >
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
        <X size={16} />
      </button>
    </motion.div>
  );
};