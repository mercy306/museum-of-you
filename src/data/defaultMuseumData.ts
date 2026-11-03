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
  ],
  arcade: {
    captionThis: [
      {
        id: 'cap-1',
        photoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        context: 'Alex attempting to cook a 5-star meal while reading instructions upside down.',
        options: [
          {
            id: 'c1-1',
            caption: 'Gordon Ramsay has left the chat, weeping.',
            funnyRating: 98,
            reaction: '🔥 Absolute Savage! The kitchen smoke alarm agrees.'
          },
          {
            id: 'c1-2',
            caption: 'The recipe called for 2 pinches of salt; I poured the whole jar.',
            funnyRating: 85,
            reaction: '🧂 Dehydration is simply part of the flavor profile.'
          },
          {
            id: 'c1-3',
            caption: 'Just according to plan. The crispy black crust adds antioxidants.',
            funnyRating: 92,
            reaction: '🧑‍🍳 Michelin inspectors are currently calling an ambulance.'
          }
        ]
      },
      {
        id: 'cap-2',
        photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
        context: 'Summer 2008: The era of heavy bangs, raccoon eyeliner, and teen angst.',
        options: [
          {
            id: 'c2-1',
            caption: 'It’s not just a phase, Mom! This is my true authentic soul!',
            funnyRating: 99,
            reaction: '🎸 My Chemical Romance is blaring from a Motorola Razr right now.'
          },
          {
            id: 'c2-2',
            caption: 'Hair so stiff with gel it could deflect direct meteorite impacts.',
            funnyRating: 94,
            reaction: '🌪️ Hurricane category 5 could not bend that fringe.'
          },
          {
            id: 'c2-3',
            caption: 'Looking down so nobody notices I’m wearing three studded belts.',
            funnyRating: 88,
            reaction: '🖤 The Hot Topic rewards card was burning a hole in your pocket.'
          }
        ]
      },
      {
        id: 'cap-3',
        photoUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
        context: '2:15 AM: Caught by the refrigerator light consuming shredded cheese like a wild raccoon.',
        options: [
          {
            id: 'c3-1',
            caption: 'If I don’t chew, the calories don’t count.',
            funnyRating: 96,
            reaction: '🧀 Sound nutritional science, backed by midnight biology.'
          },
          {
            id: 'c3-2',
            caption: 'I swear I was just checking the temperature of the milk.',
            funnyRating: 84,
            reaction: '🥛 The cheese in your teeth tells another story.'
          },
          {
            id: 'c3-3',
            caption: 'A creature of the night performing an essential culinary audit.',
            funnyRating: 97,
            reaction: '🦝 Official Title: Senior Midnight Snack Inspector.'
          }
        ]
      },
      {
        id: 'cap-4',
        photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        context: 'Belted Bohemian Rhapsody into a salt shaker at 3 AM.',
        options: [
          {
            id: 'c4-1',
            caption: 'Pitch is subjective, but passion is mandatory.',
            funnyRating: 99,
            reaction: '🎤 Freddie Mercury just smiled from the great beyond.'
          },
          {
            id: 'c4-2',
            caption: 'When they tell you last call was 20 minutes ago, sing louder.',
            funnyRating: 91,
            reaction: '🍻 The bouncer is impressed by your audacity.'
          },
          {
            id: 'c4-3',
            caption: 'Hitting notes that only canine ears can properly appreciate.',
            funnyRating: 95,
            reaction: '🐶 Every dog in a 4-mile radius is howling in harmony.'
          }
        ]
      }
    ],
    whoKnowsMeBest: [
      {
        id: 'wkm-1',
        question: 'What is Alex’s most notorious excuse for running 20 minutes late?',
        options: [
          {
            id: 'opt-1a',
            text: '“I couldn’t find my keys, which were in my hand the whole time.”',
            isCorrect: true,
            curatorFeedback: 'Spot on! Classical Alex behavior confirmed by independent observers.'
          },
          {
            id: 'opt-1b',
            text: '“I was caught in heavy interstate helicopter traffic.”',
            isCorrect: false,
            curatorFeedback: 'A great excuse, but Alex usually blames everyday objects like socks.'
          },
          {
            id: 'opt-1c',
            text: '“My alarm didn’t go off because my phone was too tired.”',
            isCorrect: false,
            curatorFeedback: 'Close second, but the key dilemma remains undisputed champion.'
          }
        ]
      },
      {
        id: 'wkm-2',
        question: 'What does Alex consider a "light, healthy snack"?',
        options: [
          {
            id: 'opt-2a',
            text: 'Celery sticks and a glass of warm spring water.',
            isCorrect: false,
            curatorFeedback: 'Never in recorded human history has Alex voluntarily chosen celery.'
          },
          {
            id: 'opt-2b',
            text: 'Half a party-size bag of spicy tortilla chips with melted cheese at midnight.',
            isCorrect: true,
            curatorFeedback: 'Bingo! Pure refined gold standard of Alex midnight nutrition.'
          },
          {
            id: 'opt-2c',
            text: 'A protein shake made of kale and crushed dreams.',
            isCorrect: false,
            curatorFeedback: 'Incorrect. If it does not contain carbs or cheese, Alex is suspicious.'
          }
        ]
      },
      {
        id: 'wkm-3',
        question: 'How many unread notifications and open browser tabs does Alex currently have?',
        options: [
          {
            id: 'opt-3a',
            text: 'Zero, inbox zero discipline at all times.',
            isCorrect: false,
            curatorFeedback: 'Hahahaha! You clearly don’t know Alex at all.'
          },
          {
            id: 'opt-3b',
            text: 'Somewhere between 47 open tabs and 1,842 unread group chat texts.',
            isCorrect: true,
            curatorFeedback: 'Exact science! Each tab represents an unfinished ambition or abandoned shopping cart.'
          },
          {
            id: 'opt-3c',
            text: 'Exactly 3 tabs: Google, Weather, and Netflix.',
            isCorrect: false,
            curatorFeedback: 'Way too organized for the Architect of Chaos.'
          }
        ]
      },
      {
        id: 'wkm-4',
        question: 'If you lose Alex in a crowded store or party, where are they guaranteed to be?',
        options: [
          {
            id: 'opt-4a',
            text: 'Befriending the host’s dog or inspecting the snack table.',
            isCorrect: true,
            curatorFeedback: '100% Guaranteed! The dog knows all of Alex’s deepest secrets by now.'
          },
          {
            id: 'opt-4b',
            text: 'Standing silently in the corner contemplating quantum mechanics.',
            isCorrect: false,
            curatorFeedback: 'Silence is not in Alex’s diagnostic manual.'
          },
          {
            id: 'opt-4c',
            text: 'Organizing the coat closet by color hierarchy.',
            isCorrect: false,
            curatorFeedback: 'Alex couldn’t color-code their own closet, let alone someone else’s!'
          }
        ]
      },
      {
        id: 'wkm-5',
        question: 'What is Alex’s absolute superpower in any group crisis?',
        options: [
          {
            id: 'opt-5a',
            text: 'Dropping a shockingly hilarious meme that instantly diffuses all tension.',
            isCorrect: true,
            curatorFeedback: 'The Nobel Peace Prize of Group Chats! That’s our Alex.'
          },
          {
            id: 'opt-5b',
            text: 'Writing a 10-page analytical spreadsheet with pivot tables.',
            isCorrect: false,
            curatorFeedback: 'Spreadsheets bring Alex out in a sympathetic rash.'
          },
          {
            id: 'opt-5c',
            text: 'Fleeing the country under an assumed alias.',
            isCorrect: false,
            curatorFeedback: 'Tempting, but comedic defusal always comes first.'
          }
        ]
      }
    ],
    hiddenMemories: [
      {
        id: 'mem-1',
        title: 'The Lost Golden Guitar Pick',
        hint: 'Tucked behind the concert grand piano in Room 1.',
        roomName: 'Room 1 · Memorable Moments',
        roomNumber: 1,
        position: [-6.5, 0.4, -4.0],
        icon: '🎸',
        revealedStory: 'Dropped during an enthusiastic rendition of "Wonderwall" in 2017. Never recovered until now.'
      },
      {
        id: 'mem-2',
        title: 'The Burnt Soufflé Whisk',
        hint: 'Resting near the modern linear fireplace in Room 1.',
        roomName: 'Room 1 · Memorable Moments',
        roomNumber: 1,
        position: [-4.2, 0.5, -4.8],
        icon: '🔥',
        revealedStory: 'The legendary survivor of the 2022 kitchen flambé disaster. The smoke alarm sends its regards.'
      },
      {
        id: 'mem-3',
        title: 'The 11th Mystery IKEA Screw',
        hint: 'Perched on the pedestal in Room 2.',
        roomName: 'Room 2 · Funny Memories',
        roomNumber: 2,
        position: [0.3, 0.95, -25.2],
        icon: '🔩',
        revealedStory: 'Where did it belong? Nobody knows. The coffee table still leans 15 degrees, but it stands proud.'
      },
      {
        id: 'mem-4',
        title: 'The Classified VHS Tape',
        hint: 'Hidden behind the red alert warning post in Room 3.',
        roomName: 'Room 3 · Embarrassing Images',
        roomNumber: 3,
        position: [6.8, 0.5, -46.0],
        icon: '📼',
        revealedStory: 'Contains 47 minutes of middle school lip-syncing and dramatic air guitar. Rated TOP SECRET.'
      },
      {
        id: 'mem-5',
        title: 'The Golden Birthday Sparkler',
        hint: 'Gleaming directly below the 3-tier birthday cake in Room 4.',
        roomName: 'Room 4 · Wishes & Celebration',
        roomNumber: 4,
        position: [0, 0.35, -73.2],
        icon: '✨',
        revealedStory: 'The ceremonial VIP sparkler reserved for the milestone birthday celebration of a lifetime.'
      }
    ],
    mysteryBoxes: [
      {
        id: 'box-1',
        title: 'The Portico Surprise Box',
        roomName: 'Room 1 · Memorable Moments',
        roomNumber: 1,
        position: [-5.5, 0, 0.5],
        boxColor: '#c53030',
        ribbonColor: '#f6e05e',
        reward: {
          type: 'badge',
          title: '🏅 Certified Architect of Chaos Badge',
          message: 'Official Accreditation: Awarded for navigating 30 years of questionable life choices with 100% confidence.'
        }
      },
      {
        id: 'box-2',
        title: 'The Comedy Relic Box',
        roomName: 'Room 2 · Funny Memories',
        roomNumber: 2,
        position: [6.0, 0, -22.0],
        boxColor: '#d69e2e',
        ribbonColor: '#1a202c',
        reward: {
          type: 'gag',
          title: '📜 Lifetime 3:00 AM Snack Immunity Voucher',
          message: 'This voucher entitles Alex to raid any refrigerator worldwide at 3:00 AM without parental, spousal, or societal judgment.'
        }
      },
      {
        id: 'box-3',
        title: 'The Classified Vault Crate',
        roomName: 'Room 3 · Embarrassing Images',
        roomNumber: 3,
        position: [-6.2, 0, -45.0],
        boxColor: '#1a1a1a',
        ribbonColor: '#e53e3e',
        reward: {
          type: 'photo',
          title: '🕵️ Classified Declassification Order #007',
          message: 'The Presidential Archival Board has reviewed your childhood haircuts and declared: "Honestly, you pulled it off better than expected."'
        }
      },
      {
        id: 'box-4',
        title: 'The Grand Celebration Gift',
        roomName: 'Room 4 · Wishes & Celebration',
        roomNumber: 4,
        position: [6.5, 0, -78.0],
        boxColor: '#ed64a6',
        ribbonColor: '#ecc94b',
        reward: {
          type: 'song',
          title: '👑 Royal Birthday Fanfare & Endless Wishes',
          message: 'May your next 30 years be filled with uncontrollable laughter, loyal friends, wild adventures, and zero hangovers!'
        }
      }
    ]
  }
};
