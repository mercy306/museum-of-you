'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, ThumbsUp, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CaptionThisQuestion } from '@/types/museum';

interface CaptionThisGameProps {
  questions: CaptionThisQuestion[];
  onComplete?: (score: number) => void;
}

export function CaptionThisGame({ questions, onComplete }: CaptionThisGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [totalRating, setTotalRating] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQ = questions[currentIdx];
  const selectedOption = currentQ?.options.find((o) => o.id === selectedOptionId);

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);

    const chosen = currentQ.options.find((o) => o.id === optionId);
    if (chosen) {
      setTotalRating((prev) => prev + chosen.funnyRating);
      if (chosen.funnyRating >= 95) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setGameFinished(true);
      const averageRating = Math.round(totalRating / questions.length);
      onComplete?.(averageRating);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setTotalRating(0);
    setGameFinished(false);
  };

  if (!currentQ) return null;

  if (gameFinished) {
    const avgScore = Math.round(totalRating / questions.length);
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#221c13] to-[#0e0d0c] border-2 border-[#dfb76c]/40 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-[#c5a059] flex items-center justify-center text-black mb-4 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#dfb76c] font-semibold">
          Arcade Rating Complete
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
          {avgScore >= 95 ? '👑 Certified Comedy Royalty' : avgScore >= 90 ? '🔥 Meme Grandmaster' : '👏 Respectable Comedic Taste'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto mb-6">
          Your collective funny rating across all rounds reached <span className="font-mono font-bold text-amber-400">{avgScore}%</span>.
          The Museum Archival Board bows to your sense of humor.
        </p>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round Header */}
      <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#dfb76c]">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>ROUND {currentIdx + 1} OF {questions.length}</span>
        </div>
        <span className="text-xs font-mono text-stone-400">
          Cumulative Rating: {currentIdx > 0 ? Math.round(totalRating / currentIdx) : 100}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Photo Card */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#c5a059]/40 bg-black aspect-video sm:aspect-square flex items-center justify-center shadow-xl">
          <img
            src={currentQ.photoUrl}
            alt="Caption This candidate"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <p className="text-xs text-stone-200 font-sans italic text-center">
              &ldquo;{currentQ.context}&rdquo;
            </p>
          </div>
        </div>

        {/* Caption Choices */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#dfb76c] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Pick the Funniest Caption:
          </p>

          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={Boolean(selectedOptionId)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-sans flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : selectedOptionId
                    ? 'bg-black/30 border-stone-800 text-stone-500 opacity-60'
                    : 'bg-black/50 border-[#c5a059]/30 text-stone-200 hover:border-[#dfb76c] hover:bg-black/70'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/10 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  💬
                </span>
                <span className="leading-relaxed">{opt.caption}</span>
              </button>
            );
          })}

          {/* Feedback & Funny Rating Meter */}
          <AnimatePresence>
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 mt-4"
              >
                <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                  <span>Audience Laugh Meter:</span>
                  <span className="font-bold text-base text-amber-400">{selectedOption.funnyRating}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedOption.funnyRating}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                  />
                </div>
                <p className="text-xs text-stone-300 italic pt-1">
                  {selectedOption.reaction}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#dfb76c] text-black font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md cursor-pointer"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Next Round' : 'Finish Game'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
