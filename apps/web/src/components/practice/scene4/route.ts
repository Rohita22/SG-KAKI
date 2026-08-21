/**
 * Scene 4 — the commute to the TCS office at Changi Business Park.
 *
 * The graph, and only the graph. The scene component owns every pixel; this
 * file owns where you can go, how long it takes, and what counts as wrong.
 *
 *   Act 1  Kadaloor  ──bus 50──▶  Punggol Int        (checkpoint, cannot fail)
 *   Act 2  Punggol   ──NEL─────▶  Little India
 *                    ──DTL─────▶  Expo               (can fail)
 *   Act 3  Expo      ──walk────▶  TCS @ Changi Business Park
 *
 * Two node kinds carry the whole quest. A `Place` is somewhere you stand and
 * choose; a `Ride` is a line you are on, and one implementation serves the bus,
 * the NEL and the DTL alike. Every wrong alight — around thirty of them across
 * the three lines — lands in a single generated "stranded" state rather than an
 * authored node, which is why this file is short and the art list is eleven
 * stills instead of forty.
 */

export type NodeId = string;

/** A clickable way out of a Place. */
export interface Hotspot {
  label: string;
  to: NodeId;
  /** Minutes this costs. Correct moves cost real walking/waiting time; wrong
   * moves cost that plus the detour. */
  costMin: number;
  /** Shown as a toast on arrival. Present on wrong turns — the in-fiction
   * "that wasn't it" rather than a scolding. */
  nudge?: string;
  /** Wrong turns are counted for the end card; the correct exit is not. */
  wrong?: boolean;
  /** Phase 3: a % box over the still, so this becomes a region you click on the
   * art instead of a button under it. */
  box?: { x: number; y: number; w: number; h: number };
}

export interface Place {
  kind: 'place';
  id: NodeId;
  caption: string;
  /** One line of scene-setting under the caption. */
  blurb: string;
  /** Phase 1 stand-in for the art: a tailwind gradient. */
  placeholder: string;
  /** Phase 3: the still that replaces `placeholder`. */
  background?: string;
  /** Fed to SG Buddy so "which way?" gets answered for THIS spot. */
  situation: string;
  /** A light nudge that preserves the decision for the player. */
  hint: string;
  /** The direct next step shown by the STUCK lifeline. */
  guidance: string;
  stuckQuestions: string[];
  hotspots: Hotspot[];
  /** Phase 2: a required exchange before the hotspots unlock. */
  talk?: TalkBeat;
  /** Banked on arrival; a later failure rewinds to here instead of the start. */
  checkpoint?: boolean;
  /** Ends the quest, successfully. */
  arrival?: boolean;
}

/** Phase 2 — one required conversation, in the shape scene 3 proved. */
export interface TalkBeat {
  personaName: string;
  personaDescription: string;
  goal: string;
  openingNudge: string;
  endWhen: string;
  closingCue: RegExp;
  minTurns: number;
  maxTurns: number;
}

export interface Ride {
  kind: 'ride';
  id: NodeId;
  line: string;
  /** Terminal/destination displayed on the arriving vehicle and platform board. */
  direction: string;
  /** Official line colour, for the HUD strip. */
  colour: string;
  /** In travel order. Index 0 is where you boarded. */
  stations: string[];
  /** Index of the correct station. -1 on a wrong-direction ride, where no
   * station is ever right. */
  alightAt: number;
  minPerStation: number;
  /** Where alighting correctly puts you. */
  arriveAt: NodeId;
  placeholder: string;
  background?: string;
  situation: string;
  hint: string;
  guidance: string;
  stuckQuestions: string[];
  /** The last station forces you off — bus 50 terminates at Punggol, so
   * overshooting it is physically impossible and the driver clears the bus. */
  terminus?: boolean;
  /** Set on a wrong-direction ride: where "cross to the other platform" leads.
   * Absent means a wrong alight is merely early — wait for the next train. */
  crossOverTo?: NodeId;
  /** Minutes to wait for the next service after alighting at the wrong stop. */
  waitMin: number;
}

