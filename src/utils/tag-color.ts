export type TagBadgeColor = {
  background: string;
  color: string;
};

const PALETTE: TagBadgeColor[] = [
  { background: '#e7c4a4', color: '#5a3318' },
  { background: '#cfd9b8', color: '#2f4324' },
  { background: '#d7c6de', color: '#4a2f58' },
  { background: '#f0c9b8', color: '#7a2f22' },
  { background: '#c5d6e4', color: '#243f58' },
  { background: '#e8d48a', color: '#5c4708' },
  { background: '#d4c4a8', color: '#3d3426' },
  { background: '#e2b8c4', color: '#6b2438' },
];

export function tagBadgeColor(seed: string): TagBadgeColor {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}
