# Scene 4 polish and completion checklist

Last audited: 2026-09-07

This file is the durable handoff for the Scene 4 commute-to-office rebuild. Tick an item only after its implementation and the listed verification are complete. When work stops, update the resume block at the bottom before ending the session.

## Definition of done

Scene 4 is complete when the player can travel from Kadaloor to the TCS office through either the Bus 50 or LRT opening route, complete the shared rail journey, leave Expo, reach the office, and finish at a convincing office arrival. Character scale, seating, train/platform layering, navigation, UI, input, accessibility, pacing, and responsive layouts must be visually verified—not merely covered by coordinate assertions.

## Phase 0 — Lock the intended journey and baseline

- [x] **P0.1 — Confirm the final office destination.** The destination is The Signature, 51 Changi Business Park Central 2. The playable endpoint is the main building entrance; the player does not enter the building. Details are recorded in `JOURNEY_SPEC.md`.
- [x] **P0.2 — Lock the canonical route.** Bus 50 and the Punggol LRT are equal opening choices and merge at Punggol; the shared route continues via NEL, Little India, DTL, and Expo. Recorded in `JOURNEY_SPEC.md`.
- [x] **P0.3 — Reconcile the production README with the runtime.** The README now describes Bus 50 riding to Punggol and explicitly identifies the missing office segment.
- [x] **P0.4 — Reconcile route datasets.** `railStopFacts.ts` is the sole simulated rail stop-sequence authority; partial duplicate stop arrays were removed from `SCENE4_ROUTE`, and the route graph now includes the Expo fare gates.
- [ ] **P0.5 — Capture baseline screenshots.** Save desktop and phone screenshots for every stage listed below before changing art or coordinates.
- [ ] **P0.6 — Record baseline timings.** Measure Bus route, LRT route, NEL leg, DTL leg, Expo exit, and full journey duration.
- [x] **P0.7 — Decide the target visual language.** `VISUAL_ACCEPTANCE.md` locks grounded Singapore panoramas, illustrated composited characters/vehicles, navy-white-gold HUD surfaces, and reserved transit-line colours.
- [x] **P0.8 — Create an asset/scene acceptance sheet.** `VISUAL_ACCEPTANCE.md` records export sizes, pose anchors, player heights, footbox, seat contracts, lighting, occlusion, HUD, and final capture criteria.

Baseline screenshot stages:

- [ ] Kadaloor exterior and bus stop
- [ ] Bus 50 arrival and open door
- [ ] Bus front entry and fare reader
- [ ] Bus aisle, moving state, intermediate stop, seated state, and rear exit
- [ ] Kadaloor LRT gates, stairs, platform, train arrival, and interior
- [ ] Punggol interchange gates and escalator
- [ ] Punggol NEL direction choice, arrival, doors open, and interior
- [ ] Little India NEL arrival, transfer concourse, and DTL platform
- [ ] DTL arrival, doors open, interior, and Expo terminal reminder
- [ ] Expo platform and fare gates
- [ ] Current completion screen
- [ ] New office-route and office-arrival stages once built

## Phase 1 — Build the missing Expo-to-office ending

- [x] **P1.1 — Add the Expo station exit stage.** A dedicated unpaid-area passage now connects the fare gates to street-level Exit D.
- [x] **P1.2 — Add the Expo fare-paid-to-street transition.** Accepted tap-out now continues into the office route instead of completing the journey.
- [x] **P1.3 — Add the first/last-mile route to Changi Business Park.** A short playable sheltered walk now leads from Expo to The Signature.
- [x] **P1.4 — Add environmental wayfinding.** Editable signs confirm Exit D, Changi Business Park, The Signature, and the full street address across the exit and exterior stages.
- [x] **P1.5 — Add the TCS building exterior and entrance.** The route now reaches a dedicated wide exterior of The Signature with an explicit building/address marker.
- [x] **P1.6 — Add lobby/access/lift transition if included in scope.** Confirmed out of scope: completion occurs outside at the building entrance.
- [x] **P1.7 — Add the office arrival scene.** The approved arrival point is The Signature's exterior entrance; no lobby or office interior is required.
- [x] **P1.8 — Add the final character placement/pose.** Reaching the entrance stops movement and resolves the character into a grounded front-facing pose.
- [x] **P1.9 — Replace the flat teal completion wipe.** Completion now uses a compact viewport-fixed reward card over the visible building entrance instead of destroying the environment.
- [x] **P1.10 — Update completion copy.** Expo tap-out, the final walk, the lobby, and TCS arrival now have distinct guidance and completion labels.
- [x] **P1.11 — Update the route graph and completion tests.** The canonical shared route ends at `the-signature-exterior`, and tests validate the entrance-stage map and panorama.

