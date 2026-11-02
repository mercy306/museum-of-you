'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, QrCode, Award, Calendar, Compass, ShieldCheck } from 'lucide-react';
import { MuseumConfig } from '@/types/museum';

interface MuseumTicketProps {
  isOpen: boolean;
  onClose: () => void;
  config: MuseumConfig;
}

export function MuseumTicket({ isOpen, onClose, config }: MuseumTicketProps) {
  const { profile, galleries } = config;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-gradient-to-b from-[#1E1B16] via-[#141312] to-[#0D0D0E] border-2 border-[#C5A059]/40 shadow-2xl shadow-[#C5A059]/10 p-1 sm:p-2"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Inner Ticket Card */}
            <div className="relative border border-[#C5A059]/30 rounded-xl p-6 sm:p-8 bg-[#151412]/90 overflow-hidden">
              {/* Subtle background decorative watermark */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#DFB76C]/5 blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#DFB76C_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-5">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#DFB76C] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Admission Pass
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display text-[#F5EEDC] tracking-wide mt-1">
                    THE MUSEUM OF YOU
                  </h2>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded border border-[#DFB76C]/40 bg-[#DFB76C]/10 text-[#DFB76C] text-xs font-serif tracking-widest uppercase">
                    VIP PASS
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1 font-mono">
                    {profile.arrival?.admissionNumber || 'MOY-VIP-2026-8849'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="mt-6 space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#DFB76C] font-semibold">
                    {profile.arrival?.celebrationTitle || 'Official Birthday Retrospective'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-display text-[#DFB76C] font-bold tracking-wider mt-0.5">
                    {profile.name}
                  </div>
                  {profile.nickname && (
                    <p className="text-xs italic text-[#C5A059]/80 font-editorial text-lg tracking-wide">
                      &ldquo;{profile.nickname}&rdquo;
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#C5A059]/15">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#DFB76C] mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Exhibition Date</p>
                      <p className="text-xs sm:text-sm font-medium text-stone-200">{profile.birthday}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Compass className="w-4 h-4 text-[#DFB76C] mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Access Privileges</p>
                      <p className="text-xs sm:text-sm font-medium text-stone-200">All 6 Galleries + Masterpiece Wing</p>
                    </div>
                  </div>
                </div>

                {/* Galleries Checklist */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">Exhibition Itinerary</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {galleries.map((gal) => (
                      <div
                        key={gal.id}
                        className="p-2 rounded bg-black/40 border border-[#C5A059]/20 text-[11px] text-stone-300"
                      >
                        <span className="text-[#DFB76C] font-semibold mr-1">{gal.roomName}:</span>
                        {gal.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ticket Footer with Perforation & Barcode aesthetic */}
              <div className="mt-7 pt-4 border-t border-dashed border-[#C5A059]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded">
                    <QrCode className="w-8 h-8 text-black" />
                  </div>
                  <div className="text-[11px] text-stone-400">
                    <p className="text-stone-300 font-mono">AUTHENTICITY VERIFIED</p>
                    <p>Admits One Extraordinary Human</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs uppercase tracking-widest rounded-lg border border-[#C5A059]/50 text-[#DFB76C] hover:bg-[#C5A059]/10 transition-colors"
                  >
                    Save Pass
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs uppercase tracking-widest rounded-lg bg-[#C5A059] text-black font-semibold hover:bg-[#DFB76C] transition-colors"
                  >
                    Proceed to Entrance
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
