'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, Sparkles, MessageSquare, PenTool, CheckCircle, Cake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FriendWish } from '@/types/museum';

interface FriendWishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  honoreeName?: string;
  letter?: {
    salutation: string;
    body: string[];
    closing: string;
    author: string;
  };
}

const DEFAULT_WISHES: FriendWish[] = [
  {
    id: 'wish-1',
    authorName: 'Sarah Jenkins',
    relationship: 'Best Friend since 2012',
    message: 'Happy 30th Birthday to my favorite human! From late-night diner runs to conquering adulthood together, I cannot imagine life without your laugh. Here is to 30 more years of making bad decisions and laughing about them! Love you always! 💖🥂',
    emoji: '💖',
    createdAt: 'Today, 2:15 PM'
  },
  {
    id: 'wish-2',
    authorName: 'David & Maya',
    relationship: 'The College Crew',
    message: 'To the legend who survived our 2am study sessions and still managed to become the most successful of us all! Keep shining, dreaming big, and never stop being your wild, authentic self. Happy Birthday brother! 🎉✨',
    emoji: '🎉',
    createdAt: 'Today, 1:40 PM'
  },
  {
    id: 'wish-3',
    authorName: 'Elena Rostova',
    relationship: 'Work Partner in Crime',
    message: 'Happy Birthday! Thank you for being the calm voice of reason, the unofficial office therapist, and the best lunch partner in the universe. You deserve all the happiness and joy in the world today! 🎂🌟',
    emoji: '🎂',
    createdAt: 'Yesterday, 6:20 PM'
  },
  {
    id: 'wish-4',
    authorName: 'Marcus Cole',
    relationship: 'Childhood Friend',
    message: '30 years of knowing each other and you haven\'t changed a bit (mentally at least 😉). Incredibly proud of everything you have built and the loyal person you are. Raising a glass to you tonight! 🍻🎸',
    emoji: '🍻',
    createdAt: 'Yesterday, 3:10 PM'
  }
];

const STICKERS = ['💖', '🥂', '🎂', '🎉', '🌟', '👑', '🚀', '✨'];

