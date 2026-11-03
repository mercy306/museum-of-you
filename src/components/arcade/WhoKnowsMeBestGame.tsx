'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WhoKnowsMeQuestion } from '@/types/museum';

interface WhoKnowsMeBestGameProps {
  questions: WhoKnowsMeQuestion[];
  honoreeName?: string;
  onComplete?: (score: number) => void;
}

export function WhoKnowsMeBestGame({ questions, honoreeName = 'Alex', onComplete }: WhoKnowsMeBestGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQ = questions[currentIdx];
  const selectedOption = currentQ?.options.find((o) => o.id === selectedOptionId);

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);

    const chosen = currentQ.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setGameFinished(true);
      onComplete?.(score + (selectedOption?.isCorrect ? 1 : 0));
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setGameFinished(false);
  };

  if (!currentQ) return null;

  if (gameFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const title =
      percentage >= 80
        ? `⭐ The Certified ${honoreeName} Whisperer`
        : percentage >= 50
        ? `🤝 Trusted Inner Circle Confidant`
        : `👀 Suspect Stranger in Disguise`;

    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c1a17] to-[#0e0d0c] border-2 border-[#dfb76c]/40 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-[#c5a059] flex items-center justify-center text-black mb-4 shadow-lg shadow-amber-500/20">
          <Award className="w-8 h-8 animate-bounce" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#dfb76c] font-semibold">
          Final Results Tribunal
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto mb-4">
          You scored <span className="font-mono font-bold text-amber-400">{score} of {questions.length}</span> ({percentage}%).
          {percentage >= 80
            ? ` You clearly know ${honoreeName} better than they know themselves.`
            : ` A few close calls, but the friendship remains legally binding.`}
        </p>

        {/* Certificate Card */}
        <div className="p-4 rounded-xl bg-black/50 border border-[#c5a059]/30 max-w-sm mx-auto mb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#dfb76c] mb-1">
            <span>OFFICIAL VIP ACCREDITATION</span>
          </div>
          <p className="text-xs text-stone-300">
            Certified Friend Clearance: <span className="text-white font-bold">{title}</span>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#dfb76c]">
          <HelpCircle className="w-4 h-4" />
          <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
        </div>
        <span className="text-xs font-mono text-stone-400">
          Score: {score} / {questions.length}
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg sm:text-xl font-bold text-white">
          {currentQ.question}
        </h3>

        {/* Choices */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const showOutcome = Boolean(selectedOptionId);

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={Boolean(selectedOptionId)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-xs sm:text-sm font-sans flex items-start justify-between gap-3 cursor-pointer ${
                  showOutcome
                    ? opt.isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : isSelected
                      ? 'bg-red-950/60 border-red-500 text-red-200'
                      : 'bg-black/30 border-stone-800 text-stone-600 opacity-50'
                    : 'bg-black/50 border-[#c5a059]/30 text-stone-200 hover:border-[#dfb76c] hover:bg-black/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {opt.id.slice(-1).toUpperCase()}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </div>

                {showOutcome && opt.isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {showOutcome && isSelected && !opt.isCorrect && (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Commentary Box */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border mt-4 ${
                selectedOption.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-stone-300'
              }`}
            >
              <p className="text-xs italic leading-relaxed">
                {selectedOption.curatorFeedback}
              </p>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#dfb76c] text-black font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Final Certification'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
