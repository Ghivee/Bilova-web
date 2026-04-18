import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronRight, X, Check, HelpCircle, Lightbulb, Clock } from 'lucide-react';
import { Header, Alert, Badge, Button } from '../../components/UIComponents';
import { supabase } from '../../lib/supabase';

const FALLBACK_ARTICLES = [
  { id: 'f1', title: 'Kenapa Antibiotik Harus Dihabiskan?', category: 'antibiotic', content: 'Menghentikan antibiotik sebelum selesai dapat menyebabkan bakteri yang tersisa menjadi resisten. Pastikan selalu menyelesaikan seluruh rangkaian pengobatan meskipun gejala sudah membaik.' },
  { id: 'f2', title: 'Resistansi Antibiotik: Bahaya Global', category: 'resistansi', content: 'AMR (Antimicrobial Resistance) adalah ancaman kesehatan global. WHO memperkirakan 10 juta kematian per tahun pada 2050 akibat infeksi yang tidak bisa diobati karena resistansi antibiotik.' },
  { id: 'f3', title: 'Efek Samping Umum Antibiotik', category: 'efek-samping', content: 'Diare, mual, dan ruam kulit adalah efek samping yang umum. Jika mengalami sesak napas atau bengkak di wajah, segera hubungi dokter karena bisa jadi reaksi alergi serius.' },
];

const FALLBACK_QUIZ = [
  { id: 'q1', question: 'Mengapa antibiotik harus dihabiskan meskipun sudah merasa sembuh?', options: ['Agar tidak boros', 'Mencegah resistansi bakteri', 'Menambah nafsu makan', 'Mempercepat pemulihan'], correct: 1, explanation: 'Menghentikan antibiotik lebih awal dapat membuat bakteri sisa menjadi kebal (resisten) terhadap antibiotik.' },
  { id: 'q2', question: 'Apa kepanjangan AMR?', options: ['Antibiotic Medicine Resistance', 'Antimicrobial Resistance', 'Advanced Medical Research', 'Antibiotic Medical Review'], correct: 1, explanation: 'AMR = Antimicrobial Resistance, yaitu resistansi terhadap obat antimikroba termasuk antibiotik.' },
  { id: 'q3', question: 'Gejala apa yang paling berbahaya saat mengonsumsi antibiotik?', options: ['Sedikit mual', 'Mengantuk ringan', 'Sesak napas dan bengkak wajah', 'Nafsu makan berkurang'], correct: 2, explanation: 'Sesak napas dan bengkak wajah/tenggorokan menandakan reaksi alergi serius yang membutuhkan penanganan darurat.' },
];

