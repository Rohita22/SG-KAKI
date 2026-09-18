# Scene 4 production workspace

Implementation progress and the durable resume handoff are tracked in
[`POLISH_CHECKLIST.md`](./POLISH_CHECKLIST.md).
The route and destination contract is recorded in
[`JOURNEY_SPEC.md`](./JOURNEY_SPEC.md).

This directory holds editable game-production sources, verified real-world
references, deterministic processing scripts, and Tiled maps for the rebuilt
Scene 4 commute game.

## Locked production stack

- Phaser 4.2.1 for the runtime
- Phaser Editor v5 for scenes, prefabs, asset packs, animation setup, and physics bodies
- Tiled 1.12.2 for map geometry, collision, trigger, spawn, and transit-path layers
- Spine 4.3 or frame-based texture atlases for character animation; choose one pipeline before production
- Vitest for deterministic game-state tests
- Playwright for route, viewport, input, and screenshot tests

## Directory contract

- `art-direction/`: approval sheets and the eventual locked style guide
- `maps/`: editable Tiled project, maps, tilesets, object templates, and world definitions
- `characters/`: editable rig or sprite sources, not optimized runtime exports
- `props/`: editable bus, train, gate, reader, sign, and environment sources
- `audio/`: editable sound and music masters
- `exports/`: generated atlases, maps, audio, and manifests consumed by Phaser

Generated exports must never replace their editable sources. React must not
position or animate physical game-world objects.

## Current route contract

`art-direction/scene4-style-scale-v2.png` is the approved concept sheet. The
runtime implements the complete connected commute:

1. begin outside Kadaloor LRT Exit B and choose Bus 50 or the Punggol LRT;
2. on the bus branch, hail Service 50 at stop 65321, tap in, ride via Oasis,
   Damai, and Punggol View Primary School, then tap out at Punggol Interchange;
3. on the LRT branch, enter Kadaloor station, tap in, and ride towards Punggol
   via Oasis and Damai;
4. merge both branches at Punggol Interchange;
5. choose the HarbourFront-bound North East Line platform and alight at Little
   India;
6. transfer to the Expo-bound Downtown Line and alight at Expo;
7. tap out at Expo;
8. follow Expo Exit D towards Changi Business Park and The Signature;
9. reach the main entrance of **The Signature, 51 Changi Business Park Central
   2**, and finish the journey outside the building.

The building interior is out of scope and must not be added.

The rail legs are authored in `maps/kadaloor-lrt.tmj`,
`maps/punggol-nel.tmj`, and `maps/little-india-dtl.tmj`. They provide camera
bounds, platform geometry, direction choices, boarding triggers, player
spawns, train paths, and complete 2172×724 illustrated station backgrounds.
Rail animation is Phaser-native; no generated videos are required.

Tiled is the intended authority for physical coordinates. The current runtime
still contains hard-coded placement values that must be migrated as part of the
polish work. React owns the quest HUD and action controls.