export type RouteNode = Place | Ride;

// ─── Tuning ──────────────────────────────────────────────────────────────────

/** The clock runs at this rate, and ONLY while you are aboard something. It is
 * the one knob worth turning after a playtest: the DTL leg is 46 game minutes,
 * so 1.0 would be 46 real seconds of watching stations go by. */
export const SECONDS_PER_GAME_MINUTE = 0.55;

/** Ride this many stations past your stop — or in the wrong direction — and the
 * journey is unrecoverable. */
export const FAIL_AFTER_STOPS = 3;

/** What a clean run costs, in game minutes. Asserted against the graph in
 * route.test.ts, so retuning any single leg without updating this is caught
 * rather than silently eating the player's buffer. */
export const HAPPY_PATH_MIN = 108;

/** The slack on top of a clean run. Three or so mistakes' worth. */
export const BUFFER_MIN = 30;

export const BUDGET_MIN = HAPPY_PATH_MIN + BUFFER_MIN;

export const START_NODE: NodeId = 'kadaloor-busstop';

// ─── The graph ───────────────────────────────────────────────────────────────

const NODES: RouteNode[] = [
  // ── Act 1 — the bus ────────────────────────────────────────────────────────
  {
    kind: 'place',
    id: 'kadaloor-busstop',
    caption: 'Punggol Dr — Kadaloor Stn Exit B',
    blurb: "First morning. The office is at Changi Business Park and you're due at nine.",
    placeholder: 'from-amber-200 to-orange-300',
    background: '/scenes/scene4/environments/kadaloor-bus-stop.png',
    situation:
      'They are at the bus stop outside Kadaloor LRT station in Punggol, on their first morning, ' +
      'trying to reach the TCS office at Changi Business Park. The bus they want is service 50 towards Punggol Interchange.',
    hint: 'Check the service number and the destination shown on the bus display.',
    guidance: 'Wait for bus 50 showing “Punggol Interchange”. When it stops and the doors open, board before it leaves.',
    stuckQuestions: [
      'Which bus do I take from here?',
      'Should I take the LRT instead of the bus?',
      'How do I pay for the bus?',
    ],
    hotspots: [
      { label: 'Wait for bus 50 towards Punggol Int', to: 'ride-bus', costMin: 5 },
      {
        label: 'Board bus 3',
        to: 'kadaloor-busstop',
        costMin: 8,
        wrong: true,
        nudge: 'Wrong bus — 3 goes deeper into Punggol, away from the interchange. You get off and walk back.',
      },
      {
        label: 'Take the LRT instead',
        to: 'kadaloor-busstop',
        costMin: 6,
        wrong: true,
        nudge: 'The LRT loop goes the long way round to Punggol. You come back down to the bus stop.',
      },
    ],
  },
  {
    kind: 'ride',
    id: 'ride-bus',
    line: 'Bus 50',
    direction: 'Punggol Interchange',
    colour: '#8b5cf6',
    // Confirmed against the published route: four stops, Punggol Int last.
    stations: [
      'Kadaloor Stn Exit B',
      'Oasis Stn Exit B / Blk 617D',
      'Damai Stn Exit B',
      'Punggol View Pri Sch',
      'Punggol Int',
    ],
    alightAt: 4,
    minPerStation: 2.5,
    arriveAt: 'punggol-int',
    terminus: true,
    waitMin: 8,
    placeholder: 'from-violet-300 to-purple-400',
    background: '/scenes/scene4/environments/bus-interior.png',
    situation:
      'They are on bus 50 heading towards Punggol Interchange, which is the last stop. ' +
      'Oasis and Damai are LRT stations along the way but are not where they want to get off.',
    hint: 'Your stop is also the final destination shown on the bus display.',
    guidance: 'Stay on bus 50 until Punggol Interchange, the last stop, then alight and tap out.',
    stuckQuestions: [
      'Which stop do I get off at?',
      'How do I know when to press the bell?',
      'What happens if I miss my stop?',
    ],
  },

  // ── Act 2 — the MRT ────────────────────────────────────────────────────────
  {
    kind: 'place',
    id: 'punggol-int',
    caption: 'Punggol Interchange',
    blurb: 'Bus bays below, MRT and the mall above. Signs everywhere.',
    placeholder: 'from-sky-200 to-cyan-300',
    background: '/scenes/scene4/environments/punggol-interchange.png',
    checkpoint: true,
    situation:
      'They have just got off bus 50 at Punggol Interchange and need the North East Line platform ' +
      'to head towards HarbourFront. Waterway Point mall and the LRT platforms are also here and are both wrong turns.',
    hint: 'Look for the purple MRT line, not the grey LRT loop.',
    guidance: 'Follow the purple North East Line signs to the MRT platform. Do not enter Waterway Point or take the LRT.',
    stuckQuestions: [
      'Where is the MRT platform from here?',
      'Which line do I need for Changi Business Park?',
      'Do I need to tap out of the bus first?',
    ],
    hotspots: [
      { label: 'Follow the signs to the North East Line', to: 'punggol-nel-platform', costMin: 4 },
      {
        label: 'Head into Waterway Point',
        to: 'punggol-int',
        costMin: 10,
        wrong: true,
        nudge: "That's the mall. Nice kopi, wrong direction — you double back to the station.",
      },
      {
        label: 'Go up to the LRT platform',
        to: 'punggol-int',
        costMin: 6,
        wrong: true,
        nudge: 'The LRT loops around Punggol — it never leaves the estate. Back down to the MRT.',
      },
    ],
  },
  {
    kind: 'place',
    id: 'punggol-nel-platform',
    caption: 'Punggol — North East Line platform',
    blurb: 'Purple line. Check the platform: you need HarbourFront, not Punggol Coast.',
    placeholder: 'from-purple-200 to-fuchsia-300',
    background: '/scenes/scene4/environments/punggol-nel-platform.png',
    situation:
      'They are on the North East Line platform at Punggol. The correct direction is towards HarbourFront; ' +
      'the opposite direction goes one stop to Punggol Coast. They need to change to the Downtown Line at Little India.',
    hint: 'Read the platform destination: HarbourFront takes you south towards Little India.',
    guidance: 'Wait behind the yellow line for the North East Line train towards HarbourFront. Board when its doors open, then alight at Little India.',
    stuckQuestions: [
      'Which direction is the train going?',
      'Where do I change to get to Expo?',
      'What is tapping in?',
    ],
    hotspots: [
      { label: 'Wait for the train towards HarbourFront', to: 'ride-nel', costMin: 3 },
      {
        label: 'Take the train towards Punggol Coast',
        to: 'punggol-nel-platform',
        costMin: 8,
        wrong: true,
        nudge: 'Punggol Coast is one stop north—the opposite direction. You cross over and return to Punggol.',
      },
      {
        label: 'Board without tapping in',
        to: 'punggol-nel-platform',
        costMin: 4,
        wrong: true,
        nudge: 'The gantry beeps and stays shut. You dig out your card and tap properly.',
      },
    ],
  },
  {
    kind: 'ride',
    id: 'ride-nel',
    line: 'North East Line',
    direction: 'HarbourFront',
    colour: '#9e28b5',
    stations: [
      'Punggol',
      'Sengkang',
      'Buangkok',
      'Hougang',
      'Kovan',
      'Serangoon',
      'Woodleigh',
      'Potong Pasir',
      'Boon Keng',
      'Farrer Park',
      'Little India',
      // The line carries on towards HarbourFront. These three exist so that
      // missing your stop is actually possible — ride to Chinatown and the
      // journey is unrecoverable.
      'Dhoby Ghaut',
      'Clarke Quay',
      'Chinatown',
    ],
    alightAt: 10,
    minPerStation: 2.2,
    arriveAt: 'little-india',
    waitMin: 4,
    placeholder: 'from-purple-300 to-violet-400',
    background: '/scenes/scene4/environments/mrt-interior.png',
    situation:
      'They are on the North East Line heading from Punggol towards HarbourFront, and need to alight at Little India ' +
      'to change onto the Downtown Line towards Expo. Serangoon is an interchange but is the wrong one for this trip.',
    hint: 'Watch the station display for the interchange where the purple and blue lines meet.',
    guidance: 'Remain on the North East Line until Little India, then get off there for the Downtown Line transfer.',
    stuckQuestions: [
      'Which stop do I get off at?',
      'Is Serangoon where I change?',
      'How many stops left?',
    ],
  },
  {
    kind: 'place',
    id: 'little-india',
    caption: 'Little India — interchange concourse',
    blurb: 'Purple line behind you. Somewhere down here is the blue one.',
    placeholder: 'from-emerald-200 to-teal-300',
    background: '/scenes/scene4/environments/little-india-dtl-platform.png',
    situation:
      'They have alighted at Little India off the North East Line and need to transfer down to the Downtown Line, ' +
      'which will take them east to Expo. Leaving the station entirely would mean paying again.',
    hint: 'Transfers happen inside the paid area. Follow the blue-line signs without tapping out.',
    guidance: 'Stay inside the station and follow the blue Downtown Line signs down to its platforms.',
    stuckQuestions: [
      'How do I get to the Downtown Line from here?',
      'Do I need to tap out to change lines?',
      'Which colour line am I looking for?',
    ],
    hotspots: [
      { label: 'Follow the Downtown Line signs down', to: 'little-india-dtl', costMin: 5 },
      {
        label: 'Tap out and leave the station',
        to: 'little-india',
        costMin: 9,
        wrong: true,
        nudge: "You're outside on Serangoon Road, and re-entering starts a new fare. Back in you go.",
      },
      {
        label: 'Get back on the North East Line',
        to: 'little-india',
        costMin: 5,
        wrong: true,
        nudge: 'That line carries on to Chinatown and HarbourFront — nowhere near Changi. You step off again.',
      },
    ],
  },
  {
    kind: 'place',
    id: 'little-india-dtl',
    caption: 'Little India — Downtown Line platform',
    blurb: 'Two platforms, opposite directions. Only one of them ends up east.',
    placeholder: 'from-blue-200 to-indigo-300',
    background: '/scenes/scene4/environments/little-india-dtl-platform.png',
    situation:
      'They are on the Downtown Line platform at Little India and must pick a direction. Towards Expo is correct. ' +
      'Towards Bukit Panjang is the opposite end of the island. This is the single easiest mistake to make on the whole journey.',
    hint: 'Use the terminal station on the platform display to choose your direction.',
    guidance: 'Use the Downtown Line platform marked “towards Expo”. Wait behind the yellow line and board when the train doors open.',
    stuckQuestions: [
      'Which platform goes to Expo?',
      'How do I tell which direction a train is going?',
      'What happens if I get on the wrong one?',
    ],
    hotspots: [
      { label: 'Wait for the train towards Expo', to: 'ride-dtl', costMin: 2 },
      {
        label: 'Wait for the train towards Bukit Panjang',
        to: 'ride-dtl-wrong',
        costMin: 2,
        wrong: true,
        nudge: 'The map above the door is running the wrong way. This train is heading north-west.',
      },
    ],
  },
  {
    kind: 'ride',
    id: 'ride-dtl',
    line: 'Downtown Line',
    direction: 'Expo',
    colour: '#0354a6',
    // DT12 → DT35. The line loops through the city centre before turning east,
    // which is why a short-looking hop is twenty-three stops.
    stations: [
      'Little India',
      'Rochor',
      'Bugis',
      'Promenade',
      'Bayfront',
      'Downtown',
      'Telok Ayer',
      'Chinatown',
      'Fort Canning',
      'Bencoolen',
      'Jalan Besar',
      'Bendemeer',
      'Geylang Bahru',
      'Mattar',
      'MacPherson',
      'Ubi',
      'Kaki Bukit',
      'Bedok North',
      'Bedok Reservoir',
      'Tampines West',
      'Tampines',
      'Tampines East',
      'Upper Changi',
      'Expo',
    ],
    alightAt: 23,
    minPerStation: 2,
    arriveAt: 'expo',
    // Expo is the end of the Downtown Line, so — like the bus — you cannot ride
    // past it. The only way to fail this leg is to have boarded it backwards.
    terminus: true,
    waitMin: 4,
    placeholder: 'from-blue-300 to-indigo-400',
    background: '/scenes/scene4/environments/mrt-interior.png',
    situation:
      'They are on the Downtown Line heading east towards Expo, which is the stop for Changi Business Park. ' +
      'The line loops through the city centre first, so it is a long ride. Tampines and Upper Changi come just before Expo.',
    hint: 'The train may loop through the city first; that does not mean you chose the wrong direction.',
    guidance: 'Stay on the Downtown Line until Expo, the final stop. Changi Business Park is reached from Expo station.',
    stuckQuestions: [
      'How many stops until Expo?',
      'Is Tampines where I get off?',
      'Why is the train going towards the city first?',
    ],
  },
  {
    kind: 'ride',
    id: 'ride-dtl-wrong',
    line: 'Downtown Line — towards Bukit Panjang',
    direction: 'Bukit Panjang',
    colour: '#0354a6',
    stations: ['Little India', 'Newton', 'Stevens', 'Botanic Gardens', 'Tan Kah Kee'],
    // Nothing on this train is ever the right stop.
    alightAt: -1,
    minPerStation: 2,
    arriveAt: 'little-india-dtl',
    crossOverTo: 'little-india-dtl',
    waitMin: 4,
    placeholder: 'from-slate-300 to-blue-400',
    background: '/scenes/scene4/environments/mrt-interior.png',
    situation:
      'They boarded the Downtown Line in the wrong direction at Little India and are heading north-west, away from Expo. ' +
      'They need to get off and cross to the opposite platform as soon as they can.',
    hint: 'Compare the next station with the line map above the train doors.',
    guidance: 'Get off at the next station, cross to the opposite platform, and return towards Expo.',
    stuckQuestions: [
      'I think I am going the wrong way — what do I do?',
      'Do I have to pay again to cross over?',
      'How far have I gone wrong?',
    ],
  },

  // ── Act 3 — arrival ────────────────────────────────────────────────────────
  {
    kind: 'place',
    id: 'expo',
    caption: 'Expo — station exits',
    blurb: 'Big empty halls one way, business park the other.',
    placeholder: 'from-rose-200 to-pink-300',
    background: '/scenes/scene4/environments/expo-station.png',
    situation:
      'They have arrived at Expo station and need the exit towards Changi Business Park, where the TCS office is. ' +
      'The Singapore Expo halls and the Changi Airport train are both here and are both wrong.',
    hint: 'The office is in the business park, not the exhibition halls or airport.',
    guidance: 'Follow the station exit signs for Changi Business Park, then continue on foot towards the office towers.',
    stuckQuestions: [
      'Which exit is Changi Business Park?',
      'Is there a shuttle bus?',
      'How far is the walk?',
    ],
    hotspots: [
      { label: 'Take the exit for Changi Business Park', to: 'cbp-walk', costMin: 3 },
      {
        label: 'Exit towards the Singapore Expo halls',
        to: 'expo',
        costMin: 8,
        wrong: true,
        nudge: 'Convention halls, no offices. You walk back through the concourse.',
      },
      {
        label: 'Board the train to Changi Airport',
        to: 'expo',
        costMin: 10,
        wrong: true,
        nudge: "That's the airport branch — right area, wrong stop entirely. You ride straight back.",
      },
    ],
  },
  {
    kind: 'place',
    id: 'cbp-walk',
    caption: 'Changi Business Park',
    blurb: 'Glass and landscaping. Lanyards everywhere. One of these is yours.',
    placeholder: 'from-lime-200 to-green-300',
    background: '/scenes/scene4/environments/changi-business-park.png',
    situation:
      'They are walking through Changi Business Park looking for the TCS building, having come out of Expo station.',
    hint: 'Use the building directory and stay on the office-side pedestrian path.',
    guidance: 'Continue along the Changi Business Park pedestrian path and follow the directory signs to the TCS building.',
    stuckQuestions: [
      'Which building is TCS?',
      'What do I say at reception?',
      'Am I going to be late?',
    ],
    hotspots: [{ label: 'Walk to the TCS building', to: 'tcs-office', costMin: 8 }],
  },
  {
    kind: 'place',
    id: 'tcs-office',
    caption: 'TCS — Changi Business Park',
    blurb: 'You made it.',
    placeholder: 'from-indigo-200 to-blue-300',
    arrival: true,
    situation: 'They have arrived at the TCS office at Changi Business Park.',
    hint: 'You have reached your destination.',
    guidance: 'Enter the TCS lobby and check in at reception.',
    stuckQuestions: [],
    hotspots: [],
  },
];

