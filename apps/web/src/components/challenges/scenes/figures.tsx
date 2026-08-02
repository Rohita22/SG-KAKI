interface FigureProps {
  className?: string;
  flip?: boolean;
}

/** A rounded, friendly person silhouette used across all scene compositions. */
export function Figure({ className, flip }: FigureProps) {
  return (
    <svg
      viewBox="0 0 24 36"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <circle cx="12" cy="6.5" r="6" fill="currentColor" />
      <circle cx="4.5" cy="23" r="2.6" fill="currentColor" opacity="0.85" />
      <circle cx="19.5" cy="23" r="2.6" fill="currentColor" opacity="0.85" />
      <path
        fill="currentColor"
        d="M12 14c-5.2 0-9.4 3.9-9.4 8.7V33.5a2 2 0 0 0 2 2h14.8a2 2 0 0 0 2-2V22.7c0-4.8-4.2-8.7-9.4-8.7Z"
      />
    </svg>
  );
}
