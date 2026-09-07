# Scene 4 rail-platform generation record

Generated with the built-in image generation tool using
`scene4-style-scale-v2.png` as the mandatory style, scale, lighting, and
Singapore-transit reference. All outputs are complete opaque 2172×724 game
environment panoramas with no player, train, UI, generated signs, or video.

## Kadaloor LRT

Create a continuous side-on PE5 Kadaloor elevated Punggol LRT platform with a
green canopy, tropical daylight, elevated structure, guideway, concourse
access, and a clear walkable foreground, matching the approved cel-shaded art.

## Punggol North East Line

Create a continuous side-on NE17 Punggol underground MRT platform with glass
platform screen doors, silver framing, purple NEL accents, concourse access,
and a clear walkable foreground, matching the approved cel-shaded art.

The layered runtime base must retain two unobstructed track openings and the
central stair/escalator bank. Place `PUNGGOL` / `NE17` identity and Platform A
towards HarbourFront signage above the platform-door overlay. Integrate an
original interpretation of `Water, Landscape & Future` as laminated-glass
panels evoking water, shoreline, kampong rooflines, and trees. Open and closed
door overlays must terminate in straight fixed frames; never include hinged
end leaves projecting into the platform.

## Little India Downtown Line

Create a continuous side-on DT12 Little India underground MRT platform with
glass platform screen doors, deep-blue DTL accents, restrained warm geometric
details, concourse access, and a clear walkable foreground, matching the
approved cel-shaded art.

## Little India interchange regeneration

The Little India environment set was regenerated from the verified station
references rather than memory. The three runtime backgrounds now include large
station identity and wayfinding signs, correct `NE7` / `DT12` line colours,
multilingual station naming, and artwork cues specific to each side of the
interchange:

- `little-india-nel-platform.png`: NE7 platform identity, HarbourFront and
  DTL-transfer wayfinding, and an original sepia buffalo-history mural.
- `little-india-transfer-concourse.png`: prominent NE7/DT12 station identity
  and line-transfer signs, a DTL Platforms A & B direction board, and
  sari-weave-inspired metalwork. Expo/Bukit Panjang destination boards are
  reserved for the DTL platform and must not appear in this concourse.
- `little-india-dtl-platform-base.png`: DT12 platform identity and Expo/NEL
  wayfinding placed above the separate runtime platform-door layer, plus
  sari-weave-inspired geometric aluminium panels.

All three outputs remain empty, opaque, side-on 2172×724 gameplay panoramas.

The live island-platform scene uses `little-india-dtl-platform-base.png`.
It must contain the multilingual `DT12 Little India` identity fascia while its
two framed display boards remain blank for live Platform A/B destination and
next-train information. Direction selection is spatial—walking onto the left
or right platform—not a persistent HTML button overlay. The island-platform
door sprites must end in straight fixed frames with no outward-hinged leaves.
