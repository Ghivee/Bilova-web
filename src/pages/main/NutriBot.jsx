import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { Header } from '../../components/UIComponents';

const predefinedResponses = [
  "Halo Bunda! Nutri-Bot di sini. Ada yang bisa saya bantu terkait nutrisi si Kecil?",
  "Untuk stunting, sangat disarankan memperbanyak protein hewani seperti ikan, telur, dan daging.",
  "NutriSea Gummy mengandung omega-3 dari fauna laut yang baik untuk kecerdasan otak anak.",
  "Pastikan si kecil tidur cukup dan aktif bermain agar tinggi badannya optimal.",
  "Jangan lupa untuk selalu memonitor tinggi dan berat badan anak setiap bulan di Posyandu."
];

const NutriBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Halo Bunda! Nutri-Bot di sini, konsultan gizi virtual 24/7. Apa yang ingin Bunda tanyakan seputar pencegahan stunting?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add User message
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let replyIndex = Math.floor(Math.random() * predefinedResponses.length);
      // primitive keyword matching
      const i = userMsg.text.toLowerCase();
      if(i.includes('ikan') || i.includes('gummy')) replyIndex = 2;
      else if(i.includes('protein') || i.includes('makan')) replyIndex = 1;
      else if(i.includes('tinggi')) replyIndex = 3;
      
      setMessages(prev => [...prev, { sender: 'bot', text: predefinedResponses[replyIndex] }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)]">
      <Header title="AI Nutri-Bot" />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-600 shadow-nutrisea-sm">
              <Bot size={32} />
           </div>
           <h2 className="font-black text-slate-900">Konsultan Gizi Virtual Anda</h2>
           <p className="text-xs font-bold text-slate-400">Siap menjawab pertanyaan kapan saja</p>
        </div>

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {m.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div className={`p-3 rounded-2xl max-w-[75%] text-sm font-semibold shadow-sm
               ${m.sender === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white border border-sky-100 text-slate-700 rounded-tl-none'}
            `}>
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                <Bot size={16} />
            </div>
            <div className="p-3 py-4 rounded-2xl bg-white border border-sky-100 rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-sky-100 pb-8 lg:pb-4 shrink-0">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Tanyakan tentang gizi anak..."
            className="flex-1 bg-sky-50 border border-sky-100 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-600"
          />
          <button type="submit" disabled={!input.trim()} className="w-11 h-11 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 shrink-0">
             <Send size={18} className="-ml-1 mt-0.5"/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default NutriBot;
