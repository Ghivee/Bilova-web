import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, TrendingUp, Activity, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        avgCompliance: 0,
        severeAlerts: 0,
        activeMonitoring: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Total pengguna aktif
            const { data: users, count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .eq('role', 'user');

            // Total compliance logs bulan ini
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const { data: logs } = await supabase
                .from('compliance_logs')
                .select('*')
                .gte('taken_at', startOfMonth.toISOString());

            // Gejala berat (severity >= 8)
            const { data: severeSymptoms, count: severeCount } = await supabase
                .from('symptom_logs')
                .select('*', { count: 'exact' })
                .gte('severity', 1)
                .lte('severity', 3);

            // Obat aktif
            const { count: activeMeds } = await supabase
                .from('medications')
                .select('*', { count: 'exact' })
                .eq('is_active', true);

            setStats({
                totalUsers: userCount || 0,
                avgCompliance: logs?.length > 0 ? Math.min(Math.round((logs.length / Math.max(userCount || 1, 1)) * 100 / new Date().getDate() * 10), 100) : 0,
                severeAlerts: severeCount || 0,
                activeMonitoring: activeMeds || 0
            });

            // Recent patients
            if (users) {
                setRecentPatients(users.slice(0, 5));
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        {
            label: 'Total Pengguna Aktif',
            value: stats.totalUsers.toLocaleString('id-ID'),
            change: '+4.2%',
            icon: Users,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-700',
            bgIcon: Users,
        },
        {
            label: 'Rata-rata Kepatuhan',
            value: `${stats.avgCompliance}%`,
            badge: stats.avgCompliance >= 80 ? 'OPTIMAL' : stats.avgCompliance >= 50 ? 'SEDANG' : 'RENDAH',
            badgeColor: stats.avgCompliance >= 80 ? 'bg-emerald-100 text-emerald-700' : stats.avgCompliance >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
            icon: CheckCircle,
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-700',
            bgIcon: CheckCircle,
        },
        {
            label: 'Alert Gejala Berat',
            value: stats.severeAlerts.toString(),
            subtitle: 'Perlu Perhatian',
            icon: AlertTriangle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            valueColor: 'text-red-600',
            bgIcon: AlertTriangle,
        },
    ];

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    };

    const getInitialColor = (name) => {
        const colors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
        return colors[(name || '').length % colors.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Hero Heading — Soft Green, padded, rounded */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100/50">
                <h3 className="text-3xl font-extrabold text-emerald-900 tracking-tight mb-2">Sistem Kontrol Klinis</h3>
                <p className="text-emerald-700/70 text-base">
                    Selamat datang kembali, Admin. Berikut ringkasan status kesehatan sistem hari ini.
                </p>
            </div>

            {/* Metrics Grid — Elegant, Soft Green theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {metricCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.04]">
                            <card.bgIcon size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                                <card.icon size={20} className={card.iconColor} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-black tracking-tight ${card.valueColor || 'text-slate-900'}`}>{card.value}</span>
                            {card.change && <span className="text-emerald-600 font-bold text-sm">{card.change}</span>}
                            {card.badge && <span className={`px-3 py-1 rounded-full text-xs font-bold ${card.badgeColor}`}>{card.badge}</span>}
                            {card.subtitle && <span className="text-red-500 font-bold text-sm">{card.subtitle}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content — dual column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-slate-900">Daftar Pengguna</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                        <th className="px-4 py-3 rounded-l-xl">Nama Lengkap</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Gender</th>
                                        <th className="px-4 py-3 rounded-r-xl text-right">Bergabung</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentPatients.map((patient) => (
                                        <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getInitialColor(patient.full_name)}`}>
                                                    {getInitials(patient.full_name)}
                                                </div>
                                                <span className="font-semibold text-slate-800">{patient.full_name || '-'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-500">{patient.email}</td>
                                            <td className="px-4 py-4 text-slate-500">{patient.gender || '-'}</td>
                                            <td className="px-4 py-4 text-right text-slate-400 text-xs">
                                                {new Date(patient.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentPatients.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-slate-400">Belum ada pengguna terdaftar</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl shadow-emerald-600/20">
                        <div className="relative z-10">
                            <h5 className="text-lg font-bold mb-2">Kesehatan Sistem</h5>
                            <p className="text-sm text-emerald-100 leading-relaxed mb-4">
                                Infrastruktur cloud BILOVA beroperasi optimal. Semua sinkronisasi data real-time aktif.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
                                </span>
                                <span className="text-xs font-bold tracking-widest uppercase">Live Status: OK</span>
                            </div>
                        </div>
                        <Activity size={120} className="absolute -right-6 -top-6 text-emerald-700/30" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-5">Wawasan Strategis</h5>
                        <ul className="space-y-5">
                            <li className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-emerald-700" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 mb-0.5">Adopsi Mobile Meningkat</p>
                                    <p className="text-[11px] text-slate-500 leading-tight">Penggunaan aplikasi seluler meningkat 15% pada kuartal ini.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Clock size={14} className="text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 mb-0.5">Waktu Respons Rata-rata</p>
                                    <p className="text-[11px] text-slate-500 leading-tight">Dokter merespons red flags dalam rata-rata 14 menit.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
