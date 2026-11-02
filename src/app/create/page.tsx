'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, User, Image as ImageIcon, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { MuseumHeader } from '@/components/interface/MuseumHeader';
import { MuseumConfig } from '@/types/museum';
import { getMuseumConfig, saveMuseumConfig, resetMuseumConfig } from '@/lib/museumStore';

export default function CreateMuseumPage() {
  const [config, setConfig] = useState<MuseumConfig | null>(null);
  const [personName, setPersonName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [nickname, setNickname] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const data = getMuseumConfig();
    setConfig(data);
    setPersonName(data.profile.name);
    setBirthday(data.profile.birthday);
    setNickname(data.profile.nickname || '');
    setWelcomeMessage(data.profile.welcomeMessage);
  }, []);

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const updatedConfig: MuseumConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
      profile: {
        ...config.profile,
        name: personName,
        birthday: birthday,
        nickname: nickname,
        welcomeMessage: welcomeMessage
      }
    };

    saveMuseumConfig(updatedConfig);
    setConfig(updatedConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset to default curated retrospective?')) {
      const reset = resetMuseumConfig();
      setConfig(reset);
      setPersonName(reset.profile.name);
      setBirthday(reset.profile.birthday);
      setNickname(reset.profile.nickname || '');
      setWelcomeMessage(reset.profile.welcomeMessage);
    }
  };

  if (!config) return null;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0C] text-[#E8E4DA] flex flex-col justify-between">
      <MuseumHeader config={config} currentLocation="Curator's Studio (/create)" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-24 sm:py-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] hover:text-[#DFB76C] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Entrance
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF5EB]">
              Personalization Engine <span className="gold-gradient-text">· Create</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Customize the honoree, memories, and exhibition narratives for your special person.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-300 underline"
          >
            Reset Default
          </button>
        </div>

        {/* Quick Personalization Form (Foundation preview for Phase 5) */}
        <form onSubmit={handleQuickSave} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl museum-panel border border-[#C5A059]/30">
            <div className="flex items-center gap-2 text-[#DFB76C] mb-4">
              <User className="w-4 h-4" />
              <h2 className="font-display text-lg uppercase tracking-wider text-[#FAF5EB]">
                1. Honoree Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-[#C5A059]/30 text-stone-100 focus:outline-none focus:border-[#DFB76C] text-sm"
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">
                  Birthday / Milestone Date
                </label>
                <input
                  type="text"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-[#C5A059]/30 text-stone-100 focus:outline-none focus:border-[#DFB76C] text-sm"
                  placeholder="e.g. November 15, 1996"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">
                  Affectionate Title or Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-[#C5A059]/30 text-stone-100 focus:outline-none focus:border-[#DFB76C] text-sm"
                  placeholder="e.g. The Architect of Chaos"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">
                  Curator Welcome Proclamation
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-[#C5A059]/30 text-stone-100 focus:outline-none focus:border-[#DFB76C] text-sm leading-relaxed"
                  placeholder="Welcome message displayed at the grand entrance..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Exhibition Wings Overview */}
          <div className="p-6 sm:p-8 rounded-2xl museum-panel border border-[#C5A059]/20">
            <div className="flex items-center gap-2 text-[#DFB76C] mb-4">
              <Layers className="w-4 h-4" />
              <h2 className="font-display text-lg uppercase tracking-wider text-[#FAF5EB]">
                2. Museum Wings (Pre-Configured)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.galleries.map((gal) => (
                <div
                  key={gal.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-[#C5A059]/20 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded bg-[#DFB76C]/10 border border-[#DFB76C]/30 flex items-center justify-center text-[#DFB76C] font-mono text-xs font-bold shrink-0">
                    {gal.order}
                  </div>
                  <div>
                    <h3 className="text-sm font-display text-stone-200">{gal.title}</h3>
                    <p className="text-xs text-stone-400 line-clamp-1">{gal.theme}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-4 italic">
              Full drag-and-drop exhibit photograph uploader, caption editor, and Supabase cloud sync will be enriched in Phase 5.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-4 h-4" /> Changes applied to Museum!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/preview"
                className="px-5 py-2.5 rounded-lg border border-[#C5A059]/40 text-[#DFB76C] text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A059]/10 transition-colors"
              >
                Preview Mode
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-black text-xs uppercase tracking-widest font-bold hover:scale-105 transition-all shadow-md shadow-[#C5A059]/20 cursor-pointer"
              >
                Save Exhibition
              </button>
            </div>
          </div>
        </form>
      </main>

      <footer className="py-4 text-center text-xs text-stone-600 border-t border-[#C5A059]/10">
        The Museum of You © 2026 · Personalization Architecture
      </footer>
    </div>
  );
}
