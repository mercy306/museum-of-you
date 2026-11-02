'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Sparkles, PlusCircle, Landmark } from 'lucide-react';
import { MuseumTicket } from './MuseumTicket';
import { AudioController } from './AudioController';
import { MuseumConfig } from '@/types/museum';

interface MuseumHeaderProps {
  config: MuseumConfig;
  currentLocation?: string;
  isInsideMuseum?: boolean;
}

export function MuseumHeader({
  config,
  currentLocation = 'Grand Portico & Facade',
  isInsideMuseum = false
}: MuseumHeaderProps) {
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#C5A059]/15 bg-[#0A0A0C]/80 backdrop-blur-md transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DFB76C] to-[#8E6E33] p-0.5 flex items-center justify-center shadow-md shadow-[#C5A059]/20">
              <div className="w-full h-full bg-[#0E0E10] rounded-[6px] flex items-center justify-center">
                <Landmark className="w-4 h-4 text-[#DFB76C] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-display text-sm sm:text-base font-semibold tracking-widest text-[#F4E9D8] uppercase group-hover:text-[#DFB76C] transition-colors">
                The Museum of You
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] uppercase tracking-wider text-[#A39682] border-l border-stone-700 pl-2">
                Curated Retrospective
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Location indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-[#C5A059]/20 bg-[#141418]/60 text-xs text-[#D8CEBE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DFB76C] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-stone-400">Location:</span>
          <span className="font-medium text-[#F4DE9C]">{currentLocation}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Audio controller */}
          <AudioController />

          {/* Ticket Button */}
          <button
            onClick={() => setIsTicketOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-[#C5A059]/35 bg-[#171615]/80 hover:bg-[#C5A059]/15 text-[#DFB76C] text-xs uppercase tracking-wider font-medium transition-all"
            title="View Official Admission Pass"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VIP Pass</span>
          </button>

          {/* Create Button */}
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-[#C5A059]/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Curate Museum</span>
          </Link>
        </div>
      </header>

      {/* Ticket Modal */}
      <MuseumTicket
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        config={config}
      />
    </>
  );
}