const BY_ID = new Map(NODES.map((n) => [n.id, n]));

export function nodeById(id: NodeId): RouteNode {
  const node = BY_ID.get(id);
  // A missing id means a typo in the graph above, which would strand a player
  // mid-quest with no way out. Fail loudly here instead.
  if (!node) throw new Error(`[scene4] unknown node "${id}"`);
  return node;
}

export const allNodes: readonly RouteNode[] = NODES;

export const isPlace = (n: RouteNode): n is Place => n.kind === 'place';
export const isRide = (n: RouteNode): n is Ride => n.kind === 'ride';

/** Minutes a ride takes from boarding to the correct stop. */
export function rideMinutes(ride: Ride): number {
  return ride.alightAt * ride.minPerStation;
}

/** Which station you are at, derived from the minutes spent aboard rather than
 * counted up separately — one clock drives the whole ride, so the two can never
 * drift apart, and stepping off and re-boarding resumes exactly where it left
 * off. Clamped to the last station: a terminus cannot be ridden past. */
export function stationIndex(ride: Ride, rideMin: number): number {
  return Math.min(ride.stations.length - 1, Math.floor(rideMin / ride.minPerStation));
}

/** How many stations past the correct one you are. Every station on a
 * wrong-direction ride counts, since none of them was ever right. */
