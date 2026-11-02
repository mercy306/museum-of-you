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
      'Welcome to the Museum of You. A carefully curated collection of extraordinary memories, questionable decisions, unforgettable moments, and one truly irreplaceable human being.',
    entranceSubtitle: 'An Exclusive Retrospective Exhibition · 1996 to Present',
    arrival: {
      admissionNumber: 'MOY-VIP-2026-8849',
      celebrationTitle: 'The Official 30th Birthday Retrospective',
      receptionistName: 'Sebastian Sterling',
      receptionistTitle: 'Chief Protocol Officer & Royal Curator',
      dialogue: [
        'Ladies and gentlemen, welcome to the Museum of You.',
        'Today we celebrate an extraordinary individual whose achievements are questionable, whose memories are unforgettable, and whose existence deserves its own museum.',
        'Please present your VIP Admission Pass, collect your champagne glass, and prepare for an expedition through 30 magnificent years of triumph and chaos.'
      ],
      spokenGreeting:
        'Ladies and gentlemen, welcome to the Museum of You. Today we celebrate an extraordinary individual whose achievements are questionable, whose memories are unforgettable, and whose existence deserves its own museum.'
    },
    finalBirthdayLetter: {
      salutation: 'Dearest Alex,',
      body: [
        'Walking through the galleries of your life reminds everyone fortunate enough to know you of one simple truth: the world is infinitely warmer, funnier, and more adventurous with you in it.',
        'From your earliest schemes to your grandest achievements, you have navigated life with rare authenticity, an infectious laugh, and the uncanny ability to turn any quiet evening into a memorable chapter.',
        'On your milestone 30th birthday, we built this museum not just to commemorate where you have been, but to honor who you are and celebrate every magnificent chapter yet to come.'
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
      id: 'gallery-01',
      order: 1,
      title: 'The Origin Story',
      roomName: 'Gallery I',
      theme: 'Childhood & Formative Years',
      curatorStatement:
        'Before becoming a legend, this individual was just a small human with questionable plans, fierce determination, and zero interest in afternoon naps.',
      wallColor: '#201F1D',
      lightingTone: '#F3E5AB',
      exhibits: [
        {
          id: 'ex-01-1',
          galleryId: 'gallery-01',
          title: 'The Mastermind in Diapers',
          date: 'circa 1998',
          imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
          story: 'Subject pictured moments before attempting to trade a plastic shovel for a real automobile.',
          curatorNote: 'Historical records indicate early signs of unstoppable ambition and complete disregard for parental guidelines.',
          aspectRatio: 'portrait'
        },
        {
          id: 'ex-01-2',
          galleryId: 'gallery-01',
          title: 'First Day of School, Maximum Dread',
          date: 'September 2002',
          imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80',
          story: 'Arrived with high expectations for playground politics; severely disappointed by mandatory quiet time.',
          curatorNote: 'Acquired first diplomatic experience negotiating snacks at the cafeteria.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-01-3',
          galleryId: 'gallery-01',
          title: 'The Unsanctioned Living Room Fort',
          date: 'Winter 2005',
          imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
          story: 'Engineered an impenetrable citadel out of all sofa cushions, kitchen chairs, and grandmother’s fine linens.',
          curatorNote: 'Refused entry to siblings unless they possessed a valid secret password.',
          aspectRatio: 'square'
        }
      ],
      guessYearGame: {
        title: 'Chronology Challenge: Guess The Year',
        description: 'Examine vintage photographic evidence and test your memory of this small human specimen.',
        questions: [
          {
            id: 'gy-01',
            photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80',
            caption: 'Subject sporting oversized neon sunglasses and holding an unplugged rotary phone like a Fortune 500 CEO.',
            correctYear: 1999,
            options: [1997, 1999, 2001, 2004],
            explanation: 'Look at this tiny human! Summer 1999. Nobody could have predicted what was coming, but the corporate swagger was already legendary.'
          },
          {
            id: 'gy-02',
            photoUrl: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80',
            caption: 'The First Solo Bicycle Expedition, seconds before steering straight into the neighbor’s prized flowerbed.',
            correctYear: 2004,
            options: [2001, 2004, 2006, 2009],
            explanation: 'Spring 2004! The training wheels came off at 2:00 PM; the municipal garden was destroyed by 2:04 PM.'
          }
        ]
      }
    },
    {
      id: 'gallery-02',
      order: 2,
      title: 'The Hall of Embarrassment',
      roomName: 'Gallery II',
      theme: 'Questionable Decisions & Unfiltered History',
      curatorStatement:
        'Some evidence should have remained permanently deleted. The museum archival board, after heated debate, voted to preserve it in high definition.',
      wallColor: '#1A1817',
      lightingTone: '#DFB76C',
      exhibits: [
        {
          id: 'ex-02-1',
          galleryId: 'gallery-02',
          title: 'The Hairstyle Incident',
          date: 'Summer 2011',
          imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
          story: 'Subject firmly believed this haircut was high fashion. The mirrors of the era respectfully disagreed.',
          curatorNote: 'Curators have classified this artifact under "Crimes Against Barbering".',
          aspectRatio: 'portrait',
          classifiedLevel: 'Top Secret'
        },
        {
          id: 'ex-02-2',
          galleryId: 'gallery-02',
          title: 'The "GPS Was Wrong" Expedition',
          date: 'Spring Break 2017',
          imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          story: 'Claimed a 45-minute shortcut that miraculously extended the journey into a 6-hour scenic crisis.',
          curatorNote: 'Maintained unwavering confidence throughout every wrong turn.',
          aspectRatio: 'landscape',
          classifiedLevel: 'Confidential'
        },
        {
          id: 'ex-02-3',
          galleryId: 'gallery-02',
          title: 'The DIY Kitchen Catastrophe',
          date: 'October 2021',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
          story: 'Attempted a complex 7-layer soufflé after watching a 30-second TikTok tutorial.',
          curatorNote: 'The smoke alarm served as an appreciative oven timer.',
          aspectRatio: 'square',
          classifiedLevel: 'Declassified'
        }
      ],
      whoSaidThatGame: {
        title: 'Evidence Tribunal: Who Said That?',
        description: 'Read the incriminating quote and identify the true culprit behind these unforgettable words.',
        questions: [
          {
            id: 'wst-01',
            quote: 'I don’t need a map. I have an innate directional compass in my soul.',
            dateOrSetting: '1:30 AM, dead-end gravel quarry 40 miles off-route.',
            options: [
              {
                id: 'opt-1',
                name: 'Alex Morgan',
                isCorrect: true,
                feedback: 'Correct! Unfortunately, the evidence is undeniable. The GPS wept silently that night.'
              },
              {
                id: 'opt-2',
                name: 'Christopher Columbus',
                isCorrect: false,
                feedback: 'Incorrect. Columbus got lost across continents, but he didn’t have Google Maps in his pocket.'
              },
              {
                id: 'opt-3',
                name: 'A Disgruntled Uber Driver',
                isCorrect: false,
                feedback: 'Incorrect. Even a rideshare driver would have performed a U-turn 25 miles earlier.'
              },
              {
                id: 'opt-4',
                name: 'A Golden Retriever',
                isCorrect: false,
                feedback: 'Incorrect. A dog would have sniffed the highway 3 miles back.'
              }
            ],
            explanation: 'Alex insisted the gravel quarry was a "scenic bypass". All passengers required emotional compensation snacks.'
          },
          {
            id: 'wst-02',
            quote: 'I am only having one drink and being in bed by 10:00 PM sharp.',
            dateOrSetting: 'Friday evening group chat, 6:45 PM.',
            options: [
              {
                id: 'opt-5',
                name: 'Alex Morgan',
                isCorrect: true,
                feedback: 'Correct! Followed by 3:00 AM diner pancakes and an impromptu dissertation on 90s pop music.'
              },
              {
                id: 'opt-6',
                name: 'A Tibetan Monk',
                isCorrect: false,
                feedback: 'Incorrect. A monk possesses discipline that Alex has never once considered.'
              },
              {
                id: 'opt-7',
                name: 'An AI Language Model',
                isCorrect: false,
                feedback: 'Incorrect. An AI shuts down at scheduled maintenance. Alex does not.'
              }
            ],
            explanation: 'Known internationally as "The Greatest Lie in Social History". The 10:00 PM curfew was broken 47 times in a single year.'
          }
        ]
      }
    },
    {
      id: 'gallery-03',
      order: 3,
      title: 'The Hall of Fame',
      roomName: 'Gallery III',
      theme: 'Triumphs, Talents & Accidental Brilliance',
      curatorStatement:
        'An extremely rare specimen of human excellence. Occasionally unavailable due to laziness, but unstoppable when motivated.',
      wallColor: '#191C1E',
      lightingTone: '#FDE08B',
      exhibits: [
        {
          id: 'ex-03-1',
          galleryId: 'gallery-03',
          title: 'The Magna Cum Loudly',
          date: 'June 2019',
          imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          story: 'Graduation day. Finished all requirements with minimal panic, maximum espresso intake, and legendary thesis defense.',
          curatorNote: 'Proof that pulling off miracles at 3:00 AM is indeed an accredited discipline.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-03-2',
          galleryId: 'gallery-03',
          title: 'The Unofficial Karaoke Laureate',
          date: 'December 2022',
          imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
          story: 'Delivered a rendition of Bohemian Rhapsody so passionately off-key that the venue staff paused to applaud the bravery.',
          curatorNote: 'Pitched perfectly between musical theater and sheer comedic genius.',
          aspectRatio: 'portrait'
        }
      ]
    },
    {
      id: 'gallery-04',
      order: 4,
      title: 'The Personality Laboratory',
      roomName: 'Gallery IV',
      theme: 'Habits, Quirks & Scientific Inconsistencies',
      curatorStatement:
        'Research conclusion: This person is difficult to explain scientifically. Key drivers include iced matcha, spontaneous dance breaks, and 47 unclosed browser tabs.',
      wallColor: '#1B1918',
      lightingTone: '#EAC585',
      exhibits: [
        {
          id: 'ex-04-1',
          galleryId: 'gallery-04',
          title: 'Specimen: "I Will Be Ready in 5 Minutes"',
          date: 'Ongoing Phenomenon',
          imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
          story: 'A standard temporal paradox where 5 earthly minutes equal approximately 42 minutes in subject time.',
          curatorNote: 'Theoretical physicists around the globe continue to study this localized time distortion.',
          aspectRatio: 'portrait'
        },
        {
          id: 'ex-04-2',
          galleryId: 'gallery-04',
          title: 'Culinary Masterpiece: Midnight Cheese Board',
          date: 'Nightly Exhibit',
          imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
          story: 'Expertly assembled snacks consumed under the golden hum of the open refrigerator door.',
          curatorNote: 'A three-star Michelin experience created strictly in pajamas.',
          aspectRatio: 'landscape'
        }
      ]
    },
    {
      id: 'gallery-05',
      order: 5,
      title: 'The Future Wing',
      roomName: 'Gallery V',
      theme: 'Dreams, Speculations & Grand Horizons',
      curatorStatement:
        'Predicted future: Rich, deeply content, universally beloved, and still asking close friends what to order for dinner.',
      wallColor: '#16191B',
      lightingTone: '#E1C48C',
      exhibits: [
        {
          id: 'ex-05-1',
          galleryId: 'gallery-05',
          title: 'The Mediterranean Villa Blueprint',
          date: 'Forecast 2030',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          story: 'Subject holding court on a sun-drenched terrace with an army of rescue dogs and endless pastries.',
          curatorNote: 'Guest suites have already been booked indefinitely for the founding curators.',
          aspectRatio: 'landscape'
        },
        {
          id: 'ex-05-2',
          galleryId: 'gallery-05',
          title: 'Nobel Peace Prize in Group Chat Harmony',
          date: 'Forecast 2035',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
          story: 'Honored internationally for defusing tense debates through perfectly timed reaction memes.',
          curatorNote: 'A humanitarian contribution of unprecedented digital scale.',
          aspectRatio: 'portrait'
        }
      ]
    },
    {
      id: 'gallery-06',
      order: 6,
      title: 'The Final Masterpiece',
      roomName: 'Gallery VI (The Rotunda)',
      theme: 'The Birthday Celebration & Living Tribute',
      curatorStatement:
        'Some people are not replaceable. This is one of them. The cornerstone of the museum and the heart of this celebration.',
      wallColor: '#121214',
      lightingTone: '#F8DC96',
      exhibits: [
        {
          id: 'ex-06-1',
          galleryId: 'gallery-06',
          title: 'The Milestone Portrait',
          date: 'Present Day',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          story: 'Surrounded by the memories of thirty incredible years and standing at the precipice of an even greater future.',
          curatorNote: 'Permanent Collection · Unconditional Gift from Everyone Who Loves You.',
          aspectRatio: 'portrait'
        }
      ]
    }
  ]
};
