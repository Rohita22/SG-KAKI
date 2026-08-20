import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Hotspot, Place } from './route';

/**
 * Somewhere you stand and choose. Phase 1 renders the hotspots as a stack of
 * labelled buttons over a gradient; phase 3 swaps the gradient for the still and
 * promotes any hotspot with a `box` to a region you click on the art itself.
 * The button stack stays either way — it is the only workable form on a phone,
 * and it is what keeps the scene usable before the art exists.
 */
export function PlaceView({
  place,
  onGo,
  disabled,
}: {
  place: Place;
  onGo: (hotspot: Hotspot) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`relative flex-1 overflow-hidden bg-gradient-to-br ${place.placeholder}`}
      >
        {place.background && (
          <img src={place.background} alt="" className="absolute inset-0 size-full object-cover" />
        )}

        {/* Phase 3: clickable regions drawn straight onto the art. Absent until
            there is art to draw them on, so this renders nothing today. */}
        {place.background &&
          place.hotspots
            .filter((h) => h.box)
            .map((h) => (
              <button
                key={h.label}
                type="button"
                aria-label={h.label}
                disabled={disabled}
                onClick={() => onGo(h)}
                style={{
                  left: `${h.box!.x}%`,
                  top: `${h.box!.y}%`,
                  width: `${h.box!.w}%`,
                  height: `${h.box!.h}%`,
                }}
                className="absolute rounded-xl ring-white/0 transition-all hover:bg-white/15 hover:ring-4 hover:ring-white/70"
              />
            ))}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sg-navy/85 to-transparent px-4 pb-4 pt-10">
          <p className="text-xs font-black uppercase tracking-wide text-white/60">
            {place.caption}
          </p>
          <p className="mt-0.5 text-sm font-bold text-white">{place.blurb}</p>
        </div>
      </div>

      <div className="grid gap-2 border-t border-black/5 bg-white p-4">
        {place.hotspots.map((hotspot, i) => (
          <motion.button
            key={hotspot.label}
            type="button"
            disabled={disabled}
            onClick={() => onGo(hotspot)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            // Every option looks identical on purpose. Styling the correct one
            // differently — or even ordering it first every time — would let the
            // player read the UI instead of the signage, which is the skill the
            // whole quest is about.
            className="flex items-center justify-between gap-3 rounded-2xl bg-sg-bg px-4 py-3.5 text-left text-sm font-bold text-sg-navy transition-colors hover:bg-black/10 disabled:opacity-40"
          >
            <span>{hotspot.label}</span>
            <ArrowRight className="size-4 shrink-0 text-sg-navy/30" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
