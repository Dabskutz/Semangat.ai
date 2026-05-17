'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from 'ai/react';
import { Frown, Coffee, Zap, Smile, ArrowLeft, Download, RefreshCw, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import MoodButton from '@/components/MoodButton';
import DonationModal from '@/components/DonationModal';
import { Heart } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'home' | 'mood' | 'result'>('home');
  const [selectedMood, setSelectedMood] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

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
              className="text-center space-y-8 md:space-y-12"
            >
              <div className="space-y-4 md:space-y-6">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-flex p-4 md:p-6 rounded-[24px] md:rounded-[32px] glass-card text-white mb-2 md:mb-4"
                >
                  <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                </motion.div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tight premium-text-gradient">
                  Semangat<span className="text-white">.ai</span>
                </h1>
                <p className="text-white/50 text-lg md:text-2xl font-medium leading-relaxed max-w-[280px] md:max-w-md mx-auto">
                  Dosis inspirasi eksklusif yang dirancang khusus untuk jiwamu.
                </p>
              </div>
              <button
                onClick={() => setStep('mood')}
                className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-6 font-bold text-black transition-all duration-200 bg-white rounded-full hover:bg-white/90 active:scale-95 text-lg md:text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
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
              className="space-y-8 md:space-y-12"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 md:gap-4">
                   <button onClick={() => setStep('home')} className="p-2 md:p-3 glass-card rounded-full hover:bg-white/10 transition-all text-white/70">
                    <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <span className="text-white/40 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">Pilih Suasana</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Bagaimana kabarmu hari ini?</h2>
                {cooldown > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-wider">Cooldown: {cooldown}s</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <MoodButton mood="Sedih" icon={Frown} color="text-blue-400" onClick={() => handleMoodSelect('Sedih')} />
                <MoodButton mood="Lelah" icon={Coffee} color="text-orange-400" onClick={() => handleMoodSelect('Lelah')} />
                <MoodButton mood="Ragu" icon={Zap} color="text-purple-400" onClick={() => handleMoodSelect('Ragu')} />
                <MoodButton mood="Senang" icon={Smile} color="text-emerald-400" onClick={() => handleMoodSelect('Senang')} />
                <div className="col-span-2">
                   <MoodButton 
                    mood="Koleksi Tokoh Dunia" 
                    icon={BookOpen} 
                    color="text-amber-400" 
                    onClick={() => handleMoodSelect('Koleksi')} 
                    className="aspect-[2/1] md:aspect-[3/1]"
                   />
                </div>
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
              className="space-y-6 md:space-y-10"
            >
              <div 
                ref={cardRef} 
                className="glass-card p-8 md:p-16 rounded-[40px] md:rounded-[60px] min-h-[400px] md:min-h-[500px] flex flex-col justify-center relative overflow-hidden group"
              >
                {/* Decorative glow inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 blur-[40px] md:blur-[80px] rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32" />
                
                <div className="relative z-10">
                  {serverError ? (
                    <div className="text-center space-y-4 md:space-y-6">
                      <div className="inline-flex p-4 md:p-6 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
                      </div>
                      <h3 className="text-xl md:text-3xl font-black text-white">Sistem Mengalami Kendala</h3>
                      <p className="text-white/40 font-mono text-xs md:text-sm bg-black/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">{serverError}</p>
                    </div>
                  ) : isLoadingManual && !assistantMessage ? (
                    <div className="flex flex-col items-center gap-6 md:gap-10">
                      <div className="relative">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="w-16 h-16 md:w-24 md:h-24 border-2 border-white/10 rounded-full"
                        />
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                        />
                      </div>
                      <p className="text-white/40 font-bold text-sm md:text-xl tracking-widest animate-pulse uppercase">Merajut Kata...</p>
                    </div>
                  ) : (
                    <div className="space-y-6 md:space-y-10">
                      <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-blue-400/50" />
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-5xl font-black text-white leading-[1.4] tracking-tight"
                      >
                        {assistantMessage ? `"${assistantMessage.content}"` : "..."}
                      </motion.p>
                      <div className="h-1 w-12 md:w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-3 py-4 md:py-6 bg-white/5 border border-white/10 text-white rounded-full font-bold text-base md:text-lg hover:bg-white/10 transition-all active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
                  Mencoba Lagi
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isLoadingManual || !!serverError || !assistantMessage}
                  className="flex-[1.5] flex items-center justify-center gap-3 py-4 md:py-6 bg-white text-black rounded-full font-bold text-base md:text-lg shadow-[0_10px_20px_rgba(255,255,255,0.05)] md:shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-white/90 transition-all disabled:opacity-20 active:scale-95"
                >
                  <Download className="w-5 h-5 md:w-6 md:h-6" />
                  Simpan Karya
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Donation Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDonationOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 glass-card rounded-full text-white/90 border-white/10 hover:border-white/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
      >
        <div className="relative">
          <Heart className="w-5 h-5 text-red-400 group-hover:fill-red-400 transition-colors" />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-red-400 rounded-full"
          />
        </div>
        <span className="font-bold text-sm tracking-wide hidden md:block">Dukung Kreator</span>
      </motion.button>

      {/* Donation Modal */}
      <DonationModal 
        isOpen={isDonationOpen} 
        onClose={() => setIsDonationOpen(false)} 
      />
    </main>
  );
}
