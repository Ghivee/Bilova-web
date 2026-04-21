import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronRight, X, Check, HelpCircle, Clock } from 'lucide-react';
import { Header, Alert, Badge, Button } from '../../components/UIComponents';
import { supabase } from '../../lib/supabase';

const FALLBACK_ARTICLES = [
  { id: 'f1', title: 'Apa Itu Stunting dan Ciri-Cirinya?', category: 'stunting', content: 'Stunting adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis. Ciri utamanya adalah tinggi badan anak lebih pendek dari standar usianya.' },
  { id: 'f2', title: 'Pentingnya Protein Ikan untuk Anak', category: 'nutrisi', content: 'Ikan laut kaya akan Omega-3, asam amino esensial, dan protein yang sangat penting untuk perkembangan otak dan pertumbuhan tulang balita dalam mencegah stunting.' },
  { id: 'f3', title: 'Cara Kerja NutriSea Gummy', category: 'umum', content: 'NutriSea Gummy terbuat dari ekstrak ikan laut, bebas amis, dengan bentuk lucu yang disukai anak. Gummy ini mengandung mikronutrien padat yang menutrisi dengan efektif.' },
];

const Edukasi = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState('');
  const [currentCat, setCurrentCat] = useState('semua');

  const categories = ['semua', 'stunting', 'nutrisi', 'tumbuh-kembang', 'umum'];

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const { data } = await supabase.from('educational_articles')
        .select('*').eq('is_published', true).order('created_at', { ascending: false });
      setArticles(data?.length > 0 ? data : FALLBACK_ARTICLES);
    } catch (err) {
      setError('Gagal memuat konten. Menampilkan konten bawaan.');
      setArticles(FALLBACK_ARTICLES);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = currentCat === 'semua' ? articles : articles.filter(a => a.category === currentCat);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  /* ─── Article detail ─── */
  if (selectedArticle) return (
    <div>
      <Header title="Baca Artikel" showBack onBack={() => setSelectedArticle(null)} />
      <div className="px-5 pb-10">
        <Badge className="mt-4 mb-3">{selectedArticle.category || 'umum'}</Badge>
        <h1 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{selectedArticle.title}</h1>
        {selectedArticle.created_at && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-5">
            <Clock size={12} />
            {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
        <p className="text-slate-600 font-semibold leading-relaxed text-sm whitespace-pre-line">{selectedArticle.content}</p>
      </div>
    </div>
  );

  /* ─── Main Edukasi list ─── */
  return (
    <div>
      <Header title="Edukasi" />
      <div className="px-5 pt-4 pb-10 space-y-5">
        {error && <Alert type="warning" message={error} />}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCurrentCat(c)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all ${currentCat === c ? 'bg-sky-600 text-white shadow-nutrisea-sm border border-sky-600' : 'bg-white text-slate-500 border border-sky-100 hover:border-sky-600 hover:bg-sky-50'}`}>
              {c === 'semua' ? 'Semua Kategori' : c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div>
          <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-sky-600" /> Artikel Tumbuh Kembang <span className="text-slate-400 font-semibold">({filtered.length})</span>
          </h3>
          <div className="space-y-3">
            {filtered.map(a => (
              <button key={a.id} onClick={() => setSelectedArticle(a)}
                className="w-full bg-white rounded-2xl p-5 border border-sky-100 text-left hover:border-sky-600 hover:shadow-card transition-all shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge color="sky" className="mb-2">{a.category || 'umum'}</Badge>
                    <h4 className="font-black text-slate-900 text-sm leading-tight mb-1">{a.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-2">
                      {a.content?.substring(0, 100)}...
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0 mt-1" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-sky-100">
                <BookOpen size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-400 text-sm">Belum ada artikel di kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edukasi;