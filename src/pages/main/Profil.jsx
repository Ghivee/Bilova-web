import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, History, LogOut, ChevronRight, Edit3, Save, X, User } from 'lucide-react';
import { Header, CircularProgress, Button, InputField, Modal } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Profil = () => {
    const { profile, signOut, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        gender: '',
        allergy_info: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [complianceStats, setComplianceStats] = useState({ total: 0, taken: 0, percentage: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                gender: profile.gender || '',
                allergy_info: profile.allergy_info || '',
            });
            fetchComplianceStats();
            fetchRecentLogs();
        }
    }, [profile]);

    const fetchComplianceStats = async () => {
        if (!profile) return;
        try {
            const { data: meds } = await supabase.from('medications').select('id').eq('user_id', profile.id).eq('is_active', true);
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const { data: logs } = await supabase
                .from('compliance_logs')
                .select('id')
                .eq('user_id', profile.id)
                .eq('status', 'taken')
                .gte('taken_at', startOfMonth.toISOString());

            const totalExpected = (meds?.length || 0) * new Date().getDate(); 
            const taken = logs?.length || 0;
            const percentage = totalExpected > 0 ? Math.min(Math.round((taken / totalExpected) * 100), 100) : 0;
            setComplianceStats({ total: totalExpected, taken, percentage });
        } catch (err) {
            console.error('Error fetching compliance:', err);
        }
    };

    const fetchRecentLogs = async () => {
        if (!profile) return;
        try {
            const { data } = await supabase
                .from('compliance_logs')
                .select('*, medications(name, dosage)')
                .eq('user_id', profile.id)
                .order('taken_at', { ascending: false })
                .limit(10);
            if (data) setRecentLogs(data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            await updateProfile(form);
            setSuccess('Profil berhasil diperbarui!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="pb-24">
            <Header title="Profil" />

            <div className="flex flex-col items-center mt-4 px-6 relative z-10">
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full bg-[#DFF0EE] flex items-center justify-center border-4 border-[#138476] shadow-lg">
                        <User size={48} className="text-[#138476]" />
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">{profile?.full_name || 'Pengguna'}</h2>
                <p className="text-sm text-slate-500 font-medium">{profile?.email}</p>

                {profile?.allergy_info && (
                    <div className="mt-4 bg-[#FEE2E2] text-red-700 px-5 py-3 rounded-xl flex items-center gap-2 border border-red-200 w-full max-w-sm justify-center">
                        <AlertTriangle size={18} />
                        <span className="font-extrabold text-sm uppercase">Alergi: {profile.allergy_info}</span>
                    </div>
                )}
            </div>

            <div className="px-6 mt-8 space-y-6">
                {success && (
                    <div className="bg-[#DFF0EE] border border-[#138476]/20 text-[#138476] px-4 py-3 rounded-xl text-sm font-bold text-center">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="w-1/2">
                        <h3 className="font-extrabold text-lg text-slate-800 mb-2">Rapor Kepatuhan</h3>
                        <p className="text-sm text-slate-500 font-medium">{complianceStats.taken} dosis dimonum bulan ini</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {complianceStats.percentage >= 80 ? '🌟 Sangat Baik!' :
                             complianceStats.percentage >= 50 ? '👍 Cukup Baik' : '⚠️ Perlu Ditingkatkan'}
                        </p>
                    </div>
                    <div className="w-1/2 flex justify-end">
                        <CircularProgress percentage={complianceStats.percentage} size={110} strokeWidth={12} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-lg text-slate-800">Data Pribadi</h3>
                        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-[#138476] font-bold text-sm">
                            {editing ? <><X size={14} /> Batal</> : <><Edit3 size={14} /> Edit</>}
                        </button>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <InputField name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nama lengkap" />
                            <InputField name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxx" type="tel" />
                            <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-4 py-4 text-slate-800 font-medium">
                                <option value="">-- Jenis Kelamin --</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            <InputField name="allergy_info" value={form.allergy_info} onChange={handleChange} placeholder="Info Alergi" />
                            <Button onClick={handleSave} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500 font-medium">Nama</span>
                                <span className="text-sm text-slate-800 font-semibold">{profile?.full_name || '-'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500 font-medium">Alergi</span>
                                <span className="text-sm text-slate-800 font-semibold text-red-600">{profile?.allergy_info || '-'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <button onClick={() => setShowHistoryModal(true)} className="w-full bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-4 text-slate-800 font-bold">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100"><History size={20} /></div>
                            Riwayat Medis
                        </div>
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                    <button onClick={() => setShowLogoutModal(true)} className="w-full bg-[#FEE2E2]/50 rounded-2xl p-5 flex items-center justify-between border border-red-100">
                        <div className="flex items-center gap-4 text-red-700 font-bold">
                            <div className="bg-white p-2 rounded-xl border border-red-100"><LogOut size={20} /></div>
                            Keluar Akun
                        </div>
                        <ChevronRight size={20} className="text-red-400" />
                    </button>
                </div>
            </div>

            <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar" footer={<><Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Batal</Button><Button variant="danger" onClick={handleConfirmLogout}>Keluar</Button></>}>
                Apakah Anda yakin ingin keluar dari akun BILOVA Anda?
            </Modal>

            <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Riwayat Pengobatan" footer={<Button onClick={() => setShowHistoryModal(false)}>Tutup</Button>}>
                <div className="text-left max-h-[40vh] overflow-y-auto space-y-3">
                    {recentLogs.length > 0 ? recentLogs.map(log => (
                        <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                             <p className="font-bold text-slate-800">{log.medications?.name} {log.medications?.dosage}</p>
                             <p className="text-slate-500 mt-1">{new Date(log.taken_at).toLocaleString('id-ID')}</p>
                        </div>
                    )) : <p className="text-center py-4 text-slate-400">Belum ada riwayat.</p>}
                </div>
            </Modal>
        </div>
    );
};

export default Profil;