export function stopsPastTarget(ride: Ride, index: number): number {
  return ride.alightAt < 0 ? index : Math.max(0, index - ride.alightAt);
}

/** The journey is unrecoverable once you are this far gone. A terminus ride can
 * never reach it — the bus and the Downtown Line both end AT the stop you want,
 * so the only leg you can truly ride past is the NEL, and the only line you can
 * board backwards is the DTL. */
export function isUnrecoverable(ride: Ride, index: number): boolean {
  return stopsPastTarget(ride, index) >= FAIL_AFTER_STOPS;
}

/** How the clock is spent on a clean run — every correct hotspot plus every
 * ride, in order. Used by the test to prove the quest is winnable. */
export function happyPath(): { nodes: NodeId[]; minutes: number } {
  const nodes: NodeId[] = [];
  let minutes = 0;
  let current = nodeById(START_NODE);

  // The graph is small and acyclic along the correct path; the cap is only here
  // so a mis-authored loop fails the test rather than hanging it.
  for (let step = 0; step < 50; step += 1) {
    nodes.push(current.id);
    if (isPlace(current)) {
      if (current.arrival) return { nodes, minutes };
      const exit = current.hotspots.find((h) => !h.wrong);
      if (!exit) throw new Error(`[scene4] "${current.id}" has no correct way out`);
      minutes += exit.costMin;
      current = nodeById(exit.to);
    } else {
      minutes += rideMinutes(current);
      current = nodeById(current.arriveAt);
    }
  }
  throw new Error('[scene4] happy path never reached the office');
}
