import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminKepatuhan = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortDirection, setSortDirection] = useState('desc');
    const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });

    useEffect(() => {
        fetchComplianceData();
    }, []);

    const fetchComplianceData = async () => {
        try {
            // Ambil semua user
            const { data: users } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'user');

            if (!users) return;

            // Untuk tiap user, hitung compliance
            const patientsWithCompliance = await Promise.all(
                users.map(async (user) => {
                    const { data: logs } = await supabase
                        .from('compliance_logs')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('status', 'taken');

                    const { data: meds } = await supabase
                        .from('medications')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_active', true);

                    const totalExpected = (meds?.length || 0) * 7; // simplifikasi 7 hari
                    const taken = logs?.length || 0;
                    const percentage = totalExpected > 0 ? Math.min(Math.round((taken / totalExpected) * 100), 100) : 0;

                    let status = 'low';
                    if (percentage >= 80) status = 'high';
                    else if (percentage >= 50) status = 'medium';

                    return {
                        ...user,
                        compliance: percentage,
                        totalDoses: totalExpected,
                        takenDoses: taken,
                        status,
                        activeMeds: meds?.length || 0
                    };
                })
            );

            setPatients(patientsWithCompliance);

            // Stats
            const high = patientsWithCompliance.filter(p => p.status === 'high').length;
            const medium = patientsWithCompliance.filter(p => p.status === 'medium').length;
            const low = patientsWithCompliance.filter(p => p.status === 'low').length;
            setStats({ high, medium, low });
        } catch (err) {
            console.error('Error fetching compliance:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter & search
    const filteredPatients = patients
        .filter(p => filterStatus === 'all' || p.status === filterStatus)
        .filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortDirection === 'desc' ? b.compliance - a.compliance : a.compliance - b.compliance);

    const getStatusBadge = (status) => {
        const styles = {
            high: 'bg-emerald-100 text-emerald-700',
            medium: 'bg-amber-100 text-amber-700',
            low: 'bg-red-100 text-red-700'
        };
        const labels = { high: 'Sangat Patuh', medium: 'Kurang Patuh', low: 'Tidak Patuh' };
        return <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'high' ? 'bg-emerald-500' : status === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
            {labels[status]}
        </span>;
    };

    const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Header — Soft Green, consistent with dashboard */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100/50">
                <h3 className="text-3xl font-extrabold text-emerald-900 tracking-tight mb-2">Kepatuhan & Monitoring</h3>
                <p className="text-emerald-700/70 text-base">
                    Pantau dan evaluasi tingkat kepatuhan seluruh pasien terhadap pengobatan antibiotik.
                </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <ClipboardCheck size={22} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-emerald-700">{stats.high}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Kepatuhan Tinggi</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ClipboardCheck size={22} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-amber-700">{stats.medium}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Kepatuhan Sedang</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <ClipboardCheck size={22} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-red-700">{stats.low}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Kepatuhan Rendah</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-center border border-slate-100">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl pl-11 py-3 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
                        placeholder="Cari nama atau email pasien..."
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                    <option value="all">Semua Status</option>
                    <option value="high">Sangat Patuh</option>
                    <option value="medium">Kurang Patuh</option>
                    <option value="low">Tidak Patuh</option>
                </select>
                <button
                    onClick={() => setSortDirection(d => d === 'desc' ? 'asc' : 'desc')}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium text-slate-600"
                >
                    {sortDirection === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    Sort
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/70">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pasien</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Obat Aktif</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dosis Diminum</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kepatuhan</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                            {getInitials(patient.full_name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{patient.full_name || '-'}</p>
                                            <p className="text-xs text-slate-400">{patient.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600 font-medium">{patient.activeMeds}</td>
                                <td className="px-4 py-4 text-sm text-slate-600 font-medium">{patient.takenDoses}/{patient.totalDoses}</td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    patient.compliance >= 80 ? 'bg-emerald-500' :
                                                    patient.compliance >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${patient.compliance}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{patient.compliance}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">{getStatusBadge(patient.status)}</td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-400">
                                    {searchTerm || filterStatus !== 'all' ? 'Tidak ditemukan hasil yang cocok' : 'Belum ada data kepatuhan'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminKepatuhan;