const Edukasi = () => {
  const [articles, setArticles] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [quizResult, setQuizResult] = useState({ answered: false, score: 0, total: 0 });
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [currentCat, setCurrentCat] = useState('semua');

  const categories = ['semua', 'antibiotic', 'resistansi', 'efek-samping', 'nutrisi', 'umum'];

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [artRes, quizRes] = await Promise.all([
        supabase.from('educational_articles').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('quiz_questions').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);
      setArticles(artRes.data?.length > 0 ? artRes.data : FALLBACK_ARTICLES);
      setQuizQuestions(quizRes.data?.length > 0 ? quizRes.data : FALLBACK_QUIZ);
    } catch (err) {
      setError('Gagal memuat konten. Menampilkan konten bawaan.');
      setArticles(FALLBACK_ARTICLES);
      setQuizQuestions(FALLBACK_QUIZ);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = currentCat === 'semua' ? articles : articles.filter(a => a.category === currentCat);

  const startQuiz = () => {
    if (quizQuestions.length === 0) return;
    setQuizStep(0); setSelected(null); setAnswers([]);
    setQuizResult({ answered: false, score: 0, total: quizQuestions.length });
    setShowQuiz(true);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return; // Already answered this question
    setSelected(idx);
    const isCorrect = idx === quizQuestions[quizStep].correct;
    const newAnswers = [...answers, { questionIdx: quizStep, selected: idx, correct: isCorrect }];
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
      setSelected(null);
    } else {
      // Quiz finished
      const score = answers.filter(a => a.correct).length;
      setQuizResult({ answered: true, score, total: quizQuestions.length });
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
    </div>
  );

  /* ─── Article detail ─── */
  if (selectedArticle) return (
    <div>
      <Header title="Baca Artikel" showBack onBack={() => setSelectedArticle(null)} />
      <div className="px-5 pb-10">
        <Badge className="mt-4 mb-3">{selectedArticle.category || 'umum'}</Badge>
        <h1 className="text-2xl font-black text-[#2D1B3D] mb-4 leading-tight">{selectedArticle.title}</h1>
        {selectedArticle.created_at && (
          <div className="flex items-center gap-1.5 text-[#B090C0] text-xs font-semibold mb-5">
            <Clock size={12} />
            {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
        <p className="text-[#6B4B7B] font-semibold leading-relaxed text-sm whitespace-pre-line">{selectedArticle.content}</p>
      </div>
    </div>
  );

  /* ─── Quiz modal ─── */
  if (showQuiz) {
    if (quizResult.answered) {
      const pct = Math.round((quizResult.score / quizResult.total) * 100);
      return (
        <div className="px-5 py-8">
          <div className="bg-white rounded-3xl p-8 border border-[#EDD9F5] text-center shadow-bilova">
            <div className="text-6xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
            <h2 className="text-2xl font-black text-[#2D1B3D] mb-2">Kuis Selesai!</h2>
            <p className="text-[#6B4B7B] font-semibold mb-4">Kamu menjawab {quizResult.score} dari {quizResult.total} soal dengan benar.</p>
            <div className="text-5xl font-black mb-2" style={{ color: pct >= 80 ? '#8B2C8C' : pct >= 60 ? '#D97706' : '#DC2626' }}>{pct}%</div>
            <p className="text-sm font-bold mb-6" style={{ color: pct >= 80 ? '#8B2C8C' : '#6B4B7B' }}>
              {pct >= 80 ? 'Luar biasa! Pengetahuanmu tentang antibiotik sangat baik.' : pct >= 60 ? 'Cukup baik! Terus baca artikel untuk meningkatkan pengetahuan.' : 'Pelajari lebih lanjut tentang antibiotik lewat artikel di bawah.'}
            </p>
            {/* Review answers */}
            <div className="text-left space-y-3 mb-6">
              {answers.map((ans, i) => {
                const q = quizQuestions[ans.questionIdx];
                return (
                  <div key={i} className={`p-3 rounded-2xl border-2 text-sm ${ans.correct ? 'bg-[#EDD9F5]/50 border-[#D4A8E0]' : 'bg-red-50 border-red-200'}`}>
                    <p className="font-bold mb-1">{q.question}</p>
                    <p className={`text-xs font-black ${ans.correct ? 'text-[#8B2C8C]' : 'text-red-600'}`}>{ans.correct ? '✓' : '✗'} {q.options[ans.selected]}</p>
                    {!ans.correct && q.explanation && <p className="text-xs text-[#6B4B7B] mt-1">💡 {q.explanation}</p>}
                  </div>
                );
              })}
            </div>
            <Button onClick={() => setShowQuiz(false)}>Kembali ke Edukasi</Button>
          </div>
        </div>
      );
    }

    const q = quizQuestions[quizStep];
    return (
      <div className="px-5 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-[#2D1B3D]">Kuis: Soal {quizStep + 1}/{quizQuestions.length}</h2>
          <button onClick={() => setShowQuiz(false)} className="p-2 rounded-xl hover:bg-[#EDD9F5] text-[#B090C0]"><X size={18} /></button>
        </div>
        <div className="w-full h-2 bg-[#EDD9F5] rounded-full mb-6">
          <div className="h-full bg-[#8B2C8C] rounded-full transition-all" style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }} />
        </div>
        <div className="bg-white rounded-3xl p-6 border border-[#EDD9F5] shadow-card mb-5">
          <p className="font-black text-[#2D1B3D] text-base leading-relaxed">{q.question}</p>
        </div>
        <div className="space-y-3">
          {(Array.isArray(q.options) ? q.options : []).map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correct;
            let style = 'bg-white border-[#EDD9F5] text-[#2D1B3D] hover:border-[#8B2C8C] hover:bg-[#EDD9F5]/30';
            if (selected !== null) {
              if (isCorrect) style = 'bg-[#EDD9F5] border-[#8B2C8C] text-[#8B2C8C]';
              else if (isSelected) style = 'bg-red-50 border-red-400 text-red-700';
              else style = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${style}`}>
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${selected !== null && isCorrect ? 'bg-[#8B2C8C] text-white' : selected !== null && isSelected && !isCorrect ? 'bg-red-400 text-white' : 'bg-[#EDD9F5] text-[#8B2C8C]'}`}>
                  {selected !== null ? (isCorrect ? <Check size={12} /> : isSelected ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        
        {selected !== null && q.explanation && (
          <div className="mt-4 bg-[#EDD9F5]/50 rounded-2xl p-4 border border-[#EDD9F5] text-sm animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs font-black text-[#8B2C8C] mb-1">💡 Penjelasan</p>
            <p className="text-[#6B4B7B] font-semibold">{q.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <div className="mt-6 flex justify-end">
            <Button onClick={nextQuestion}>
              {quizStep < quizQuestions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Selesai & Lihat Hasil'}
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* ─── Main Edukasi list ─── */
  return (
    <div>
      <Header title="Edukasi" />
      <div className="px-5 pt-4 pb-10 space-y-5">
        {error && <Alert type="warning" message={error} />}

        {/* Quiz CTA */}
        <div onClick={startQuiz} className="bg-gradient-to-r from-[#8B2C8C] to-[#C85CA0] rounded-3xl p-5 cursor-pointer shadow-bilova relative overflow-hidden">
          <div className="absolute right-4 top-2 opacity-20">
            <HelpCircle size={80} />
          </div>
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Kuis Interaktif</span>
            <h3 className="text-xl font-black text-white mt-2 mb-1">Seberapa Paham Kamu?</h3>
            <p className="text-white/80 text-sm font-semibold">{quizQuestions.length} soal tentang antibiotik & AMR · Cek pengetahuanmu!</p>
            <div className="flex items-center gap-1 mt-3 text-white font-black text-sm">Mulai Kuis <ChevronRight size={16} /></div>
          </div>
        </div>

        {/* Category filter */}
        <div className="relative w-full -mx-5 px-5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 pr-5">
            {categories.map(c => (
              <button key={c} onClick={() => setCurrentCat(c)}
                className={`flex-shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all ${currentCat === c ? 'bg-[#8B2C8C] text-white shadow-bilova-sm border border-[#8B2C8C]' : 'bg-white text-[#6B4B7B] border border-[#EDD9F5] hover:border-[#8B2C8C] hover:bg-[#EDD9F5]/30'}`}>
                {c === 'semua' ? 'Semua Kategori' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className="font-black text-[#2D1B3D] mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-[#8B2C8C]" /> Artikel Edukasi <span className="text-[#B090C0] font-semibold">({filtered.length})</span>
          </h3>
          <div className="space-y-3">
            {filtered.map(a => (
              <button key={a.id} onClick={() => setSelectedArticle(a)}
                className="w-full bg-white rounded-2xl p-5 border border-[#EDD9F5] text-left hover:border-[#8B2C8C] hover:shadow-bilova-sm transition-all shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="mb-2">{a.category || 'umum'}</Badge>
                    <h4 className="font-black text-[#2D1B3D] text-sm leading-tight mb-1">{a.title}</h4>
                    <p className="text-xs text-[#B090C0] font-semibold line-clamp-2">
                      {a.content?.substring(0, 100)}...
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#D4A8E0] shrink-0 mt-1" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#EDD9F5]">
                <BookOpen size={32} className="text-[#D4A8E0] mx-auto mb-2" />
                <p className="font-bold text-[#B090C0] text-sm">Belum ada artikel di kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edukasi;