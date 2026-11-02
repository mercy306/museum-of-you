'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AudioController } from '@/components/interface/AudioController';
import { ExhibitDetailModal } from '@/components/museum/ExhibitDetailModal';
import { FriendWishesModal } from '@/components/museum/FriendWishesModal';
import { MuseumConfig, Exhibit } from '@/types/museum';
import { getMuseumConfig } from '@/lib/museumStore';
import Link from 'next/link';
import { Landmark, Mail } from 'lucide-react';

// Dynamically import 3D Museum Walkthrough
const MuseumWalkthrough3D = dynamic(
  () => import('@/components/three/scenes/MuseumWalkthrough3D').then((mod) => mod.MuseumWalkthrough3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#fbfbfa] text-[#C5A059]">
        <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    )
  }
);

export default function MuseumPage() {
  const [config, setConfig] = useState<MuseumConfig | null>(null);
  const [inspectedExhibit, setInspectedExhibit] = useState<Exhibit | null>(null);
  const [isTouring, setIsTouring] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);

  useEffect(() => {
    setConfig(getMuseumConfig());
  }, []);

  if (!config) {
    return <div className="min-h-screen w-full bg-[#fbfbfa]" />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#fbfbfa] text-[#1a1a1e] select-none">
      {/* Minimal Top Brand & Audio Atmosphere Button */}
      <div className="absolute top-4 left-5 right-5 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#C5A059]/40 text-[#8e6e33] hover:bg-[#C5A059]/15 transition-all text-xs font-serif uppercase tracking-widest backdrop-blur-md shadow-sm"
          >
            <Landmark className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Museum Entrance</span>
          </Link>

          <button
            onClick={() => setShowWishesModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#C5A059]/50 text-[#7a591e] hover:bg-[#C5A059]/20 transition-all text-xs font-serif uppercase tracking-widest backdrop-blur-md shadow-sm cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Friend Wishes 💌</span>
          </button>
        </div>

        <div className="pointer-events-auto">
          <AudioController />
        </div>
      </div>

      {/* Pure 3D Walkthrough Museum */}
      <MuseumWalkthrough3D
        config={config}
        onInspectExhibit={(exhibit) => setInspectedExhibit(exhibit)}
        isTouring={isTouring}
        onToggleTour={() => setIsTouring(!isTouring)}
        onOpenWishes={() => setShowWishesModal(true)}
      />

      {/* Exhibit Inspection View (Only shown when you walk up to an artwork and press E) */}
      <ExhibitDetailModal
        exhibit={inspectedExhibit}
        galleryName="The Collection"
        onClose={() => setInspectedExhibit(null)}
      />

      {/* Friend Wishes & Birthday Letter Modal */}
      <FriendWishesModal
        isOpen={showWishesModal}
        onClose={() => setShowWishesModal(false)}
        honoreeName={config.profile.name}
        letter={config.profile.finalBirthdayLetter}
      />
    </div>
  );
}
