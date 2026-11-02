'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Volume2, VolumeX, Sparkles, X, ArrowRight, UserCheck, Award } from 'lucide-react';
import { MuseumConfig } from '@/types/museum';

interface ReceptionArrivalModalProps {
  config: MuseumConfig;
  isOpen: boolean;
  onDismiss: () => void;
  onOpenTicket: () => void;
}

export function ReceptionArrivalModal({
  config,
  isOpen,
  onDismiss,
  onOpenTicket
}: ReceptionArrivalModalProps) {
  const { profile } = config;
  const arrival = profile.arrival || {
    admissionNumber: 'MOY-VIP-2026-8849',
    celebrationTitle: 'The Official Birthday Retrospective',
    receptionistName: 'Sebastian Sterling',
    receptionistTitle: 'Chief Protocol Officer & Royal Curator',
    dialogue: [
      'Ladies and gentlemen, welcome to the Museum of You.',
      'Today we celebrate an extraordinary individual whose achievements are questionable, whose memories are unforgettable, and whose existence deserves its own museum.',
      'Please present your VIP Admission Pass and prepare for an unforgettable expedition.'
    ],
    spokenGreeting:
      'Ladies and gentlemen, welcome to the Museum of You. Today we celebrate an extraordinary individual whose achievements are questionable, whose memories are unforgettable, and whose existence deserves its own museum.'
  };

  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setVoiceAvailable(true);
    }
  }, []);

  const handleSpeakGreeting = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = arrival.spokenGreeting || arrival.dialogue.join(' ');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Prefer an English voice with sophisticated cadence
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((v) => v.lang.includes('en-GB') || v.name.includes('British') || v.name.includes('Daniel') || v.name.includes('Oliver')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleNextDialogue = () => {
    if (dialogueIndex < arrival.dialogue.length - 1) {
      setDialogueIndex((prev) => prev + 1);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      onDismiss();
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#1C1A17] via-[#131211] to-[#0A0A0C] border-2 border-[#C5A059]/40 shadow-2xl shadow-black p-6 sm:p-10"
          >
            {/* Top Bar with Skip & Audio */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DFB76C]/10 border border-[#DFB76C]/40 flex items-center justify-center text-[#DFB76C]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#DFB76C] font-semibold">
                    Grand Reception · Protocol Desk
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {arrival.receptionistName} — {arrival.receptionistTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {voiceAvailable && (
                  <button
                    onClick={handleSpeakGreeting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      isSpeaking
                        ? 'bg-[#DFB76C] text-black border-[#DFB76C] shadow-md shadow-[#DFB76C]/30'
                        : 'border-[#C5A059]/30 text-[#DFB76C] hover:bg-[#C5A059]/10'
                    }`}
                    title={isSpeaking ? 'Silence docent voice' : 'Listen to docent voice greeting'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isSpeaking ? 'Voice: Playing' : 'Voice Greeting'}</span>
                  </button>
                )}

                <button
                  onClick={handleSkip}
                  className="px-3 py-1.5 rounded-full text-stone-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Main Welcome Dialogue Card */}
            <div className="relative py-4">
              {/* Decorative Quotation Mark */}
              <span className="absolute -top-4 -left-2 text-6xl text-[#DFB76C]/10 font-serif select-none pointer-events-none">
                “
              </span>

              <motion.div
                key={dialogueIndex}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.4 }}
                className="min-h-[110px] flex items-center"
              >
                <p className="font-editorial text-2xl sm:text-3xl italic text-[#FAF2E1] leading-snug">
                  &ldquo;{arrival.dialogue[dialogueIndex]}&rdquo;
                </p>
              </motion.div>

              {/* Step indicator dots */}
              <div className="flex items-center gap-2 mt-6">
                {arrival.dialogue.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDialogueIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dialogueIndex === i ? 'w-8 bg-[#DFB76C]' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Honoree Credentials Summary */}
            <div className="mt-6 p-4 rounded-2xl bg-black/50 border border-[#C5A059]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Honoree of the Day</span>
                <p className="font-display text-lg sm:text-xl text-[#DFB76C] font-bold">{profile.name}</p>
                <p className="text-xs text-stone-400 font-mono">Admission Pass: {arrival.admissionNumber}</p>
              </div>

              <button
                onClick={onOpenTicket}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DFB76C]/40 bg-[#DFB76C]/10 text-[#DFB76C] hover:bg-[#DFB76C] hover:text-black transition-all text-xs uppercase tracking-wider font-semibold"
              >
                <ShieldCheck className="w-4 h-4" />
                Inspect VIP Pass
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-[#C5A059]/15 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                Reception Protocol 1.0 · Audio Enabled
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNextDialogue}
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#DFB76C] to-[#C5A059] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#DFB76C]/20"
                >
                  <span>{dialogueIndex < arrival.dialogue.length - 1 ? 'Next' : 'Enter Galleries'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
