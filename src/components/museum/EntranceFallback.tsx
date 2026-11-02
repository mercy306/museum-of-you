'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';

interface EntranceFallbackProps {
  isEntering: boolean;
}

export function EntranceFallback({ isEntering }: EntranceFallbackProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-[#09090b] via-[#121216] to-[#0A0A0C]">
      {/* Background Architectural Columns Silhouette */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-full max-w-5xl h-full flex justify-between px-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-full bg-gradient-to-b from-[#2E2820] via-[#1A1815] to-[#0E0E10] border-x border-[#C5A059]/20"
            />
          ))}
        </div>
      </div>

      {/* Warm Ambient Portal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#DFB76C]/10 blur-3xl pointer-events-none" />

      {/* Stylized Double Bronze Doors in 2D fallback */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-96 flex border-2 border-[#C5A059]/40 rounded-t-full overflow-hidden shadow-2xl shadow-black/80">
        {/* Left Door */}
        <motion.div
          animate={isEntering ? { rotateY: -85, x: -40, opacity: 0.3 } : { rotateY: 0, x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-[#1A1816] border-r border-[#C5A059]/40 p-3 flex flex-col justify-around origin-left"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-14 border border-[#C5A059]/30 rounded bg-black/40" />
          ))}
        </motion.div>

        {/* Right Door */}
        <motion.div
          animate={isEntering ? { rotateY: 85, x: 40, opacity: 0.3 } : { rotateY: 0, x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-[#1A1816] border-l border-[#C5A059]/40 p-3 flex flex-col justify-around origin-right"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-14 border border-[#C5A059]/30 rounded bg-black/40" />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
