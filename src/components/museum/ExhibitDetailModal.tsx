'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Calendar, Eye, Sparkles, Video, Image as ImageIcon, Volume2, VolumeX } from 'lucide-react';
import { Exhibit } from '@/types/museum';
import { getAssetPath } from '@/lib/assetHelper';

interface ExhibitDetailModalProps {
  exhibit: Exhibit | null;
  galleryName?: string;
  onClose: () => void;
}

export function ExhibitDetailModal({ exhibit, galleryName, onClose }: ExhibitDetailModalProps) {
  const [isDeclassified, setIsDeclassified] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!exhibit) return null;

  const isClassified = exhibit.classifiedLevel && !isDeclassified;
  const isVideo = exhibit.mediaType === 'video' || Boolean(exhibit.videoUrl);
  const resolvedVideoUrl = getAssetPath(exhibit.videoUrl || exhibit.imageUrl);
  const resolvedImageUrl = getAssetPath(exhibit.imageUrl);

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
                    <div className="relative w-full h-full">
                      <video
                        src={resolvedVideoUrl}
                        poster={resolvedImageUrl}
                        controls
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Quick Unmute Toggle Pill */}
                      {isMuted && (
                        <button
                          type="button"
                          onClick={() => setIsMuted(false)}
                          className="absolute bottom-14 right-3 z-10 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-amber-300 border border-amber-500/50 text-xs font-medium flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Tap for Sound</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <img
                      src={resolvedImageUrl}
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

                  {/* Reveal overlay if classified */}
                  {isClassified && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-center">
                      <div className="text-3xl mb-2">🙈</div>
                      <button
                        onClick={() => setIsDeclassified(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-wider font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Tap to Reveal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Memory Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FBF6EC]">
                  {exhibit.title}
                </h3>
                {exhibit.date && (
                  <div className="flex items-center gap-1.5 text-xs text-[#DFB76C] mt-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exhibit.date}</span>
                  </div>
                )}
              </div>

              {/* Simple description if present */}
              {(exhibit.story || exhibit.curatorNote) && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-stone-200 leading-relaxed font-sans">
                    {exhibit.story || exhibit.curatorNote}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-[#DFB76C] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
