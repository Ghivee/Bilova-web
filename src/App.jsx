import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Halaman Auth
import LoginScreen from './pages/auth/Login';
import RegisterScreen from './pages/auth/Register';
import ForgotPasswordScreen from './pages/auth/ForgotPassword';

// Import Halaman Utama
import Beranda from './pages/main/Beranda';
import Gejala from './pages/main/Gejala';
import Edukasi from './pages/main/Edukasi';
import Profil from './pages/main/Profil';

// Import Navigasi
import BottomNav from './components/BottomNav';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState('login'); // 'login', 'register', 'forgot'
    const [activeTab, setActiveTab] = useState('beranda');

    const handleLogin = () => setIsAuthenticated(true);
    const handleLogout = () => {
        setIsAuthenticated(false);
        setAuthView('login');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center font-['Manrope'] overflow-hidden">
            {/* Background elements for premium look */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-[#F7F9FA] min-h-screen relative overflow-hidden md:rounded-[3rem] md:h-[90vh] md:min-h-[800px] md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 flex flex-col">
                
                {!isAuthenticated && (
                    <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-teal-50 to-transparent pointer-events-none"></div>
                )}

                <AnimatePresence mode="wait">

                    {!isAuthenticated ? (
                        <motion.div
                            key={authView}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            className="h-full overflow-y-auto hide-scrollbar"
                        >
                            {authView === 'login' && <LoginScreen onNavigate={setAuthView} onLogin={handleLogin} />}
                            {authView === 'register' && <RegisterScreen onNavigate={setAuthView} />}
                            {authView === 'forgot' && <ForgotPasswordScreen onNavigate={setAuthView} />}
                        </motion.div>
                    ) : (
                        <motion.div key="main-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                            <div className="h-full overflow-y-auto hide-scrollbar bg-slate-50/50">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'beranda' && <Beranda />}
                                        {activeTab === 'gejala' && <Gejala />}
                                        {activeTab === 'edukasi' && <Edukasi />}
                                        {activeTab === 'profil' && <Profil onLogout={handleLogout} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <BottomNav active={activeTab} setActive={setActiveTab} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}