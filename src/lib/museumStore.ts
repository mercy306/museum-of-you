import { MuseumConfig } from '@/types/museum';
import { defaultMuseumData } from '@/data/defaultMuseumData';

const STORAGE_KEY = 'museum_of_you_config';

export function getMuseumConfig(): MuseumConfig {
  if (typeof window === 'undefined') {
    return defaultMuseumData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMuseumData;
    const parsed = JSON.parse(raw);
    if (!parsed?.profile?.name) return defaultMuseumData;
    // Sanitize any dead Google sample video URLs from previous local sessions
    if (parsed.galleries && Array.isArray(parsed.galleries)) {
      parsed.galleries = parsed.galleries.map((gallery: any) => ({
        ...gallery,
        exhibits: (gallery.exhibits || []).map((ex: any) => {
          if (
            ex.videoUrl &&
            (ex.videoUrl.includes('commondatastorage.googleapis.com') ||
              ex.videoUrl.includes('gtv-videos-bucket'))
          ) {
            ex.videoUrl = '/videos/sample.mp4';
          }
          if (ex.imageUrl && ex.imageUrl.includes('w=1200&q=80')) {
            ex.imageUrl = ex.imageUrl.replace('w=1200&q=80', 'w=2400&q=95');
          }
          return ex;
        })
      }));
    }

    return {
      ...defaultMuseumData,
      ...parsed,
      arcade: parsed.arcade || defaultMuseumData.arcade
    };
  } catch (error) {
    console.warn('Failed to parse stored museum config, using default data:', error);
    return defaultMuseumData;
  }
}

export function saveMuseumConfig(config: MuseumConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save museum config to localStorage:', error);
  }
}

export function resetMuseumConfig(): MuseumConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultMuseumData;
}
