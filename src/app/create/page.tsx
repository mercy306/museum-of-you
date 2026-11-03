'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  User,
  Image as ImageIcon,
  Video,
  Layers,
  CheckCircle,
  Upload,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  Download,
  RefreshCw,
  Music,
  Heart,
  Smile,
  ShieldAlert,
  Cake,
  Save,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MuseumHeader } from '@/components/interface/MuseumHeader';
import { MuseumConfig, Exhibit } from '@/types/museum';
import { getMuseumConfig, saveMuseumConfig, resetMuseumConfig } from '@/lib/museumStore';
import { getAssetPath } from '@/lib/assetHelper';
import { encodeGiftConfig } from '@/lib/giftShare';

type TabType = 'profile' | 'room1' | 'room2' | 'room3' | 'wishes' | 'audio';

export default function CreateMuseumPage() {
  const [config, setConfig] = useState<MuseumConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const data = getMuseumConfig();
    setConfig(data);
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen w-full bg-[#0E0D0C] text-[#C5A059] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Save changes to localStorage
  const handleSave = () => {
    if (!config) return;
    const updated = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    saveMuseumConfig(updated);
    setConfig(updated);
    setIsSaved(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffd700', '#ff69b4', '#00e5ff', '#2ecc40']
    });
    setTimeout(() => setIsSaved(false), 3500);
  };

  // Copy direct gift link for the birthday person (receiver only sees the museum & rooms with your photos)
  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined' || !config) return;

    try {
      // 1. Auto-save current config first
      saveMuseumConfig(config);

      // 2. Encode config payload
      const giftCode = await encodeGiftConfig(config);

      // 3. Build pristine receiver gift URL
      const origin = window.location.origin;
      const pathWithoutCreate = window.location.pathname.replace(/\/create\/?$/, '');
      const shareUrl = `${origin}${pathWithoutCreate}/museum#gift=${giftCode}`;

      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffd700', '#ff69b4', '#00e5ff', '#2ecc40']
      });
      setTimeout(() => setCopySuccess(false), 4000);
    } catch {
      // Fallback if clipboard fails
      const shareUrl = `${window.location.origin}${window.location.pathname.replace('/create', '/museum')}`;
      prompt('Copy this Birthday Gift link for the receiver:', shareUrl);
    }
  };

  // Export JSON backup
  const handleExportJSON = () => {
    if (!config) return;
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `museum-of-${config.profile.name.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed?.profile?.name && parsed?.galleries) {
          saveMuseumConfig(parsed);
          setConfig(parsed);
          alert('Successfully imported museum data!');
        } else {
          alert('Invalid museum JSON backup file.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default template
  const handleReset = () => {
    if (confirm('Reset to the default Alex Morgan birthday museum? Any unsaved edits will be replaced.')) {
      const reset = resetMuseumConfig();
      setConfig(reset);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Update profile field
  const updateProfile = (field: string, val: any) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          [field]: val
        }
      };
    });
  };

  // Update final birthday letter field
  const updateLetter = (field: string, val: any) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          finalBirthdayLetter: {
            ...prev.profile.finalBirthdayLetter,
            [field]: val
          }
        }
      };
    });
  };

  // Update exhibit within gallery
  const updateExhibit = (galleryId: string, exhibitId: string, updates: Partial<Exhibit>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        galleries: prev.galleries.map((gal) => {
          if (gal.id !== galleryId) return gal;
          return {
            ...gal,
            exhibits: gal.exhibits.map((ex) => (ex.id === exhibitId ? { ...ex, ...updates } : ex))
          };
        })
      };
    });
  };

  // Handle local image/video upload with auto-resizing for lightweight performance & sharing
  const handleImageFileUpload = (galleryId: string, exhibitId: string, file: File) => {
    const isVid = file.type.startsWith('video/');

    if (isVid) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateExhibit(galleryId, exhibitId, {
            imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
            videoUrl: reader.result,
            mediaType: 'video'
          });
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Auto-compress photos using HTML Canvas to keep memory fast & lightweight
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 850;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          updateExhibit(galleryId, exhibitId, {
            imageUrl: compressed,
            videoUrl: undefined,
            mediaType: 'image'
          });
        } else {
          updateExhibit(galleryId, exhibitId, {
            imageUrl: src,
            videoUrl: undefined,
            mediaType: 'image'
          });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Add new exhibit to gallery
  const handleAddExhibit = (galleryId: string) => {
    const newEx: Exhibit = {
      id: `ex-custom-${Date.now()}`,
      galleryId,
      title: 'New Cherished Memory',
      date: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
      mediaType: 'image',
      story: 'Describe this memorable moment and why it means so much to both of you.',
      curatorNote: 'Curator note: Added with love by friends and family.'
    };

    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        galleries: prev.galleries.map((gal) => {
          if (gal.id !== galleryId) return gal;
          return {
            ...gal,
            exhibits: [...gal.exhibits, newEx]
          };
        })
      };
    });
  };

  // Delete exhibit from gallery
  const handleDeleteExhibit = (galleryId: string, exhibitId: string) => {
    if (!confirm('Remove this photo from the museum?')) return;
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        galleries: prev.galleries.map((gal) => {
          if (gal.id !== galleryId) return gal;
          return {
            ...gal,
            exhibits: gal.exhibits.filter((ex) => ex.id !== exhibitId)
          };
        })
      };
    });
  };

  const room1 = config.galleries.find((g) => g.id === 'gallery-memories') || config.galleries[0];
  const room2 = config.galleries.find((g) => g.id === 'gallery-funny') || config.galleries[1];
  const room3 = config.galleries.find((g) => g.id === 'gallery-embarrassing') || config.galleries[2];

  return (
    <div className="min-h-screen w-full bg-[#0C0B0A] text-[#FAF5EB] flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <MuseumHeader config={config} currentLocation="Picture Adder & Creator Studio" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-32">
        {/* Top Breadcrumb & Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#C5A059]/20">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1.5">
              <Link href="/museum" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to 3D Museum
              </Link>
              <span>•</span>
              <span className="text-amber-400 font-bold">Picture Adder &amp; Creator Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-wide">
              Museum of <span className="text-[#ffd700]">{config.profile.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Add the pictures, videos, and texts here. When you click <strong className="text-amber-300">&ldquo;Copy Gift Link&rdquo;</strong>, your friend or family member will receive a clean link showing only the front celebration and the 3D rooms filled with your photos!
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyShareLink}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer border-2 ${
                copySuccess
                  ? 'bg-emerald-500 text-neutral-950 border-white shadow-emerald-500/30 scale-105'
                  : 'bg-gradient-to-r from-amber-500 via-[#ffd700] to-amber-500 text-neutral-950 border-white hover:scale-105'
              }`}
            >
              {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-black" />}
              <span>{copySuccess ? 'Gift Link Copied! 🎉' : 'Copy Gift Link for Receiver 🎁'}</span>
            </button>

            <Link
              href="/museum"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-[#ffd700]" />
              <span>Preview 3D Museum 🏛️</span>
            </Link>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border border-white/20"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Saved Status Notification */}
        {isSaved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-xl backdrop-blur-md animate-bounce">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Changes saved successfully! Your 3D museum is updated with all new photos and stories.</span>
            </div>
            <Link
              href="/museum"
              className="text-xs font-bold underline hover:text-white uppercase tracking-wider ml-4"
            >
              View in Museum →
            </Link>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 border-b border-white/10 scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#c5a059] text-neutral-950 shadow-md shadow-[#c5a059]/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Birthday Honoree</span>
          </button>

          <button
            onClick={() => setActiveTab('room1')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'room1'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Room 1 · Memories ({room1?.exhibits.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('room2')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'room2'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>3. Room 2 · Funny ({room2?.exhibits.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('room3')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'room3'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>4. Room 3 · Fails ({room3?.exhibits.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'wishes'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>5. Room 4 · Letter &amp; Wishes</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>6. Birthday Song 🎵</span>
          </button>
        </div>

        {/* ===================== TAB 1: HONOREE PROFILE ===================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/70 border border-[#c5a059]/30 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-[#ffd700] mb-6">
                <User className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold text-white">
                  Birthday Person&apos;s Personal Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Birthday Person&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    value={config.profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-[#ffd700] text-sm"
                    placeholder="e.g. Alex Morgan, Mom, Sarah"
                    required
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">This name appears on the front banner, the doors, and the cake!</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Birthday / Milestone Date
                  </label>
                  <input
                    type="text"
                    value={config.profile.birthday}
                    onChange={(e) => updateProfile('birthday', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-[#ffd700] text-sm"
                    placeholder="e.g. November 15, 1996"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Milestone Age
                  </label>
                  <input
                    type="number"
                    value={config.profile.age || ''}
                    onChange={(e) => updateProfile('age', Number(e.target.value) || undefined)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-[#ffd700] text-sm"
                    placeholder="e.g. 30"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Affectionate Nickname or Title
                  </label>
                  <input
                    type="text"
                    value={config.profile.nickname || ''}
                    onChange={(e) => updateProfile('nickname', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-[#ffd700] text-sm"
                    placeholder="e.g. The Legend, Queen of Laughs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Welcome Card Greeting Message
                  </label>
                  <textarea
                    value={config.profile.welcomeMessage}
                    onChange={(e) => updateProfile('welcomeMessage', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-[#ffd700] text-sm leading-relaxed"
                    placeholder="Welcome to your personal 3D Birthday Museum..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2, 3, 4: ROOM PICTURE MANAGERS ===================== */}
        {(activeTab === 'room1' || activeTab === 'room2' || activeTab === 'room3') && (
          <div>
            {(() => {
              const currentRoom =
                activeTab === 'room1' ? room1 : activeTab === 'room2' ? room2 : room3;
              const roomBadge =
                activeTab === 'room1'
                  ? 'Room 1: Memorable Moments & Milestones 📸'
                  : activeTab === 'room2'
                  ? 'Room 2: Funny Memories & Crazy Moments 😂'
                  : 'Room 3: Embarrassing Images & Classified Fails 🙈';

              if (!currentRoom) return null;

              return (
                <div className="space-y-6">
                  {/* Room Overview Header */}
                  <div className="p-6 rounded-3xl bg-neutral-900/70 border border-[#c5a059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                        {roomBadge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-2">
                        {currentRoom.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                        Add photos or videos. You can upload files directly from your phone/computer or paste image links!
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddExhibit(currentRoom.id)}
                      className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-[#ffd700] text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Picture to this Room</span>
                    </button>
                  </div>

                  {/* Exhibits Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentRoom.exhibits.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="p-5 rounded-2xl bg-black/60 border border-white/10 hover:border-[#c5a059]/50 transition-all flex flex-col justify-between shadow-xl"
                      >
                        <div>
                          {/* Image Preview & File Upload */}
                          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 mb-4 group">
                            {ex.mediaType === 'video' && ex.videoUrl ? (
                              <video
                                src={getAssetPath(ex.videoUrl)}
                                className="w-full h-full object-cover"
                                controls={false}
                                muted
                              />
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={ex.imageUrl}
                                alt={ex.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            )}

                            {/* Badge */}
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-amber-300 font-bold border border-white/20">
                              Frame #{idx + 1} · {ex.mediaType === 'video' ? 'VIDEO 🎥' : 'PHOTO 📸'}
                            </div>

                            {/* File Upload Overlay Button */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                              <label className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-1.5 transition-transform active:scale-95">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload New File</span>
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageFileUpload(currentRoom.id, ex.id, file);
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-neutral-300 font-mono text-center">
                                Direct upload from phone or computer
                              </span>
                            </div>
                          </div>

                          {/* Inputs */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-bold">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={ex.title}
                                  onChange={(e) => updateExhibit(currentRoom.id, ex.id, { title: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#ffd700] focus:outline-none"
                                  placeholder="e.g. Graduation Day"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-bold">
                                  Year / Date
                                </label>
                                <input
                                  type="text"
                                  value={ex.date || ''}
                                  onChange={(e) => updateExhibit(currentRoom.id, ex.id, { date: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#ffd700] focus:outline-none"
                                  placeholder="e.g. 2021"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-bold">
                                Image URL (or upload above)
                              </label>
                              <input
                                type="text"
                                value={ex.imageUrl}
                                onChange={(e) => updateExhibit(currentRoom.id, ex.id, { imageUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 text-xs focus:border-[#ffd700] focus:outline-none font-mono"
                                placeholder="Paste image link https://..."
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1 font-bold">
                                Story / Memory Description
                              </label>
                              <textarea
                                value={ex.story}
                                onChange={(e) => updateExhibit(currentRoom.id, ex.id, { story: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#ffd700] focus:outline-none leading-relaxed"
                                placeholder="The story behind this picture..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delete Action */}
                        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                          <label className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Replace Photo</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileUpload(currentRoom.id, ex.id, file);
                              }}
                            />
                          </label>

                          <button
                            onClick={() => handleDeleteExhibit(currentRoom.id, ex.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                            title="Delete this photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Add Button */}
                  <button
                    onClick={() => handleAddExhibit(currentRoom.id)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400 text-amber-300 font-display font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-amber-500/5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Another Picture or Memory to {currentRoom.title}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===================== TAB 5: ROOM 4 LETTER & WISHES ===================== */}
        {activeTab === 'wishes' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/70 border border-[#c5a059]/30 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-pink-400 mb-6">
                <Heart className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold text-white">
                  Grand Birthday Letter (Room 4 Finale)
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-bold">
                    Salutation
                  </label>
                  <input
                    type="text"
                    value={config.profile.finalBirthdayLetter?.salutation || ''}
                    onChange={(e) => updateLetter('salutation', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none"
                    placeholder="e.g. Dearest Alex,"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-bold">
                    Letter Body (Paragraph 1)
                  </label>
                  <textarea
                    value={config.profile.finalBirthdayLetter?.body?.[0] || ''}
                    onChange={(e) => {
                      const currentBody = [...(config.profile.finalBirthdayLetter?.body || [])];
                      currentBody[0] = e.target.value;
                      updateLetter('body', currentBody);
                    }}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none leading-relaxed"
                    placeholder="First paragraph of your birthday letter..."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-bold">
                    Letter Body (Paragraph 2)
                  </label>
                  <textarea
                    value={config.profile.finalBirthdayLetter?.body?.[1] || ''}
                    onChange={(e) => {
                      const currentBody = [...(config.profile.finalBirthdayLetter?.body || [])];
                      currentBody[1] = e.target.value;
                      updateLetter('body', currentBody);
                    }}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none leading-relaxed"
                    placeholder="Second paragraph..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-bold">
                      Closing
                    </label>
                    <input
                      type="text"
                      value={config.profile.finalBirthdayLetter?.closing || ''}
                      onChange={(e) => updateLetter('closing', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none"
                      placeholder="e.g. With all our love and laughter,"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-bold">
                      Author / Signatures
                    </label>
                    <input
                      type="text"
                      value={config.profile.finalBirthdayLetter?.author || ''}
                      onChange={(e) => updateLetter('author', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-pink-400 focus:outline-none"
                      placeholder="e.g. Your Lifelong Fan Club & Family"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: AUDIO & SOUNDTRACK ===================== */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/70 border border-[#c5a059]/30 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-purple-400 mb-6">
                <Music className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold text-white">
                  Birthday Music &amp; Audio Settings
                </h2>
              </div>

              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                  <h3 className="text-sm font-bold text-amber-300">🎵 Built-In Real Happy Birthday Band</h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    By default, the museum plays a celebratory, upbeat Happy Birthday track with trumpet brass fanfare, grand piano chords, party drums, and bass! It starts automatically as soon as the visitor clicks <strong>&ldquo;Open My Birthday Museum&rdquo;</strong> or <strong>&ldquo;Watch Birthday Movie&rdquo;</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                    Custom Soundtrack Audio URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.settings?.customAudioUrl || ''}
                    onChange={(e) => {
                      setConfig((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          settings: {
                            ...prev.settings,
                            customAudioUrl: e.target.value
                          }
                        };
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/40 text-white focus:outline-none focus:border-purple-400 text-sm font-mono"
                    placeholder="https://... (leave empty to use the built-in lively Happy Birthday band)"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Paste a direct MP3 link if you want a specific song to play for the birthday person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BOTTOM BACKUP & SHARING DRAWER ===================== */}
        <div className="mt-12 p-6 rounded-3xl bg-black/50 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold text-white">Backup &amp; Restore Your Museum</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Export your museum configuration to a file so you never lose your memories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 font-mono transition-all cursor-pointer border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup (.json)</span>
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-neutral-300 font-mono transition-all cursor-pointer border border-white/10">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-stone-500 border-t border-white/10 bg-black/40">
        The Museum of You · Picture Adder &amp; Personalization Engine © 2026
      </footer>
    </div>
  );
}
