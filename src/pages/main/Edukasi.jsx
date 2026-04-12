import React, { useState, useEffect } from 'react';
import { Star, HelpCircle, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { Header } from '../../components/UIComponents';
import { supabase } from '../../lib/supabase';

const Edukasi = () => {
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data, error } = await supabase
                .from('educational_articles')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setArticles(data);
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    // Tampilkan detail artikel
    if (selectedArticle) {
        return (
            <div className="pb-24">
                <Header title="Edukasi" showBack onBack={() => setSelectedArticle(null)} />
                <div className="px-6 mt-2">
                    <span className="bg-[#DFF0EE] text-[#138476] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedArticle.category || 'Umum'}
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-800 mt-4 mb-4 leading-snug">{selectedArticle.title}</h2>
                    <p className="text-xs text-slate-400 font-medium mb-6 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <Header title="Edukasi" />
            <div className="px-6 mt-2 mb-6">
                <p className="text-xs font-extrabold text-[#138476] uppercase mb-2">Pusat Pengetahuan</p>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight mb-1">Edukasi</h2>
                <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">Resistansi Obat.</h2>
            </div>

            <div className="px-6 space-y-6">
                {/* Tantangan Harian */}
                <div className="bg-[#138476] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-teal-500/20">
                    <div className="relative z-10 w-2/3">
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={16} className="fill-white" />
                            <span className="text-xs font-extrabold uppercase text-teal-100">Tantangan Hari Ini</span>
                        </div>
                        <h3 className="text-2xl font-extrabold mb-2">Kuis Harian AMR</h3>
                        <p className="text-sm text-teal-100 mb-4">Uji pengetahuan Anda tentang penggunaan antibiotik yang benar!</p>
                        <button className="bg-white text-[#138476] px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-shadow">Mulai Sekarang</button>
                    </div>
                    <HelpCircle size={140} className="absolute -right-8 -bottom-8 text-teal-600 opacity-50" />
                </div>

                {/* Mitos & Fakta */}
                <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-4">Mitos & Fakta</h3>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                        <span className="bg-[#DFF0EE] text-[#138476] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Fakta</span>
                        <h4 className="font-extrabold text-lg text-slate-800 mt-4 mb-3 w-4/5 leading-snug">
                            Antibiotik hanya untuk bakteri, bukan virus flu.
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Penggunaan antibiotik yang tidak tepat dapat menyebabkan resistansi bakteri, membuat infeksi semakin sulit diobati.
                        </p>
                    </div>
                </div>

                {/* Daftar Artikel */}
                <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-4">Artikel Edukasi</h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                        </div>
                    ) : articles.length > 0 ? (
                        <div className="space-y-3">
                            {articles.map((article) => (
                                <button
                                    key={article.id}
                                    onClick={() => setSelectedArticle(article)}
                                    className="w-full bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4 text-left hover:shadow-md transition-shadow group"
                                >
                                    <div className="bg-[#DFF0EE] p-3 rounded-xl shrink-0">
                                        <BookOpen size={20} className="text-[#138476]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 mb-1 truncate group-hover:text-[#138476] transition-colors">{article.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            <span className="mx-1">·</span>
                                            <span className="text-[#138476]">{article.category || 'Umum'}</span>
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#138476] transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl p-8 text-center">
                            <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Belum ada artikel edukasi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Edukasi;