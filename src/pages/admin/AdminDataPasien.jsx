import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, ChevronRight, Pill, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDataPasien = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientMeds, setPatientMeds] = useState([]);
    const [patientSymptoms, setPatientSymptoms] = useState([]);

    // Form tambah obat
    const [showMedForm, setShowMedForm] = useState(false);
    const [medForm, setMedForm] = useState({
        name: '', dosage: '', frequency: '', instruction: '',
        total_tablets: 0, remaining_tablets: 0
    });
    const [savingMed, setSavingMed] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'user')
                .order('created_at', { ascending: false });
            if (data) setPatients(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        // Fetch patient's medications
        const { data: meds } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', patient.id)
            .order('created_at', { ascending: false });
        setPatientMeds(meds || []);

        // Fetch patient's symptoms
        const { data: symptoms } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(10);
        setPatientSymptoms(symptoms || []);
    };

    const handleMedSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi dasar
        if (!medForm.name || !medForm.dosage || !medForm.frequency) {
            alert('Harap isi minimal nama obat, dosis, dan frekuensi.');
            return;
        }

        setSavingMed(true);
        try {
            const { error } = await supabase.from('medications').insert({
                user_id: selectedPatient.id,
                name: medForm.name,
                dosage: medForm.dosage,
                frequency: medForm.frequency,
                instruction: medForm.instruction,
                total_tablets: parseInt(medForm.total_tablets) || 0,
                remaining_tablets: parseInt(medForm.remaining_tablets) || 0,
                is_active: true
            });
            
            if (error) throw error;

            // Reset form dan feedback
            setMedForm({ name: '', dosage: '', frequency: '', instruction: '', total_tablets: 0, remaining_tablets: 0 });
            setShowMedForm(false);
            
            // Refresh detail pasien
            await selectPatient(selectedPatient);
            
            // Note: Idealnya pake toast, tapi untuk efisiensi token pake alert dulu atau update UI state
            console.log('Obat berhasil ditambahkan');
        } catch (err) {
            console.error('Error adding medication:', err);
            alert('Gagal menambahkan obat: ' + (err.message || 'Terjadi kesalahan jaringan'));
        } finally {
            setSavingMed(false);
        }
    };

    const toggleMedStatus = async (medId, currentStatus) => {
        try {
            await supabase.from('medications').update({ is_active: !currentStatus }).eq('id', medId);
            selectPatient(selectedPatient);
        } catch (err) {
            console.error('Toggle error:', err);
        }
    };

    const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';

    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Detail Pasien View
    if (selectedPatient) {
        return (
            <div>
                <button
                    onClick={() => setSelectedPatient(null)}
                    className="flex items-center gap-2 text-emerald-700 font-bold mb-6 hover:underline"
                >
                    ← Kembali ke Daftar
                </button>

                {/* Patient Info */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xl">
                            {getInitials(selectedPatient.full_name)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-emerald-900">{selectedPatient.full_name || '-'}</h3>
                            <p className="text-emerald-700/70">{selectedPatient.email}</p>
                            <div className="flex gap-3 mt-2 text-sm text-emerald-600">
                                {selectedPatient.gender && <span>{selectedPatient.gender}</span>}
                                {selectedPatient.phone && <span>· {selectedPatient.phone}</span>}
                            </div>
                        </div>
                    </div>
                    {selectedPatient.allergy_info && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 mt-2 w-fit">
                            <AlertTriangle size={16} />
                            <span className="text-sm font-bold">Alergi: {selectedPatient.allergy_info}</span>
                        </div>
                    )}
                </div>

                {/* Medications */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-slate-900">Resep Obat</h4>
                        <button
                            onClick={() => setShowMedForm(!showMedForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition"
                        >
                            <Pill size={14} /> {showMedForm ? 'Batal' : 'Tambah Obat'}
                        </button>
                    </div>

                    {showMedForm && (
                        <form onSubmit={handleMedSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input name="name" value={medForm.name} onChange={(e) => setMedForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Nama obat" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                                <input name="dosage" value={medForm.dosage} onChange={(e) => setMedForm(f => ({ ...f, dosage: e.target.value }))}
                                    placeholder="Dosis (misal: 500mg)" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                                <input name="frequency" value={medForm.frequency} onChange={(e) => setMedForm(f => ({ ...f, frequency: e.target.value }))}
                                    placeholder="Frekuensi (misal: 3x sehari)" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                                <input name="instruction" value={medForm.instruction} onChange={(e) => setMedForm(f => ({ ...f, instruction: e.target.value }))}
                                    placeholder="Instruksi (misal: Setelah makan)" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                                <input name="total_tablets" type="number" value={medForm.total_tablets} onChange={(e) => setMedForm(f => ({ ...f, total_tablets: e.target.value }))}
                                    placeholder="Total tablet" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                                <input name="remaining_tablets" type="number" value={medForm.remaining_tablets} onChange={(e) => setMedForm(f => ({ ...f, remaining_tablets: e.target.value }))}
                                    placeholder="Sisa tablet" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500" />
                            </div>
                            <button type="submit" disabled={savingMed} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50">
                                {savingMed ? 'Menyimpan...' : 'Simpan Obat'}
                            </button>
                        </form>
                    )}

                    <div className="space-y-3">
                        {patientMeds.map(med => (
                            <div key={med.id} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${med.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                        <Pill size={18} className={med.is_active ? 'text-emerald-600' : 'text-slate-400'} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{med.name} {med.dosage}</p>
                                        <p className="text-xs text-slate-500">{med.frequency} · {med.instruction || '-'}</p>
                                        <p className="text-xs text-slate-400 mt-1">Sisa: {med.remaining_tablets}/{med.total_tablets} tablet</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleMedStatus(med.id, med.is_active)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${med.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {med.is_active ? 'Aktif' : 'Nonaktif'}
                                </button>
                            </div>
                        ))}
                        {patientMeds.length === 0 && (
                            <p className="text-center text-slate-400 py-6">Belum ada resep obat untuk pasien ini.</p>
                        )}
                    </div>
                </div>

                {/* Symptom History */}
                {patientSymptoms.length > 0 && (
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-4">Riwayat Gejala</h4>
                        <div className="space-y-3">
                            {patientSymptoms.map(log => (
                                <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-wrap gap-1">
                                            {log.symptoms?.map((s, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">{s}</span>
                                            ))}
                                        </div>
                                        <span className={`text-sm font-bold ${log.severity >= 7 ? 'text-emerald-600' : log.severity >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
                                            Kondisi: {log.severity}/10
                                        </span>
                                    </div>
                                    {log.notes && <p className="text-sm text-slate-500 mt-1">{log.notes}</p>}
                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Patient List View
    return (
        <div>
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h3 className="text-3xl font-extrabold text-emerald-900 tracking-tight mb-2">Data Pasien</h3>
                    <p className="text-emerald-700/70 text-base">Kelola dan pantau seluruh basis data pasien dengan sistem pemantauan antibiotik terpadu.</p>
                </div>
                <div className="flex gap-3">
                    <span className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-emerald-800 border border-emerald-100">
                        {patients.length} Pasien
                    </span>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl mb-6 border border-slate-100">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl pl-11 py-3 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
                        placeholder="Cari berdasarkan nama atau email..."
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/70">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pasien</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Email</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Gender</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Alergi</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                            {getInitials(patient.full_name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{patient.full_name || '-'}</p>
                                            <p className="text-xs text-slate-400 sm:hidden">{patient.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-500 hidden sm:table-cell">{patient.email}</td>
                                <td className="px-4 py-4 text-sm text-slate-500 hidden md:table-cell">{patient.gender || '-'}</td>
                                <td className="px-4 py-4 text-sm hidden md:table-cell">
                                    {patient.allergy_info ?
                                        <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-lg font-medium">{patient.allergy_info}</span>
                                        : <span className="text-slate-400">-</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => selectPatient(patient)}
                                        className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1 justify-end"
                                    >
                                        Detail <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-400">
                                    {searchTerm ? 'Tidak ditemukan hasil yang cocok' : 'Belum ada pasien terdaftar'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDataPasien;
