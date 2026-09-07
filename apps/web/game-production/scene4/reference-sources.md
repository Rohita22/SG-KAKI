# Scene 4 real-world reference sources

These sources define physical layout and transit details. Reference photos are
not shipped with the game; production art must be an original animated
interpretation of the verified architecture.

## Kadaloor exterior

- Station overview and layout: <https://landtransportguru.net/kadaloor-station/>
- Real Exit B stair photograph: <https://www.streetdirectory.com/stock_images/travel/preview/12689684150321/251335/entranceexit_b_kadaloor_lrt_pe5/>
- Real stop 65321 sign photograph: <https://www.streetdirectory.com/stock_images/travel/preview/13783687850103/245638/kadaloor_station_exit_b_punggol_drive_b65321/>
- Current service 50 route: <https://travelguide.simplygo.com.sg/Bus/Info/50>
- Current LTA service 683 notice: <https://www.lta.gov.sg/content/dam/ltagov/Interactive_map/pdf/New_CDS_679%2C680%2C681%2C682%2C683.pdf>

Verified constraints:

- PE5 Kadaloor is an elevated Punggol LRT station built over Punggol Drive.
- The platform is level 3; the concourse, faregates, and linkbridge are level 2.
- Exit B is a long covered stair and lift structure on the pedestrian side.
- Bus stop 65321 is `Kadaloor Stn Exit B` on Punggol Drive.
- The stop is currently served by 50, 666, and 683.
- The player performs three visible stair-climbing animation cycles before the
  map transition. The real staircase still has its full flight of steps.

## Little India interchange

- Station layout, platform directions, line codes, and gallery photographs:
  <https://landtransportguru.net/little-india-station/>
- Official DTL architecture and `Woven Field` artwork description:
  <https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/rail_network/downtown_line.html>
- Official Art in Transit descriptions for DT12 `Woven Field` and NE7
  `Memoirs of the Past`:
  <https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/a_better_public_transport_experience/art_in_public_transport/art_in_transit.html>

Verified constraints:

- Little India is an underground interchange identified as `NE7 / DT12`.
- Passenger-facing station identity uses `Little India`, `小印度`, and
  `லிட்டில் இந்தியா`.
- The NEL platform is at B2; the DTL platform is at B3; paid transfer linkways
  connect the NEL and DTL concourses.
- NEL Platform A runs towards HarbourFront. DTL Platform B runs towards Expo.
- NEL wayfinding uses purple; DTL wayfinding uses blue.
- The DTL artwork character is based on sari-inspired tessellated aluminium
  patterns. The NEL artwork character includes sepia-toned Indian folk-art and
  references to the area's buffalo-stable history.

## Punggol North East Line

- Station layout, current platform directions, and gallery photographs:
  <https://landtransportguru.net/punggol-station/>
- Official Art in Transit description for NE17 `Water, Landscape & Future`:
  <https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/a_better_public_transport_experience/art_in_public_transport/art_in_transit.html>

Verified constraints:

- Punggol is `NE17` on the North East Line; Platform A runs towards
  HarbourFront and Platform B runs towards Punggol Coast.
- The station artwork uses layered hand-painted glass to evoke water, the
  seaside, kampongs, and trees, with a shimmering effect.
- Platform screen doors slide laterally. No hinged or outward-projecting end
  panel should appear in either the open or closed runtime door overlay.

## Production rule

No environment asset is approved from memory alone. Compare it against the
sources above, then compare its linework and palette against
`art-direction/scene4-style-scale-v2.png` before adding it to Tiled or Phaser.
