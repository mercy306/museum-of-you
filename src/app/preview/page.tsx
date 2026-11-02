'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Sparkles, Eye } from 'lucide-react';
import { MuseumHeader } from '@/components/interface/MuseumHeader';
import { MuseumConfig } from '@/types/museum';
import { getMuseumConfig } from '@/lib/museumStore';

export default function PreviewPage() {
  const [config, setConfig] = useState<MuseumConfig | null>(null);

  useEffect(() => {
    setConfig(getMuseumConfig());
  }, []);

  if (!config) return null;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0C] text-[#E8E4DA] flex flex-col justify-between">
      <MuseumHeader config={config} currentLocation="Exhibition Preview Deck" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-24 sm:py-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] hover:text-[#DFB76C] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Curator Studio
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF5EB]">
              Exhibition Preview <span className="gold-gradient-text">· Live Manifest</span>
            </h1>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DFB76C] text-black text-xs uppercase tracking-widest font-bold hover:scale-105 transition-all shadow-md shadow-[#C5A059]/20"
          >
            <Eye className="w-4 h-4" /> Visit Portico
          </Link>
        </div>

        {/* Live Preview Overview */}
        <div className="p-6 sm:p-8 rounded-2xl museum-panel border border-[#C5A059]/30 space-y-6">
          <div className="border-b border-[#C5A059]/20 pb-5">
            <span className="text-[11px] uppercase tracking-widest text-[#DFB76C] font-semibold">Honoree</span>
            <h2 className="text-3xl font-display text-stone-100 mt-1">{config.profile.name}</h2>
            {config.profile.nickname && (
              <p className="text-sm italic text-[#C5A059] mt-0.5">&ldquo;{config.profile.nickname}&rdquo;</p>
            )}
            <p className="text-xs text-stone-400 mt-2 font-mono">Milestone Date: {config.profile.birthday}</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#DFB76C] font-semibold">Welcome Proclamation</span>
            <p className="text-sm text-stone-300 mt-1.5 leading-relaxed bg-black/40 p-4 rounded-xl border border-[#C5A059]/20">
              {config.profile.welcomeMessage}
            </p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#DFB76C] font-semibold">Exhibition Galleries</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {config.galleries.map((gal) => (
                <div key={gal.id} className="p-4 rounded-xl bg-black/40 border border-[#C5A059]/15">
                  <div className="text-xs font-mono text-[#DFB76C] font-bold">{gal.roomName}</div>
                  <div className="text-base font-display text-stone-200 mt-0.5">{gal.title}</div>
                  <div className="text-xs text-stone-400 mt-1 leading-normal">{gal.curatorStatement}</div>
                  <div className="text-[10px] text-stone-500 mt-2 font-mono">{gal.exhibits.length} Curated Artifacts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-stone-600 border-t border-[#C5A059]/10">
        The Museum of You © 2026 · Exhibition Preview System
      </footer>
    </div>
  );
}
