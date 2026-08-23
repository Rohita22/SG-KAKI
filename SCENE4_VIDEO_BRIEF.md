# Scene 4 — video-generation brief

These are the short videos that will materially improve the commute game. The
rest of the scene should remain interactive still art: card taps, hailing the
bus, choosing a seat, and getting off are player actions, not movies.

## Before generating

- Generate **16:9 horizontal MP4**, 1920×1080 if available, **4–6 seconds**.
- Use a **locked camera**. No zoom, pan, shake, cuts, titles, subtitles, logos,
  music, or narration.
- Attach the specified game image as the **visual reference** in Gemini for
  each prompt. Tell Gemini to preserve that image's architecture, weather,
  colour palette, camera angle, and passenger density.
- Keep the action simple and leave empty foreground space where the game can
  layer the player character and buttons.
- The person seen in a reference image is only background crowd. Do not make
  them the hero and do not create a close-up.

## 1. Bus 50 approaches Kadaloor bus stop

### Simple version

A bus comes along the road and pulls in beside the Kadaloor bus stop. It must
arrive from the road, not slide across the pavement.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/kadaloor-bus-stop.png`

### Gemini prompt

> Use the attached image as the exact scene reference. Preserve its Kadaloor
> bus-stop architecture, road direction, curb, stairs, daylight, colour
> palette, camera position, and background. Create a 5-second, 16:9,
> locked-camera animated-game video. At the beginning the road is clear. A
> believable Singapore public bus, route number 50, approaches from the road
> in the correct lane, slows, signals, and pulls into the curb directly beside
> the bus-stop pole. It must travel on the road and stop parallel to the curb;
> it must not appear from the pavement, the sky, or the foreground. Leave the
> lower-middle foreground clear for a player character waiting at the stop.
> Keep three or four background commuters only. End with the bus fully stopped
> at the curb, doors still closed. No text overlays, subtitles, logos, camera
> moves, cuts, or audio.

## 2. Bus 50 front doors open after the player hails it

### Simple version

The bus is already stopped. Its front doors open and the driver waits for the
player to board.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/kadaloor-bus-stop.png`

### Gemini prompt

> Use the attached Kadaloor bus-stop image as the exact visual reference for
> the same curb, road, daylight, stairs, perspective, and colour palette.
> Create a 4-second, 16:9, locked-camera continuation shot. A Singapore public
> bus on route 50 is already stopped correctly at the curb, facing the same
> road direction as the reference. After a short beat, the **front passenger
> doors** smoothly open toward the bus-stop pavement and the interior doorway
> light comes on. The driver remains seated in the front cab. Keep the doorway
> visible and the foreground empty so the game can animate its player walking
> aboard. Do not show anyone boarding, do not drive away, and do not add text,
> logos, subtitles, cuts, camera movement, or audio.

## 3. Kadaloor LRT train arrives and opens its doors

### Simple version

At Kadaloor, the small white-and-navy Punggol LRT train arrives on the elevated
guideway, stops, and opens its doors.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/kadaloor-lrt-gates.png`

### Gemini prompt

> Use the attached Kadaloor LRT reference image to preserve the green canopy,
> elevated Punggol setting, tropical daylight, materials, architecture, and
> animation style. Create a 5-second, 16:9, locked-camera game video looking
> across the Kadaloor LRT platform toward the elevated guideway. A believable
> two-car Singapore Punggol LRT people mover arrives slowly on the guideway: it
> is white with dark navy-blue window panels, compact, rubber-tyred, and
> distinctly different from a full-size MRT train. It stops aligned with the
> platform, then its passenger doors open. Keep the train on the guideway and
> behind the platform edge. Maintain only a small, calm crowd and leave a clear
> boarding area in the foreground for the player. No readable signs, route
> maps, logos, captions, camera movement, cuts, or audio.

## 4. NEL train arrives at Punggol behind platform screen doors

### Simple version

The purple North East Line train comes in behind the glass platform doors and
stops. It never passes through the passenger platform.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/punggol-nel-platform.png`

### Gemini prompt