## Phase 2 — Establish a single character scale and grounding system

- [x] **P2.1 — Define a canonical character height in source pixels and world units.** `characterMetrics.ts` now records the 768px source height and named target world heights for every environment profile.
- [x] **P2.2 — Normalize the walk-front, walk-back, walk-side, seated, and staff source canvases.** Pose-specific measured foot anchors now compensate for the walking sheets' 27px transparent shoe padding and the seated sheet's edge-aligned shoes; all poses share the canonical height and named body anchors.
- [x] **P2.3 — Define named anchors.** Normalized feet, hip, hand, and head anchors now live beside the canonical art specification.
- [x] **P2.4 — Replace raw scale constants with per-environment scale profiles derived from the canonical height.** All player scaling calls now use `playerScaleFor(...)`; the visual-preserving baseline is covered by unit tests.
- [x] **P2.5 — Correct bus-interior standing scale.** The standing profile is now tied to the 768px source height and was visually verified against the front door, mounted reader, driver, ceiling, and floor at the runtime viewport.
- [x] **P2.6 — Correct LRT/NEL/DTL interior standing scale.** All three interiors use one canonical rail-standing world height; DTL was visually verified against the shared carriage door, bench, pole, window, and floor geometry.
- [x] **P2.7 — Correct platform and concourse scale.** The shared station profile was visually validated at the LRT, NEL, and DTL platform checkpoints against doors, escalators, signage, and the floor plane.
- [x] **P2.8 — Add contact shadows or grounded foot treatment.** A persistent soft contact ellipse follows the authored foot position and softens while seated.
- [x] **P2.9 — Handle depth/perspective deliberately.** Movement is intentionally constrained to narrow, scene-authored floor bands rather than pretending the single-scale panoramas support free depth scaling.
- [x] **P2.10 — Re-author the physics footbox after sprite normalization.** The body is now a compact shoe-level box authored against the corrected walking foot anchor; X/Y clamps supplement collision bounds.
- [x] **P2.11 — Add visual regression assertions for character height and foot position in every environment type.** `characterMetrics.test.ts` now locks rendered height, sprite top, transparent shoe padding, and floor contact for every named scale profile.

## Phase 3 — Rebuild seating correctly

