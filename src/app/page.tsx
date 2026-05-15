'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from 'ai/react';
import { Frown, Coffee, Zap, Smile, ArrowLeft, Download, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import MoodButton from '@/components/MoodButton';

export default function Home() {
  const [step, setStep] = useState<'home' | 'mood' | 'result'>('home');
  const [selectedMood, setSelectedMood] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoadingManual, setIsLoadingManual] = useState(false);

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
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: data.text }]);
    } catch (e: any) {
      console.error('Fetch error:', e);
      setServerError(e.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoadingManual(false);
    }
  };

  const downloadImage = async () => {
    if (cardRef.current === null) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        backgroundColor: '#000000', // md-sys-color-background (True Black)
        pixelRatio: 2, // Meningkatkan ketajaman gambar
        style: {
          transform: 'scale(1)', // Memastikan tidak ada distorsi saat pengambilan gambar
        }
      });
      const link = document.createElement('a');
      link.download = `semangat-${selectedMood.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const reset = () => {
    setStep('home');
    setMessages([]);
    setSelectedMood('');
    setServerError(null);
    setIsLoadingManual(false);
  };

  return (
    <main className="min-h-screen bg-background text-on-background flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container">
      <div className="max-w-lg w-full">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-10"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex p-4 rounded-[32px] bg-primary-container text-on-primary-container mb-2"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <h1 className="text-6xl font-black tracking-tighter text-on-background">
                  Semangat<span className="text-primary">.ai</span>
                </h1>
                <p className="text-on-surface-variant text-xl font-medium leading-relaxed max-w-sm mx-auto">
                  Jalani Harimu Sebagai Semestinya.
                </p>
              </div>
              <button
                onClick={() => setStep('mood')}
                className="w-full py-5 bg-primary text-on-primary rounded-[28px] font-bold text-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary/90 transition-all active:scale-95"
              >
                Mulai Perjalanan
              </button>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                   <button onClick={() => setStep('home')} className="p-3 hover:bg-surface-variant rounded-full transition-colors text-on-surface">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <span className="text-primary font-bold tracking-widest uppercase text-sm">Pilih Suasana</span>
                </div>
                <h2 className="text-4xl font-black text-on-surface px-2">Bagaimana perasaanmu saat ini?</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-8"
            >
              <div 
                ref={cardRef} 
                className="bg-surface text-on-surface p-10 rounded-[48px] shadow-2xl border border-outline/10 min-h-[400px] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="relative z-10 flex-grow flex flex-col justify-center">
                  {serverError ? (
                    <div className="flex flex-col items-center text-error gap-4 text-center p-4">
                      <div className="p-4 bg-error-container rounded-full">
                        <AlertCircle className="w-12 h-12" />
                      </div>
                      <p className="font-black text-2xl">Aduh, Terdeteksi Masalah</p>
                      <div className="text-sm bg-surface-variant p-6 rounded-[24px] font-mono text-left w-full border border-error/20">
                        {serverError}
                      </div>
                    </div>
                  ) : isLoadingManual && !assistantMessage ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex space-x-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="h-4 w-4 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                      <p className="text-on-surface-variant font-bold text-lg animate-pulse">Merangkai kata-kata ajaib...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Sparkles className="w-10 h-10 text-primary opacity-30" />
                      <p className="text-3xl md:text-4xl font-black text-on-surface leading-[1.2] tracking-tight italic">
                        {assistantMessage ? `"${assistantMessage.content}"` : "..."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-outline/10 pt-6">
                  <div className="text-primary font-black text-xl tracking-tighter">
                    Semangat<span className="opacity-50">.ai</span>
                  </div>
                  <div className="text-on-surface-variant/40 text-xs font-bold uppercase tracking-widest">
                    Generated by Gemini
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-3 py-5 bg-secondary-container text-on-secondary-container rounded-[28px] font-bold text-lg hover:bg-secondary-container/80 transition-all active:scale-95"
                >
                  <RefreshCw className="w-6 h-6" />
                  Ulangi
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isLoadingManual || !!serverError || !assistantMessage}
                  className="flex-[1.5] flex items-center justify-center gap-3 py-5 bg-primary text-on-primary rounded-[28px] font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-30 active:scale-95"
                >
                  <Download className="w-6 h-6" />
                  Simpan Gambar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
