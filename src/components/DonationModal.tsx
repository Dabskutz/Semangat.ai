'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-card rounded-[48px] p-8 overflow-hidden"
          >
            {/* Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="flex justify-between w-full items-start">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <Heart className="w-6 h-6 text-red-400 fill-red-400/20" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Dukung Semangat.ai</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Kontribusimu membantu kami terus menyebarkan energi positif kepada dunia.
                </p>
              </div>

              {/* QRIS Image Container */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl overflow-hidden aspect-square w-56 flex items-center justify-center">
                  {!imageError ? (
                    <Image 
                      src="/qr/qris.png" 
                      alt="QRIS Donation" 
                      width={200} 
                      height={200}
                      className="w-full h-full object-contain"
                      priority
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center p-4">
                       <p>Gagal memuat</p>
                       <p className="text-black">qris.png</p>
                       <p className="mt-2 text-[8px]">Pastikan file ada di /public/qr/</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Metode Pembayaran Aman</span>
              </div>

              <p className="text-white/30 text-[10px] italic">
                Scan kode di atas menggunakan aplikasi m-banking atau e-wallet favoritmu.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