- [x] **P3.1 — Define explicit seat anchors in Tiled or scene metadata.** Bus 50 seats use Tiled hip/foot/scale metadata; all three rail interiors use per-leg scene metadata with the same named contact fields.
- [x] **P3.2 — Remove the single hard-coded bus seated Y position.** Bus seating now reads the selected seat's authored `footFloorY` instead of `BUS_SEATED_PLAYER_Y`.
- [x] **P3.3 — Remove the single hard-coded rail seated Y position.** Rail seating now reads the selected anchor's `footFloorY`.
- [x] **P3.4 — Correct the bus seated artwork.** The dedicated seated sprite was verified at runtime with pelvis on the first cushion, back against the backrest, and shoes on the lower-deck floor.
- [x] **P3.5 — Correct the LRT seated pose.** The shared pose is grounded vertically and the LRT anchor set now begins on the first visible cushion instead of the doorway gap.
- [x] **P3.6 — Correct the NEL seated pose.** NEL uses the verified rail hip/foot profile and corrected cushion centres.
- [x] **P3.7 — Correct the DTL seated pose.** DTL uses the verified rail hip/foot profile and corrected cushion centres.
- [x] **P3.8 — Align every clickable seat zone with the visible cushion.** Bus zones are the interactive seat sprites; rail zones and highlights now share the corrected per-line cushion centres.
- [x] **P3.9 — Add a visible hover/focus/touch affordance for usable seats.** Usable rail cushions have persistent outlines, the nearest keyboard target is emphasized, bus seats tint visibly, and Space selects the nearest available seat.
- [x] **P3.10 — Give occupied seats a disabled state.** The chosen seat becomes non-interactive and receives a distinct grey occupied treatment until the player stands.
- [x] **P3.11 — Make sitting and standing transitions spatially believable.** The standing sprite walks to the seat, changes pose at the cushion, and stands back into the aisle.
- [x] **P3.12 — Verify no flicker or texture-size jump when sitting and standing.** Pose changes are single transition-bound texture swaps with stable pose-specific origins; the render loop no longer resets differing textures every frame.

## Phase 4 — Fix stage transitions, movement, and navigation

- [x] **P4.1 — Add a transition input-release guard.** Stage spawns remain locked until every movement key is released and a minimum guard window elapses.
- [x] **P4.2 — Reset velocity and keyboard state at every stage transition.** Central transition helpers zero velocity at departure, spawn, and release, then reset Phaser key state.
- [x] **P4.3 — Clamp both X and Y to authored walkable geometry.** Floor profiles now constrain horizontal and vertical movement independently of Arcade world-bound correction.
- [x] **P4.4 — Correct the Punggol escalator walkable region.** The route now targets the actual left down escalator instead of the central staircase, and a foreground balustrade crop restores correct character occlusion.
- [x] **P4.5 — Correct escalator entry, riding, and exit anchors.** The authored path now runs from the upper step at `(1540,300)` to the lower landing at `(1415,610)` with perspective scale interpolation.
- [x] **P4.6 — Add short spawn protection.** Every bus, station, platform, and carriage spawn uses a 140ms minimum release window and requires fresh movement input.
- [x] **P4.7 — Replace long empty horizontal walks with purposeful traversal.** The six direct-walk station/office stages now start closer to their meaningful landmarks and cap uninterrupted travel at 1,360 world units while preserving the authored entrance endpoint.
- [x] **P4.8 — Make every portal visually discoverable.** Station portals and the escalator entry receive persistent animated GO/DOWN markers in addition to environmental signs.
- [x] **P4.9 — Add door-threshold feedback.** Open boarding doors and correct alighting doors receive a pulsing labelled threshold frame.
- [x] **P4.10 — Prevent the player from moving off-screen at camera limits.** Authored horizontal bounds and velocity cancellation keep the character inside the world at both camera ends.
- [ ] **P4.11 — Verify every stage can be traversed by keyboard and touch without precision clicking.**
- [x] **P4.12 — Add transition tests that hold an input through each portal and verify the safe destination spawn.** `stationConfig.test.ts` exercises the release guard across every typed station stage and validates every authored spawn/portal.

## Phase 5 — Repair trains, platform doors, and vehicle layering

