import { MuseumConfig } from '@/types/museum';
import { defaultMuseumData } from '@/data/defaultMuseumData';

/**
 * Compact representation of user customized museum data for sharing via URL
 */
interface CompactGiftData {
  n: string; // name
  b?: string; // birthday
  a?: number; // age
  k?: string; // nickname
  w?: string; // welcomeMessage
  l?: { // letter
    s?: string;
    b?: string[];
    c?: string;
    a?: string;
  };
  g?: Array<{
    id: string;
    ex: Array<{
      id: string;
      t: string; // title
      s?: string; // subtitle
      d?: string; // date
      u?: string; // imageUrl
      v?: string; // videoUrl
      m?: 'image' | 'video';
      st?: string; // story
      cn?: string; // curatorNote
    }>;
  }>;
}

// Convert ArrayBuffer or Uint8Array to URL-safe base64 string
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert URL-safe base64 string back to Uint8Array
function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses museum config into a URL-safe compact string for sharing
 */
export async function encodeGiftConfig(config: MuseumConfig): Promise<string> {
  const compact: CompactGiftData = {
    n: config.profile.name,
    b: config.profile.birthday,
    a: config.profile.age,
    k: config.profile.nickname,
    w: config.profile.welcomeMessage,
    l: config.profile.finalBirthdayLetter
      ? {
          s: config.profile.finalBirthdayLetter.salutation,
          b: config.profile.finalBirthdayLetter.body,
          c: config.profile.finalBirthdayLetter.closing,
          a: config.profile.finalBirthdayLetter.author
        }
      : undefined,
    g: config.galleries.map((gal) => ({
      id: gal.id,
      ex: gal.exhibits.map((ex) => ({
        id: ex.id,
        t: ex.title,
        s: ex.subtitle,
        d: ex.date,
        u: ex.imageUrl,
        v: ex.videoUrl,
        m: ex.mediaType,
        st: ex.story,
        cn: ex.curatorNote
      }))
    }))
  };

  const json = JSON.stringify(compact);

  // Compress using native browser CompressionStream if available
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new CompressionStream('deflate-raw');
      const writer = stream.writable.getWriter();
      writer.write(new TextEncoder().encode(json));
      writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      return 'z_' + bufferToBase64Url(compressedBuffer);
    } catch {
      // Fallback to plain base64url if compression fails
    }
  }

  return 'b_' + bufferToBase64Url(new TextEncoder().encode(json));
}

/**
 * Decodes compressed gift string from URL into full MuseumConfig
 */
export async function decodeGiftConfig(encoded: string): Promise<MuseumConfig | null> {
  if (!encoded) return null;

  try {
    let jsonStr = '';

    if (encoded.startsWith('z_')) {
      // Decompress
      const rawBytes = base64UrlToBuffer(encoded.slice(2));
      if (typeof DecompressionStream !== 'undefined') {
        const stream = new DecompressionStream('deflate-raw');
        const writer = stream.writable.getWriter();
        writer.write(rawBytes as unknown as BufferSource);
        writer.close();
        const decompressed = await new Response(stream.readable).text();
        jsonStr = decompressed;
      } else {
        return null;
      }
    } else if (encoded.startsWith('b_')) {
      const rawBytes = base64UrlToBuffer(encoded.slice(2));
      jsonStr = new TextDecoder().decode(rawBytes);
    } else {
      // Direct base64url fallback
      const rawBytes = base64UrlToBuffer(encoded);
      jsonStr = new TextDecoder().decode(rawBytes);
    }

    const compact: CompactGiftData = JSON.parse(jsonStr);
    if (!compact?.n) return null;

    // Merge onto default museum structure so all room positions and 3D architectural data are retained
    const mergedConfig: MuseumConfig = {
      ...defaultMuseumData,
      profile: {
        ...defaultMuseumData.profile,
        name: compact.n || defaultMuseumData.profile.name,
        birthday: compact.b || defaultMuseumData.profile.birthday,
        age: compact.a ?? defaultMuseumData.profile.age,
        nickname: compact.k || defaultMuseumData.profile.nickname,
        welcomeMessage: compact.w || defaultMuseumData.profile.welcomeMessage,
        finalBirthdayLetter: compact.l
          ? {
              salutation: compact.l.s || defaultMuseumData.profile.finalBirthdayLetter?.salutation || '',
              body: compact.l.b || defaultMuseumData.profile.finalBirthdayLetter?.body || [],
              closing: compact.l.c || defaultMuseumData.profile.finalBirthdayLetter?.closing || '',
              author: compact.l.a || defaultMuseumData.profile.finalBirthdayLetter?.author || ''
            }
          : defaultMuseumData.profile.finalBirthdayLetter
      },
      galleries: defaultMuseumData.galleries.map((defaultGal) => {
        const customGal = compact.g?.find((g) => g.id === defaultGal.id);
        if (!customGal) return defaultGal;

        return {
          ...defaultGal,
          exhibits: defaultGal.exhibits.map((defaultEx) => {
            const customEx = customGal.ex.find((e) => e.id === defaultEx.id);
            if (!customEx) return defaultEx;

            return {
              ...defaultEx,
              title: customEx.t || defaultEx.title,
              subtitle: customEx.s !== undefined ? customEx.s : defaultEx.subtitle,
              date: customEx.d !== undefined ? customEx.d : defaultEx.date,
              imageUrl: customEx.u || defaultEx.imageUrl,
              videoUrl: customEx.v !== undefined ? customEx.v : defaultEx.videoUrl,
              mediaType: customEx.m || defaultEx.mediaType,
              story: customEx.st !== undefined ? customEx.st : defaultEx.story,
              curatorNote: customEx.cn !== undefined ? customEx.cn : defaultEx.curatorNote
            };
          })
        };
      })
    };

    return mergedConfig;
  } catch (err) {
    console.warn('Failed to decode gift URL:', err);
    return null;
  }
}
