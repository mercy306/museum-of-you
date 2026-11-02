'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, CheckCircle, XCircle, ArrowRight, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import { WhoSaidThatQuestion } from '@/types/museum';

interface WhoSaidThatGameProps {
  questions: WhoSaidThatQuestion[];
  onGameComplete?: (score: number) => void;
}

export function WhoSaidThatGame({ questions, onGameComplete }: WhoSaidThatGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const chosen = currentQ.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setGameFinished(true);
      if (onGameComplete) {
        onGameComplete(score);
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setGameFinished(false);
  };

  if (gameFinished) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#201815] to-[#0E0D0C] border-2 border-red-500/40 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/60 border border-red-500 flex items-center justify-center text-red-400 mb-4">
          <Gavel className="w-8 h-8 animate-bounce" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-red-400 font-semibold">
          Verdict Rendered · Court of Embarrassment
        </span>
        <h3 className="font-display text-2xl sm:text-3xl text-[#FAF5EB] font-bold mt-1">
          The Tribunal Has Ruled!
        </h3>
        <p className="font-editorial text-xl italic text-[#DFB76C] mt-2">
          &ldquo;Some evidence should have remained permanently deleted. Unfortunately, the evidence is undeniable.&rdquo;
        </p>
        <p className="text-sm text-stone-300 mt-2">
          You correctly convicted the perpetrator in <strong className="text-[#DFB76C]">{score}</strong> out of {questions.length} cases!
        </p>

        <button
          onClick={handleReset}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C5A059]/50 text-[#DFB76C] hover:bg-[#C5A059]/10 text-xs uppercase tracking-widest font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-open Evidence Archive
        </button>
      </div>
    );
  }

  const chosenOption = currentQ.options.find((o) => o.id === selectedOptionId);
  const isCorrect = chosenOption?.isCorrect;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#221C18] via-[#161311] to-[#0A0A0C] border border-[#C5A059]/35 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-500/40 flex items-center justify-center text-red-400">
            <Gavel className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#DFB76C] font-semibold">
              Interactive Mini-Game · Who Said That?
            </h4>
            <p className="text-[11px] text-stone-400">Match the immortal quotation to its true author</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-black/60 border border-[#C5A059]/30 text-xs font-mono text-[#DFB76C]">
          Case {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* The Incriminating Quote Banner */}
      <div className="relative p-6 rounded-2xl bg-black/60 border border-[#C5A059]/30 mb-6 text-center overflow-hidden">
        <span className="absolute -top-3 left-4 text-7xl text-[#DFB76C]/10 font-serif select-none pointer-events-none">
          “
        </span>
        <p className="font-editorial text-2xl sm:text-3xl italic text-[#FAF4E6] leading-snug">
          &ldquo;{currentQ.quote}&rdquo;
        </p>
        {currentQ.dateOrSetting && (
          <p className="text-xs text-stone-400 mt-3 font-mono">
            📍 Recorded Setting: {currentQ.dateOrSetting}
          </p>
        )}
      </div>

      {/* Suspect Options */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-[#DFB76C] font-semibold mb-2">
          Select the Prime Suspect:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((option) => {
            const isSelected = selectedOptionId === option.id;

            let btnStyle = 'bg-black/50 border-[#C5A059]/25 text-stone-200 hover:border-[#DFB76C]';
            if (isAnswered) {
              if (option.isCorrect) {
                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
              } else if (isSelected && !option.isCorrect) {
                btnStyle = 'bg-red-950/80 border-red-500 text-red-300';
              } else {
                btnStyle = 'bg-black/20 border-stone-800 text-stone-600 opacity-60';
              }
            }

            return (
              <button
                key={option.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
                className={`p-3.5 rounded-xl border text-sm font-medium tracking-wide transition-all duration-300 flex items-center justify-between text-left ${btnStyle}`}
              >
                <span className="font-display">{option.name}</span>
                {isAnswered && option.isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                {isAnswered && isSelected && !option.isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer Verdict Feedback */}
      <AnimatePresence>
        {isAnswered && chosenOption && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-6 p-4 rounded-xl border ${
              isCorrect ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-red-950/40 border-red-500/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {isCorrect ? (
                <span className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Guilty As Charged!
                </span>
              ) : (
                <span className="text-xs uppercase font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Incorrect. Unfortunately, the evidence is undeniable.
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans mb-2">
              {chosenOption.feedback}
            </p>

            <p className="text-xs text-stone-400 italic">
              Historical Context: {currentQ.explanation}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#DFB76C] text-black font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Quote' : 'Finalize Tribunal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
