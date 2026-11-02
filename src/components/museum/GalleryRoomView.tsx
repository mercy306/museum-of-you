'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  Award,
  CheckCircle,
  HelpCircle,
  Gavel,
  ChevronRight,
  ChevronLeft,
  Volume2
} from 'lucide-react';
import { MuseumConfig, Gallery, Exhibit } from '@/types/museum';
import { ExhibitDetailModal } from './ExhibitDetailModal';
import { GuessYearGame } from '@/components/games/GuessYearGame';
import { WhoSaidThatGame } from '@/components/games/WhoSaidThatGame';

interface GalleryRoomViewProps {
  config: MuseumConfig;
  onOpenReception: () => void;
  onOpenTicket: () => void;
}

export function GalleryRoomView({ config, onOpenReception, onOpenTicket }: GalleryRoomViewProps) {
  const { galleries, profile } = config;
  const [activeGalleryId, setActiveGalleryId] = useState<string>(galleries[0]?.id || 'gallery-01');
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);

  // Visitor Progress State
  const [visitedGalleryIds, setVisitedGalleryIds] = useState<string[]>([galleries[0]?.id || 'gallery-01']);
  const [inspectedExhibitIds, setInspectedExhibitIds] = useState<string[]>([]);
  const [completedGames, setCompletedGames] = useState<Record<string, number>>({});

  const currentGallery = galleries.find((g) => g.id === activeGalleryId) || galleries[0];

  const handleSelectGallery = (id: string) => {
    setActiveGalleryId(id);
    if (!visitedGalleryIds.includes(id)) {
      setVisitedGalleryIds((prev) => [...prev, id]);
    }
  };

  const handleInspectExhibit = (exhibit: Exhibit) => {
    setSelectedExhibit(exhibit);
    if (!inspectedExhibitIds.includes(exhibit.id)) {
      setInspectedExhibitIds((prev) => [...prev, exhibit.id]);
    }
  };

  const handleGameScore = (gameKey: string, score: number) => {
    setCompletedGames((prev) => ({ ...prev, [gameKey]: score }));
  };

  const totalExhibits = galleries.reduce((acc, g) => acc + g.exhibits.length, 0);

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-[#E8E4DA] pt-20 pb-24 px-4 sm:px-8">
      {/* Top Gallery Navigation Deck */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Progress & VIP Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-2xl bg-[#141312]/80 border border-[#C5A059]/25 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#DFB76C] font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Visitor Progress:
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Galleries: <strong className="text-[#DFB76C]">{visitedGalleryIds.length}</strong>/{galleries.length}
            </span>
            <span className="text-stone-600 hidden sm:inline">|</span>
            <span className="text-xs text-stone-300 font-mono hidden sm:inline">
              Artifacts Examined: <strong className="text-[#DFB76C]">{inspectedExhibitIds.length}</strong>/{totalExhibits}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReception}
              className="px-3 py-1 rounded-lg border border-[#C5A059]/40 hover:bg-[#C5A059]/10 text-xs uppercase tracking-wider text-[#DFB76C] transition-colors"
            >
              Reception Desk
            </button>
            <button
              onClick={onOpenTicket}
              className="px-3 py-1 rounded-lg bg-[#DFB76C]/15 border border-[#DFB76C]/50 text-xs uppercase tracking-wider text-[#DFB76C] font-semibold hover:bg-[#DFB76C] hover:text-black transition-colors"
            >
              VIP Pass
            </button>
          </div>
        </div>

        {/* Gallery Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {galleries.map((gal) => {
            const isActive = gal.id === activeGalleryId;
            const isVisited = visitedGalleryIds.includes(gal.id);

            return (
              <button
                key={gal.id}
                onClick={() => handleSelectGallery(gal.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DFB76C] to-[#C5A059] text-black border-[#DFB76C] font-bold shadow-lg shadow-[#C5A059]/20 scale-[1.02]'
                    : isVisited
                    ? 'bg-[#151413]/70 border-[#C5A059]/30 text-stone-200 hover:border-[#DFB76C]'
                    : 'bg-[#0E0E10]/50 border-stone-800 text-stone-500 hover:text-stone-300'
                }`}
              >
                <span className="font-mono">{gal.roomName}</span>
                <span>·</span>
                <span className="font-display">{gal.title}</span>
                {isVisited && !isActive && <CheckCircle className="w-3.5 h-3.5 text-[#DFB76C]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Gallery Space */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGallery.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Gallery Portal Header */}
            <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#1C1A17] via-[#141312] to-[#0A0A0C] border border-[#C5A059]/30 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(#DFB76C_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#DFB76C]/30 bg-[#DFB76C]/10 text-[#DFB76C] text-xs font-mono uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentGallery.roomName} · {currentGallery.theme}
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FBF6EC] tracking-wider mb-3">
                  {currentGallery.title}
                </h2>

                <p className="font-editorial text-xl sm:text-2xl italic text-[#DFB76C] leading-snug">
                  &ldquo;{currentGallery.curatorStatement}&rdquo;
                </p>
              </div>
            </div>

            {/* Gallery Exhibits Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-[#FAF5EB] font-bold">
                    Curated Photographic Artifacts
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Click any artifact to inspect curatorial notes, dates, and historical evidence.
                  </p>
                </div>

                <span className="text-xs text-[#DFB76C] font-mono">
                  {currentGallery.exhibits.length} Masterworks On Display
                </span>
              </div>

              {/* Grid of Framed Exhibits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {currentGallery.exhibits.map((exhibit) => {
                  const isInspected = inspectedExhibitIds.includes(exhibit.id);

                  return (
                    <motion.div
                      key={exhibit.id}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleInspectExhibit(exhibit)}
                      className="group cursor-pointer rounded-2xl bg-[#141312] border border-[#C5A059]/25 hover:border-[#DFB76C] p-4 shadow-xl transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Gold Museum Picture Frame */}
                      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black border-2 border-[#9A7B38]/50 group-hover:border-[#DFB76C] transition-colors shadow-inner">
                        <img
                          src={exhibit.imageUrl}
                          alt={exhibit.title}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                            exhibit.classifiedLevel ? 'blur-[3px] group-hover:blur-0' : ''
                          }`}
                        />

                        {/* Classified badge if applicable */}
                        {exhibit.classifiedLevel && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-950/90 border border-red-500 text-red-400 text-[10px] font-mono font-bold uppercase">
                            ⚠ {exhibit.classifiedLevel}
                          </div>
                        )}

                        {/* Inspected Stamp */}
                        {isInspected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#DFB76C] text-black flex items-center justify-center shadow">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 border border-[#DFB76C] text-[#DFB76C] text-xs font-semibold uppercase tracking-wider">
                            <Eye className="w-3.5 h-3.5" /> Examine
                          </span>
                        </div>
                      </div>

                      {/* Plaque beneath photo */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[11px] text-[#A99D8B] mb-1">
                          <span className="font-mono text-[#DFB76C]">{exhibit.date || 'Archival'}</span>
                          <span className="text-[10px] uppercase tracking-wider text-stone-500">
                            Specimen #{exhibit.id.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-stone-100 group-hover:text-[#DFB76C] transition-colors line-clamp-1">
                          {exhibit.title}
                        </h4>
                        <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-normal font-sans">
                          {exhibit.story}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Embedded Mini-Games according to Gallery Theme */}
            {/* Gallery 01 Mini-Game: Guess the Year */}
            {currentGallery.id === 'gallery-01' && currentGallery.guessYearGame && (
              <div className="pt-6">
                <GuessYearGame
                  questions={currentGallery.guessYearGame.questions}
                  onGameComplete={(score) => handleGameScore('guess_year', score)}
                />
              </div>
            )}

            {/* Gallery 02 Mini-Game: Who Said That? */}
            {currentGallery.id === 'gallery-02' && currentGallery.whoSaidThatGame && (
              <div className="pt-6">
                <WhoSaidThatGame
                  questions={currentGallery.whoSaidThatGame.questions}
                  onGameComplete={(score) => handleGameScore('who_said_that', score)}
                />
              </div>
            )}

            {/* Next Gallery Quick Nav */}
            <div className="pt-8 border-t border-[#C5A059]/20 flex items-center justify-between">
              {(() => {
                const currentIndex = galleries.findIndex((g) => g.id === activeGalleryId);
                const prevGallery = galleries[currentIndex - 1];
                const nextGallery = galleries[currentIndex + 1];

                return (
                  <>
                    {prevGallery ? (
                      <button
                        onClick={() => handleSelectGallery(prevGallery.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C5A059]/30 text-stone-300 hover:text-[#DFB76C] hover:border-[#DFB76C] text-xs uppercase tracking-wider transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous: {prevGallery.title}</span>
                      </button>
                    ) : <div />}

                    {nextGallery ? (
                      <button
                        onClick={() => handleSelectGallery(nextGallery.id)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#C5A059]/20"
                      >
                        <span>Next: {nextGallery.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : <div />}
                  </>
                );
              })()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Inspect Modal */}
      <ExhibitDetailModal
        exhibit={selectedExhibit}
        galleryName={`${currentGallery.roomName}: ${currentGallery.title}`}
        onClose={() => setSelectedExhibit(null)}
      />
    </div>
  );
}