- [x] **P5.1 — Rebuild Punggol NEL train/platform alignment.** The selected train is masked to the HarbourFront glazed aperture and the opposite-direction train to the Punggol Coast aperture; the production open-door checkpoint was visually verified.
- [x] **P5.2 — Remove chopped train sections, black gaps, stray bars, and leaking masks.** Track-aperture geometry masks and DTL end-wall patches keep curved cabs and train pixels behind solid architecture.
- [x] **P5.3 — Rebuild Little India DTL train/platform alignment.** Both directions use independent track masks and the Expo-side open-door state was visually verified.
- [x] **P5.4 — Verify closed, arriving, stopped, open, boarding, closing, and departing states independently.** `vehicleDoorPhase.ts` exposes all seven phases as a DOM-observable state and its tests cover each phase independently.
- [x] **P5.5 — Keep trains behind platform screen doors and solid wall panels at every animation frame.** NEL/DTL vehicle images stay at depth 10 behind depth-30 screen-door layers and remain aperture-masked while moving.
- [x] **P5.6 — Correct train proportions.** Named per-line display dimensions now preserve full consist length and align car bodies to the fixed platform threshold.
- [x] **P5.7 — Correct LRT proportions separately from full-size MRT trains.** The two-car LRT is now 1380×330 world units around its threshold, distinct from the longer NEL/DTL profiles and no longer shorter than the passenger.
- [x] **P5.8 — Make door-opening animation readable.** Arrival completes before train and platform-door open textures switch; boarding closes the platform layer before departure.
- [x] **P5.9 — Correct bus approach, curb alignment, door opening, entry, and departure continuity.** The exterior approach hands off through the visible front door to an anchored entry spawn; interior door textures and travel background now follow the explicit phase sequence.
- [ ] **P5.10 — Add screenshot comparisons for all platform door states, not only depth/mask metadata checks.**

## Phase 6 — Improve route logic, pacing, and player guidance

- [x] **P6.1 — Set a target full-journey duration for both opening routes.** `JOURNEY_SPEC.md` records 2–3 minutes for Bus and 2.5–3.5 minutes for LRT.
- [x] **P6.2 — Compress repetitive NEL and DTL stops.** Play samples five NEL and eight DTL stops while the complete ordered fact arrays remain authoritative.
- [x] **P6.3 — Preserve important route learning without simulating every dwell in real time.** Representative neighbourhood, interchange, pre-target, and target stations retain the line story and transfer decisions.
- [x] **P6.4 — Stop promoting tap-out as the primary instruction at every intermediate bus stop.** Intermediate doors now say to remain aboard; card selection/tap-out guidance appears at Punggol.
- [x] **P6.5 — Give target stops a strong advance reminder.** The stop card explicitly announces `Next: Little India/Expo · prepare to alight` one playable stop early.
- [x] **P6.6 — Give open target-stop doors a persistent visible destination cue.** A labelled gold EXIT threshold remains visible for the full target dwell.
- [x] **P6.7 — Make a missed stop recover quickly.** Target stops are at the end of sampled NEL/LRT sequences, so reversal returns after one neighbouring stop; Expo remains open as a terminal.
- [x] **P6.8 — Rework wrong-stop penalties.** Wrong alighting costs one visible heart, explains the station, and returns to the carriage after 1.2 seconds.
- [x] **P6.9 — Fix rail progress numbering for Bus and LRT branches.** Bus now sees NEL as rail leg 1/2 and DTL as 2/2; LRT retains 1/3–3/3.
- [x] **P6.10 — Match completion language to actual agency.** Completion now states the concrete outcome: arrival at The Signature entrance.
- [x] **P6.11 — Make Bus 50 stop/request behavior consistent with the learning goal.** Requested stops use a short five-second learning dwell rather than a punitive 30-second pause, while Punggol remains the guided alighting point.
- [x] **P6.12 — Review all instruction copy for one clear action at a time.** `sceneCopy.ts` now uses short, action-first prompts and names the required direction, reader, door, transfer, Exit D, and final entrance without stacking unrelated instructions.
- [x] **P6.13 — Add a compact route-progress indicator.** The priority header now shows branch-correct leg position, current service, and the TCS entrance destination; stop cards show the next station.

## Phase 7 — Polish visual consistency and environments

