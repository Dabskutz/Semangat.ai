'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from 'ai/react';
import { Frown, Coffee, Zap, Smile, ArrowLeft, Download, RefreshCw, AlertCircle } from 'lucide-react';
import MoodButton from '@/components/MoodButton';
import { toPng } from 'html-to-image';

export default function Home() {
  const [step, setStep] = useState<'home' | 'mood' | 'result'>('home');
  const [selectedMood, setSelectedMood] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  // Kita tetap gunakan useChat untuk manajemen state pesan, 
  // tapi kita lakukan fetch manual karena streaming sering bermasalah.
  const { messages, setMessages } = useChat({
    api: '/api/chat',
  });

  const assistantMessage = messages.find(m => m.role === 'assistant');

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setStep('result');
    setMessages([]);
    setServerError(null);
    setIsLoadingManual(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Saya sedang merasa ${mood}. Berikan saya kata-kata penyemangat.` }]
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.details || `Error ${response.status}`);
      }

      const data = await response.json();
      // Set pesan asisten secara manual ke dalam state useChat
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: data.text }]);
    } catch (e: any) {
      console.error('Fetch error:', e);
      setServerError(e.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoadingManual(false);
    }
  };

  const downloadImage = () => {
    if (cardRef.current === null) return;
    toPng(cardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `semangat-${selectedMood}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error(err));
  };

  const reset = () => {
    setStep('home');
    setMessages([]);
    setSelectedMood('');
    setServerError(null);
    setIsLoadingManual(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                Semangat<span className="text-blue-600">.ai</span>
              </h1>
              <p className="text-slate-600 text-lg">
                Dapatkan dosis semangat harianmu melalui sentuhan kecerdasan buatan.
              </p>
              <button
                onClick={() => setStep('mood')}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors"
              >
                Mulai
              </button>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('home')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Apa yang kamu rasakan?</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MoodButton mood="Sedih" icon={Frown} color="text-blue-500" onClick={() => handleMoodSelect('Sedih')} />
                <MoodButton mood="Lelah" icon={Coffee} color="text-amber-600" onClick={() => handleMoodSelect('Lelah')} />
                <MoodButton mood="Ragu" icon={Zap} color="text-purple-500" onClick={() => handleMoodSelect('Ragu')} />
                <MoodButton mood="Senang" icon={Smile} color="text-green-500" onClick={() => handleMoodSelect('Senang')} />
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div ref={cardRef} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[300px] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <h2 className="text-4xl font-bold uppercase tracking-widest">{selectedMood}</h2>
                </div>
                
                <div className="relative z-10">
                  {serverError ? (
                    <div className="flex flex-col items-center text-red-500 gap-2 text-center p-4">
                      <AlertCircle className="w-10 h-10" />
                      <p className="font-bold">Masalah Terdeteksi:</p>
                      <div className="text-xs bg-red-50 p-4 rounded-xl border border-red-100 font-mono text-left overflow-auto max-h-40">
                        {serverError}
                      </div>
                      <p className="text-[10px] mt-2 opacity-50">Cek log di Dashboard Vercel untuk detail lebih lanjut.</p>
                    </div>
                  ) : isLoadingManual && !assistantMessage ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-slate-400 text-sm animate-pulse">Merangkai kata...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-serif text-slate-800 leading-relaxed text-center italic px-4">
                      {assistantMessage ? `"${assistantMessage.content}"` : "..."}
                    </p>
                  )}
                </div>
                <div className="mt-8 text-center text-slate-400 text-sm font-medium">
                  semangat.ai
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Ulangi
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isLoadingManual || !!serverError || !assistantMessage}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
