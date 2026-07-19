/**
 * Deterministic color-chip helpers for the small circular product/category
 * icons (catalog table, low-stock table). Same name always maps to the
 * same color, so a product reads consistently across screens without
 * needing a color field in the data model.
 */

const PALETTE_SIZE = 6; // keep in sync with .chip--0..5 in styles.scss

/** Returns 'chip--0' .. 'chip--5' based on a hash of the seed string. */
export function avatarColorClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE_SIZE;
  return `chip--${idx}`;
}

/** First letter of the name, uppercased, for display inside the chip. */
export function avatarInitial(name: string | undefined | null): string {
  const trimmed = (name ?? '').trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}
