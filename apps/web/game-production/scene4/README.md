# Scene 4 production workspace

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

## Locked art direction

`art-direction/scene4-style-scale-v2.png` is the approved concept sheet. The
runtime implements the complete connected commute:

1. walk through the real-world-informed Kadaloor exterior with arrows or A/D;
2. enter bus stop 65321 and use the sole action control, Raise Hand;
3. watch service 50 arrive in the curbside lane and open its front door;
4. physically walk into the front door;
5. walk to the bus reader and trigger an automatic animated card tap;
6. receive the live `ENTRY OK` response, ride to Kadaloor, walk to the rear
   reader, receive `EXIT OK`, and alight through the rear doors;
7. transfer at Kadaloor to the Punggol-bound LRT and ride via Oasis and Damai;
8. choose the HarbourFront-bound North East Line platform at Punggol;
9. choose the Expo-bound Downtown Line platform at Little India and arrive at
   Changi Business Park.

The rail legs are authored in `maps/kadaloor-lrt.tmj`,
`maps/punggol-nel.tmj`, and `maps/little-india-dtl.tmj`. They provide camera
bounds, platform geometry, direction choices, boarding triggers, player
spawns, train paths, and complete 2172×724 illustrated station backgrounds.
Rail animation is Phaser-native; no generated videos are required.

All physical coordinates come from Tiled. React owns only the quest HUD and
the permitted action controls.
