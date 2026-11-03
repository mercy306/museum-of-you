export interface Exhibit {
  id: string;
  galleryId: string;
  title: string;
  subtitle?: string;
  date?: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  story: string;
  curatorNote: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  isSecret?: boolean;
  isUnlocked?: boolean;
  classifiedLevel?: 'Top Secret' | 'Confidential' | 'Declassified';
}

export interface GuessYearQuestion {
  id: string;
  photoUrl: string;
  caption: string;
  correctYear: number;
  options: number[];
  explanation: string;
}

export interface QuoteOption {
  id: string;
  name: string;
  isCorrect: boolean;
  feedback: string;
}

export interface WhoSaidThatQuestion {
  id: string;
  quote: string;
  dateOrSetting?: string;
  options: QuoteOption[];
  explanation: string;
}

export interface Gallery {
  id: string;
  order: number;
  title: string;
  roomName: string;
  theme: string;
  curatorStatement: string;
  wallColor?: string;
  lightingTone?: string;
  exhibits: Exhibit[];
  guessYearGame?: {
    title: string;
    description: string;
    questions: GuessYearQuestion[];
  };
  whoSaidThatGame?: {
    title: string;
    description: string;
    questions: WhoSaidThatQuestion[];
  };
}

export interface ArrivalConfig {
  admissionNumber: string;
  celebrationTitle: string;
  receptionistName: string;
  receptionistTitle: string;
  dialogue: string[];
  spokenGreeting?: string;
}

export interface PersonProfile {
  name: string;
  nickname?: string;
  birthday: string; // e.g. "November 15, 1996"
  age?: number;
  profilePhoto: string;
  welcomeMessage: string;
  entranceSubtitle: string;
  arrival?: ArrivalConfig;
  finalBirthdayLetter: {
    salutation: string;
    body: string[];
    closing: string;
    author: string;
  };
}

export interface FriendWish {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  emoji?: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface MuseumConfig {
  id: string;
  createdAt: string;
  updatedAt: string;
  profile: PersonProfile;
  galleries: Gallery[];
  settings: {
    enableSoundtrack: boolean;
    enableGuidedTour: boolean;
    ambientLightingIntensity: number;
  };
}

export interface VisitorState {
  hasEntered: boolean;
  receptionistGreeted: boolean;
  currentGalleryId: string | null;
  visitedGalleryIds: string[];
  activeExhibit: Exhibit | null;
  isMapOpen: boolean;
  isSettingsOpen: boolean;
  isGuidedTourActive: boolean;
  audioPlaying: boolean;
  audioVolume: number;
  unlockedSecretCount: number;
  completedGameIds: string[];
  gameScores: Record<string, number>;
  collectedAwards: string[];
}
