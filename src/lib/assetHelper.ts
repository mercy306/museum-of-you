/**
 * Resolves static asset paths accounting for GitHub Pages basePath in production
 */
export function getAssetPath(url?: string): string {
  if (!url) return '';

  // Intercept obsolete Google GTV sample bucket URLs that return 403 Forbidden
  if (url.includes('commondatastorage.googleapis.com') || url.includes('gtv-videos-bucket')) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = isProd ? '/museum-of-you' : '';
    return `${base}/videos/sample.mp4`;
  }

  // If already absolute or data/blob URI, return directly
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const base = isProd ? '/museum-of-you' : '';
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${base}${clean}`;
}
