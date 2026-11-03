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
import { Landmark, Mail, PlusCircle, Compass, Gamepad2, Sparkles, CheckCircle2, Film, Menu, X } from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState(false);
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
      {/* Ultra-Clean Corner Controls (Zero screen clutter) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        {/* Background Birthday Soundtrack */}
        <AudioController customAudioUrl={config.settings?.customAudioUrl} />

        {/* Minimalist Menu Toggle (keeps screen 100% clean) */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5 text-xs font-medium"
          title="Open Menu"
        >
          {showMenu ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
          <span className="hidden sm:inline">{showMenu ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* Slide-out / Dropdown Menu (only visible when user clicks ☰) */}
      {showMenu && (
        <div className="absolute top-16 right-4 z-40 w-64 p-3 rounded-2xl bg-neutral-950/95 border border-[#d4af37]/40 shadow-2xl backdrop-blur-xl pointer-events-auto">
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <p className="text-xs font-serif font-bold text-[#ffd700]">Happy Birthday, {config.profile.name}! 🎂</p>
          </div>

          <div className="flex flex-col gap-1">
            {/* Watch Birthday Movie */}
            <button
              onClick={() => {
                setIsTouring(!isTouring);
                setShowMenu(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white transition-all text-left cursor-pointer"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>{isTouring ? 'Exit Movie Tour' : 'Watch Birthday Movie 🎬'}</span>
            </button>

            {/* Birthday Wishes */}
            <button
              onClick={() => {
                setShowWishesModal(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white transition-all text-left cursor-pointer"
            >
              <Mail className="w-4 h-4 text-rose-400" />
              <span>Birthday Wishes 💌</span>
            </button>

            {/* Mini-Games */}
            <button
              onClick={() => {
                setArcadeDefaultTab('caption');
                setShowArcadeModal(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white transition-all text-left cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span>Mischief Arcade Games 🕹️</span>
            </button>

            {/* Picture Adder Person / Creator Studio */}
            <Link
              href="/create"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-amber-300 transition-all border-t border-white/10 pt-2 mt-1"
            >
              <PlusCircle className="w-4 h-4 text-[#ffd700]" />
              <span>Creator Studio (Add Photos) 🎨</span>
            </Link>
          </div>
        </div>
      )}

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