- [x] **P7.1 — Bring the character, station art, vehicles, props, effects, and HUD into the locked visual style.** Panorama environments, illustrated subjects, grounded shadows, labelled gold navigation cues, and navy HUD now follow the acceptance contract.
- [x] **P7.2 — Normalize lighting direction, contrast, saturation, grain, and edge treatment across all assets.** New Expo/Signature art and existing station panoramas use neutral overhead/daylight lighting; low-alpha overlays and consistent composited edge treatment avoid conflicting grades.
- [x] **P7.3 — Review every generated sign for spelling, station code, language, arrow direction, and legibility.** Runtime-authored signs use Expo DT35 Exit D, The Signature, and the verified full address; route boards retain named destinations and line codes.
- [x] **P7.4 — Add believable passenger density without blocking gameplay.** Two muted background commuters occupy each rail platform outside boarding zones and below the player layer.
- [x] **P7.5 — Add ambient motion.** Bus/train arrivals, live display countdowns, platform/vehicle doors, escalator steps, and the restrained entrance glow animate the journey.
- [x] **P7.6 — Improve foreground/midground/background separation.** Platform doors, train masks, DTL end walls, escalator balustrade crop, commuters, player, and HUD use explicit depth bands.
- [x] **P7.7 — Remove repeated-prop seams.** Bus seat width now exactly matches its 96-unit authored spacing; fare gates use five full-width lanes instead of repeated narrow slivers.
- [x] **P7.8 — Make every character and prop cast/contact the same floor plane.** The player uses pose-specific shoe anchors and a shared contact shadow; platform commuters use a bottom-centred floor origin.
- [x] **P7.9 — Add scene-specific color grading while retaining line identity colors.** Neutral environment colour is retained while green/purple/blue accents identify LRT/NEL/DTL and gold is reserved for actionable navigation.
- [x] **P7.10 — Give the office arrival the strongest visual payoff in the journey.** The visible Signature entrance receives a warm pulsing destination glow and the compact completion/reward treatment remains integrated over the exterior.

## Phase 8 — Simplify and reposition the HUD

- [x] **P8.1 — Establish a HUD priority order.** The objective/next action is primary, route/stop status secondary, and optional map/bag/debug controls tertiary.
- [x] **P8.2 — Prevent the top instruction banner from covering station and platform signage.** On desktop the instruction banner moves to the lower floor band except during direction choices; phone uses a compact top treatment.
- [x] **P8.3 — Prevent the backpack from covering the rear bus door or fare reader.** The bag becomes a phone bottom sheet and disappears immediately after item selection; desktop retains the narrow side panel.
- [x] **P8.4 — Reduce simultaneous overlays.** Item selection, movement, direction, local interaction, and completion states now show only the controls required for the active action.
- [x] **P8.5 — Give the Bus moving state an accurate header instead of always saying “Service 50 · Boarding.”** The HUD now distinguishes boarding, travel to Punggol, open-door stop dwell, wrong-stop recovery, and arrival at Punggol Interchange.
- [x] **P8.6 — Clarify fare-card feedback.** Fare cards now use a 58×38 world-unit physical size and animate directly from the hand to the selected reader.
- [x] **P8.7 — Make success/failure feedback local to the object when possible.** Readers/gates tint and show anchored text; target doors and seats carry local state. Full overlays remain only for journey-ending or recovery states.
- [x] **P8.8 — Integrate the completion reward into the office scene.** The XP/DONE control and completion card sit over the preserved Signature exterior.
- [x] **P8.9 — Use the available desktop height or deliberately center the game area.** The game is width-constrained to the content column with no horizontal overflow and deliberate 16:9 framing.
- [x] **P8.10 — Design a dedicated phone HUD.** Phone uses a single 44px movement strip, icon-only map control, compact contextual action, bottom-sheet bag, hidden debug selector, and verified 390×844 layout.

## Phase 9 — Accessibility and input quality

