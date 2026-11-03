'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, PlusCircle, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Exhibit } from '@/types/museum';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExhibit: (exhibit: Exhibit) => void;
}

export function AddMediaModal({ isOpen, onClose, onAddExhibit }: AddMediaModalProps) {
  const [galleryId, setGalleryId] = useState('gallery-memories');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [story, setStory] = useState('');
  const [curatorNote, setCuratorNote] = useState('');
  const [classifiedLevel, setClassifiedLevel] = useState<'Top Secret' | 'Confidential' | 'Declassified' | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('landscape');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type.startsWith('image/')) {
      setMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    const newExhibit: Exhibit = {
      id: `ex-custom-${Date.now()}`,
      galleryId,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      date: date.trim() || 'Undated Memory',
      imageUrl: mediaType === 'image' ? mediaUrl : 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
      videoUrl: mediaType === 'video' ? mediaUrl : undefined,
      mediaType,
      story: story.trim() || 'A cherished moment added to the permanent museum collection.',
      curatorNote: curatorNote.trim() || 'Curator appraisal: An irreplaceable memory worthy of preservation.',
      aspectRatio,
      classifiedLevel: galleryId === 'gallery-embarrassing' ? (classifiedLevel || 'Top Secret') : undefined
    };

    onAddExhibit(newExhibit);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1c1a17] to-[#0f0e0d] border border-[#c5a059]/40 shadow-2xl p-6 sm:p-8 text-[#faf6ed]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/20">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#c5a059]" />
              <h3 className="font-display text-xl font-bold text-white">Add Memory to Museum</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-stone-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Room Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                Target Room
              </label>
              <select
                value={galleryId}
                onChange={(e) => setGalleryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059]"
              >
                <option value="gallery-memories">Room 1: Memorable Moments</option>
                <option value="gallery-funny">Room 2: Funny Memories</option>
                <option value="gallery-embarrassing">Room 3: Embarrassing Images (Classified)</option>
                <option value="gallery-celebration">Room 4: Wishes &amp; Celebration</option>
              </select>
            </div>

            {/* Media Type Toggle */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                Media Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    mediaType === 'image'
                      ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                      : 'bg-black/40 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    mediaType === 'video'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-black/40 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Clip (MP4/WebM)</span>
                </button>
              </div>
            </div>

            {/* Media URL & File Upload */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                {mediaType === 'video' ? 'Video File or Web URL' : 'Image File or Web URL'}
              </label>
              <input
                type="text"
                placeholder={mediaType === 'video' ? 'https://.../video.mp4' : 'https://.../photo.jpg'}
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059] mb-2"
              />
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-700 bg-black/30 hover:bg-black/50 text-stone-400 hover:text-white text-xs cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-[#c5a059]" />
                <span>Or Upload from Device ({mediaType === 'video' ? 'MP4/WebM' : 'PNG/JPG/WEBP'})</span>
                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                  Exhibit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Roadtrip to Big Sur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                  Date / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer 2023"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Story / Memory Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                Story / Memory Description
              </label>
              <textarea
                rows={2}
                placeholder="What happened? Tell the story behind this moment..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Curator Note */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c5a059] mb-1.5">
                Curator&apos;s Appraisal / Funny Quote
              </label>
              <input
                type="text"
                placeholder='e.g. "Ranked 10/10 for comedic excellence."'
                value={curatorNote}
                onChange={(e) => setCuratorNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-[#c5a059]/30 text-white text-sm focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Classified Level (if Room 3) */}
            {galleryId === 'gallery-embarrassing' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-red-400 mb-1.5">
                  Security Classification
                </label>
                <select
                  value={classifiedLevel || 'Top Secret'}
                  onChange={(e) => setClassifiedLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm focus:outline-none focus:border-red-400"
                >
                  <option value="Top Secret">Top Secret (Red Blur)</option>
                  <option value="Confidential">Confidential (Mild Blur)</option>
                  <option value="Declassified">Declassified (Public View)</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border border-stone-700 text-stone-300 text-xs uppercase tracking-wider hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save to Museum</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
