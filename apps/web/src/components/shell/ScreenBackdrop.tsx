/**
 * A fixed, non-scrolling illustrated backdrop for a screen.
 *
 * Rendered inside the scrolling `<main>` but positioned `fixed`, so the art
 * stays pinned to the viewport while only the content moves — and the area
 * below the fold never scrolls past the bottom of the image into white.
 *
 * `left-64` clears the fixed-width sidebar (`w-64`) so the image spans exactly
 * the content column rather than sliding under the nav.
 */
export function ScreenBackdrop({ image }: { image: string }) {
  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-64 right-0 z-0"
      aria-hidden="true"
    >
      <div
        className="size-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF5]/85 via-[#FDFBF5]/55 to-[#FDFBF5]/35" />
    </div>
  );
}
