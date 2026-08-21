export function getApiOrigin(): string {
  const origin = import.meta.env.VITE_API_BASE_URL;
  if (typeof origin !== 'string' || origin.length === 0) {
    return '';
  }

  return origin.replace(/\/$/, '');
}
