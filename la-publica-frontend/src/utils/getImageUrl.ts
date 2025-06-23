const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL;

export const getImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return PUBLIC_BASE_URL.replace(/\/$/, '') + url;
}; 