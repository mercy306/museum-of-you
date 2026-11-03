import { MuseumConfig } from '@/types/museum';

export const defaultMuseumData: MuseumConfig = {
  id: 'museum-default-01',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  profile: {
    name: 'Alex Morgan',
    nickname: 'The Architect of Chaos',
    birthday: 'November 15, 1996',
    age: 30,
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    welcomeMessage:
      'Welcome to the Museum of You. A curated 4-room architectural journey through extraordinary milestones, hilarious memories, classified embarrassing artifacts, and a grand birthday celebration.',
    entranceSubtitle: 'A 4-Room Step-by-Step Interactive Experience · 1996 to Present',
    arrival: {
      admissionNumber: 'MOY-VIP-2026-8849',
      celebrationTitle: 'The Official 30th Birthday Retrospective',
      receptionistName: 'Sebastian Sterling',
      receptionistTitle: 'Chief Protocol Officer & Royal Curator',
      dialogue: [
        'Ladies and gentlemen, welcome to the Museum of You.',
        'Today we take you on a step-by-step journey across 4 distinct exhibition rooms.',
        'Begin in Room 1: Memorable Moments, unlock the doors to Funny Memories and Embarrassing Images, and conclude in the Grand Celebration & Wishes Hall!'
      ],
      spokenGreeting:
        'Welcome to the Museum of You. Please open each door to progress through four rooms of unforgettable memories, hilarious fails, and grand celebrations.'
    },
    finalBirthdayLetter: {
      salutation: 'Dearest Alex,',
      body: [
        'Walking through the galleries of your life reminds everyone fortunate enough to know you of one simple truth: the world is infinitely warmer, funnier, and more adventurous with you in it.',
        'From your earliest schemes to your grandest achievements, you have navigated life with rare authenticity, an infectious laugh, and the uncanny ability to turn any quiet evening into a memorable chapter.',
        'On your milestone birthday, we built this museum not just to commemorate where you have been, but to honor who you are and celebrate every magnificent chapter yet to come.'
      ],
      closing: 'With all our love, pride, and laughter,',
      author: 'Your Lifelong Fan Club & Curators'
    }
  },
  settings: {
    enableSoundtrack: true,
    enableGuidedTour: true,
    ambientLightingIntensity: 1.15
  },
  galleries: [
    {
      id: 'gallery-memories',
      order: 1,
      title: 'Memorable Moments',
      roomName: 'Room 1 · Memorable Moments',
      theme: 'Milestones, Triumphs & Cherished Adventures',
      curatorStatement:
        'A collection of unforgettable milestones, breathtaking journeys, and proud triumphs that defined the journey so far.',
      wallColor: '#201F1D',
      lightingTone: '#F3E5AB',
      exhibits: [
        {
          id: 'ex-mem-1',
          galleryId: 'gallery-memories',
          title: 'The Great Pacific Highway Odyssey',
          subtitle: 'High-Spirited Roadtrip',
          date: 'Summer 2021',
          imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          mediaType: 'video',
          story: 'Windows rolled all the way down, ocean breeze, and a 12-hour collaborative playlist that brought everyone to tears of laughter.',
          curatorNote: 'Captured on video: pure unfiltered wanderlust and the undeniable proof that spontaneous road trips are the best therapy.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-mem-2',
          galleryId: 'gallery-memories',
          title: 'Summit of Mount Rainier',
          subtitle: 'The Sunrise Climb',
          date: 'September 2022',
          imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Woke up at 3:00 AM, climbed 4,000 feet in freezing fog, and broke into tears when the sun lit the clouds in gold.',
          curatorNote: 'The definitive proof that this person can conquer any mountain when promised coffee and breakfast tacos at the top.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-mem-3',
          galleryId: 'gallery-memories',
          title: 'The Cap & Gown Triumph',
          subtitle: 'Graduation Day',
          date: 'June 2019',
          imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Surviving four rigorous years fueled purely by espresso, adrenaline, and 3:00 AM study group debates.',
          curatorNote: 'The thesis committee was stunned. The parents wept. The degree was officially awarded with distinction.',
          aspectRatio: 'portrait'
        },
        {
          id: 'ex-mem-4',
          galleryId: 'gallery-memories',
          title: 'Sunset on the Aegean Coast',
          subtitle: 'Golden Hour in Santorini',
          date: 'October 2023',
          imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Leaning over whitewashed cliffside balconies watching the Mediterranean sky turn from apricot to deep violet.',
          curatorNote: 'Rated 10/10 by the archival board for absolute serenity and cinematic perfection.',
          aspectRatio: 'portrait'
        }
      ]
    },
    {
      id: 'gallery-funny',
      order: 2,
      title: 'Funny Memories',
      roomName: 'Room 2 · Funny Memories',
      theme: 'Comedic Masterpieces, Fails & Laughs',
      curatorStatement:
        'Life is too short to take seriously. Step inside Room 2 for the funniest, wildest, and most laugh-out-loud moments ever caught on camera.',
      wallColor: '#1A1817',
      lightingTone: '#DFB76C',
      exhibits: [
        {
          id: 'ex-fun-1',
          galleryId: 'gallery-funny',
          title: 'The Great Kitchen Flambé Disaster',
          subtitle: 'Chef In Training',
          date: 'November 2022',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          mediaType: 'video',
          story: 'Attempted a dramatic French chef skillet toss after watching one 30-second reel. Ended with onions on the ceiling fan.',
          curatorNote: 'The smoke detector gave the performance a standing ovation. We ordered pizza 12 minutes later.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-fun-2',
          galleryId: 'gallery-funny',
          title: 'The 9-Hour IKEA "Coffee Table"',
          subtitle: 'Assembly Catastrophe',
          date: 'March 2021',
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Proudly threw away the instruction booklet declaring "It is just 4 legs and a plank, how hard can it be?".',
          curatorNote: 'Historical outcome: The table possessed a 15-degree tilt and 11 mysterious leftover wooden dowels.',
          aspectRatio: 'square'
        },
        {
          id: 'ex-fun-3',
          galleryId: 'gallery-funny',
          title: 'The Unsanctioned Living Room Fort',
          subtitle: 'Citadel of Cushions',
          date: 'Winter 2020',
          imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Engineered an impenetrable blanket citadel consuming every throw pillow in the house during a snowstorm.',
          curatorNote: 'Security protocol: No entry permitted without presenting fresh chocolate chip cookies.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-fun-4',
          galleryId: 'gallery-funny',
          title: 'The 3:00 AM Karaoke Solo',
          subtitle: 'Bohemian Rhapsody Live',
          date: 'New Year 2023',
          imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          mediaType: 'video',
          story: 'Delivered an operatic falsetto so passionately off-key that even the bartender stopped washing glasses to applaud.',
          curatorNote: 'A tour de force of vocal enthusiasm over pitch precision. A legendary cultural moment.',
          aspectRatio: 'portrait'
        }
      ]
    },
    {
      id: 'gallery-embarrassing',
      order: 3,
      title: 'Embarrassing Images',
      roomName: 'Room 3 · Embarrassing Images',
      theme: 'Classified Artifacts, Awkward Phases & Cringe History',
      curatorStatement:
        'WARNING: Entering the Classified Archival Vault. The board voted 5-to-1 to preserve these cringe artifacts for educational amusement.',
      wallColor: '#121110',
      lightingTone: '#C5A059',
      exhibits: [
        {
          id: 'ex-emb-1',
          galleryId: 'gallery-embarrassing',
          title: 'The 2008 Scene Haircut Tragedy',
          subtitle: 'Crimes Against Barbering',
          date: 'August 2008',
          imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          classifiedLevel: 'Top Secret',
          story: 'Subject firmly believed this asymmetric razor-cut side fringe was peak runway fashion. The family album mourns.',
          curatorNote: 'Requires Level 4 Security Clearance. An estimated 1.5 bottles of hair gel were sacrificed daily.',
          aspectRatio: 'portrait'
        },
        {
          id: 'ex-emb-2',
          galleryId: 'gallery-embarrassing',
          title: 'The Backyard Slip-N-Slide Faceplant',
          subtitle: 'Epic Fail Caught on 4K',
          date: 'July 2018',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          mediaType: 'video',
          classifiedLevel: 'Top Secret',
          story: 'A confident 20-meter sprint followed by an immediate aquatic physics miscalculation and graceful yard slide.',
          curatorNote: 'The judges awarded 10/10 for dramatic height, and 2/10 for hydrodynamic execution.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-emb-3',
          galleryId: 'gallery-embarrassing',
          title: 'The 2:15 AM Refrigerator Raid',
          subtitle: 'Caught in the Cold Glow',
          date: 'October 2021',
          imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          classifiedLevel: 'Confidential',
          story: 'Pictured eating shredded cheese straight from the bag while wearing dinosaur flannel pajamas.',
          curatorNote: 'Eyes wide like a nocturnal raccoon startled by human contact. A pristine specimen of domestic snacking.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-emb-4',
          galleryId: 'gallery-embarrassing',
          title: 'The Middle School Yearbook Pose',
          subtitle: 'Peak Awkwardness',
          date: 'Fall 2010',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          classifiedLevel: 'Declassified',
          story: 'Braces, oversized collared shirt, and a forced thumbs-up against a digital neon laser backdrop.',
          curatorNote: 'Declassified by popular demand. We love you anyway.',
          aspectRatio: 'portrait'
        }
      ]
    },
    {
      id: 'gallery-celebration',
      order: 4,
      title: 'Wishes & Celebration',
      roomName: 'Room 4 · Wishes & Grand Celebration',
      theme: 'Birthday Cake, Friends Wishes & Fireworks',
      curatorStatement:
        'The climax of the museum experience! Walk forward into the grand celebration hall, blow out the birthday candles, and read wishes from the people who love you.',
      wallColor: '#101012',
      lightingTone: '#FDE08B',
      exhibits: [
        {
          id: 'ex-cel-1',
          galleryId: 'gallery-celebration',
          title: 'The Milestone Birthday Portrait',
          subtitle: 'The Guest of Honor',
          date: 'Present Day',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Surrounded by the warmth of friends, incredible memories, and countless adventures still waiting to unfold.',
          curatorNote: 'Permanent Collection · Unconditional Gift from Everyone Who Loves You.',
          aspectRatio: 'portrait'
        },
        {
          id: 'ex-cel-2',
          galleryId: 'gallery-celebration',
          title: 'The Grand Champagne Toast',
          subtitle: 'A Toast to the Next 30 Years',
          date: 'Tonight',
          imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
          story: 'Raising glasses of chilled vintage champagne to the irreplaceable human who brings laughter to every room they enter.',
          curatorNote: 'To good health, ridiculous ambitions, and unforgettable evenings.',
          aspectRatio: 'landscape'
        }
      ]
    }
  ]
};
