'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, CheckCircle2, Award, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MysteryBoxItem } from '@/types/museum';

interface MysteryBoxModalProps {
  box: MysteryBoxItem | null;
  isOpen: boolean;
  isAlreadyOpened: boolean;
  onOpenBox: (boxId: string) => void;
  onClose: () => void;
}

export function MysteryBoxModal({
  box,
  isOpen,
  isAlreadyOpened,
  onOpenBox,
  onClose
}: MysteryBoxModalProps) {
  const [isUnwrapped, setIsUnwrapped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsUnwrapped(isAlreadyOpened);
    }
  }, [isOpen, isAlreadyOpened]);

  if (!isOpen || !box) return null;

  const playUnwrapSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = ctx.currentTime;
      // High arpeggio fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } catch {
      // AudioContext not allowed or muted
    }
  };

  const handleUnwrap = () => {
    setIsUnwrapped(true);
    onOpenBox(box.id);
    playUnwrapSound();

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f6e05e', '#ed8936', '#9f7aea', '#38b2ac', '#f56565']
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#1c1815] via-[#141210] to-[#0d0c0a] border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: box.boxColor }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: box.ribbonColor }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5f0e6]">
              {box.title}
            </h2>
          </div>

          {!isUnwrapped ? (
            /* Wrapped Box View */
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, -2, 2, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: 'easeInOut'
                }}
                className="relative mb-6 cursor-pointer select-none"
                onClick={handleUnwrap}
              >
                {/* 3D Gift Box Visual Graphic */}
                <div
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl relative shadow-2xl flex items-center justify-center border-4"
                  style={{
                    backgroundColor: box.boxColor,
                    borderColor: box.ribbonColor
                  }}
                >
                  {/* Vertical Ribbon */}
                  <div
                    className="absolute inset-y-0 w-7 shadow-inner"
                    style={{ backgroundColor: box.ribbonColor }}
                  />
                  {/* Horizontal Ribbon */}
                  <div
                    className="absolute inset-x-0 h-7 shadow-inner"
                    style={{ backgroundColor: box.ribbonColor }}
                  />
                  {/* Bow Ribbon */}
                  <div className="absolute -top-6 flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-full border-4"
                      style={{ backgroundColor: box.ribbonColor, borderColor: '#ffffff40' }}
                    />
                  </div>
                  <Sparkles className="w-12 h-12 text-white relative z-10 drop-shadow-md animate-pulse" />
                </div>
              </motion.div>

              <button
                onClick={handleUnwrap}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-amber-500 via-[#d4af37] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4" /> Tap to Unwrap 🎁
              </button>
            </div>
          ) : (
            /* Revealed Reward View */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center mb-5 shadow-xl">
                <Award className="w-10 h-10 text-[#d4af37] animate-bounce" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> REWARD UNLOCKED
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mb-3">
                {box.reward.title}
              </h3>

              <div className="bg-neutral-900/80 border border-neutral-700/70 rounded-2xl p-5 mb-6 text-neutral-200 text-sm leading-relaxed max-w-md shadow-inner">
                {box.reward.message}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-[#d4af37]/20 active:scale-95 transition-all"
                >
                  Add to My Birthday Vault 🏆
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
