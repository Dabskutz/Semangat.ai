'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [cooldown, setCooldown] = useState(0);

  const { messages, setMessages } = useChat({
    api: '/api/chat',
  });

  const assistantMessage = messages.find(m => m.role === 'assistant');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleMoodSelect = async (mood: string) => {
    if (cooldown > 0) return;

    setSelectedMood(mood);
    setStep('result');
    setMessages([]);
    setServerError(null);
    setIsLoadingManual(true);
    setCooldown(15);
    
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
        backgroundColor: '#0a0a0b',
        pixelRatio: 3,
        style: { transform: 'scale(1)' }
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
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="max-w-2xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-flex p-6 rounded-[32px] glass-card text-white mb-4"
                >
                  <Sparkles className="w-12 h-12 text-blue-400" />
                </motion.div>
                <h1 className="text-7xl md:text-8xl font-black tracking-tight premium-text-gradient">
                  Semangat<span className="text-white">.ai</span>
                </h1>
                <p className="text-white/50 text-xl md:text-2xl font-medium leading-relaxed max-w-md mx-auto">
                  Dosis inspirasi eksklusif yang dirancang khusus untuk jiwamu.
                </p>
              </div>
              <button
                onClick={() => setStep('mood')}
                className="group relative inline-flex items-center justify-center px-10 py-6 font-bold text-black transition-all duration-200 bg-white rounded-full hover:bg-white/90 active:scale-95 text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Mulai Perjalanan
              </button>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <button onClick={() => setStep('home')} className="p-3 glass-card rounded-full hover:bg-white/10 transition-all text-white/70">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <span className="text-white/40 font-bold tracking-[0.2em] uppercase text-xs">Pilih Suasana</span>
                </div>
                <h2 className="text-5xl font-black text-white leading-tight">Bagaimana kabarmu hari ini?</h2>
                {cooldown > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Cooldown aktif: {cooldown}s</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <MoodButton mood="Sedih" icon={Frown} color="text-blue-400" onClick={() => handleMoodSelect('Sedih')} />
                <MoodButton mood="Lelah" icon={Coffee} color="text-orange-400" onClick={() => handleMoodSelect('Lelah')} />
                <MoodButton mood="Ragu" icon={Zap} color="text-purple-400" onClick={() => handleMoodSelect('Ragu')} />
                <MoodButton mood="Senang" icon={Smile} color="text-emerald-400" onClick={() => handleMoodSelect('Senang')} />
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div 
                ref={cardRef} 
                className="glass-card p-12 md:p-16 rounded-[60px] min-h-[500px] flex flex-col justify-center relative overflow-hidden group"
              >
                {/* Decorative glow inside card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                
                <div className="relative z-10">
                  {serverError ? (
                    <div className="text-center space-y-6">
                      <div className="inline-flex p-6 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                      </div>
                      <h3 className="text-3xl font-black text-white">Sistem Mengalami Kendala</h3>
                      <p className="text-white/40 font-mono text-sm bg-black/40 p-6 rounded-3xl border border-white/5">{serverError}</p>
                    </div>
                  ) : isLoadingManual && !assistantMessage ? (
                    <div className="flex flex-col items-center gap-10">
                      <div className="relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="w-24 h-24 border-2 border-white/10 rounded-full"
                        />
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                        />
                      </div>
                      <p className="text-white/40 font-bold text-xl tracking-widest animate-pulse uppercase">Merajut Kata...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <Sparkles className="w-12 h-12 text-blue-400/50" />
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white leading-[1.3] tracking-tight"
                      >
                        {assistantMessage ? `"${assistantMessage.content}"` : "..."}
                      </motion.p>
                      <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-3 py-6 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all active:scale-95"
                >
                  <RefreshCw className="w-6 h-6" />
                  Mencoba Lagi
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isLoadingManual || !!serverError || !assistantMessage}
                  className="flex-[1.5] flex items-center justify-center gap-3 py-6 bg-white text-black rounded-full font-bold text-lg shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-white/90 transition-all disabled:opacity-20 active:scale-95"
                >
                  <Download className="w-6 h-6" />
                  Simpan Karya
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
