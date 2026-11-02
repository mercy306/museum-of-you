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
    return parsed?.profile?.name ? parsed : defaultMuseumData;
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
