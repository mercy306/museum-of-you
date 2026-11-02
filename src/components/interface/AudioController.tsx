'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';

interface AudioControllerProps {
  className?: string;
  forcePlay?: boolean;
}

export function AudioController({ className = '', forcePlay = false }: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const tracks = [
    { name: 'Happy Birthday (Music Box & Piano)', tempo: 120 },
    { name: 'Birthday Celebration Chimes', tempo: 135 },
    { name: 'Luxury Villa Sunset Jazz', tempo: 95 }
  ];

  // Synthesize realistic acoustic instruments (Music box, bell, warm rhodes piano)
  const playNote = (
    ctx: AudioContext,
    destination: GainNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity = 0.3
  ) => {
    // 1. Fundamental tone (Warm Bell / Music Box Sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(velocity * 0.45, startTime + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(gain1);
    gain1.connect(destination);
    osc1.start(startTime);
    osc1.stop(startTime + duration);

    // 2. Harmonic overtone (Chime shimmer)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(velocity * 0.15, startTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);

    osc2.connect(gain2);
    gain2.connect(destination);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.7);
  };

  const playBassNote = (
    ctx: AudioContext,
    destination: GainNode,
    freq: number,
    startTime: number,
    duration: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Play the authentic Happy Birthday melody and accompaniment
  const scheduleHappyBirthday = (startTime: number): number => {
    if (!audioCtxRef.current || !masterGainRef.current) return 0;
    const ctx = audioCtxRef.current;
    const out = masterGainRef.current;

    // Frequencies (Hz)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    const C3 = 130.81, G3 = 196.0, F3 = 174.61;

    const beat = 0.52; // Seconds per quarter note

    // Melody: [frequency, durationInBeats, beatOffset]
    const melody: [number, number, number][] = [
      // "Happy Birthday to you"
      [G4, 0.75, 0],
      [G4, 0.25, 0.75],
      [A4, 1.0, 1.0],
      [G4, 1.0, 2.0],
      [C5, 1.0, 3.0],
      [B4, 2.0, 4.0],

      // "Happy Birthday to you"
      [G4, 0.75, 6.0],
      [G4, 0.25, 6.75],
      [A4, 1.0, 7.0],
      [G4, 1.0, 8.0],
      [D5, 1.0, 9.0],
      [C5, 2.0, 10.0],

      // "Happy Birthday dear (name)"
      [G4, 0.75, 12.0],
      [G4, 0.25, 12.75],
      [G5, 1.0, 13.0],
      [E5, 1.0, 14.0],
      [C5, 1.0, 15.0],
      [B4, 1.0, 16.0],
      [A4, 2.0, 17.0],

      // "Happy Birthday to you!"
      [F5, 0.75, 19.0],
      [F5, 0.25, 19.75],
      [E5, 1.0, 20.0],
      [C5, 1.0, 21.0],
      [D5, 1.0, 22.0],
      [C5, 2.5, 23.0]
    ];

    // Chords / Bassline
    const bass: [number, number, number][] = [
      [C3, 2.8, 0],
      [G3, 2.8, 3.0],
      [G3, 2.8, 6.0],
      [C3, 2.8, 9.0],
      [C3, 2.8, 12.0],
      [F3, 2.8, 15.0],
      [F3, 1.8, 18.0],
      [C3, 1.8, 20.0],
      [G3, 1.8, 22.0],
      [C3, 3.0, 23.0]
    ];

    melody.forEach(([freq, dur, offset]) => {
      playNote(ctx, out, freq, startTime + offset * beat, dur * beat * 1.15, 0.32);
    });

    bass.forEach(([freq, dur, offset]) => {
      playBassNote(ctx, out, freq, startTime + offset * beat, dur * beat);
    });

    return 26.5 * beat; // Total sequence length in seconds
  };

  const startMusicLoop = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.3, ctx.currentTime);
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const playNext = () => {
      if (!isPlayingRef.current || !audioCtxRef.current) return;
      const length = scheduleHappyBirthday(audioCtxRef.current.currentTime);
      timerRef.current = window.setTimeout(playNext, (length + 0.8) * 1000);
    };

    playNext();
  };

  const stopMusic = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.4);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusicLoop();
    }
  };

  useEffect(() => {
    if (forcePlay && !isPlaying) {
      startMusicLoop();
    }
  }, [forcePlay]);

  useEffect(() => {
    // Listen for custom trigger from Birthday cake in 3D scene
    const handleTriggerBirthdaySong = () => {
      if (!isPlayingRef.current) {
        startMusicLoop();
      }
    };
    window.addEventListener('play-birthday-song', handleTriggerBirthdaySong);

    return () => {
      window.removeEventListener('play-birthday-song', handleTriggerBirthdaySong);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleMusic}
        title={isPlaying ? 'Pause Birthday Music' : 'Play Happy Birthday Song'}
        className={`group flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer ${
          isPlaying
            ? 'bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300 shadow-amber-500/20'
            : 'bg-white/85 border-stone-300 text-stone-700 hover:border-amber-400 hover:text-amber-600'
        }`}
      >
        <div className="relative flex items-center justify-center w-5 h-5 text-amber-500">
          {isPlaying ? (
            <Disc3 className="w-4 h-4 animate-spin text-amber-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400 group-hover:text-amber-500" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold">
            {isPlaying ? 'Happy Birthday: Playing 🎵' : 'Play Birthday Song 🎂'}
          </span>

          {/* Equalizer animation when music is on */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 ml-1">
              <span className="w-0.5 h-full bg-amber-500 animate-[bounce_0.8s_infinite_100ms] rounded-full" />
              <span className="w-0.5 h-3/4 bg-amber-500 animate-[bounce_0.8s_infinite_300ms] rounded-full" />
              <span className="w-0.5 h-full bg-amber-500 animate-[bounce_0.8s_infinite_200ms] rounded-full" />
              <span className="w-0.5 h-1/2 bg-amber-500 animate-[bounce_0.8s_infinite_400ms] rounded-full" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
