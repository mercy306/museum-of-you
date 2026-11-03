'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Check, Lock, Trophy } from 'lucide-react';
import { HiddenMemoryItem } from '@/types/museum';

interface ScavengerHuntHUDProps {
  items: HiddenMemoryItem[];
  collectedIds: string[];
  onFocusMemory?: (item: HiddenMemoryItem) => void;
}

export function ScavengerHuntHUD({
  items,
  collectedIds,
  onFocusMemory
}: ScavengerHuntHUDProps) {
  const [isOpen, setIsOpen] = useState(false);
  const total = items.length;
  const collectedCount = items.filter((it) => collectedIds.includes(it.id)).length;
  const isAllCollected = collectedCount === total && total > 0;

  return (
    <>
      {/* HUD Floating Badge Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900/85 hover:bg-neutral-800 text-white border border-[#d4af37]/50 shadow-xl backdrop-blur-md transition-all active:scale-95 group"
      >
        <span className="text-base group-hover:scale-125 transition-transform">
          {isAllCollected ? '🏆' : '🔍'}
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">
            Hidden Memories
          </span>
          <span className="text-xs font-bold text-white">
            {collectedCount} / {total} Found
          </span>
        </div>
      </button>

      {/* Clues & Found Memories Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[88vh] bg-gradient-to-b from-[#1c1815] via-[#141210] to-[#0d0c0a] border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-7 shadow-2xl text-white flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-5 pr-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 mb-2">
                  <Search className="w-3.5 h-3.5" /> 3D Scavenger Hunt
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5f0e6]">
                  Find the Hidden Memories
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Explore the 4 rooms and look for glowing golden tokens tucked behind exhibits and decor!
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-5 bg-neutral-900/90 rounded-2xl p-3 border border-neutral-800 flex items-center gap-4">
                <div className="flex-1 bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-[#d4af37] to-amber-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(collectedCount / (total || 1)) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-[#d4af37] whitespace-nowrap">
                  {collectedCount} of {total} Discovered
                </div>
              </div>

              {isAllCollected && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-amber-400 shrink-0 animate-bounce" />
                  <div className="text-xs text-neutral-200">
                    <strong className="text-amber-300 block text-sm">Archival Master Grand Slam!</strong>
                    You found all 5 hidden memories across every room! You officially know the birthday legend better than anyone.
                  </div>
                </div>
              )}

              {/* Memory Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1.5">
                {items.map((item, idx) => {
                  const isFound = collectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFound
                          ? 'bg-amber-950/25 border-[#d4af37]/60'
                          : 'bg-neutral-900/50 border-neutral-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            isFound
                              ? 'bg-gradient-to-br from-[#d4af37]/30 to-amber-600/30 border border-[#d4af37]'
                              : 'bg-neutral-800 border border-neutral-700'
                          }`}
                        >
                          {isFound ? item.icon : <Lock className="w-4 h-4 text-neutral-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-sm sm:text-base font-bold ${
                                isFound ? 'text-white' : 'text-neutral-400'
                              }`}
                            >
                              {isFound ? item.title : `Secret Memory #${idx + 1}`}
                            </h4>
                            {isFound ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <Check className="w-3 h-3" /> Found
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                {item.roomName}
                              </span>
                            )}
                          </div>

                          {isFound ? (
                            <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                              {item.revealedStory}
                            </p>
                          ) : (
                            <div className="mt-1">
                              <p className="text-xs text-neutral-300">
                                <span className="text-amber-400 font-medium">Clue:</span> {item.hint}
                              </p>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                Walk into {item.roomName} and look for the floating golden icon.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-neutral-800 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
                >
                  Close & Resume Walkthrough
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
