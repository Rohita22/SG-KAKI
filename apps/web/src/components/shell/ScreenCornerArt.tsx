/**
 * Decorative art tucked into the top-right of a screen, behind the content.
 *
 * The source PNG has a flat grey backdrop rather than an alpha channel, so it
 * is composited with `mix-blend-multiply`: against the cream page the light
 * grey drops out and the dark passport/postcard art stays. A plain <img> would
 * show as a grey rectangle instead.
 */
export function ScreenCornerArt({ image }: { image: string }) {
  return (
    <div
      className="pointer-events-none absolute right-4 top-2 z-0 hidden select-none lg:block lg:right-8"
      aria-hidden="true"
    >
      <img
        src={image}
        alt=""
        className="w-[260px] opacity-85 mix-blend-multiply xl:w-[300px]"
      />
    </div>
  );
}
