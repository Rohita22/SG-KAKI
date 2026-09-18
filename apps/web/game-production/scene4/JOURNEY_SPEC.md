# Scene 4 canonical journey specification

Status: canonical route and destination locked; Expo exit detail pending environment implementation

Last verified: 2026-09-07

## Learning goal

The player independently reads Singapore transit signs, selects the correct service and direction, uses fare readers correctly, transfers between lines, and reaches the TCS Asia Pacific office in Changi Business Park.

## Canonical route

Scene 4 begins at Kadaloor LRT station Exit B and offers two valid alternatives to Punggol Interchange.

### Bus opening route

1. Wait at bus stop `65321 · Kadaloor Stn Exit B`.
2. Hail SBS Transit Service 50 towards Punggol Interchange.
3. Tap in after boarding.
4. Pass `Oasis Stn Exit B / Blk 617D`, `Damai Stn Exit B`, and `Punggol View Primary School`.
5. Tap out and alight at `Punggol Interchange`.

### LRT opening route

1. Enter Kadaloor LRT station through Exit B.
2. Tap in and reach the elevated platform.
3. Take the Punggol LRT East Loop towards Punggol via Oasis and Damai.
4. Alight at Punggol.

### Shared rail route

1. Enter the North East Line at `Punggol · NE17`.
2. Choose the HarbourFront-bound platform; Punggol Coast is the wrong direction.
3. Alight at `Little India · NE7`.
4. Transfer within the paid area to `Little India · DT12`.
5. Choose the Expo-bound Downtown Line platform; Bukit Panjang is the wrong direction.
6. Alight at `Expo · DT35`.
7. Tap out at Expo.
8. Follow `Exit D` towards Changi Business Park and The Signature.
9. Complete the short outdoor walk to The Signature main entrance.

The authoritative simulated rail stop sequences and stop facts live in `src/components/practice/scene4/railStopFacts.ts`. Route summaries must not duplicate partial stop arrays.

## Canonical destination

- **Building:** The Signature
- **Address:** 51 Changi Business Park Central 2, Singapore 486066
- **Organisation represented:** Tata Consultancy Services (TCS)
- **First/last-mile segment:** a short playable walk from Expo MRT to The Signature, compressed enough to preserve pacing while keeping the destination leg clear.
- **Station exit:** Expo Exit D. SBS Transit's current DT35 station information lists The Signature among the destinations served by Exit D.
- **Playable endpoint:** The Signature main building entrance, with clear destination wayfinding and a final arrival confirmation. The player does not enter the building.
- **Internal floor:** intentionally unspecified until a reliable project reference is provided. Do not invent a floor number, restricted office interior, or desk location.

The scene is not complete when the player taps out at Expo. Tap-out begins the final walk; completion occurs when the player reaches The Signature's main building entrance.

## Pacing target

- Bus 50 opening route: 2–3 minutes from Kadaloor to The Signature entrance.
- Punggol LRT opening route: 2.5–3.5 minutes from Kadaloor to The Signature entrance.
- Long MRT legs use representative playable stops while retaining complete authoritative stop/fact lists in data.
- A missed target stop should recover within roughly 15 seconds rather than replaying the entire line.

## Current runtime boundary

Completion must occur at The Signature's main building entrance, never at the Expo fare gates or inside an invented office interior.

## Reference sources

- Current Service 50 route: <https://travelguide.simplygo.com.sg/Bus/Info/50>
- TCS Asia Pacific office confirmation: <https://www.tcs.com/who-we-are/newsroom/news-alert/tcs-launches-ai-powered-research-innovation-centre-in-singapore-accelerate-enterprise-innovation-at-scale>
- TCS Pace Port Singapore location: <https://www.tcs.com/what-we-do/pace-innovation/pace-port/tcs-pace-port-singapore-powering-innovation>
- The Signature property and address: <https://www.mapletree.com.sg/property/the-signature/>
- Expo DT35 exits and destinations: <https://www.sbstransit.com.sg/Service/TrainInformation?Station=XPO&TrainLine=DTL>
- LTA rail network: <https://www.lta.gov.sg/content/ltagov/en/map/train.html>
