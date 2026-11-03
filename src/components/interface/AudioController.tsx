'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';

interface AudioControllerProps {
  className?: string;
  forcePlay?: boolean;
  customAudioUrl?: string;
}

export function AudioController({ className = '', forcePlay = false, customAudioUrl }: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play punchy celebratory brass trumpet lead (Real festive party sound!)
  const playTrumpetLead = (
    ctx: AudioContext,
    destination: GainNode,
    freq: number,
    startTime: number,
    duration: number,
    velocity = 0.4
  ) => {
    // Twin oscillators for rich brass body
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime); // slight chorusing

    // Dynamic brass envelope on filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.frequency.exponentialRampToValueAtTime(1100, startTime + duration);
    filter.Q.setValueAtTime(2.5, startTime);

    // Amplitude envelope
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(velocity, startTime + 0.04);
    noteGain.gain.setValueAtTime(velocity * 0.85, startTime + duration * 0.75);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Subtle natural vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 5.5;
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.setValueAtTime(3.5, startTime + 0.12); // Vibrato kicks in gently
    vibrato.connect(osc1.frequency);
    vibrato.connect(osc2.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);

    vibrato.start(startTime);
    vibrato.stop(startTime + duration);
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration);
  };

  // Upbeat Piano Chord Strum
  const playPianoChord = (
    ctx: AudioContext,
    destination: GainNode,
    freqs: number[],
    startTime: number,
    duration: number,
    velocity = 0.18
  ) => {
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.015);

      gain.gain.setValueAtTime(0, startTime + idx * 0.015);
      gain.gain.linearRampToValueAtTime(velocity, startTime + idx * 0.015 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime + idx * 0.015);
      osc.stop(startTime + duration);
    });
  };

  // Kick Drum for lively party pulse
  const playKick = (ctx: AudioContext, destination: GainNode, startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, startTime);
    osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.09);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.16);
  };

  // Snare / Tambourine Party Shake
  const playSnareTambourine = (ctx: AudioContext, destination: GainNode, startTime: number) => {
    const bufferSize = ctx.sampleRate * 0.08;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.08);
  };

  // Bouncy Party Bassline
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

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, startTime);
    filter.frequency.exponentialRampToValueAtTime(160, startTime + duration);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Upbeat, festive, joyful Happy Birthday arrangement with brass, piano, and drums!
  const scheduleHappyBirthday = (startTime: number): number => {
    if (!audioCtxRef.current || !masterGainRef.current) return 0;
    const ctx = audioCtxRef.current;
    const out = masterGainRef.current;

    // Frequencies (Hz)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    const C3 = 130.81, G3 = 196.0, F3 = 174.61, A3 = 220.0;

    const beat = 0.44; // Upbeat celebratory tempo (~136 BPM)

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

    // Chords on beats
    const chords: { beats: number[]; freqs: number[] }[] = [
      { beats: [0, 1, 2], freqs: [C4, E4, G4] },
      { beats: [3, 4, 5], freqs: [G3, B4, D4, F4] },
      { beats: [6, 7, 8], freqs: [G3, B4, D4, F4] },
      { beats: [9, 10, 11], freqs: [C4, E4, G4] },
      { beats: [12, 13, 14], freqs: [C4, E4, G4] },
      { beats: [15, 16, 17], freqs: [F3, A4, C4] },
      { beats: [18, 19], freqs: [F3, A4, C4] },
      { beats: [20, 21], freqs: [C4, E4, G4] },
      { beats: [22], freqs: [G3, B4, D4, F4] },
      { beats: [23, 24], freqs: [C4, E4, G4] }
    ];

    // Upbeat party bassline
    const bass: [number, number, number][] = [
      [C3, 0.8, 0], [G3, 0.8, 1.0], [E4, 0.8, 2.0],
      [G3, 0.8, 3.0], [D4, 0.8, 4.0], [G3, 0.8, 5.0],
      [G3, 0.8, 6.0], [D4, 0.8, 7.0], [B4, 0.8, 8.0],
      [C3, 0.8, 9.0], [E4, 0.8, 10.0], [G3, 0.8, 11.0],
      [C3, 0.8, 12.0], [E4, 0.8, 13.0], [G3, 0.8, 14.0],
      [F3, 0.8, 15.0], [A3, 0.8, 16.0], [C4, 0.8, 17.0],
      [F3, 0.8, 18.0], [A3, 0.8, 19.0],
      [C3, 0.8, 20.0], [E4, 0.8, 21.0],
      [G3, 0.8, 22.0],
      [C3, 2.0, 23.0]
    ];

    // 1. Play lively brass trumpet lead
    melody.forEach(([freq, dur, offset]) => {
      playTrumpetLead(ctx, out, freq, startTime + offset * beat, dur * beat * 0.95, 0.35);
    });

    // 2. Play piano accompaniment
    chords.forEach((chord) => {
      chord.beats.forEach((b) => {
        playPianoChord(ctx, out, chord.freqs, startTime + b * beat, beat * 0.85, 0.16);
      });
    });

    // 3. Play party bassline
    bass.forEach(([freq, dur, offset]) => {
      playBassNote(ctx, out, freq, startTime + offset * beat, dur * beat);
    });

    // 4. Play celebratory rhythm (Kick on beat 1, Tambourine on beats 2 & 3)
    for (let b = 0; b < 25; b++) {
      if (b % 3 === 0) {
        playKick(ctx, out, startTime + b * beat);
      } else {
        playSnareTambourine(ctx, out, startTime + b * beat);
      }
    }

    return 26 * beat; // ~11.5 seconds per festive chorus
  };

  const startMusicLoop = () => {
    // If a custom real MP3 / stream audio is configured, use it
    if (customAudioUrl) {
      if (!htmlAudioRef.current) {
        htmlAudioRef.current = new Audio(customAudioUrl);
        htmlAudioRef.current.loop = true;
      }
      htmlAudioRef.current.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to Web Audio synthesis if audio element is blocked
        startWebAudioLoop();
      });
      return;
    }

    startWebAudioLoop();
  };

  const startWebAudioLoop = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.38, ctx.currentTime);
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
      timerRef.current = window.setTimeout(playNext, (length + 0.5) * 1000);
    };

    playNext();
  };

  const stopMusic = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.3);
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
    // Listen for custom trigger from Opening Welcome Card or Birthday Cake in 3D scene
    const handleTriggerBirthdaySong = () => {
      if (!isPlayingRef.current) {
        startMusicLoop();
      }
    };
    window.addEventListener('play-birthday-song', handleTriggerBirthdaySong);

    return () => {
      window.removeEventListener('play-birthday-song', handleTriggerBirthdaySong);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (htmlAudioRef.current) htmlAudioRef.current.pause();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleMusic}
        title={isPlaying ? 'Pause Birthday Music' : 'Play Happy Birthday Song'}
        className={`group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer active:scale-95 ${
          isPlaying
            ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-amber-500/25 animate-pulse'
            : 'bg-black/60 border-white/20 text-neutral-300 hover:border-amber-400 hover:text-amber-300'
        }`}
      >
        <div className="relative flex items-center justify-center w-4 h-4 text-amber-400">
          {isPlaying ? (
            <Disc3 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <Music className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="hidden sm:inline">
          {isPlaying ? 'Birthday Tune 🎵' : 'Play Music 🎶'}
        </span>
      </button>
    </div>
  );
}
