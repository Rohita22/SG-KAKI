import type { CSSProperties } from 'react';

interface GlyphProps {
  className?: string;
  style?: CSSProperties;
}

/** Simplified Merlion silhouette — decorative flavor, not a literal illustration. */
export function MerlionGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 4c3 0 5 2 5 5 0 1.5-.6 2.7-1.5 3.6.9.4 1.5 1.3 1.5 2.4v2c1.7.3 3 1.8 3 3.6v3.4a2 2 0 0 1-2 2h-2v-3h-8v3H10a2 2 0 0 1-2-2v-3.4c0-1.8 1.3-3.3 3-3.6v-2c0-1.1.6-2 1.5-2.4A5 5 0 0 1 11 9c0-3 2-5 5-5Z"
      />
    </svg>
  );
}

export function HawkerGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <path fill="currentColor" d="M4 12h24l-2 4H6l-2-4Z" />
      <rect x="7" y="17" width="18" height="9" rx="1.5" fill="currentColor" />
      <rect x="14" y="6" width="4" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

export function FerrisWheelGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <path
        stroke="currentColor"
        strokeWidth="1.4"
        d="M16 5v22M5 16h22M8.2 8.2l15.6 15.6M23.8 8.2 8.2 23.8"
      />
    </svg>
  );
}

export function BusGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <rect x="4" y="9" width="24" height="14" rx="3" fill="currentColor" />
      <circle cx="10" cy="24" r="2.4" fill="currentColor" />
      <circle cx="22" cy="24" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Simplified HDB-style housing block silhouette. */
export function HdbGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <rect x="5" y="8" width="22" height="20" fill="currentColor" />
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={8 + col * 4.6}
            y={11 + row * 5.4}
            width="2.6"
            height="3.2"
            fill="white"
            opacity="0.55"
          />
        )),
      )}
    </svg>
  );
}

/** Simplified Gardens by the Bay "supertree" silhouette. */
export function SupertreeGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <path fill="currentColor" d="M15 6h2v14h-2z" />
      <ellipse cx="16" cy="10" rx="11" ry="4" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="8" ry="3" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
