# Scene 4 exterior v2 — generation record

Mode: built-in ImageGen (`image_gen`), reference-guided precise object editing and asset isolation.

## Clean base plate

Use case: precise-object-edit. Asset type: clean base environment plate for a layered 2D game map. Edit target: the supplied Kadaloor exterior panorama. Remove ONLY the collision-relevant foreground props from the pedestrian pavement: remove the entire bus shelter canopy, glass walls and posts; remove its timetable panel; remove the metal bench; remove the freestanding bus-stop pole, bus icon and route sign; remove the freestanding blank advertising display; remove all short silver-and-black bollards along the curb. Fill every removed area naturally with continuous matching pavement, curb, hedges and background vegetation. Preserve exactly the elevated PE5 Kadaloor station, covered Exit B stairs and lift, overhead linkbridge, buildings, trees, lighting, road markings, red BUS lane and the fixed orange LRT wayfinding emblem. Preserve the same 3:1 camera, perspective, colour palette, animated cel-shaded style and 2172x724-like panorama. No people, no bus, no new signs, no UI, no text additions, no watermark. This must be one coherent opaque base background suitable for separate prop sprites to be layered back on top.

## Shelter

Asset isolation edit using the supplied Kadaloor exterior game art as the style and exact object reference. Extract/recreate ONLY the dark teal Singapore bus shelter structure from the image: its shallow roof canopy, metal frame, glass side/back panels and vertical support posts. Exclude the bench, timetable content/panel, bus-stop pole, ad stand, bollards, person, road, buildings and scenery. Show the shelter in the exact same side-on 2D camera angle, scale proportions, warm daylight and polished animated cel-shaded illustration style as the source. Place the complete object centered on a flat pure chroma green #00FF00 background with generous clearance and no shadow beyond its footprint. No text, no UI, no watermark. This is a standalone layered game prop.

## Bench

Asset isolation edit using the supplied Kadaloor exterior game art as the style and exact object reference. Extract/recreate ONLY the metal bus-stop bench with its silver rails, three seat sections and legs. Exact same side-on 2D camera angle, scale proportions, warm daylight and polished animated cel-shaded illustration style as the source. No shelter, no pole, no timetable, no ad stand, no bollards, no person, no scenery. Center the complete bench on a flat pure chroma green #00FF00 background with generous clearance. No text, no UI, no watermark. Standalone layered game prop.

## Advertising stand

Asset isolation edit using the supplied Kadaloor exterior game art as the style and exact object reference. Extract/recreate ONLY the narrow freestanding blank advertising display/lightbox on its two dark support feet, with the cream empty poster face and dark teal-black frame. Exact same front-side 2D camera angle, scale proportions, warm daylight and polished animated cel-shaded illustration style as the source. No shelter, no bench, no stop pole, no timetable, no bollards, no person, no scenery. Center the complete object on a flat pure chroma green #00FF00 background with generous clearance. Keep the poster face entirely blank. No text, no UI, no watermark. Standalone layered game prop.

## Bollard

Asset isolation edit using the supplied Kadaloor exterior game art as the style and exact object reference. Extract/recreate ONLY one short cylindrical Singapore curb bollard: brushed silver rounded cap and body, dark charcoal lower base, and a single amber zig-zag reflective marking on the front. Exact same side-on 2D camera angle, scale proportions, warm daylight and polished animated cel-shaded illustration style as the source. No shelter, no bench, no stop sign, no ad stand, no person, no scenery. Center the complete object on a flat pure chroma green #00FF00 background with generous clearance. No text, no UI, no watermark. Standalone layered game prop.

## Bus-stop pole

Asset isolation edit using the supplied Kadaloor exterior game art as the style and object reference. Recreate ONLY one complete Singapore bus-stop pole and sign housing, side-front view: a slim dark metal pole, rounded blue bus pictogram cap at the top, a single dark teal rectangular station-name panel beneath it, and one cream rectangular route-services panel below. Keep both rectangular panels completely blank because exact route text will be overlaid in the game. Do not create a second sign or duplicate panel. Exact same proportions, warm daylight and polished animated cel-shaded illustration style as the supplied source. No shelter, bench, timetable, ad stand, bollards, person or scenery. Center it on a flat pure chroma green #00FF00 background with generous clearance. No readable text, no UI, no watermark. Standalone layered game prop.

## Seated bus driver

Use case: background-extraction. Asset type: transparent character sprite for a layered 2D bus-interior game scene. Input image: the supplied bus interior is the exact reference for camera angle, lighting, proportions, linework and polished animated cel-shaded style. Create ONLY one seated Singapore public-bus driver viewed mostly from behind and slightly from the passenger side, positioned as though facing left toward the steering wheel. Adult driver wearing a neat dark navy short-sleeve uniform shirt and dark trousers, natural seated driving posture, hands forward on an unseen steering wheel. Full seated figure from head through hips and upper legs; no seat, no steering wheel, no bus interior, no props. Match the warm daylight, clean outlines and semi-realistic animated illustration style of the reference. Center the isolated character on a flat pure chroma green #00FF00 background with generous clearance. No logos, no badges with readable text, no UI, no watermark.