> Use the attached Punggol North East Line platform image as the exact visual
> reference. Preserve the platform screen doors, silver-white train design,
> rich purple North East Line band, lighting, floor markings, passenger count,
> and camera angle. Create a 5-second, 16:9, locked-camera video. Begin with
> the track visible behind the platform screen doors. A full-size Singapore MRT
> North East Line train with a prominent purple band glides in **behind the
> platform screen doors**, slows, and stops perfectly aligned. The train must
> remain on the tracks and behind the glass doors at all times; it must never
> move across the passenger platform or into the foreground. End stationary
> just before the screen doors open. No text, logos, subtitles, cuts, camera
> movement, or audio.

## 5. NEL platform doors and train doors open together

### Simple version

The purple NEL train is already stopped. The glass platform doors open first,
then the train doors open, ready for boarding.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/punggol-nel-platform.png`

### Gemini prompt

> Use the attached Punggol NEL platform image as the exact visual reference.
> Keep the purple-banded North East Line train fully stationary on the track
> behind the platform screen doors, with the same perspective, lighting,
> architecture, and small crowd. Create a 4-second, 16:9, locked-camera video.
> After one second, the aligned glass platform screen doors slide open. Then
> the aligned silver train doors behind them slide open. Keep the gap and floor
> clear for a player character to walk in. Do not move the train, do not show
> the train in front of the platform doors, and do not show a crowd rush. No
> text, logos, subtitles, camera movement, cuts, or audio.

## 6. Downtown Line train arrives at Little India behind platform doors

### Simple version

The blue Downtown Line train arrives behind the platform doors at Little India;
this is the train the player takes towards Expo.

### Reference image to attach

`apps/web/public/scenes/scene4/environments/little-india-dtl-platform.png`

### Gemini prompt

> Use the attached Little India Downtown Line platform image as the exact
> scene reference. Preserve the station architecture, platform screen doors,
> blue-line colour treatment, lighting, camera angle, and crowd density.
> Create a 5-second, 16:9, locked-camera animated-game video. A modern
> full-size Singapore MRT Downtown Line train, silver-white with a clear deep
> blue line band, approaches on the tracks **behind the platform screen doors**,
> slows, and stops aligned with the doors. It must never appear on the
> passenger platform or cross the foreground. Finish with the train stopped,
> ready for the separate door-opening interaction. No readable signs, logos,
> text, subtitles, camera movement, cuts, or audio.

## Optional videos — only if generation budget allows

These will add polish but are not required for the gameplay to work.

### A. Bus interior leaving the stop

Attach `apps/web/public/scenes/scene4/environments/bus-interior.png`.

> Use the attached bus-interior image as the exact interior reference. Create
> a 4-second, 16:9, locked-camera view from inside a Singapore bus. The bus
> gently pulls away from a curb; outside scenery begins moving naturally past
> the windows while three or four seated passengers remain calm. Keep the
> fare-card reader and an empty foreground aisle visible. No text, logos,
> subtitles, cuts, camera movement, or audio.

### B. LRT gliding past Oasis and Damai

Generate this as two separate clips, one with each reference image:

- `apps/web/public/scenes/scene4/environments/oasis-lrt-platform.png`
- `apps/web/public/scenes/scene4/environments/damai-lrt-platform.png`

> Use the attached station image as the exact reference for this particular
> Punggol LRT stop. Create a 4-second, 16:9, locked-camera platform video. A
> compact white-and-dark-navy Punggol LRT people mover passes through or pulls
> in gently on the elevated guideway, while the station architecture, tropical
> greenery, housing blocks, sunlight, and small commuter crowd remain
> consistent with the reference. Keep the train behind the platform edge. No
> text, logos, subtitles, camera movement, cuts, or audio.

## Delivery names

Please name the delivered files exactly like this:

- `bus50-kadaloor-approach.mp4`
- `bus50-kadaloor-doors-open.mp4`
- `kadaloor-lrt-arrival-doors-open.mp4`
- `punggol-nel-arrival.mp4`
- `punggol-nel-doors-open.mp4`
- `little-india-dtl-arrival.mp4`
- `bus50-interior-departure.mp4` *(optional)*
- `oasis-lrt-pass.mp4` *(optional)*
- `damai-lrt-pass.mp4` *(optional)*
