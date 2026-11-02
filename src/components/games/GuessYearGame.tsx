'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import { GuessYearQuestion } from '@/types/museum';

interface GuessYearGameProps {
  questions: GuessYearQuestion[];
  onGameComplete?: (score: number) => void;
}

export function GuessYearGame({ questions, onGameComplete }: GuessYearGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelectYear = (year: number) => {
    if (isAnswered) return;
    setSelectedYear(year);
    setIsAnswered(true);

    const isCorrect = year === currentQ.correctYear;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedYear(null);
      setIsAnswered(false);
    } else {
      setGameFinished(true);
      if (onGameComplete) {
        onGameComplete(score + (selectedYear === currentQ.correctYear ? 0 : 0));
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedYear(null);
    setIsAnswered(false);
    setScore(0);
    setGameFinished(false);
  };

  if (gameFinished) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1C1A17] to-[#0E0D0C] border-2 border-[#DFB76C]/40 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#DFB76C]/20 border border-[#DFB76C] flex items-center justify-center text-[#DFB76C] mb-4">
          <Sparkles className="w-8 h-8 animate-bounce" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#DFB76C] font-semibold">
          Challenge Completed · Chronologist Certificate
        </span>
        <h3 className="font-display text-2xl sm:text-3xl text-[#FAF5EB] font-bold mt-1">
          Chronology Mastered!
        </h3>
        <p className="font-editorial text-xl italic text-[#DFB76C] mt-2">
          &ldquo;Look at this tiny human. Nobody could have predicted what was coming.&rdquo;
        </p>
        <p className="text-sm text-stone-300 mt-2">
          You scored <strong className="text-[#DFB76C]">{score}</strong> out of {questions.length} on childhood history!
        </p>

        <button
          onClick={handleReset}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C5A059]/50 text-[#DFB76C] hover:bg-[#C5A059]/10 text-xs uppercase tracking-widest font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Replay Chronology Challenge
        </button>
      </div>
    );
  }

  const isCorrect = selectedYear === currentQ.correctYear;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1E1C19] via-[#141312] to-[#0A0A0C] border border-[#C5A059]/35 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DFB76C]/10 border border-[#DFB76C]/30 flex items-center justify-center text-[#DFB76C]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#DFB76C] font-semibold">
              Interactive Mini-Game · Chronology Challenge
            </h4>
            <p className="text-[11px] text-stone-400">Guess the exact year of this historical artifact</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-black/60 border border-[#C5A059]/30 text-xs font-mono text-[#DFB76C]">
          Specimen {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Artifact Image with Museum Frame */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#C5A059]/40 aspect-square max-h-[300px] shadow-lg">
          <img
            src={currentQ.photoUrl}
            alt="Historical Artifact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
            <p className="text-xs text-stone-200 font-sans leading-snug">
              &ldquo;{currentQ.caption}&rdquo;
            </p>
          </div>
        </div>

        {/* Options & Interaction */}
        <div className="space-y-4">
          <p className="text-sm font-display text-stone-100 font-semibold">
            In approximately which year was this iconic scene captured?
          </p>

          {/* Year Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((year) => {
              const selected = selectedYear === year;
              const isOptionCorrect = year === currentQ.correctYear;

              let btnClass = 'bg-black/50 border-[#C5A059]/30 text-stone-200 hover:border-[#DFB76C]';
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                } else if (selected && !isOptionCorrect) {
                  btnClass = 'bg-red-950/80 border-red-500 text-red-300';
                } else {
                  btnClass = 'bg-black/20 border-stone-800 text-stone-600';
                }
              }

              return (
                <button
                  key={year}
                  disabled={isAnswered}
                  onClick={() => handleSelectYear(year)}
                  className={`py-3 px-4 rounded-xl border text-sm font-mono tracking-wider transition-all duration-300 flex items-center justify-between ${btnClass}`}
                >
                  <span>{year}</span>
                  {isAnswered && isOptionCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {isAnswered && selected && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}
          </div>

          {/* Feedback & Curator Explanation */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-[#1C1815] border-[#DFB76C]/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect ? (
                    <span className="text-xs uppercase font-bold text-emerald-400">
                      ✓ Spot On! Official Archive Match
                    </span>
                  ) : (
                    <span className="text-xs uppercase font-bold text-[#DFB76C]">
                      ⚠ Archival Correction: It was {currentQ.correctYear}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  {currentQ.explanation}
                </p>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#DFB76C] text-black font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Next Specimen' : 'Complete Challenge'}</span>
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
