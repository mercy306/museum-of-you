'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AudioController } from '@/components/interface/AudioController';
import { ExhibitDetailModal } from '@/components/museum/ExhibitDetailModal';
import { FriendWishesModal } from '@/components/museum/FriendWishesModal';
import { AddMediaModal } from '@/components/museum/AddMediaModal';
import { MuseumConfig, Exhibit } from '@/types/museum';
import { getMuseumConfig, saveMuseumConfig } from '@/lib/museumStore';
import Link from 'next/link';
import { Landmark, Mail, PlusCircle, Compass } from 'lucide-react';

// Dynamically import 3D Museum Walkthrough
const MuseumWalkthrough3D = dynamic(
  () => import('@/components/three/scenes/MuseumWalkthrough3D').then((mod) => mod.MuseumWalkthrough3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#181614] text-[#C5A059]">
        <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#dfb76c]">
          Loading 4-Room Step-by-Step Experience...
        </p>
      </div>
    )
  }
);

export default function MuseumPage() {
  const [config, setConfig] = useState<MuseumConfig | null>(null);
  const [inspectedExhibit, setInspectedExhibit] = useState<Exhibit | null>(null);
  const [isTouring, setIsTouring] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(1);

  useEffect(() => {
    setConfig(getMuseumConfig());
  }, []);

  const handleAddExhibit = (newExhibit: Exhibit) => {
    if (!config) return;

    const updatedGalleries = config.galleries.map((gallery) => {
      if (gallery.id === newExhibit.galleryId) {
        return {
          ...gallery,
          exhibits: [...gallery.exhibits, newExhibit]
        };
      }
      return gallery;
    });

    const updatedConfig: MuseumConfig = {
      ...config,
      galleries: updatedGalleries
    };

    setConfig(updatedConfig);
    saveMuseumConfig(updatedConfig);
  };

  if (!config) {
    return <div className="min-h-screen w-full bg-[#181614]" />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#181614] text-[#1a1a1e] select-none">
      {/* Minimal Top Brand & Audio Atmosphere Button */}
      <div className="absolute top-4 left-5 right-5 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#C5A059]/40 text-[#dfb76c] hover:bg-[#C5A059]/20 transition-all text-xs font-serif uppercase tracking-widest backdrop-blur-md shadow-sm"
          >
            <Landmark className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Entrance</span>
          </Link>

          <button
            onClick={() => setShowWishesModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#C5A059]/40 text-[#dfb76c] hover:bg-[#C5A059]/20 transition-all text-xs font-serif uppercase tracking-widest backdrop-blur-md shadow-sm cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Friend Wishes 💌</span>
          </button>

          <button
            onClick={() => setShowAddMediaModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-[#c5a059] text-white hover:scale-105 transition-all text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>+ Add Photo / Video</span>
          </button>

          <button
            onClick={() => setIsTouring(!isTouring)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-sm cursor-pointer transition-all ${
              isTouring
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-black/60 text-stone-300 border-stone-700 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isTouring ? 'Stop Guided Tour' : 'Auto Guided Tour'}</span>
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
        currentRoomIndex={currentRoomIndex}
        onRoomChange={setCurrentRoomIndex}
        onAddMedia={() => setShowAddMediaModal(true)}
      />

      {/* Exhibit Inspection View (Only shown when you walk up to an artwork and press E) */}
      <ExhibitDetailModal
        exhibit={inspectedExhibit}
        galleryName={
          currentRoomIndex === 1
            ? 'Room 1 · Memorable Moments'
            : currentRoomIndex === 2
            ? 'Room 2 · Funny Memories'
            : currentRoomIndex === 3
            ? 'Room 3 · Embarrassing Images (Classified)'
            : 'Room 4 · Wishes & Grand Celebration'
        }
        onClose={() => setInspectedExhibit(null)}
      />

      {/* Friend Wishes & Birthday Letter Modal */}
      <FriendWishesModal
        isOpen={showWishesModal}
        onClose={() => setShowWishesModal(false)}
        honoreeName={config.profile.name}
        letter={config.profile.finalBirthdayLetter}
      />

      {/* Add Media (Photo or Video) Modal */}
      <AddMediaModal
        isOpen={showAddMediaModal}
        onClose={() => setShowAddMediaModal(false)}
        onAddExhibit={handleAddExhibit}
      />
    </div>
  );
}
