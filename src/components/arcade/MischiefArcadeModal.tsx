'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, Sparkles, Camera, HelpCircle, Search, Gift } from 'lucide-react';
import { ArcadeManifest, MysteryBoxItem } from '@/types/museum';
import { CaptionThisGame } from './CaptionThisGame';
import { WhoKnowsMeBestGame } from './WhoKnowsMeBestGame';
import { MysteryBoxModal } from './MysteryBoxModal';

interface MischiefArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  arcade: ArcadeManifest;
  honoreeName?: string;
  collectedMemoryIds: string[];
  openedBoxIds: string[];
  onOpenBox: (boxId: string) => void;
  defaultTab?: 'caption' | 'trivia' | 'scavenger' | 'boxes';
}

export function MischiefArcadeModal({
  isOpen,
  onClose,
  arcade,
  honoreeName = 'Alex',
  collectedMemoryIds,
  openedBoxIds,
  onOpenBox,
  defaultTab = 'caption'
}: MischiefArcadeModalProps) {
  const [activeTab, setActiveTab] = useState<'caption' | 'trivia' | 'scavenger' | 'boxes'>(defaultTab);
  const [selectedBox, setSelectedBox] = useState<MysteryBoxItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#1b1713] via-[#12100d] to-[#0a0908] border-2 border-[#d4af37]/60 rounded-3xl shadow-2xl text-white flex flex-col overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="relative px-6 py-4 sm:py-5 border-b border-[#d4af37]/25 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5f0e6]">
                  Museum Mischief Arcade
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Special Edition
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Play hilarious mini-games & unlock archival birthday treasures
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950/60 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('caption')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'caption'
                ? 'bg-gradient-to-r from-amber-500 to-[#d4af37] text-neutral-950 shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" /> Caption This!
          </button>

          <button
            onClick={() => setActiveTab('trivia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'trivia'
                ? 'bg-gradient-to-r from-amber-500 to-[#d4af37] text-neutral-950 shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Who Knows Me Best?
          </button>

          <button
            onClick={() => setActiveTab('scavenger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'scavenger'
                ? 'bg-gradient-to-r from-amber-500 to-[#d4af37] text-neutral-950 shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" /> Hidden Memories ({collectedMemoryIds.length}/{arcade.hiddenMemories.length})
          </button>

          <button
            onClick={() => setActiveTab('boxes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'boxes'
                ? 'bg-gradient-to-r from-amber-500 to-[#d4af37] text-neutral-950 shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-4 h-4" /> Mystery Boxes ({openedBoxIds.length}/{arcade.mysteryBoxes.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'caption' && (
            <CaptionThisGame questions={arcade.captionThis} />
          )}

          {activeTab === 'trivia' && (
            <WhoKnowsMeBestGame questions={arcade.whoKnowsMeBest} honoreeName={honoreeName} />
          )}

          {activeTab === 'scavenger' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-serif text-[#f5f0e6]">
                  Find the Hidden Memories in 3D
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  5 secret relics have been stashed inside the rooms of the villa. Walk close to them in 3D and press [E] or tap to collect!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {arcade.hiddenMemories.map((mem, idx) => {
                  const isFound = collectedMemoryIds.includes(mem.id);
                  return (
                    <div
                      key={mem.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFound
                          ? 'bg-amber-950/20 border-[#d4af37]/60'
                          : 'bg-neutral-900/60 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            isFound
                              ? 'bg-[#d4af37]/20 border border-[#d4af37]'
                              : 'bg-neutral-800 border border-neutral-700'
                          }`}
                        >
                          {isFound ? mem.icon : '🔒'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm sm:text-base text-white">
                              {isFound ? mem.title : `Secret Relic #${idx + 1}`}
                            </h4>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                isFound
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {isFound ? 'Discovered ✨' : mem.roomName}
                            </span>
                          </div>
                          {isFound ? (
                            <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                              {mem.revealedStory}
                            </p>
                          ) : (
                            <p className="text-xs text-neutral-300 mt-1">
                              <span className="text-amber-400 font-semibold">Clue:</span> {mem.hint}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'boxes' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-serif text-[#f5f0e6]">
                  Mystery Surprise Boxes
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Discover gift boxes placed across the museum villa, or unwrap them right here!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {arcade.mysteryBoxes.map((box) => {
                  const isOpened = openedBoxIds.includes(box.id);
                  return (
                    <motion.div
                      key={box.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBox(box)}
                      className="cursor-pointer p-5 rounded-2xl bg-neutral-900/80 border border-neutral-700 hover:border-[#d4af37] transition-all flex flex-col justify-between shadow-lg group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md border-2"
                          style={{
                            backgroundColor: box.boxColor,
                            borderColor: box.ribbonColor
                          }}
                        >
                          <Gift className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-white">
                            {box.title}
                          </h4>
                          <span className="text-[11px] text-neutral-400">
                            {box.roomName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isOpened
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isOpened ? 'Unwrapped 🎁' : 'Sealed & Ready ✨'}
                        </span>
                        <span className="text-xs text-[#d4af37] font-medium group-hover:underline">
                          {isOpened ? 'Inspect Reward →' : 'Unwrap →'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Individual Box Modal */}
      {selectedBox && (
        <MysteryBoxModal
          box={selectedBox}
          isOpen={Boolean(selectedBox)}
          isAlreadyOpened={openedBoxIds.includes(selectedBox.id)}
          onOpenBox={onOpenBox}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </div>
  );
}
