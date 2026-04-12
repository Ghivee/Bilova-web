import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Calendar as CalendarIcon, Clock, Activity } from 'lucide-react';
import { Button } from '../../components/UIComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Beranda = () => {
    const { profile } = useAuth();
    const [medications, setMedications] = useState([]);
    const [todayLogs, setTodayLogs] = useState([]);
    const [takenIds, setTakenIds] = useState(new Set());
    const [loadingMed, setLoadingMed] = useState(null);

    const today = new Date();
    const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

    // Buat kalender mingguan dari hari ini
    const getWeekDays = () => {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const isToday = d.toDateString() === today.toDateString();
            const isPast = d < today && !isToday;
            return { day: dayNames[d.getDay()], date: d.getDate(), isToday, isPast, full: d };
        });
    };

    const calendarDays = getWeekDays();

    useEffect(() => {
        fetchMedications();
        fetchTodayLogs();
    }, []);

    const fetchMedications = async () => {
        try {
            const { data } = await supabase
                .from('medications')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (data) setMedications(data);
        } catch (err) {
            console.error('Error fetching medications:', err);
        }
    };

    const fetchTodayLogs = async () => {
        try {
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const { data } = await supabase
                .from('compliance_logs')
                .select('*')
                .gte('taken_at', startOfDay.toISOString())
                .eq('status', 'taken');
            if (data) {
                setTodayLogs(data);
                setTakenIds(new Set(data.map(l => l.medication_id)));
            }
        } catch (err) {
            console.error('Error fetching today logs:', err);
        }
    };

    const handleConfirmMed = async (medicationId) => {
        if (!profile) return;
        setLoadingMed(medicationId);
        try {
            const { error } = await supabase.from('compliance_logs').insert({
                user_id: profile.id,
                medication_id: medicationId,
                taken_at: new Date().toISOString(),
                status: 'taken'
            });
            if (error) throw error;

            // Kurangi sisa tablet
            const med = medications.find(m => m.id === medicationId);
            if (med && med.remaining_tablets > 0) {
                const { error: updateError } = await supabase
                    .from('medications')
                    .update({ remaining_tablets: med.remaining_tablets - 1 })
                    .eq('id', medicationId)
                    .eq('user_id', profile.id); // Guard tambahan
                
                if (updateError) console.error('Gagal update sisa tablet:', updateError);
            }

            setTakenIds(prev => new Set([...prev, medicationId]));
            fetchMedications();
            fetchTodayLogs(); // Refresh logs juga
        } catch (err) {
            console.error('Error confirming medication:', err);
            alert('Gagal mengonfirmasi minum obat. Silakan coba lagi.');
        } finally {
            setLoadingMed(null);
        }
    };

    // Hitung kepatuhan
    const totalDoses = medications.length * 7; // simplifikasi
    const takenDoses = todayLogs.length;
    const compliancePercent = totalDoses > 0 ? Math.round((takenDoses / Math.max(medications.length, 1)) * 100) : 0;

    const firstName = profile?.full_name?.split(' ')[0] || 'Pengguna';

    return (
        <div className="pb-24">
            {/* Header dengan Logo — hanya di Beranda */}
            <div className="flex items-center justify-between py-4 px-6 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Activity size={22} className="text-[#138476]" />
                    <h1 className="text-lg font-bold text-[#138476] uppercase tracking-wide">BILOVA</h1>
                </div>
                <div />
            </div>

            <div className="px-6 mt-2 mb-6">
                <p className="text-slate-600 font-medium text-lg">Halo, {firstName} 👋</p>
                <h2 className="text-2xl font-extrabold text-slate-800">Kesehatan Anda Hari Ini</h2>
            </div>

            {/* Daftar Obat */}
            {medications.length > 0 ? medications.map((med) => {
                const isTaken = takenIds.has(med.id);
                return (
                    <div key={med.id} className="px-6 mb-4">
                        <div className="bg-white rounded-[2rem] p-6 shadow-md shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="bg-[#DFF0EE] text-[#138476] text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                                        {isTaken ? '✓ Sudah Diminum' : 'Dosis Berikutnya'}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-800 mt-3 mb-1">{med.name} {med.dosage}</h3>
                                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                        <Clock size={14} />
                                        <span>{med.frequency}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-100 p-3 rounded-2xl">
                                    <Pill size={24} className="text-[#138476]" />
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between mb-4 border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Instruksi</p>
                                    <p className="font-semibold text-slate-800 text-sm">{med.instruction || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Sisa</p>
                                    <p className="font-semibold text-[#138476] text-sm">{med.remaining_tablets} Tablet</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleConfirmMed(med.id)}
                                variant={isTaken ? "secondary" : "primary"}
                                disabled={isTaken || loadingMed === med.id}
                                className={isTaken ? "!bg-slate-100 !text-slate-500 !shadow-none" : ""}
                            >
                                {loadingMed === med.id ? 'Menyimpan...' : isTaken ? 'Sudah Diminum ✓' : <><CheckCircle2 size={20} /> Konfirmasi Minum</>}
                            </Button>
                        </div>
                    </div>
                );
            }) : (
                <div className="px-6 mb-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-md border border-slate-100 text-center">
                        <Pill size={40} className="text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-600 mb-1">Belum Ada Obat</h3>
                        <p className="text-sm text-slate-400">Resep obat akan muncul di sini setelah ditambahkan oleh admin.</p>
                    </div>
                </div>
            )}

            {/* Kalender Mingguan */}
            <div className="px-6 mb-8 mt-4">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Kalender Mingguan</h3>
                    <span className="text-sm font-semibold text-[#138476]">
                        {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {calendarDays.map((item, idx) => (
                        <div key={idx} className={`flex-shrink-0 w-16 h-24 rounded-full flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                            item.isToday ? 'bg-[#138476] border-[#138476] shadow-lg shadow-teal-500/30' :
                            item.isPast ? 'bg-[#DFF0EE] border-[#DFF0EE]' :
                            'bg-slate-50 border-slate-100'
                        }`}>
                            <span className={`text-xs font-bold ${item.isToday ? 'text-teal-100' : 'text-slate-500'}`}>{item.day}</span>
                            <span className={`text-xl font-extrabold ${item.isToday ? 'text-white' : 'text-slate-800'}`}>{item.date}</span>
                            <div className="mt-1 h-5 flex items-center justify-center">
                                {item.isPast && <CheckCircle2 size={16} className="text-[#138476]" />}
                                {item.isToday && <div className="w-2 h-2 rounded-full bg-white" />}
                                {!item.isPast && !item.isToday && <div className="w-2 h-2 rounded-full bg-slate-300" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kartu Kepatuhan */}
            <div className="px-6 space-y-4">
                <div className="bg-[#DFF0EE] rounded-3xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div className="z-10 w-2/3">
                        <h4 className="font-bold text-slate-800 text-lg mb-1">
                            {compliancePercent >= 80 ? 'Kepatuhan Sangat Baik!' :
                             compliancePercent >= 50 ? 'Kepatuhan Cukup Baik' : 'Ayo Tingkatkan Kepatuhan!'}
                        </h4>
                        <p className="text-sm text-slate-600 font-medium">
                            Anda telah meminum {takenDoses} dosis hari ini. Pertahankan!
                        </p>
                    </div>
                    <div className="z-10 w-16 h-16 bg-[#138476] rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xl">
                        {Math.min(compliancePercent, 100)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Beranda;