'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Volume2, Landmark } from 'lucide-react';
import { MuseumHeader } from '@/components/interface/MuseumHeader';
import { EntranceFallback } from './EntranceFallback';
import { MuseumConfig } from '@/types/museum';
import { getMuseumConfig } from '@/lib/museumStore';

// Dynamically import Three.js canvas to prevent SSR hydration errors
const EntranceScene3D = dynamic(
  () => import('@/components/three/scenes/EntranceScene3D'),
  {
    ssr: false,
    loading: () => <EntranceFallback isEntering={false} />
  }
);

export function GrandEntrance() {
  const router = useRouter();
  const [config, setConfig] = useState<MuseumConfig | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Load configured or default museum data
    const loadedConfig = getMuseumConfig();
    setConfig(loadedConfig);

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handleEnterMuseum = () => {
    if (isEntering) return;
    setIsEntering(true);

    // Fallback timer if 3D camera transition does not fire callback
    setTimeout(() => {
      router.push('/museum');
    }, 2400);
  };

  const handleTransitionComplete = () => {
    router.push('/museum');
  };

  if (!config) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08080a] text-[#C5A059]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          <p className="font-display tracking-widest text-xs uppercase text-stone-400">
            Preparing Museum Architecture...
          </p>
        </div>
      </div>
    );
  }

  const { profile } = config;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0C] select-none flex flex-col justify-between">
      {/* Museum Header Bar */}
      <MuseumHeader config={config} currentLocation="Grand Portico & Facade" />

      {/* 3D Museum Facade & Portico or Fallback */}
      <div className="absolute inset-0 z-0">
        {hasWebGL ? (
          <EntranceScene3D
            isEntering={isEntering}
            onTransitionComplete={handleTransitionComplete}
            personName={profile.name}
          />
        ) : (
          <EntranceFallback isEntering={isEntering} />
        )}
      </div>

      {/* Subtle Vignette & Gradient Overlays to frame the architecture */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,6,8,0.7)_80%,rgba(4,4,6,0.95)_100%)]" />

      {/* Top Architectural Museum Signage */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="relative z-20 pt-24 sm:pt-28 text-center px-4 max-w-4xl mx-auto pointer-events-none"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C5A059]/30 bg-black/40 backdrop-blur-md mb-3">
          <Sparkles className="w-3 h-3 text-[#DFB76C]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#DFB76C] font-medium">
            Permanent Exhibition
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.18em] text-[#F7F2E7] uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          The Museum <span className="gold-gradient-text">of You</span>
        </h1>

        <div className="w-48 h-[1px] mx-auto bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent mt-3 mb-2" />

        <p className="font-editorial text-lg sm:text-2xl italic tracking-wide text-[#DFCEB3] drop-shadow-md">
          {profile.entranceSubtitle}
        </p>
      </motion.div>

      {/* Bottom Center: Pure ENTER Button (Zero blocking text cards) */}
      <div className="relative z-20 pb-12 sm:pb-16 px-4 w-full max-w-md mx-auto text-center flex flex-col items-center">
        <AnimatePresence>
          {!isEntering && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col items-center"
            >
              {/* Grand ENTER THE MUSEUM Button */}
              <motion.button
                onClick={handleEnterMuseum}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(223, 183, 108, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 sm:px-14 py-4 rounded-full bg-gradient-to-r from-[#DFB76C] via-[#F4DE9C] to-[#C5A059] text-[#121110] font-display text-sm sm:text-base font-bold tracking-[0.22em] uppercase shadow-2xl shadow-black flex items-center gap-3 transition-all cursor-pointer"
              >
                <span className="relative z-10">Step Inside The Museum</span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform duration-300 relative z-10" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transitioning Overlay message */}
        <AnimatePresence>
          {isEntering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-3 text-[#DFB76C]"
            >
              <div className="w-8 h-8 border-2 border-[#DFB76C] border-t-transparent rounded-full animate-spin" />
              <p className="font-display tracking-[0.3em] uppercase text-xs text-[#FAF4E6]">
                Opening Portico Doors · Entering Lobby
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen Fade to Black at the peak of entering */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
            className="fixed inset-0 z-50 bg-[#08080a] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
