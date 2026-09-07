# Scene 4 map contract

Maps use a 64 px authoring grid and JSON (`.tmj`) format. The grid is a design
unit, not a literal metre. Player readability and interaction spacing take
priority over real-world scale.

Required layers:

- `BackgroundArt`: the complete opaque environment panorama shown by Tiled
  and Phaser
- `Reference`: editor-only scale and composition guides
- `Environment`: physical location footprints used by the art pass
- `Collision`: solid geometry consumed by Arcade Physics
- `Interactions`: triggers and portals with explicit action properties
- `Spawns`: player and vehicle spawn/stop points
- `Paths`: authored vehicle and camera paths
- `Camera`: scene bounds and authored framing regions

Physical world objects belong in Tiled. React must never reproduce these
coordinates with CSS percentages.

## Kadaloor exterior topology

The street layout is based on real Kadaloor references. PE5 is an elevated
station over Punggol Drive. Exit B is a long covered stair and lift structure
on the pedestrian side of the road, left of bus stop 65321. It is not a
standalone underground-MRT canopy and it never occupies the bus lane.

At the foot of the real stair flight, the game plays three visible climbing
animation cycles before transferring the player to `kadaloor-concourse`. The
three cycles are interaction timing, not three physical stairs.

## Rail topology

- `kadaloor-lrt.tmj`: PE5 platform, Punggol-bound boarding zone, and compact
  LRT arrival path.
- `punggol-nel.tmj`: NE17 screen doors, HarbourFront/Punggol Coast direction
  choice, and the HarbourFront-bound boarding zone.
- `little-india-dtl.tmj`: DT12 screen doors, Expo/Bukit Panjang direction
  choice, and the Expo-bound boarding zone.

Each map owns its player spawn, train start/stop/exit points, platform
collision edge, interaction metadata, and fixed 16:9 camera framing.
