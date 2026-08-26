/**
 * A non-scrolling illustrated backdrop for a screen, pinned to the top of the
 * viewport as the page content scrolls past it.
 *
 * Must be the first child of a `relative` ancestor that spans the full
 * scrollable height of the screen (e.g. `min-h-full`) — the outer `absolute
 * inset-0` sizes to that ancestor, and the viewport-height inner `sticky` pins
 * within it while the foreground content scrolls.
 * Scoped to that ancestor's width rather than the viewport, so it always
 * matches the content column regardless of the sidebar's collapsed/expanded
 * width.
 */
export function ScreenBackdrop({
  image,
  tone = 'default',
}: {
  image: string;
  /** Use on content-rich illustrated journey screens so the scene remains visible. */
  tone?: 'default' | 'subtle';
}) {
  const overlayClass =
    tone === 'subtle'
      ? 'from-[#FDFBF5]/70 via-[#FDFBF5]/38 to-[#FDFBF5]/26'
      : 'from-[#FDFBF5]/85 via-[#FDFBF5]/55 to-[#FDFBF5]/35';

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {/* overflow-hidden must live here, not on this div's parent — an
          overflow-hidden ancestor becomes the nearest scroll container for
          `sticky` purposes, which would anchor this to that (never-scrolled)
          wrapper instead of the page's actual scrolling element. */}
      <div
        data-testid="screen-backdrop"
        className="sticky top-0 h-dvh w-full overflow-hidden"
      >
        <div
          className="size-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${overlayClass}`} />
      </div>
    </div>
  );
}