export function FriendWishesModal({
  isOpen,
  onClose,
  honoreeName = 'Alex',
  letter
}: FriendWishesModalProps) {
  const [activeTab, setActiveTab] = useState<'letter' | 'wishes' | 'new'>('letter');
  const [wishes, setWishes] = useState<FriendWish[]>(DEFAULT_WISHES);
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('Best Friend');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('museum_friend_wishes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWishes(parsed);
          }
        } catch {
          // ignore corrupted data
        }
      }
    }
  }, []);

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    const newWish: FriendWish = {
      id: `wish-${Date.now()}`,
      authorName: authorName.trim(),
      relationship: relationship.trim() || 'Friend',
      message: message.trim(),
      emoji: selectedEmoji,
      createdAt: 'Just now',
      isCustom: true
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('museum_friend_wishes', JSON.stringify(updated));
    }

    // Blast celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAuthorName('');
      setMessage('');
      setActiveTab('wishes');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#faf8f4] text-[#2c241b] rounded-2xl shadow-2xl border border-[#c5a059]/40 overflow-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="relative px-6 py-4 border-b border-[#c5a059]/20 bg-gradient-to-r from-[#faf8f4] via-[#f5eedf] to-[#faf8f4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-xl shadow-inner">
                💌
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#3d2e1b] tracking-wide">
                  Birthday Wishes & Letters
                </h3>
                <p className="text-xs text-[#8c734b] font-serif">
                  Heartfelt messages and tributes from friends for {honoreeName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#3d2e1b]/5 hover:bg-[#c5a059]/20 transition-all flex items-center justify-center text-[#5c4a32]"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#c5a059]/20 bg-[#f6f2e9] px-6">
            <button
              onClick={() => setActiveTab('letter')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-serif uppercase tracking-widest transition-all ${
                activeTab === 'letter'
                  ? 'border-[#c5a059] text-[#73541f] font-bold bg-[#faf8f4]/60'
                  : 'border-transparent text-[#8a7a65] hover:text-[#5c4a32]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestone Letter</span>
            </button>

            <button
              onClick={() => setActiveTab('wishes')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-serif uppercase tracking-widest transition-all ${
                activeTab === 'wishes'
                  ? 'border-[#c5a059] text-[#73541f] font-bold bg-[#faf8f4]/60'
                  : 'border-transparent text-[#8a7a65] hover:text-[#5c4a32]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Friend Wishes ({wishes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-serif uppercase tracking-widest transition-all ${
                activeTab === 'new'
                  ? 'border-[#c5a059] text-[#73541f] font-bold bg-[#faf8f4]/60'
                  : 'border-transparent text-[#8a7a65] hover:text-[#5c4a32]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>+ Leave a Wish</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto max-h-[64vh]">
            {activeTab === 'letter' && (
              <div className="relative p-7 rounded-xl bg-gradient-to-b from-[#fffefc] to-[#fbf7ee] border border-[#c5a059]/30 shadow-md">
                {/* Decorative Gold Leaf Corner */}
                <div className="absolute top-3 right-4 text-xs font-serif text-[#c5a059] uppercase tracking-widest">
                  VIP Retrospective Tribute
                </div>

                <div className="text-sm font-serif italic text-[#c5a059] mb-4">
                  {letter?.salutation || `Dearest ${honoreeName},`}
                </div>

                <div className="space-y-4 text-sm font-serif leading-relaxed text-[#423425]">
                  {letter?.body ? (
                    letter.body.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
                  ) : (
                    <>
                      <p>
                        Walking through the galleries of your life reminds everyone fortunate enough
                        to know you of one simple truth: the world is infinitely warmer, funnier, and
                        more adventurous with you in it.
                      </p>
                      <p>
                        From your earliest schemes to your grandest achievements, you have navigated
                        life with rare authenticity, an infectious laugh, and the uncanny ability to
                        turn any quiet evening into a memorable chapter.
                      </p>
                      <p>
                        On your milestone 30th birthday, we built this museum not just to commemorate
                        where you have been, but to honor who you are and celebrate every magnificent
                        chapter yet to come.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-[#c5a059]/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-serif italic text-[#8c734b]">
                      {letter?.closing || 'With all our love, pride, and laughter,'}
                    </div>
                    <div className="text-sm font-serif font-bold text-[#3d2e1b] mt-0.5">
                      {letter?.author || 'Your Lifelong Fan Club & Curators'}
                    </div>
                  </div>

                  {/* Wax Seal Emblem */}
                  <div className="w-12 h-12 rounded-full bg-[#8b263e] text-[#fbf6ee] border-2 border-[#c5a059] flex items-center justify-center font-serif text-xs font-bold shadow-md">
                    MOY
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-serif uppercase tracking-widest text-[#8c734b]">
                    {wishes.length} Wishes Collected
                  </span>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="text-xs font-serif text-[#9e7631] hover:underline flex items-center gap-1"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Write your wish</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishes.map((w) => (
                    <div
                      key={w.id}
                      className="relative p-5 rounded-xl bg-white border border-[#c5a059]/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#c5a059]/15 text-sm flex items-center justify-center border border-[#c5a059]/30">
                            {w.emoji || '💖'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#3d2e1b]">{w.authorName}</div>
                            <div className="text-[10px] text-[#8c734b] font-serif">{w.relationship}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#ad9c84]">{w.createdAt}</span>
                      </div>

                      <p className="text-xs text-[#4a3b2a] font-serif leading-relaxed mt-1 italic">
                        "{w.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'new' && (
              <form onSubmit={handleSendWish} className="space-y-4">
                <div className="p-4 rounded-xl bg-[#f5eedf]/60 border border-[#c5a059]/30 mb-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#3d2e1b]">
                    <Cake className="w-4 h-4 text-[#c5a059]" />
                    <span>Sign {honoreeName}'s Birthday Wall</span>
                  </div>
                  <p className="text-[11px] text-[#7d6848] mt-1">
                    Leave a memory, an inside joke, or heartfelt birthday wishes to be preserved in the museum forever.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-[#73541f] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica or Uncle Bob"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#c5a059]/40 text-xs text-[#2c241b] focus:outline-none focus:border-[#c5a059] shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-[#73541f] mb-1">
                      Relationship
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#c5a059]/40 text-xs text-[#2c241b] focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="Best Friend">Best Friend</option>
                      <option value="Childhood Friend">Childhood Friend</option>
                      <option value="College Crew">College Crew</option>
                      <option value="Family & Relatives">Family & Relatives</option>
                      <option value="Colleague / Work Bestie">Colleague / Work Bestie</option>
                      <option value="Partner in Crime">Partner in Crime</option>
                      <option value="Secret Admirer">Secret Admirer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-[#73541f] mb-1">
                    Your Birthday Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your wishes, favorite memory, or congratulations here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#c5a059]/40 text-xs text-[#2c241b] focus:outline-none focus:border-[#c5a059] shadow-inner resize-none leading-relaxed"
                  />
                </div>

                {/* Sticker picker */}
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-[#73541f] mb-1.5">
                    Celebration Sticker
                  </label>
                  <div className="flex items-center gap-2">
                    {STICKERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedEmoji(s)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                          selectedEmoji === s
                            ? 'bg-[#c5a059]/25 border-2 border-[#c5a059] scale-110 shadow-sm'
                            : 'bg-white border border-[#c5a059]/20 hover:bg-[#c5a059]/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitted}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38a42] hover:from-[#b38a42] hover:to-[#9e7631] text-white font-serif uppercase tracking-widest text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitted ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>Wish Added to Museum Wall! 💖</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Birthday Wish to {honoreeName} 💌</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