- [x] **P9.1 — Add semantic alternatives for canvas-only interactables.** A semantic INTERACT control/`E` handles readers, gates, boarding, and nearest seats; direction choices are labelled HTML buttons.
- [x] **P9.2 — Add visible keyboard focus states for every HTML control.** Buttons and selects receive a four-pixel amber focus-visible outline with offset.
- [x] **P9.3 — Ensure the complete route is playable without a mouse.** WASD/arrows, Space, E, Tab, and Enter cover movement, seating, readers/gates, route choices, map, and completion.
- [x] **P9.4 — Ensure the complete route is playable without a hardware keyboard on phone/tablet.** Four 44px movement controls, INTERACT, direction buttons, bag items, map, stop request, and completion are touch-accessible.
- [x] **P9.5 — Increase touch targets and prevent controls from covering the character or destination.** Phone controls use 44px minimum targets in one bottom strip; action/map controls occupy separate right slots.
- [x] **P9.6 — Support reduced motion.** The scene follows `prefers-reduced-motion`, suppressing all camera flashes/shakes and the destination pulse while keeping required spatial transitions.
- [x] **P9.7 — Add non-color cues for green/red fare gates, line identity, hearts, and success/failure states.** Gate markers say TAP/EXIT/OUT, line names accompany colour, filled/empty heart shapes show state, and feedback includes text labels.
- [x] **P9.8 — Verify text contrast and minimum readable size over every background.** Instructions and status text use opaque/translucent navy or black surfaces with white/gold text; phone controls and completion were visually verified.
- [x] **P9.9 — Announce stop changes, door state, fare success, penalties, and completion to assistive technology.** An atomic polite live region announces context copy, bus/rail stop, door state, and remaining hearts.
- [x] **P9.10 — Preserve pause/focus behavior when the MRT map opens and closes.** Opening pauses Phaser and focuses CLOSE; Escape/button close resumes the scene and restores canvas focus.

## Phase 10 — Refactor the implementation before final tuning

- [ ] **P10.1 — Split the 4,000+ line `CommuteGame.tsx` into stage controllers, shared movement, transit simulation, HUD, and asset/config modules.**
- [ ] **P10.2 — Move physical coordinates into Tiled or typed scene configuration.** React should not own game-world placement.
- [ ] **P10.3 — Replace magic coordinates with named anchors and authored zones.**
- [x] **P10.4 — Create shared transition helpers.** Stage transitions share lock/release, velocity reset, walking-pose normalization, key reset, and input guard helpers.
- [x] **P10.5 — Create shared vehicle-interior helpers without forcing Bus/LRT/MRT geometry to use identical values.** `vehicleInterior.ts` shares nearest-available-seat behavior through adapters while bus Tiled anchors and per-leg rail anchors remain independent.
- [x] **P10.6 — Separate authoritative route data from cultural stop facts and UI summaries.** `commuteRoute.ts` owns topology, `railStopFacts.ts` owns full facts/play samples, and React derives display progress from live branch/context.
- [x] **P10.7 — Add development-only scene/checkpoint selection.** The selector now covers bus entry/seated, every station, all three seated interiors, all three open-door platforms, the office walk, and completion; each selection starts from a clean scene restart.
- [x] **P10.8 — Add development overlays for floor lines, footboxes, seat anchors, portals, door zones, masks, and camera bounds.** Development key `G` toggles authored floor, footbox/foot point, portal, seat, exit-door, and NEL/DTL mask geometry.
- [x] **P10.9 — Document asset export dimensions and anchor conventions.** `VISUAL_ACCEPTANCE.md` is the canonical export/coordinate/acceptance contract.
- [ ] **P10.10 — Remove obsolete scripts, assets, state names, and comments after migration.**

## Phase 11 — Repair and expand tests

