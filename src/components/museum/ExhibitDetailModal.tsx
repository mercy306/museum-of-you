'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Calendar, Eye, Sparkles, Video, Image as ImageIcon } from 'lucide-react';
import { Exhibit } from '@/types/museum';

interface ExhibitDetailModalProps {
  exhibit: Exhibit | null;
  galleryName?: string;
  onClose: () => void;
}

export function ExhibitDetailModal({ exhibit, galleryName, onClose }: ExhibitDetailModalProps) {
  const [isDeclassified, setIsDeclassified] = useState(false);

  if (!exhibit) return null;

  const isClassified = exhibit.classifiedLevel && !isDeclassified;
  const isVideo = exhibit.mediaType === 'video' || Boolean(exhibit.videoUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#1E1C19] via-[#141312] to-[#0A0A0C] border-2 border-[#C5A059]/40 shadow-2xl shadow-black p-6 sm:p-8"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Media Display: Photo OR Video */}
            <div className="relative group">
              <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-[#9A7B38] via-[#DFB76C] to-[#8E6E33] shadow-2xl shadow-black">
                <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center">
                  {isVideo && !isClassified ? (
                    <video
                      src={exhibit.videoUrl || exhibit.imageUrl}
                      poster={exhibit.imageUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={exhibit.imageUrl}
                      alt={exhibit.title}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isClassified ? 'blur-xl grayscale scale-105' : 'blur-0 grayscale-0 scale-100'
                      }`}
                    />
                  )}

                  {/* Top Media Type Badge */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/75 border border-[#C5A059]/50 text-[#DFB76C] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
                    {isVideo ? (
                      <>
                        <Video className="w-3 h-3 text-rose-400" />
                        <span>Video Exhibit</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        <span>Photo Exhibit</span>
                      </>
                    )}
                  </div>

                  {/* Red Classified Overlay if not yet declassified */}
                  {isClassified && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-center">
                      <div className="px-4 py-2 border-2 border-red-500 rounded bg-red-950/80 text-red-400 font-mono text-sm tracking-widest font-black uppercase rotate-[-6deg] shadow-lg mb-3">
                        ⚠ {exhibit.classifiedLevel} EVIDENCE
                      </div>
                      <p className="text-xs text-stone-300 max-w-xs mb-4">
                        Sensitive archival material. Click below to declassify and view evidence.
                      </p>
                      <button
                        onClick={() => setIsDeclassified(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs uppercase tracking-widest font-bold shadow-lg shadow-red-600/40 transition-all hover:scale-105"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Declassify Artifact
                      </button>
                    </div>
                  )}

                  {/* Declassified badge */}
                  {!isClassified && exhibit.classifiedLevel && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded border border-emerald-500/50 bg-emerald-950/80 text-emerald-400 font-mono text-[10px] tracking-widest font-bold uppercase">
                      ✓ Declassified
                    </div>
                  )}
                </div>
              </div>

              {/* Museum Brass Plaque under frame */}
              <div className="mt-3 p-2.5 rounded-lg bg-[#181716] border border-[#C5A059]/25 text-center flex items-center justify-between px-4">
                <p className="text-[10px] font-mono tracking-widest text-[#DFB76C] uppercase">
                  CATALOG: {exhibit.id.toUpperCase()}
                </p>
                {exhibit.subtitle && (
                  <p className="text-[10px] font-serif italic text-stone-400">
                    {exhibit.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Curatorial Story and Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#DFB76C] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {galleryName || 'Permanent Exhibition'}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FBF6EC] mt-1">
                  {exhibit.title}
                </h3>
                {exhibit.date && (
                  <div className="flex items-center gap-1.5 text-xs text-[#A99D8B] mt-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#DFB76C]" />
                    <span>{exhibit.date}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-[#C5A059]/20">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block mb-1">
                  Historical Account
                </span>
                <p className="text-sm text-stone-200 leading-relaxed font-sans">
                  {exhibit.story}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1815] border border-[#DFB76C]/30 relative">
                <div className="flex items-center gap-2 mb-1.5 text-[#DFB76C]">
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    Official Curator&apos;s Appraisal
                  </span>
                </div>
                <p className="font-editorial text-base italic text-[#F4E3BA] leading-relaxed">
                  &ldquo;{exhibit.curatorNote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono">
                  Permanent Archive Collection
                </span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-[#DFB76C] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-[#DFB76C]/20 cursor-pointer"
                >
                  Close Exhibit
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
