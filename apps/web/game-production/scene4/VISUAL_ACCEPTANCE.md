# Scene 4 visual language and acceptance sheet

Last updated: 2026-09-07

## Locked visual language

Scene 4 uses grounded, wide photographic/painted Singapore environments with clean game-native overlays. Characters and vehicles may retain illustrated edges, but every composited element must share the panorama's floor plane, perspective, light direction, and restrained saturation. HUD surfaces use deep navy, white, and warm gold; line identity is reserved for route information rather than general decoration.

Line colours:

- Punggol LRT / opening branch: green `#159b72`
- North East Line: purple `#7c3fb5`
- Downtown Line: blue `#1261a0`
- Primary action and route cue: gold `#f7b928`
- HUD surface: navy `#12233f`

## Export and coordinate contract

- Environment panoramas: 2176 × 724 PNG, rendered at world origin `(0,0)`.
- Walking sheets: four 512 × 768 frames, 2048 × 768 sheet, 27px transparent padding below the shoes.
- Seated pose: 254 × 768 PNG, shoes reach the bottom edge.
- Walking foot origin: `(0.5, 0.965)`; seated foot origin: `(0.5, 0.995)`.
- Player world heights: exterior 230.4, station 322.56, escalator upper landing 184.32, bus standing 537.6, bus seated 460.8, rail standing 414.72, rail seated 384.
- Player collision: source-space shoe box 110 × 54 at offset `(201,690)`.
- Rail seat contract: cushion centre `x`, visual hip `hipY`, shoe/floor contact `footFloorY`, and named `scaleProfile`.
- Bus seat contract: the Tiled `Seats` layer supplies cushion `x/y`, `seatBottomY`, `footFloorY`, and `scaleProfile`.

## Scene acceptance checks

For every checkpoint, approve all of the following before capturing a final baseline:

1. Shoes or contact shadow meet the authored floor/step; no transparent-canvas hovering.
2. Character head clears ceilings and fits doors; seated pelvis meets the cushion and shoes meet the floor.
3. Foreground rails, platform doors, gate posts, and vehicle masks occlude the character/vehicle correctly.
4. The next portal or usable doorway is visible without guessing; hit areas match the visible object.
5. The objective is readable without covering station names, direction signs, doors, readers, or the destination entrance.
6. Navy/white text meets readable contrast; line colour is paired with a name, icon, or direction.
7. Lighting remains neutral-to-warm from overhead; contact shadows are soft and directly below feet.
8. No repeated prop seam, stretched vehicle, black transparency gap, or obsolete completion layer is visible.

## Required final capture matrix

Capture desktop (1280 × 720 game viewport) and phone (390 × 844 browser viewport) for:

- Kadaloor exterior; Bus arrival; Bus entry; Bus seated; Bus rear exit.
- Kadaloor LRT gates, stairs, open platform doors, and seated interior.
- Punggol gates, escalator upper landing/ride/lower landing, NEL open platform doors, and interior.
- Little India arrival, transfer, DTL open platform doors, and interior.
- Expo terminal reminder, platform arrival, fare gates, and Exit D.
- The Signature exterior walk and entrance completion reward.

Final approval also requires clean runs of both opening branches, keyboard/mouse and touch-only navigation, reduced-motion mode, restart/replay, and all automated checks.