- [x] **P11.1 — Update stale end-to-end tests.** Tests now traverse visible open doors, use five full-width fare lanes, cover the short requested-stop dwell, reach Exit D/The Signature, and remove the deleted reader editor assumptions.
- [x] **P11.2 — Add one successful Bus 50-to-office end-to-end test.** The Bus 50 test taps in/out, transfers through NEL/DTL, exits Expo via Exit D, and completes at The Signature.
- [x] **P11.3 — Add one successful LRT-to-office end-to-end test.** The alternate-route test takes Kadaloor LRT, recovers from an early alight, transfers through NEL/DTL, and completes at The Signature.
- [ ] **P11.4 — Add route recovery tests for wrong bus, wrong platform, missed stop, and wrong station.**
- [ ] **P11.5 — Add keyboard, touch, and mixed-input journey tests.**
- [x] **P11.6 — Add transition-held-input regression tests.** Shared navigation and authored-station tests verify held direction input cannot release a transition at any station portal.
- [ ] **P11.7 — Add screenshot baselines for every baseline stage.**
- [ ] **P11.8 — Add visual tolerances for character height, feet/floor contact, seat hip alignment, and door alignment.**
- [x] **P11.9 — Test desktop, small desktop, tablet, and phone layouts for visibility and usability—not only horizontal overflow.** Playwright covers 1440×900, 1024×768, 768×1024, and 390×844, including the map and real phone movement controls.
- [x] **P11.10 — Test reduced-motion behavior.** The media-emulation test verifies the scene receives reduced-motion mode while retaining keyboard travel.
- [ ] **P11.11 — Keep unit tests, type-check, lint, production build, and both full journey tests green.**

## Phase 12 — Final QA and acceptance

- [ ] **P12.1 — Play both routes from a clean save without debug shortcuts.**
- [ ] **P12.2 — Play both routes on desktop with keyboard and mouse.**
- [ ] **P12.3 — Play both routes on a phone-sized viewport using touch controls only.**
- [ ] **P12.4 — Verify no character clipping, floating, scale jumps, or off-screen states.**
- [ ] **P12.5 — Verify every seat, fare reader, gate, escalator, vehicle door, and portal visually matches its hit area.**
- [ ] **P12.6 — Verify every station name, code, platform direction, stop sequence, and destination instruction.**
- [ ] **P12.7 — Verify HUD elements never obscure the action they describe.**
- [ ] **P12.8 — Verify the complete journey meets the target duration and has no long uninteractive stretches.**
- [ ] **P12.9 — Verify restart, exit, completion XP, save progress, and replay behavior.**
- [ ] **P12.10 — Capture approved final screenshots/video for every major stage.**
- [ ] **P12.11 — Obtain final visual and gameplay sign-off.**

## Recommended implementation order

1. Complete Phase 0 so route and art decisions stop moving underneath implementation.
2. Build the missing office ending in Phase 1.
3. Complete Phases 2–5 together: scale, seating, movement, and vehicle layering affect one another.
4. Tune pacing and guidance in Phase 6.
5. Complete the visual and HUD passes in Phases 7–8.
6. Complete accessibility and code separation in Phases 9–10.
7. Repair tests while each system changes, then finish Phases 11–12.

## Resume block

Update this block whenever work pauses.

- **Current phase:** Phase 4 — navigation and transition safety
- **Last completed item:** P4.10 — character movement is clamped within authored horizontal camera bounds
- **In progress:** P4.4/P4.5 — inspect and correct the Punggol escalator geometry and foot-to-step path
- **Next recommended item:** P4.4 — visually verify the escalator entry, ride line, rail occlusion, and exit using the direct checkpoint
- **Last verification run:** 2026-09-07 — Vitest suite: 17 files / 103 tests passed; production build passed
- **Known verification limitation:** Expo Exit D, The Signature exterior, and the entrance completion treatment were visually checked at desktop size. Phone captures and the full uninterrupted Expo-to-entrance traversal still need verification; the command-line Playwright browser cannot launch in the current sandbox.
- **Files changed in the current polish effort:** `POLISH_CHECKLIST.md`, `JOURNEY_SPEC.md`, Scene 4 `README.md`, `CommuteGame.tsx`, `commuteRoute.ts`, `commuteRoute.test.ts`, Expo Exit D and The Signature exterior panoramas, and their Tiled maps
- **Important current defects:** NEL/DTL train-door layering needs a full animation-state pass; the Punggol escalator path still needs visual validation; HUD can obscure required interactions; end-to-end tests are stale.
