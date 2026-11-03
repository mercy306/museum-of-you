'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AudioController } from '@/components/interface/AudioController';
import { ExhibitDetailModal } from '@/components/museum/ExhibitDetailModal';
import { FriendWishesModal } from '@/components/museum/FriendWishesModal';
import { AddMediaModal } from '@/components/museum/AddMediaModal';
import { MischiefArcadeModal } from '@/components/arcade/MischiefArcadeModal';
import { MysteryBoxModal } from '@/components/arcade/MysteryBoxModal';
import { ScavengerHuntHUD } from '@/components/arcade/ScavengerHuntHUD';
import { MuseumConfig, Exhibit, MysteryBoxItem, HiddenMemoryItem } from '@/types/museum';
import { getMuseumConfig, saveMuseumConfig } from '@/lib/museumStore';
import Link from 'next/link';
import { Landmark, Mail, PlusCircle, Compass, Gamepad2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Museum Mischief Arcade States
  const [showArcadeModal, setShowArcadeModal] = useState(false);
  const [arcadeDefaultTab, setArcadeDefaultTab] = useState<'caption' | 'trivia' | 'scavenger' | 'boxes'>('caption');
  const [selectedMysteryBox, setSelectedMysteryBox] = useState<MysteryBoxItem | null>(null);
  const [collectedMemoryIds, setCollectedMemoryIds] = useState<string[]>([]);
  const [openedBoxIds, setOpenedBoxIds] = useState<string[]>([]);
  const [discoveredMemoryToast, setDiscoveredMemoryToast] = useState<HiddenMemoryItem | null>(null);

  useEffect(() => {
    setConfig(getMuseumConfig());

    try {
      const savedMems = localStorage.getItem('museum_collected_memories');
      if (savedMems) setCollectedMemoryIds(JSON.parse(savedMems));
      const savedBoxes = localStorage.getItem('museum_opened_boxes');
      if (savedBoxes) setOpenedBoxIds(JSON.parse(savedBoxes));
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  const handleCollectHiddenMemory = (memory: HiddenMemoryItem) => {
    if (collectedMemoryIds.includes(memory.id)) return;
    const next = [...collectedMemoryIds, memory.id];
    setCollectedMemoryIds(next);
    try {
      localStorage.setItem('museum_collected_memories', JSON.stringify(next));
    } catch {}

    setDiscoveredMemoryToast(memory);
    setTimeout(() => setDiscoveredMemoryToast(null), 5500);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ffa500', '#ff69b4', '#00ffff']
    });
  };

  const handleOpenMysteryBox = (box: MysteryBoxItem) => {
    setSelectedMysteryBox(box);
  };

  const handleUnlockBoxId = (boxId: string) => {
    if (openedBoxIds.includes(boxId)) return;
    const next = [...openedBoxIds, boxId];
    setOpenedBoxIds(next);
    try {
      localStorage.setItem('museum_opened_boxes', JSON.stringify(next));
    } catch {}
  };

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
      {/* Top Brand, Audio Atmosphere & Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Celebratory Birthday Name Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 border border-[#d4af37]/50 text-[#f5f0e6] hover:bg-black/85 transition-all text-xs font-serif backdrop-blur-md shadow-lg"
          >
            <span className="text-base animate-bounce">🎂</span>
            <span className="font-bold">Happy Birthday, <span className="text-[#ffd700]">{config.profile.name}</span>!</span>
          </Link>
        </div>

        {/* Right: Clean, essential actions without visual clutter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Birthday Wishes & Cards */}
          <button
            onClick={() => setShowWishesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-rose-200 text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Mail className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">Birthday</span> Wishes 💌
          </button>

          {/* Mini-Games & Surprises */}
          <button
            onClick={() => {
              setArcadeDefaultTab('caption');
              setShowArcadeModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/50 text-purple-200 text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-300" />
            <span>Games 🕹️</span>
          </button>

          {/* Background Birthday Soundtrack */}
          <AudioController />
        </div>
      </div>

      {/* Discovered Memory Toast Notification */}
      {discoveredMemoryToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-bounce max-w-[92vw]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-900/95 border-2 border-[#d4af37] text-white shadow-2xl backdrop-blur-md">
            <span className="text-2xl">{discoveredMemoryToast.icon}</span>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Secret Memory Discovered!
              </div>
              <p className="text-sm font-bold text-white">{discoveredMemoryToast.title}</p>
              <p className="text-xs text-neutral-300 max-w-sm mt-0.5">{discoveredMemoryToast.revealedStory}</p>
            </div>
          </div>
        </div>
      )}

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
        arcade={config.arcade}
        collectedMemoryIds={collectedMemoryIds}
        openedBoxIds={openedBoxIds}
        onOpenArcade={(tab = 'caption') => {
          setArcadeDefaultTab(tab);
          setShowArcadeModal(true);
        }}
        onOpenMysteryBox={handleOpenMysteryBox}
        onCollectHiddenMemory={handleCollectHiddenMemory}
      />

      {/* Museum Mischief Arcade Console Hub Modal */}
      {config.arcade && (
        <MischiefArcadeModal
          isOpen={showArcadeModal}
          onClose={() => setShowArcadeModal(false)}
          arcade={config.arcade}
          honoreeName={config.profile.name}
          collectedMemoryIds={collectedMemoryIds}
          openedBoxIds={openedBoxIds}
          onOpenBox={handleUnlockBoxId}
          defaultTab={arcadeDefaultTab}
        />
      )}

      {/* Direct 3D Mystery Box Modal */}
      {selectedMysteryBox && (
        <MysteryBoxModal
          box={selectedMysteryBox}
          isOpen={Boolean(selectedMysteryBox)}
          isAlreadyOpened={openedBoxIds.includes(selectedMysteryBox.id)}
          onOpenBox={handleUnlockBoxId}
          onClose={() => setSelectedMysteryBox(null)}
        />
      )}

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
