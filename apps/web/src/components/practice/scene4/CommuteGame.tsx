import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SCENE4_ROUTE } from './commuteRoute';
import type { RailLegId } from './commuteRoute';
import { nextBouncingStopIndex, RAIL_PLAYABLE_STOP_FACTS, RAIL_STOP_DWELL_MS } from './railStopFacts';
import type { RailStopFact } from './railStopFacts';
import {
  PLAYER_ANCHORS,
  PLAYER_TARGET_HEIGHT,
  RAIL_SEAT_ANCHORS,
  playerScaleFor,
} from './characterMetrics';
import type { PlayerScaleProfile } from './characterMetrics';
import { canReleaseTransitionInput, clampToWalkableBounds } from './navigationSafety';
import type { WalkableFloorBounds } from './navigationSafety';
import { STATION_STAGES } from './stationConfig';
import type {
  DebugCheckpointId,
  FareItemKind,
  InteractionContext,
  StationStageId,
} from './sceneTypes';
import { CONTEXT_COPY } from './sceneCopy';
import { nearestAvailableSeatIndex } from './vehicleInterior';
import { vehicleDoorPhaseFor } from './vehicleDoorPhase';
import {
  CompletionReward,
  DebugCheckpointSelector,
  DirectionControls,
  FareBag,
  TouchMovementControls,
} from './CommuteControls';
import { STATION_DESTINATIONS } from './stationTransitions';

type ActiveRailStop = RailStopFact & {
  index: number;
  nextStation?: string;
  targetIsNext: boolean;
  legId: RailLegId;
  total: number;
};

type BusDwellState = {
  requested: boolean;
  seconds: number;
};

type WrongRailStop = {
  checkpoint: string;
  legId: RailLegId;
  station: string;
};

type StationFareGateSpec = {
  entry: boolean;
  laneX: number;
  readerX: number;
  readerY: number;
};

const EXTERIOR_MAP_KEY = 'scene4-kadaloor-map';
const INTERIOR_MAP_KEY = 'scene4-service-50-interior-map';
const RAIL_MAP_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-kadaloor-lrt-map',
  'punggol-nel': 'scene4-punggol-nel-map',
  'little-india-dtl': 'scene4-little-india-dtl-map',
};
const RAIL_BACKGROUND_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-kadaloor-lrt-background',
  'punggol-nel': 'scene4-punggol-nel-background',
  'little-india-dtl': 'scene4-little-india-dtl-background',
};
const TRAIN_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-punggol-lrt-train',
  'punggol-nel': 'scene4-nel-train',
  'little-india-dtl': 'scene4-dtl-train',
};
const TRAIN_OPEN_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-punggol-lrt-train-open',
  'punggol-nel': 'scene4-nel-train-open',
  'little-india-dtl': 'scene4-dtl-train-open',
};
const PLATFORM_DOOR_KEYS: Partial<Record<RailLegId, { closed: string; open: string }>> = {
  'punggol-nel': {
    closed: 'scene4-punggol-nel-platform-doors-closed',
    open: 'scene4-punggol-nel-platform-doors-open',
  },
  'little-india-dtl': {
    closed: 'scene4-little-india-dtl-platform-doors-closed',
    open: 'scene4-little-india-dtl-platform-doors-open',
  },
};
const DTL_LEFT_END_WALL_KEY = 'scene4-dtl-left-end-wall';
const DTL_RIGHT_END_WALL_KEY = 'scene4-dtl-right-end-wall';
const TRAIN_DISPLAY: Record<RailLegId, { height: number; width: number; yOffset: number }> = {
  // The LRT is a shorter two-car vehicle than the MRT consists, but its former
  // 220px body made the 322px platform passenger taller than the entire train.
  // Scale it around the fixed platform threshold so its doorway is human-sized.
  'kadaloor-lrt': { height: 330, width: 1380, yOffset: 15 },
  // Keep the NEL cars large enough for their doors to align one-for-one with
  // the platform screen doors. The old 780px width compressed three cars into
  // a single door bank, making the body and door spacing look bent.
  'punggol-nel': { height: 230, width: 1850, yOffset: 20 },
  // Keep the DTL consist close to its real long-train proportions. The track
  // masks reveal the straight middle cars instead of squeezing both curved
  // cabs into a platform opening.
  'little-india-dtl': { height: 245, width: 2350, yOffset: 10 },
};
const PUNGGOL_NEL_TRACK_MASKS = {
  // These are the actual glazed apertures in each screen-door bank. Keeping
  // the masks inside the glass prevents the train leaking through the solid
  // wall panels, the open track beside the banks, or the central concourse.
  harbourFront: [{ x: 1570, y: 245, width: 390, height: 245 }],
  punggolCoast: [{ x: 145, y: 245, width: 390, height: 245 }],
} as const;
const LITTLE_INDIA_DTL_TRACK_MASKS = {
  bukitPanjang: [{ x: 40, y: 205, width: 660, height: 225 }],
  expo: [{ x: 1400, y: 205, width: 736, height: 225 }],
} as const;
const RAIL_WORLD_WIDTH = 2176;
const RAIL_WORLD_HEIGHT = 724;
const EXTERIOR_FLOOR_BOUNDS: WalkableFloorBounds = { minX: 60, maxX: 2116, minY: 430, maxY: 700 };
const RAIL_INTERIOR_FLOOR_BOUNDS: WalkableFloorBounds = { minX: 60, maxX: 2116, minY: 590, maxY: 690 };
const RAIL_PLATFORM_FLOOR_BOUNDS: Record<RailLegId, WalkableFloorBounds> = {
  'kadaloor-lrt': { minY: 512, maxY: 690 },
  'punggol-nel': { minY: 500, maxY: 690 },
  'little-india-dtl': { minY: 500, maxY: 690 },
};
const STATION_FLOOR_BOUNDS: Record<StationStageId, WalkableFloorBounds> = {
  'kadaloor-lrt-concourse': { minY: 470, maxY: 690 },
  'kadaloor-lrt-stairs': { minY: 540, maxY: 690 },
  'punggol-interchange': { minY: 390, maxY: 690 },
  // The escalator scene swaps from its upper landing to its lower landing
  // after the scripted ride; currentWalkableFloorBounds handles that switch.
  'punggol-nel-escalator': { minY: 270, maxY: 370 },
  'little-india-nel-arrival': { minY: 470, maxY: 690 },
  'little-india-transfer': { minY: 470, maxY: 690 },
  'expo-dtl-arrival': { minY: 500, maxY: 690 },
  'expo-fare-gates': { minY: 300, maxY: 690 },
  'expo-exit-d': { minY: 500, maxY: 690 },
  'the-signature-exterior': { minY: 520, maxY: 690 },
};
const EXTERIOR_BACKGROUND_KEY = 'scene4-kadaloor-background';
const SHELTER_KEY = 'scene4-kadaloor-shelter';
const BENCH_KEY = 'scene4-kadaloor-bench';
const BOLLARD_KEY = 'scene4-kadaloor-bollard';
const STOP_POLE_KEY = 'scene4-kadaloor-stop-pole';
const INTERIOR_BACKGROUND_KEY = 'scene4-service-50-interior-background';
const INTERIOR_DOORS_CLOSED_KEY = 'scene4-service-50-interior-doors-closed';
const INTERIOR_DOORS_OPEN_KEY = 'scene4-service-50-interior-doors-open';
const INTERIOR_MOVING_KEY = 'scene4-service-50-interior-moving';
const BUS_SEAT_KEY = 'scene4-service-50-seat';
const BUS_SEAT_FALLBACK_POSITIONS = [1048, 1144, 1240, 1336, 1432, 1528] as const;
const BUS_SEAT_FALLBACK_BOTTOM_Y = 505;
const RAIL_EXIT_ZONES = [
  // These zones begin beyond the carriage floor. Approaching a door is not an
  // alight action; the passenger must walk upward through an open doorway and
  // cross the threshold before the station transition can occur.
  { x: 1450, y: 430, width: 260, height: 50 },
] as const;
const RAIL_INTERIOR_FLOOR_MIN_Y = 590;
const RAIL_INTERIOR_OPEN_DOOR_MIN_Y = 430;
const RAIL_TARGET_STOP_DWELL_MS = 12_000;
const DTL_INTERMEDIATE_STOP_DWELL_MS = 2_000;
const DTL_EXPO_STAFF_DELAY_MS = 30_000;
const MRT_STAFF_KEY = 'scene4-mrt-staff';
const MRT_STAFF_SCALE = 0.232;
const STATION_GATE_OPEN_KEY = 'scene4-station-fare-gate-open';
const PUNGGOL_GATE_READER_KEY = 'scene4-punggol-fare-reader';
const PUNGGOL_GATE_CLOSED_KEY = 'scene4-punggol-fare-door-closed';
const PUNGGOL_GATE_OPEN_KEY = 'scene4-punggol-fare-door-open';
const RAIL_INTERIOR_BACKGROUND_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-lrt-train-interior',
  'punggol-nel': 'scene4-nel-train-interior',
  'little-india-dtl': 'scene4-dtl-train-interior',
};
const BUS_ROUTE_STOPS = [
  'Oasis Stn Exit B / Blk 617D',
  'Damai Stn Exit B',
  'Punggol View Primary School',
  'Punggol Interchange',
] as const;
const BUS_TRAVEL_BETWEEN_STOPS_MS = 2600;
const BUS_NORMAL_DWELL_MS = 3500;
const BUS_REQUESTED_DWELL_MS = 5_000;
const LIVE_SERVICE_MINUTE_MS = 2_500;
const NEL_PLATFORM_DWELL_MS = 6_000;
const NEL_NEXT_TRAIN_MS = 10_000;
const DTL_TRAIN_STOP_X = 1790;
const RAIL_BETWEEN_STOPS_MS = 100;
const PLAYER_KEY = 'scene4-player-walk';
const PLAYER_FRONT_KEY = 'scene4-player-walk-front';
const PLAYER_BACK_KEY = 'scene4-player-walk-back';
const PLAYER_SIT_KEY = 'scene4-player-sit-front';
const BUS_CLOSED_KEY = 'scene4-service-50-closed';
const BUS_OPEN_KEY = 'scene4-service-50-open';
const FARE_READER_KEY = 'scene4-simplygo-reader';
const FARE_CARD_DISPLAY = { width: 58, height: 38 } as const;
// The reader is mounted to the bus fixture, so passengers walking past it
// must render in front. Placement mode temporarily raises it above everything.
const FARE_READER_MOUNT_DEPTH = 15;
const TRAVEL_CARD_KEY = 'scene4-fare-item-travel-card';
const UMBRELLA_KEY = 'scene4-fare-item-umbrella';
const WATER_BOTTLE_KEY = 'scene4-fare-item-water-bottle';
const WALK_SPEED = 215;
const ESCALATOR_RIDE_SCALE = 0.42;
const ESCALATOR_BOARDING_X = 1540;
const ESCALATOR_BOARDING_Y = 300;
const ESCALATOR_EXIT_X = 1415;
const ESCALATOR_EXIT_Y = 610;
const PUNGGOL_GATE_EXIT_Y = 525;
const PUNGGOL_GATE_LANE_TOLERANCE = 58;
const PUNGGOL_GATE_POST_WIDTH = 60;
const PUNGGOL_GATE_POST_HEIGHT = 170;
const PUNGGOL_GATE_DOOR_WIDTH = 135;
const PUNGGOL_GATE_DOOR_HEIGHT = 60;
const EXTERIOR_BUS_WIDTH = 864;
const EXTERIOR_BUS_HEIGHT = 333;
// The held-item art and its hand anchors were authored against a 0.52 interior
// character. Deriving them keeps the item in his hand at any character size.
const INTERIOR_ART_BASE_SCALE = 0.52;
const ITEM_SCALE = playerScaleFor('bus-standing') / INTERIOR_ART_BASE_SCALE;
const CARRIED_ITEM_Y_OFFSET = 140 * ITEM_SCALE;
const CARRIED_ITEM_X_OFFSET = 48 * ITEM_SCALE;
// The interior camera is fixed, so how far up the aisle he may stand is bound
// by his own height: any higher and the top of the frame crops his head.
const INTERIOR_WALK_Y_MIN = 24 + PLAYER_TARGET_HEIGHT['bus-standing'] + 30;
const INTERIOR_WALK_Y_MAX = 745;
const BUS_INTERIOR_FLOOR_BOUNDS: WalkableFloorBounds = {
  minX: 100,
  maxX: 2076,
  minY: INTERIOR_WALK_Y_MIN,
  maxY: INTERIOR_WALK_Y_MAX,
};
const RAIL_INTERIOR_OPEN_BACKGROUND_KEYS: Record<RailLegId, string> = {
  'kadaloor-lrt': 'scene4-lrt-train-interior-open',
  'punggol-nel': 'scene4-nel-train-interior-open',
  'little-india-dtl': 'scene4-dtl-train-interior-open',
};

type PlayerFacing = 'side' | 'front' | 'back';

type SceneMode = 'exterior' | 'bus-interior' | 'rail' | 'rail-interior' | 'station';

interface TiledProperty {
  name: string;
  value: unknown;
}

interface TiledObject {
  id: number;
  name: string;
  properties?: TiledProperty[];
  height?: number;
  width?: number;
  x: number;
  y: number;
}

function propertyValue(object: TiledObject | undefined, name: string) {
  return object?.properties?.find((property) => property.name === name)?.value;
}

interface TiledLayer {
  name: string;
  objects?: TiledObject[];
}

interface Scene4MapData {
  height: number;
  layers: TiledLayer[];
  properties?: TiledProperty[];
  tileheight: number;
  tilewidth: number;
  width: number;
}

function objectByName(
  map: Scene4MapData,
  layerName: string,
  objectName: string,
) {
  return map.layers
    .find((layer) => layer.name === layerName)
    ?.objects?.find((object) => object.name === objectName);
}

function containsPoint(
  object: TiledObject | undefined,
  x: number,
  y: number,
) {
  if (!object) return false;
  return (
    x >= object.x &&
    x <= object.x + (object.width ?? 0) &&
    y >= object.y &&
    y <= object.y + (object.height ?? 0)
  );
}

class CommuteQuestScene extends Phaser.Scene {
  private worldWidth = 2176;
  private mode: SceneMode = 'exterior';
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys?: {
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
  };
  private standKey?: Phaser.Input.Keyboard.Key;
  private interactKey?: Phaser.Input.Keyboard.Key;
  private debugKey?: Phaser.Input.Keyboard.Key;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private background?: Phaser.GameObjects.Image;
  private bus?: Phaser.GameObjects.Image;
  private entryFareReader?: Phaser.GameObjects.Image;
  private exitFareReader?: Phaser.GameObjects.Image;
  private fareReader?: Phaser.GameObjects.Image;
  private driverBubble?: Phaser.GameObjects.Container;
  private carriedItemIcon?: Phaser.GameObjects.Image;
  private exteriorObjects: Phaser.GameObjects.GameObject[] = [];
  private collisionBodies: Phaser.GameObjects.Rectangle[] = [];
  private waitZone?: TiledObject;
  private stairZone?: TiledObject;
  private readerZone?: TiledObject;
  private exitReaderZone?: TiledObject;
  private exitZone?: TiledObject;
  private carriedItem?: FareItemKind;
  private lastContext: InteractionContext = 'walking';
  private busArriving = false;
  private busReady = false;
  private inputLocked = false;
  private fareTapped = false;
  private fareTappedOut = false;
  private tapOutExitWarning = false;
  private playerFacing: PlayerFacing = 'side';
  private atDestination = false;
  private tapInProgress = false;
  private busMoving = false;
  private busDoorsOpen = false;
  private busStopRequested = false;
  private currentBusStopIndex = -1;
  private busSeats: Phaser.GameObjects.Image[] = [];
  private seatedSeatIndex?: number;
  private railSeatZones: Phaser.GameObjects.Zone[] = [];
  private destinationArrivalPosition?: Phaser.Math.Vector2;
  private finalReminderVisible = false;
  private wrongStopExitInProgress = false;
  private warningCooldown = false;
  private handRaised = false;
  private busPassing = false;
  private busTween?: Phaser.Tweens.Tween;
  private railLeg?: RailLegId;
  private railMap?: Scene4MapData;
  private railObjects: Phaser.GameObjects.GameObject[] = [];
  private train?: Phaser.GameObjects.Image;
  private oppositeTrain?: Phaser.GameObjects.Image;
  private platformDoorLayer?: Phaser.GameObjects.Image;
  private selectedRailDirection?: string;
  private nelTrainsReady = false;
  private nelHarbourFrontCountdownMs = LIVE_SERVICE_MINUTE_MS * 2;
  private nelPunggolCoastCountdownMs = LIVE_SERVICE_MINUTE_MS * 4;
  private nelHarbourFrontBoardText?: Phaser.GameObjects.Text;
  private nelPunggolCoastBoardText?: Phaser.GameObjects.Text;
  private nelServiceClock?: Phaser.Time.TimerEvent;
  private nelHarbourFrontDepartureTimer?: Phaser.Time.TimerEvent;
  private dtlTrainsReady = false;
  private dtlExpoCountdownMs = LIVE_SERVICE_MINUTE_MS * 2;
  private dtlBukitPanjangCountdownMs = LIVE_SERVICE_MINUTE_MS * 4;
  private dtlExpoBoardText?: Phaser.GameObjects.Text;
  private dtlBukitPanjangBoardText?: Phaser.GameObjects.Text;
  private dtlServiceClock?: Phaser.Time.TimerEvent;
  private dtlExpoDepartureTimer?: Phaser.Time.TimerEvent;
  private stationStage?: StationStageId;
  private stationPortal?: TiledObject;
  private lrtGateTapped = false;
  private punggolGateTapped = false;
  private expoGateTapped = false;
  private escalatorRideStarted = false;
  private escalatorRideComplete = false;
  private escalatorMotionObjects: Phaser.GameObjects.Rectangle[] = [];
  private escalatorAnimationRuns = 0;
  private transitionStarted = false;
  private transitionAwaitingRelease = false;
  private transitionReleaseGuardUntil = 0;
  private railDoorsOpen = false;
  private journeyComplete = false;
  private railInteriorBackground?: Phaser.GameObjects.Image;
  private railInteriorDoorsOpen = false;
  private currentRailStopIndex = -1;
  private railTravelDirection: 1 | -1 = 1;
  private railStopAdvanceTimer?: Phaser.Time.TimerEvent;
  private dtlTerminalStaffTimer?: Phaser.Time.TimerEvent;
  private mrtStaff?: Phaser.GameObjects.Image;
  private mrtStaffBubble?: Phaser.GameObjects.Container;
  private mrtStaffTween?: Phaser.Tweens.Tween;
  private wrongRailStopInProgress = false;
  private wrongDirectionUntil = 0;
  private queuedInteraction = false;
  private railHearts = 3;
  private stationFareGateObjects: Phaser.GameObjects.GameObject[] = [];
  private stationFareGateVisuals: Phaser.GameObjects.Image[] = [];
  private stationFareGatePosts: Phaser.GameObjects.Image[] = [];
  private stationFareGateSpecs: StationFareGateSpec[] = [];
  private openedStationGateIndex?: number;
  private openedStationGateLaneX?: number;
  private openedStationGateEntryY?: number;
  private stationGateMessage?: Phaser.GameObjects.Text;
  private stationPortalCue?: Phaser.GameObjects.Container;
  private railDoorCue?: Phaser.GameObjects.Container;
  private reducedMotion = false;
  private debugGeometryVisible = false;
  private debugGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super('CommuteQuest');
  }

  preload() {
    this.load.json(
      EXTERIOR_MAP_KEY,
      '/scenes/scene4/maps/kadaloor-exterior.tmj',
    );
    this.load.json(
      INTERIOR_MAP_KEY,
      '/scenes/scene4/maps/service-50-interior.tmj',
    );
    this.load.json(RAIL_MAP_KEYS['kadaloor-lrt'], '/scenes/scene4/maps/kadaloor-lrt.tmj');
    this.load.json(RAIL_MAP_KEYS['punggol-nel'], '/scenes/scene4/maps/punggol-nel.tmj');
    this.load.json(RAIL_MAP_KEYS['little-india-dtl'], '/scenes/scene4/maps/little-india-dtl.tmj');
    this.load.image(
      RAIL_BACKGROUND_KEYS['kadaloor-lrt'],
      '/scenes/scene4/environments/kadaloor-lrt-platform.png',
    );
    this.load.image(
      RAIL_BACKGROUND_KEYS['punggol-nel'],
      '/scenes/scene4/environments/punggol-nel-platform-base.png',
    );
    this.load.image(
      RAIL_BACKGROUND_KEYS['little-india-dtl'],
      '/scenes/scene4/environments/little-india-dtl-platform-base.png',
    );
    this.load.image(
      PLATFORM_DOOR_KEYS['punggol-nel']!.closed,
      '/scenes/scene4/environments/punggol-nel-platform-doors-closed.png?v=20260907',
    );
    this.load.image(
      PLATFORM_DOOR_KEYS['punggol-nel']!.open,
      '/scenes/scene4/environments/punggol-nel-platform-doors-open.png?v=20260907',
    );
    this.load.image(
      PLATFORM_DOOR_KEYS['little-india-dtl']!.closed,
      '/scenes/scene4/environments/little-india-dtl-platform-doors-closed.png?v=20260907',
    );
    this.load.image(
      PLATFORM_DOOR_KEYS['little-india-dtl']!.open,
      '/scenes/scene4/environments/little-india-dtl-platform-doors-open.png?v=20260907',
    );
    Object.values(STATION_STAGES).forEach((stage) => {
      this.load.json(stage.map, `/scenes/scene4/maps/${stage.map.replace('scene4-', '').replace('-map', '')}.tmj`);
      this.load.image(stage.background, `/scenes/scene4/environments/${stage.image}`);
    });
    this.load.image(TRAIN_KEYS['kadaloor-lrt'], '/scenes/scene4/vehicles/punggol-lrt-train.png');
    this.load.image(TRAIN_KEYS['punggol-nel'], '/scenes/scene4/vehicles/nel-train.png');
    this.load.image(TRAIN_KEYS['little-india-dtl'], '/scenes/scene4/vehicles/dtl-train.png');
    this.load.image(TRAIN_OPEN_KEYS['kadaloor-lrt'], '/scenes/scene4/vehicles/punggol-lrt-train-doors-open.png');
    this.load.image(TRAIN_OPEN_KEYS['punggol-nel'], '/scenes/scene4/vehicles/nel-train-doors-open.png');
    this.load.image(TRAIN_OPEN_KEYS['little-india-dtl'], '/scenes/scene4/vehicles/dtl-train-doors-open.png');
    this.load.image(
      EXTERIOR_BACKGROUND_KEY,
      '/scenes/scene4/props/kadaloor-bus-stop-background.png',
    );
    this.load.image(SHELTER_KEY, '/scenes/scene4/props/kadaloor-shelter.png');
    this.load.image(BENCH_KEY, '/scenes/scene4/props/kadaloor-bench.png');
    this.load.image(BOLLARD_KEY, '/scenes/scene4/props/kadaloor-bollard.png');
    this.load.image(STOP_POLE_KEY, '/scenes/scene4/props/kadaloor-stop-pole.png');
    this.load.image(
      INTERIOR_BACKGROUND_KEY,
      '/scenes/scene4/props/bus-interior-entry.png',
    );
    this.load.image(
      INTERIOR_DOORS_CLOSED_KEY,
      '/scenes/scene4/props/bus-interior-doors-closed.png',
    );
    this.load.image(
      INTERIOR_DOORS_OPEN_KEY,
      '/scenes/scene4/props/bus-interior-doors-open.png',
    );
    this.load.image(
      INTERIOR_MOVING_KEY,
      '/scenes/scene4/props/bus-interior-moving.png',
    );
    this.load.image(
      BUS_SEAT_KEY,
      '/scenes/scene4/props/bus-seat.png',
    );
    this.load.image(
      STATION_GATE_OPEN_KEY,
      '/scenes/scene4/props/station-fare-gate-open.png',
    );
    this.load.image(
      PUNGGOL_GATE_READER_KEY,
      '/scenes/scene4/props/punggol-fare-gate-reader.png',
    );
    this.load.image(
      PUNGGOL_GATE_CLOSED_KEY,
      '/scenes/scene4/props/punggol-fare-gate-flaps-closed.png',
    );
    this.load.image(
      PUNGGOL_GATE_OPEN_KEY,
      '/scenes/scene4/props/punggol-fare-gate-flaps-open.png',
    );
    this.load.image(
      RAIL_INTERIOR_BACKGROUND_KEYS['kadaloor-lrt'],
      '/scenes/scene4/environments/punggol-lrt-train-interior.png',
    );
    this.load.image(
      RAIL_INTERIOR_BACKGROUND_KEYS['punggol-nel'],
      '/scenes/scene4/environments/nel-train-interior.png',
    );
    this.load.image(
      RAIL_INTERIOR_BACKGROUND_KEYS['little-india-dtl'],
      '/scenes/scene4/environments/dtl-train-interior.png',
    );
    this.load.image(
      RAIL_INTERIOR_OPEN_BACKGROUND_KEYS['kadaloor-lrt'],
      '/scenes/scene4/environments/punggol-lrt-train-interior-doors-open.png',
    );
    this.load.image(
      RAIL_INTERIOR_OPEN_BACKGROUND_KEYS['punggol-nel'],
      '/scenes/scene4/environments/nel-train-interior-doors-open.png',
    );
    this.load.image(
      RAIL_INTERIOR_OPEN_BACKGROUND_KEYS['little-india-dtl'],
      '/scenes/scene4/environments/dtl-train-interior-doors-open.png',
    );
    this.load.image(
      BUS_CLOSED_KEY,
      '/scenes/scene4/vehicles/service-50-doors-closed.png',
    );
    this.load.image(
      BUS_OPEN_KEY,
      '/scenes/scene4/vehicles/service-50-doors-open.png',
    );
    this.load.image(
      FARE_READER_KEY,
      '/scenes/scene4/props/bus-fare-reader.png',
    );
    this.load.image(
      TRAVEL_CARD_KEY,
      '/scenes/scene4/props/fare-item-travel-card.png',
    );
    this.load.image(
      UMBRELLA_KEY,
      '/scenes/scene4/props/fare-item-umbrella.png',
    );
    this.load.image(
      WATER_BOTTLE_KEY,
      '/scenes/scene4/props/fare-item-water-bottle.png',
    );
    this.load.spritesheet(
      PLAYER_KEY,
      '/scenes/scene4/characters/player-walk-right.png',
      { frameWidth: 512, frameHeight: 768 },
    );
    this.load.spritesheet(
      PLAYER_FRONT_KEY,
      '/scenes/scene4/characters/player-walk-front.png',
      { frameWidth: 512, frameHeight: 768 },
    );
    this.load.spritesheet(
      PLAYER_BACK_KEY,
      '/scenes/scene4/characters/player-walk-back.png',
      { frameWidth: 512, frameHeight: 768 },
    );
    this.load.image(
      PLAYER_SIT_KEY,
      '/scenes/scene4/characters/player-seated-front.png',
    );
    this.load.image(
      MRT_STAFF_KEY,
      '/scenes/scene4/characters/mrt-staff-walk-right.png',
    );
  }

  create() {
    this.resetJourneyState();
    const exteriorMap = this.cache.json.get(
      EXTERIOR_MAP_KEY,
    ) as Scene4MapData;
    const worldWidth = exteriorMap.width * exteriorMap.tilewidth;
    const worldHeight = exteriorMap.height * exteriorMap.tileheight;
    this.worldWidth = worldWidth;
    const spawn = objectByName(exteriorMap, 'Spawns', 'player-start');

    this.background = this.add
      .image(0, 0, EXTERIOR_BACKGROUND_KEY)
      .setOrigin(0, 0)
      .setDisplaySize(worldWidth, 724);
    this.exteriorObjects = this.createExteriorEnvironment();

    this.bus = this.add
      .image(2600, 716, BUS_CLOSED_KEY)
      .setOrigin(0.5, 1)
      .setDisplaySize(EXTERIOR_BUS_WIDTH, EXTERIOR_BUS_HEIGHT)
      .setDepth(650)
      .setVisible(false);

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor('#273341');

    if (!this.anims.exists('scene4-player-walk-right')) {
      this.anims.create({
        key: 'scene4-player-walk-right',
        frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists('scene4-player-walk-front')) {
      this.anims.create({
        key: 'scene4-player-walk-front',
        frames: this.anims.generateFrameNumbers(PLAYER_FRONT_KEY, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists('scene4-player-walk-back')) {
      this.anims.create({
        key: 'scene4-player-walk-back',
        frames: this.anims.generateFrameNumbers(PLAYER_BACK_KEY, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.player = this.physics.add
      .sprite(spawn?.x ?? 1750, spawn?.y ?? 550, PLAYER_KEY, 1)
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor('exterior'))
      .setCollideWorldBounds(true)
      .setDepth(20);

    this.playerShadow = this.add
      .ellipse(this.player.x, this.player.y + 2, 76, 18, 0x07131c, 0.24)
      .setDepth(19);

    this.player.body.setAllowGravity(false);
    // A small footbox keeps the character solid against prop bases while
    // preserving the walkable strip directly in front of the furniture.
    this.player.body.setSize(110, 54);
    this.player.body.setOffset(201, 690);

    this.createExteriorCollisions(exteriorMap);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.movementKeys = this.input.keyboard?.addKeys('W,A,S,D') as {
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      W: Phaser.Input.Keyboard.Key;
    };
    this.standKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    if (import.meta.env.DEV) {
      this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.G);
      this.debugGraphics = this.add.graphics().setDepth(999);
    }

    this.waitZone = objectByName(exteriorMap, 'Interactions', 'Wait inside bus stop');
    this.stairZone = objectByName(exteriorMap, 'Interactions', 'Exit B stair entry');
    this.cameras.main.setScroll(896, 24);
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute('aria-label', 'Scene 4 walkable commute game');

    this.game.events.on('commute:raise-hand', this.startBusArrival, this);
    this.game.events.on('commute:select-item', this.selectFareItem, this);
    this.game.events.on('commute:choose-direction', this.chooseDirection, this);
    this.game.events.on('commute:board-train', this.boardTrain, this);
    this.game.events.on('commute:request-bus-stop', this.requestBusStop, this);
    this.game.events.on('commute:nudge', this.nudgePlayer, this);
    this.game.events.on('commute:interact', this.activateNearestInteraction, this);
    this.game.events.on('commute:reduced-motion', this.setReducedMotion, this);
    this.events.once('shutdown', () => {
      this.game.events.off('commute:raise-hand', this.startBusArrival, this);
      this.game.events.off('commute:select-item', this.selectFareItem, this);
      this.game.events.off('commute:choose-direction', this.chooseDirection, this);
      this.game.events.off('commute:board-train', this.boardTrain, this);
      this.game.events.off('commute:request-bus-stop', this.requestBusStop, this);
      this.game.events.off('commute:nudge', this.nudgePlayer, this);
      this.game.events.off('commute:interact', this.activateNearestInteraction, this);
      this.game.events.off('commute:reduced-motion', this.setReducedMotion, this);
    });
    this.time.delayedCall(900, this.startPassingBus, [], this);
    this.game.events.emit('commute:ready');
  }

  private resetJourneyState() {
    this.clearDtlTerminalStaff();
    this.mode = 'exterior';
    this.lastContext = 'walking';
    this.inputLocked = false;
    this.carriedItem = undefined;
    this.carriedItemIcon = undefined;
    this.fareTapped = false;
    this.fareTappedOut = false;
    this.tapOutExitWarning = false;
    this.playerFacing = 'side';
    this.tapInProgress = false;
    this.busMoving = false;
    this.busDoorsOpen = false;
    this.busStopRequested = false;
    this.currentBusStopIndex = -1;
    this.busSeats = [];
    this.seatedSeatIndex = undefined;
    this.railSeatZones = [];
    this.atDestination = false;
    this.destinationArrivalPosition = undefined;
    this.finalReminderVisible = false;
    this.wrongStopExitInProgress = false;
    this.warningCooldown = false;
    this.handRaised = false;
    this.busPassing = false;
    this.busArriving = false;
    this.busReady = false;
    this.transitionStarted = false;
    this.stationStage = undefined;
    this.lrtGateTapped = false;
    this.punggolGateTapped = false;
    this.expoGateTapped = false;
    this.escalatorRideStarted = false;
    this.escalatorRideComplete = false;
    this.escalatorMotionObjects = [];
    this.escalatorAnimationRuns = 0;
    this.railDoorsOpen = false;
    this.railInteriorDoorsOpen = false;
    this.currentRailStopIndex = -1;
    this.railTravelDirection = 1;
    this.railStopAdvanceTimer?.remove(false);
    this.railStopAdvanceTimer = undefined;
    this.wrongRailStopInProgress = false;
    this.railHearts = 3;
    this.journeyComplete = false;
    this.entryFareReader = undefined;
    this.exitFareReader = undefined;
    this.fareReader = undefined;
    this.readerZone = undefined;
    this.exitReaderZone = undefined;
    this.exitZone = undefined;
    this.exteriorObjects = [];
    this.collisionBodies = [];
    this.railObjects = [];
    this.railInteriorBackground = undefined;
    this.stationFareGateObjects = [];
    this.stationFareGateVisuals = [];
    this.stationFareGatePosts = [];
    this.stationFareGateSpecs = [];
    this.openedStationGateIndex = undefined;
    this.openedStationGateLaneX = undefined;
    this.openedStationGateEntryY = undefined;
    this.stopNelServiceClock();
    this.stopDtlServiceClock();
    this.nelHarbourFrontBoardText = undefined;
    this.nelPunggolCoastBoardText = undefined;
    this.dtlExpoBoardText = undefined;
    this.dtlBukitPanjangBoardText = undefined;
    this.game.events.emit('commute:journey-reset');
    this.game.events.emit('commute:context', 'walking');
    this.game.events.emit('commute:bus-stop', '');
    this.game.events.emit('commute:bus-doors', false);
    this.game.events.emit('commute:bus-stop-requested', false);
    this.game.events.emit('commute:bus-dwell', undefined);
    this.game.events.emit('commute:rail-stop', undefined);
  }

  update() {
    if (!this.player || !this.cursors || !this.movementKeys) return;

    if (this.transitionAwaitingRelease) {
      const movementKeysDown = [
        this.cursors.left.isDown,
        this.cursors.right.isDown,
        this.cursors.up.isDown,
        this.cursors.down.isDown,
        this.movementKeys.A.isDown,
        this.movementKeys.D.isDown,
        this.movementKeys.W.isDown,
        this.movementKeys.S.isDown,
      ];
      if (canReleaseTransitionInput(this.time.now, this.transitionReleaseGuardUntil, movementKeysDown)) {
        this.transitionAwaitingRelease = false;
        this.transitionStarted = false;
        this.input.keyboard?.resetKeys();
        this.player.setVelocity(0, 0);
        this.inputLocked = false;
        if (this.queuedInteraction) {
          this.queuedInteraction = false;
          this.activateNearestInteraction();
        }
      }
    }

    const standRequested = Boolean(
      this.standKey && Phaser.Input.Keyboard.JustDown(this.standKey),
    );
    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey) && !this.inputLocked) {
      this.activateNearestInteraction();
    }
    if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.debugGeometryVisible = !this.debugGeometryVisible;
    }
    if (standRequested && !this.inputLocked && this.seatedSeatIndex !== undefined) {
      if (this.mode === 'bus-interior') this.standUpFromBusSeat();
      if (this.mode === 'rail-interior') this.standUpFromRailSeat();
    } else if (standRequested && !this.inputLocked) {
      this.sitInNearestAvailableSeat();
    }

    const left = this.cursors.left.isDown || this.movementKeys.A.isDown;
    const right = this.cursors.right.isDown || this.movementKeys.D.isDown;
    const up = this.cursors.up.isDown || this.movementKeys.W.isDown;
    const down = this.cursors.down.isDown || this.movementKeys.S.isDown;
    const directionX = this.inputLocked ? 0 : Number(right) - Number(left);
    const directionY = this.inputLocked ? 0 : Number(down) - Number(up);
    const movement = new Phaser.Math.Vector2(directionX, directionY);

    if (movement.lengthSq() > 0) {
      if (this.mode === 'bus-interior' && this.seatedSeatIndex !== undefined) {
        this.standUpFromBusSeat();
      }
      if (this.mode === 'rail-interior' && this.seatedSeatIndex !== undefined) {
        this.standUpFromRailSeat();
      }
      movement.normalize().scale(WALK_SPEED);
    }

    this.player.setVelocity(movement.x, movement.y);
    if (!(this.mode === 'rail-interior' && this.seatedSeatIndex !== undefined)) {
      this.constrainPlayerToWalkableFloor();
    }
    const targetScrollX = Phaser.Math.Clamp(
      this.player.x - this.cameras.main.width / 2,
      0,
      this.worldWidth - this.cameras.main.width,
    );
    this.cameras.main.scrollX = Phaser.Math.Linear(
      this.cameras.main.scrollX,
      targetScrollX,
      0.12,
    );
    this.cameras.main.scrollY = 24;
    this.playerShadow
      ?.setPosition(this.player.x, this.player.y + 3)
      .setDepth(Math.max(1, this.player.depth - 1))
      .setVisible(this.player.visible)
      .setAlpha(this.seatedSeatIndex === undefined ? 0.24 : 0.14);
    this.updateSeatAffordances();
    this.game.canvas.dataset.scene4Debug = JSON.stringify({
      backgroundHeight: this.background?.displayHeight,
      backgroundTexture: this.background?.texture.key,
      backgroundX: this.background?.x,
      backgroundY: this.background?.y,
      cameraX: Math.round(this.cameras.main.scrollX),
      cameraY: Math.round(this.cameras.main.scrollY),
      cameraViewport: {
        height: this.cameras.main.height,
        width: this.cameras.main.width,
        x: this.cameras.main.x,
        y: this.cameras.main.y,
        zoom: this.cameras.main.zoom,
      },
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      walkableFloorBounds: this.currentWalkableFloorBounds() ?? null,
      playerFacing: this.playerFacing,
      playerTexture: this.player.texture.key,
      carriedItem: this.carriedItem ?? null,
      carriedItemVisible: this.carriedItemIcon?.visible ?? false,
      fareReader: this.fareReader
        ? { x: Math.round(this.fareReader.x), y: Math.round(this.fareReader.y) }
        : null,
      fareReaders: {
        entry: this.entryFareReader
          ? {
              x: Math.round(this.entryFareReader.x),
              y: Math.round(this.entryFareReader.y),
              width: Math.round(this.entryFareReader.displayWidth),
              height: Math.round(this.entryFareReader.displayHeight),
              visible: this.entryFareReader.visible,
            }
          : null,
        exit: this.exitFareReader
          ? {
              x: Math.round(this.exitFareReader.x),
              y: Math.round(this.exitFareReader.y),
              width: Math.round(this.exitFareReader.displayWidth),
              height: Math.round(this.exitFareReader.displayHeight),
              visible: this.exitFareReader.visible,
            }
          : null,
      },
      busDoorsOpen: this.busDoorsOpen,
      busStopRequested: this.busStopRequested,
      currentBusStopIndex: this.currentBusStopIndex,
      seatedSeatIndex: this.seatedSeatIndex ?? null,
      busSeats: this.busSeats.map((seat, index) => ({
        index,
        x: Math.round(seat.x),
        y: Math.round(seat.y),
      })),
      railSeatedSeatIndex: this.mode === 'rail-interior' ? this.seatedSeatIndex ?? null : null,
      railSeats: this.railSeatZones.map((seat, index) => ({
        index,
        x: Math.round(seat.x),
        y: Math.round(seat.y),
      })),
      mode: this.mode,
      playerVisible: this.player.visible,
      railInteriorDoorsOpen: this.railInteriorDoorsOpen,
      reducedMotion: this.reducedMotion,
      currentRailStopIndex: this.currentRailStopIndex,
      fareGateReaders: this.stationFareGateSpecs.map((gate, index) => ({
        entry: gate.entry,
        index,
        x: gate.readerX,
        y: gate.readerY,
      })),
      fareGateVisuals: this.stationFareGateVisuals.map((gate, index) => ({
        index,
        x: Math.round(gate.x),
        y: Math.round(gate.y),
        width: Math.round(gate.displayWidth),
        height: Math.round(gate.displayHeight),
        texture: gate.texture.key,
      })),
      fareGatePosts: this.stationFareGatePosts.map((post) => ({
        x: Math.round(post.x),
        y: Math.round(post.y),
        width: Math.round(post.displayWidth),
        height: Math.round(post.displayHeight),
      })),
      openedFareGate: this.openedStationGateIndex ?? null,
      openedFareGateLaneX: this.openedStationGateLaneX ?? null,
      escalatorRideStarted: this.escalatorRideStarted,
      escalatorMotionCount: this.escalatorMotionObjects.filter((object) => object.active).length,
      escalatorAnimationRuns: this.escalatorAnimationRuns,
      nelLiveBoard: this.railLeg === 'punggol-nel'
        ? {
            harbourFrontMs: this.nelHarbourFrontCountdownMs,
            punggolCoastMs: this.nelPunggolCoastCountdownMs,
            harbourFrontText: this.nelHarbourFrontBoardText?.text ?? null,
            punggolCoastText: this.nelPunggolCoastBoardText?.text ?? null,
          }
        : null,
      railLayering: {
        train: this.train
          ? {
              depth: this.train.depth,
              masked: Boolean(this.train.mask),
              texture: this.train.texture.key,
              trackMaskBounds: this.train.getData('trackMaskBounds') ?? null,
            }
          : null,
        platformDoors: this.platformDoorLayer
          ? {
              depth: this.platformDoorLayer.depth,
              texture: this.platformDoorLayer.texture.key,
            }
          : null,
      },
    });

    if (this.seatedSeatIndex !== undefined) {
      // Keep the dedicated seated artwork active while no movement input has
      // asked the player to stand. The generic idle branch below otherwise
      // replaces it with the front-facing walk frame every render tick.
      this.player.anims.stop();
      if (this.player.texture.key !== PLAYER_SIT_KEY) {
        this.player.setTexture(PLAYER_SIT_KEY);
      }
    } else if (movement.lengthSq() > 0) {
      if (directionY < 0) {
        this.playerFacing = 'back';
        this.player.setFlipX(false).anims.play('scene4-player-walk-back', true);
      } else if (directionY > 0) {
        this.playerFacing = 'front';
        this.player.setFlipX(false).anims.play('scene4-player-walk-front', true);
      } else {
        this.playerFacing = 'side';
        this.player.setFlipX(directionX < 0).anims.play('scene4-player-walk-right', true);
      }
    } else {
      this.player.anims.stop();
      const idleTexture = this.playerFacing === 'front'
        ? PLAYER_FRONT_KEY
        : this.playerFacing === 'back'
          ? PLAYER_BACK_KEY
          : PLAYER_KEY;
      // Avoid resetting the same texture on every render tick. Repeated
      // setTexture calls cause a visible flash after changing from the
      // differently-sized seated sprite back to the walk sheet.
      if (this.player.texture.key !== idleTexture) {
        this.player.setTexture(idleTexture, 1);
      }
    }

    if (this.mode === 'bus-interior') {
      this.updateBusInterior();
      return;
    }

    if (this.mode === 'rail') {
      this.updateRail();
      return;
    }
    if (this.mode === 'rail-interior') {
      this.updateRailInterior();
      return;
    }
    if (this.mode === 'station') {
      this.updateStation();
      return;
    }

    // Shelter furniture remains in front of the character at the rear of the
    // pavement. At the curb the character comes forward, but the bus always
    // remains the topmost physical object.
    this.player.setDepth(this.player.y >= 520 ? 600 : 20);

    if (containsPoint(this.stairZone, this.player.x, this.player.y) && !this.transitionStarted) {
      this.transitionStarted = true;
      this.inputLocked = true;
      this.setContext('stairs');
      this.time.delayedCall(260, () => this.enterStationStage('kadaloor-lrt-concourse'));
      return;
    }

    const nextContext: InteractionContext = this.busReady
      ? 'boarding'
      : this.busArriving
        ? 'bus-arriving'
        : containsPoint(this.waitZone, this.player.x, this.player.y)
            ? 'bus-stop'
            : 'walking';

    this.setContext(nextContext);
  }

  private updateBusInterior() {
    if (!this.player) return;

    this.carriedItemIcon?.setPosition(
      this.player.x +
        (this.player.flipX ? -CARRIED_ITEM_X_OFFSET : CARRIED_ITEM_X_OFFSET),
      this.player.y - CARRIED_ITEM_Y_OFFSET,
    );

    // The player can walk throughout the journey. Reader and door interactions
    // become available whenever the bus is stationary with its doors open.
    if (this.busMoving && !this.busDoorsOpen) return;
    if (this.lastContext === 'alighting') return;
    if (this.wrongStopExitInProgress) return;

    // The tap tween owns the interaction state until its accepted-card
    // response has been shown; normal proximity checks resume afterwards.
    if (this.tapInProgress) return;

    const exitBoundary = (this.exitZone?.x ?? this.player.x) - 12;
    const playerAtOpenExit =
      this.busDoorsOpen &&
      containsPoint(this.exitZone, this.player.x, this.player.y);

    if (!this.fareTappedOut && this.busDoorsOpen) {
      if (playerAtOpenExit) {
        this.tapOutExitWarning = true;
        this.player.x = Math.min(this.player.x, exitBoundary);
        this.player.setVelocityX(0);
      } else if (this.tapOutExitWarning && this.player.x < exitBoundary - 90) {
        this.tapOutExitWarning = false;
      }
      if (this.tapOutExitWarning) {
        this.setContext('tap-out-warning');
        return;
      }
    }

    if (
      this.fareTappedOut &&
      playerAtOpenExit
    ) {
      if (this.atDestination) {
        this.inputLocked = true;
        this.player.setVelocity(0, 0);
        this.setContext('alighting');
        this.time.delayedCall(650, () => this.enterStationStage('punggol-interchange'));
      } else {
        this.exitBusAtWrongStop();
      }
      return;
    }

    if (this.atDestination) {
      if (
        this.finalReminderVisible &&
        this.destinationArrivalPosition &&
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.destinationArrivalPosition.x,
          this.destinationArrivalPosition.y,
        ) > 12
      ) {
        this.finalReminderVisible = false;
      }
      this.setContext(
        this.fareTappedOut
          ? 'exit-ok'
          : this.finalReminderVisible
            ? 'last-stop-reminder'
            : this.carriedItem
              ? 'exit-item-selected'
              : 'choose-exit-item',
      );
      return;
    }

    const readerWarningBoundary = this.readerZone
      ? this.readerZone.x + (this.readerZone.width ?? 0) + 30
      : 1060;
    if (!this.fareTapped && this.player.x > readerWarningBoundary) {
      this.player.x = readerWarningBoundary;
      this.player.setVelocityX(0);
      if (this.carriedItem && this.carriedItem !== 'travel-card') {
        this.rejectFareAttempt();
      } else {
        this.showDriverWarning('Eh boy, tap in lah!');
        this.setContext(this.driverBubble ? 'driver-warning' : this.carriedItem ? 'item-selected' : 'choose-item');
      }
      return;
    }

    this.setContext(
      this.fareTappedOut
        ? 'exit-ok'
        : this.fareTapped
          ? this.busDoorsOpen
          ? 'bus-stop-open'
          : this.seatedSeatIndex !== undefined
            ? 'bus-moving'
            : 'aisle'
        : this.carriedItem
          ? 'item-selected'
          : 'choose-item',
    );
  }

  private setContext(nextContext: InteractionContext) {
    if (nextContext === this.lastContext) return;
    this.lastContext = nextContext;
    this.game.events.emit('commute:context', nextContext);
  }

  private startBusArrival() {
    if (this.mode !== 'exterior' || this.busReady || !this.bus) return;
    this.handRaised = true;
    this.setContext('bus-arriving');

    // A bus that has not yet passed the stop responds immediately. If it is
    // already gone, the raised hand remains remembered and the next bus stops.
    if (this.busPassing && this.bus.x > 1460) {
      this.routeCurrentBusToStop();
    } else if (!this.busPassing) {
      this.startPassingBus();
    }
  }

  private startPassingBus() {
    if (this.mode !== 'exterior' || this.busReady || this.busPassing || !this.bus) {
      return;
    }

    this.busPassing = true;
    this.bus
      .setTexture(BUS_CLOSED_KEY)
      .setPosition(2600, 716)
      .setVisible(true);

    if (this.handRaised) {
      this.routeCurrentBusToStop();
      return;
    }

    this.busTween = this.tweens.add({
      targets: this.bus,
      x: -520,
      duration: 6800,
      ease: 'Linear',
      onComplete: () => {
        this.busPassing = false;
        this.bus?.setVisible(false);
        if (this.mode === 'exterior' && !this.busReady) {
          this.time.delayedCall(1200, this.startPassingBus, [], this);
        }
      },
    });
  }

  private routeCurrentBusToStop() {
    if (!this.bus || this.mode !== 'exterior') return;
    this.busTween?.stop();
    this.busArriving = true;
    this.busPassing = true;
    const distance = Math.max(0, this.bus.x - 1460);

    this.busTween = this.tweens.add({
      targets: this.bus,
      x: 1460,
      duration: Phaser.Math.Clamp(distance * 1.8, 650, 2500),
      ease: 'Cubic.Out',
      onComplete: () => {
        this.busArriving = false;
        this.busPassing = false;
        this.busReady = true;
        this.bus?.setTexture(BUS_OPEN_KEY);
        this.setContext('boarding');
        // The open front door faces the shelter. Boarding is an immediate
        // transition so the player can never climb over or clip through bus art.
        this.inputLocked = true;
        this.player?.setVelocity(0, 0);
        this.time.delayedCall(700, this.enterBusInterior, [], this);
      },
    });
  }

  private enterBusInterior() {
    if (!this.player || this.mode !== 'exterior') return;

    this.mode = 'bus-interior';
    this.game.events.emit('commute:branch', 'bus');
    this.beginStageTransition();
    this.player.setVelocity(0, 0).setVisible(false);
    this.cameras.main.fadeOut(220, 20, 30, 42);

    this.time.delayedCall(240, () => {
      const interiorMap = this.cache.json.get(
        INTERIOR_MAP_KEY,
      ) as Scene4MapData;
      const spawn = objectByName(interiorMap, 'Spawns', 'from-front-door');

      this.background?.setTexture(INTERIOR_BACKGROUND_KEY);
      this.createBusSeats();
      this.busDoorsOpen = false;
      this.bus?.setVisible(false);
      this.exteriorObjects.forEach((object) => object.destroy());
      this.exteriorObjects = [];
      this.collisionBodies.forEach((object) => object.destroy());
      this.collisionBodies = [];

      this.readerZone = objectByName(
        interiorMap,
        'Interactions',
        'SimplyGo entry reader',
      );
      this.exitReaderZone = objectByName(
        interiorMap,
        'Interactions',
        'SimplyGo exit reader',
      );
      this.exitZone = objectByName(interiorMap, 'Interactions', 'Exit door destination');
      const entryReaderX = Number(propertyValue(this.readerZone, 'mountedReaderX') ?? 720);
      const entryReaderY = Number(propertyValue(this.readerZone, 'mountedReaderY') ?? 260);
      const exitReaderX = Number(propertyValue(this.exitReaderZone, 'mountedReaderX') ?? 1760);
      const exitReaderY = Number(propertyValue(this.exitReaderZone, 'mountedReaderY') ?? 370);
      this.entryFareReader = this.add
        .image(entryReaderX, entryReaderY, FARE_READER_KEY)
        .setOrigin(0.5, 0)
        .setDisplaySize(78, 118)
        .setDepth(FARE_READER_MOUNT_DEPTH)
        .setInteractive({ useHandCursor: true });
      this.exitFareReader = this.add
        .image(exitReaderX, exitReaderY, FARE_READER_KEY)
        .setOrigin(0.5, 0)
        .setDisplaySize(78, 118)
        .setDepth(FARE_READER_MOUNT_DEPTH)
        .setInteractive({ useHandCursor: true });
      this.entryFareReader.on('pointerdown', () => {
        if (this.entryFareReader) this.handleBusFareReaderClick(this.entryFareReader);
      });
      this.exitFareReader.on('pointerdown', () => {
        if (this.exitFareReader) this.handleBusFareReaderClick(this.exitFareReader);
      });
      this.fareReader = this.entryFareReader;

      this.resetPlayerToWalkingPose('bus-standing');
      this.player
        ?.setPosition(spawn?.x ?? 340, spawn?.y ?? 670)
        .setScale(playerScaleFor('bus-standing'))
        .setDepth(20)
        .setFlipX(false)
        .setVisible(true);
      this.cameras.main.setScroll(0, 24);
      this.armStageInputRelease();
      this.cameras.main.fadeIn(260, 20, 30, 42);
      this.setContext('choose-item');
    });
  }

  private selectFareItem(kind: FareItemKind) {
    const choosingEntryItem = !this.fareTapped;
    const choosingExitItem = this.fareTapped && this.atDestination && this.busDoorsOpen && !this.fareTappedOut;
    if (
      this.mode !== 'bus-interior' ||
      this.tapInProgress ||
      (!choosingEntryItem && !choosingExitItem)
    ) {
      return;
    }
    this.carriedItem = kind;
    this.carriedItemIcon?.destroy();
    const key =
      kind === 'travel-card'
        ? TRAVEL_CARD_KEY
        : kind === 'umbrella'
          ? UMBRELLA_KEY
          : WATER_BOTTLE_KEY;
    this.carriedItemIcon = this.add
      .image(
        this.player?.x ?? 0,
        (this.player?.y ?? 0) - CARRIED_ITEM_Y_OFFSET,
        key,
      )
      .setDepth(45);
    if (kind === 'travel-card') {
      this.carriedItemIcon.setDisplaySize(48 * ITEM_SCALE, 32 * ITEM_SCALE);
    } else if (kind === 'umbrella') {
      this.carriedItemIcon.setDisplaySize(34 * ITEM_SCALE, 76 * ITEM_SCALE);
    } else {
      this.carriedItemIcon.setDisplaySize(36 * ITEM_SCALE, 72 * ITEM_SCALE);
    }
    if (choosingExitItem) {
      this.finalReminderVisible = false;
      this.tapOutExitWarning = false;
    }
    this.setContext(choosingExitItem ? 'exit-item-selected' : 'item-selected');
  }

  private rejectFareAttempt() {
    if (this.warningCooldown) return;
    this.fareReader?.setTint(0xff8f9d);
    if (this.fareTapped) {
      this.setContext('choose-exit-item');
      this.showStationGateMessage(
        'Pick the travel card from your backpack first',
        this.fareReader?.x ?? 1760,
        (this.fareReader?.y ?? 370) - 35,
      );
      return;
    }
    this.setContext(this.carriedItem ? 'wrong-item' : 'driver-warning');
    this.showDriverWarning('Eh boy, tap in lah!');
  }

  private showDriverWarning(message: string) {
    if (this.warningCooldown) return;
    this.warningCooldown = true;
    this.driverBubble?.destroy();

    const bubble = this.add.container(720, 118).setDepth(80);
    const panel = this.add
      .rectangle(0, 0, 210, 58, 0x13243b, 0.96)
      .setStrokeStyle(3, 0xffffff);
    const text = this.add
      .text(0, 0, 'Driver: “' + message + '”', {
        align: 'center',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        wordWrap: { width: 190 },
      })
      .setOrigin(0.5);
    bubble.add([panel, text]);
    this.driverBubble = bubble;

    this.time.delayedCall(5000, () => {
      bubble.destroy();
      if (this.driverBubble === bubble) this.driverBubble = undefined;
      if (!this.fareTapped && !this.tapInProgress) {
        this.fareReader?.clearTint();
        this.setContext(this.carriedItem ? 'item-selected' : 'choose-item');
      }
      this.time.delayedCall(5000, () => {
        this.warningCooldown = false;
      });
    });
  }

  private handleBusFareReaderClick(reader: Phaser.GameObjects.Image) {
    if (!this.player || this.mode !== 'bus-interior' || this.tapInProgress) return;
    this.fareReader = reader;
    if (Math.abs(this.player.x - reader.x) > 190) {
      this.showStationGateMessage('Walk beside the reader before tapping', reader.x, reader.y - 35);
      return;
    }
    if (this.carriedItem !== 'travel-card') {
      this.rejectFareAttempt();
      return;
    }
    if (!this.fareTapped) {
      this.beginFareTap(reader);
      return;
    }
    if (this.fareTappedOut) return;
    if (!this.busDoorsOpen) {
      this.showStationGateMessage('Tap out when the bus doors are open', reader.x, reader.y - 35);
      return;
    }
    this.beginFareTapOut(reader);
  }

  private beginFareTap(reader: Phaser.GameObjects.Image) {
    if (!this.player || this.tapInProgress) return;

    this.tapInProgress = true;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('tapping');

    this.animateBusCardTap(reader, () => {
        reader.setTint(0x9dffca);
        this.cameraFlash(120, 92, 255, 190);
        this.setContext('fare-success');

        this.time.delayedCall(650, () => {
          this.tapInProgress = false;
          this.fareTapped = true;
          this.storeFareItemInBackpack();
          this.inputLocked = false;
          this.setContext('aisle');
          // Departure is driven by a successful fare tap, not by whether the
          // passenger chooses to sit. Seats remain clickable during the ride.
          this.time.delayedCall(500, () => {
            if (this.mode === 'bus-interior' && !this.busMoving) {
              this.startBusJourney();
            }
          });
        });
    });
  }

  private createBusSeats() {
    this.busSeats.forEach((seat) => seat.destroy());
    const interiorMap = this.cache.json.get(INTERIOR_MAP_KEY) as Scene4MapData;
    const authoredAnchors = interiorMap.layers.find((layer) => layer.name === 'Seats')?.objects ?? [];
    const anchors = authoredAnchors.length > 0
      ? authoredAnchors
      : BUS_SEAT_FALLBACK_POSITIONS.map((x, index) => ({
          id: index,
          name: `Bus seat ${index + 1}`,
          x,
          y: 405,
          properties: [
            { name: 'footFloorY', value: 635 },
            { name: 'seatBottomY', value: BUS_SEAT_FALLBACK_BOTTOM_Y },
          ],
        }));
    this.busSeats = anchors.map((anchor, index) => {
      const footFloorY = Number(propertyValue(anchor, 'footFloorY') ?? 635);
      const seatBottomY = Number(
        propertyValue(anchor, 'seatBottomY') ?? BUS_SEAT_FALLBACK_BOTTOM_Y,
      );
      const seat = this.add
        .image(anchor.x, seatBottomY, BUS_SEAT_KEY)
        .setOrigin(0.5, 1)
        .setDisplaySize(96, 205)
        .setDepth(18)
        .setInteractive({ useHandCursor: true });
      seat.setData('seatIndex', index);
      seat.setData('playerX', anchor.x);
      seat.setData('hipY', anchor.y);
      seat.setData('footFloorY', footFloorY);
      seat.setData('hovered', false);
      seat.on('pointerover', () => seat.setData('hovered', true).setTint(0xffd7a3));
      seat.on('pointerout', () => seat.setData('hovered', false));
      seat.on('pointerdown', () => this.sitInBusSeat(index));
      return seat;
    });
  }

  private sitInBusSeat(index: number) {
    const seat = this.busSeats[index];
    if (!this.player || !seat || this.mode !== 'bus-interior' || this.tapInProgress) return;
    if (this.seatedSeatIndex !== undefined || seat.getData('occupied')) return;
    if (!this.fareTapped) {
      this.showStationGateMessage('Tap in before taking a seat', seat.x, seat.y - 220);
      return;
    }

    this.inputLocked = true;
    this.seatedSeatIndex = index;
    this.playerFacing = 'front';
    seat.setData('occupied', true).disableInteractive().setTint(0x8f9aa3);
    const playerX = Number(seat.getData('playerX') ?? seat.x);
    const footFloorY = Number(seat.getData('footFloorY') ?? 635);
    this.player
      .setVelocity(0, 0)
      .setTexture(PLAYER_KEY, 1)
      .setFlipX(playerX < this.player.x)
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor('bus-standing'))
      .setCrop()
      .setDepth(20)
      .anims.play('scene4-player-walk-right', true);
    this.tweens.add({
      targets: this.player,
      x: playerX,
      y: 660,
      duration: Phaser.Math.Clamp(Math.abs(playerX - this.player.x) * 1.2, 260, 620),
      ease: 'Cubic.Out',
      onComplete: () => {
        if (this.mode !== 'bus-interior') return;
        this.player?.anims.stop();
        this.player?.setTexture(PLAYER_SIT_KEY)
          .setFlipX(false)
          .setOrigin(PLAYER_ANCHORS.seatedFeet.x, PLAYER_ANCHORS.seatedFeet.y)
          .setScale(playerScaleFor('bus-seated'))
          .setDepth(19);
        this.setContext('seated');
        this.tweens.add({
          targets: this.player,
          y: footFloorY,
          duration: 180,
          ease: 'Sine.Out',
          onComplete: () => {
            if (this.mode !== 'bus-interior') return;
            this.inputLocked = false;
            if (this.busMoving) this.setContext('bus-moving');
            else this.time.delayedCall(500, this.startBusJourney, [], this);
          },
        });
      },
    });
    this.drawDebugGeometry();
  }

  private sitInNearestAvailableSeat() {
    if (!this.player || this.seatedSeatIndex !== undefined) return;
    if (this.mode === 'bus-interior') {
      const index = this.nearestAvailableSeatIndex(this.busSeats);
      if (index !== undefined) this.sitInBusSeat(index);
    }
    if (this.mode === 'rail-interior') {
      const index = this.nearestAvailableSeatIndex(this.railSeatZones);
      if (index !== undefined) this.sitInRailSeat(index);
    }
  }

  private nearestAvailableSeatIndex(seats: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Zone>) {
    if (!this.player) return undefined;
    return nearestAvailableSeatIndex(seats, this.player.x, {
      isOccupied: (seat) => Boolean(seat.getData('occupied')),
      playerX: (seat) => Number(seat.getData('playerX') ?? seat.x),
    });
  }

  private updateSeatAffordances() {
    if (!this.player || this.seatedSeatIndex !== undefined) return;
    if (this.mode === 'bus-interior') {
      const nearest = this.nearestAvailableSeatIndex(this.busSeats);
      this.busSeats.forEach((seat, index) => {
        if (!seat.getData('occupied')) {
          if (index === nearest) seat.setTint(0xffd166);
          else if (!seat.getData('hovered')) seat.clearTint();
        }
      });
    }
    if (this.mode === 'rail-interior') {
      const nearest = this.nearestAvailableSeatIndex(this.railSeatZones);
      this.railSeatZones.forEach((seat, index) => {
        if (seat.getData('occupied')) return;
        const highlight = seat.getData('highlight') as Phaser.GameObjects.Rectangle | undefined;
        highlight?.setAlpha(seat.getData('hovered') ? 0.22 : index === nearest ? 0.16 : 0.07);
      });
    }
  }

  private standUpFromBusSeat() {
    if (!this.player || this.seatedSeatIndex === undefined) return;
    const seat = this.busSeats[this.seatedSeatIndex];
    const seatX = Number(seat?.getData('playerX') ?? seat?.x ?? this.player.x);
    this.tweens.killTweensOf(this.player);
    seat?.setData('occupied', false).clearTint().setInteractive({ useHandCursor: true });
    this.seatedSeatIndex = undefined;
    this.inputLocked = true;
    this.player
      .setCrop()
      .setTexture(PLAYER_FRONT_KEY, 1)
      // Every walking texture is feet-anchored. Keeping that anchor here is
      // important because the Arcade body uses a footbox offset authored for
      // origin (0.5, 1); a centred origin places the body below the world and
      // makes world-bounds correction fight movement every frame.
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor('bus-standing'))
      .setDepth(20)
      .setPosition(seatX, this.player.y);
    this.tweens.add({
      targets: this.player,
      y: 660,
      duration: 180,
      ease: 'Sine.Out',
      onComplete: () => {
        if (this.mode === 'bus-interior') this.inputLocked = false;
      },
    });
  }

  private destroyBusSeats() {
    this.busSeats.forEach((seat) => seat.destroy());
    this.busSeats = [];
    this.seatedSeatIndex = undefined;
  }

  private createRailSeats() {
    this.destroyRailSeats();
    if (!this.railLeg) return;
    this.railSeatZones = RAIL_SEAT_ANCHORS[this.railLeg].map((anchor, index) => {
      const highlight = this.add
        .rectangle(anchor.x, anchor.hipY, 74, 128, 0xf7b928, 0.07)
        .setStrokeStyle(2, 0xf7b928, 0.5)
        .setDepth(18);
      this.railObjects.push(highlight);
      const seatZone = this.add
        .zone(anchor.x, anchor.hipY, 76, 140)
        .setInteractive({ useHandCursor: true });
      seatZone.setData('seatIndex', index);
      seatZone.setData('playerX', anchor.x);
      seatZone.setData('footFloorY', anchor.footFloorY);
      seatZone.setData('scaleProfile', anchor.scaleProfile);
      seatZone.setData('highlight', highlight);
      seatZone.setData('occupied', false);
      seatZone.setData('hovered', false);
      seatZone.on('pointerover', () => {
        seatZone.setData('hovered', true);
        if (!seatZone.getData('occupied')) highlight.setAlpha(0.22);
      });
      seatZone.on('pointerout', () => {
        seatZone.setData('hovered', false);
        if (!seatZone.getData('occupied')) highlight.setAlpha(0.07);
      });
      seatZone.on('pointerdown', () => this.sitInRailSeat(index));
      return seatZone;
    });
  }

  private sitInRailSeat(index: number) {
    const seat = this.railSeatZones[index];
    if (!this.player || !seat || this.mode !== 'rail-interior' || this.wrongRailStopInProgress) return;
    if (this.seatedSeatIndex !== undefined || seat.getData('occupied')) return;
    this.inputLocked = true;
    this.seatedSeatIndex = index;
    this.playerFacing = 'front';
    const highlight = seat.getData('highlight') as Phaser.GameObjects.Rectangle | undefined;
    seat.setData('occupied', true).disableInteractive();
    highlight?.setFillStyle(0x69737a, 0.24).setStrokeStyle(2, 0xaeb7bd, 0.8);
    const playerX = Number(seat.getData('playerX') ?? seat.x);
    const footFloorY = Number(seat.getData('footFloorY') ?? 560);
    this.player
      .setVelocity(0, 0)
      .setTexture(PLAYER_KEY, 1)
      .setFlipX(playerX < this.player.x)
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor('rail-standing'))
      .setCrop()
      .setDepth(60)
      .anims.play('scene4-player-walk-right', true);
    this.tweens.add({
      targets: this.player,
      x: playerX,
      y: 660,
      duration: Phaser.Math.Clamp(Math.abs(playerX - this.player.x) * 1.2, 260, 620),
      ease: 'Cubic.Out',
      onComplete: () => {
        if (this.mode !== 'rail-interior') return;
        this.player?.anims.stop();
        this.player?.setTexture(PLAYER_SIT_KEY)
          .setFlipX(false)
          .setOrigin(PLAYER_ANCHORS.seatedFeet.x, PLAYER_ANCHORS.seatedFeet.y)
          .setScale(playerScaleFor('rail-seated'))
          .setDepth(20);
        this.tweens.add({
          targets: this.player,
          y: footFloorY,
          duration: 180,
          ease: 'Sine.Out',
          onComplete: () => {
            if (this.mode === 'rail-interior') this.inputLocked = false;
          },
        });
      },
    });
  }

  private standUpFromRailSeat() {
    if (!this.player || this.seatedSeatIndex === undefined) return;
    const seat = this.railSeatZones[this.seatedSeatIndex];
    const seatX = Number(seat?.getData('playerX') ?? seat?.x ?? this.player.x);
    const highlight = seat?.getData('highlight') as Phaser.GameObjects.Rectangle | undefined;
    this.tweens.killTweensOf(this.player);
    seat?.setData('occupied', false).setInteractive({ useHandCursor: true });
    highlight?.setFillStyle(0xf7b928, 0.07).setStrokeStyle(2, 0xf7b928, 0.5);
    this.seatedSeatIndex = undefined;
    this.inputLocked = true;
    this.player
      .setCrop()
      .setTexture(PLAYER_FRONT_KEY, 1)
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor('rail-standing'))
      .setDepth(60)
      .setPosition(seatX, this.player.y);
    this.tweens.add({
      targets: this.player,
      y: 660,
      duration: 180,
      ease: 'Sine.Out',
      onComplete: () => {
        if (this.mode === 'rail-interior') this.inputLocked = false;
      },
    });
  }

  private destroyRailSeats() {
    this.railSeatZones.forEach((seat) => seat.destroy());
    this.railSeatZones = [];
    this.seatedSeatIndex = undefined;
  }

  private beginFareTapOut(reader: Phaser.GameObjects.Image) {
    if (!this.player || this.tapInProgress) return;
    this.tapInProgress = true;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('tap-out');
    this.animateBusCardTap(reader, () => {
        reader.setTint(0x9dffca);
        this.cameraFlash(120, 92, 255, 190);
        this.setContext('exit-ok');
        this.time.delayedCall(450, () => {
          this.tapInProgress = false;
          this.fareTappedOut = true;
          this.tapOutExitWarning = false;
          this.storeFareItemInBackpack();
          this.inputLocked = false;
          if (!this.atDestination) this.busMoving = false;
        });
    });
  }

  private animateBusCardTap(reader: Phaser.GameObjects.Image, onComplete: () => void) {
    this.carriedItemIcon?.setVisible(false);
    const tapCard = this.add.image(
      reader.x - 34,
      reader.y + reader.displayHeight * 0.68,
      TRAVEL_CARD_KEY,
    )
      .setDisplaySize(54, 36)
      .setDepth(FARE_READER_MOUNT_DEPTH + 2)
      .setRotation(-0.12);
    this.tweens.add({
      targets: tapCard,
      x: reader.x - 5,
      duration: 180,
      ease: 'Sine.Out',
      onComplete: () => {
        this.time.delayedCall(110, () => {
          tapCard.destroy();
          this.carriedItemIcon?.setVisible(true);
          onComplete();
        });
      },
    });
  }

  private storeFareItemInBackpack() {
    this.carriedItem = undefined;
    this.carriedItemIcon?.destroy();
    this.carriedItemIcon = undefined;
    this.game.events.emit('commute:fare-item-stored');
  }

  private exitBusAtWrongStop() {
    if (!this.player || this.wrongStopExitInProgress) return;
    this.wrongStopExitInProgress = true;
    this.busMoving = false;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('wrong-stop');
    this.game.events.emit('commute:bus-dwell', undefined);
    this.time.delayedCall(2400, () => this.scene.restart());
  }

  private startBusJourney() {
    if (!this.player || this.busMoving) return;
    this.busMoving = true;
    this.busStopRequested = false;
    this.currentBusStopIndex = -1;
    this.inputLocked = false;
    this.player.setVelocity(0, 0).setVisible(true);
    this.player.anims.stop();
    this.setBusInteriorDoors(false);
    this.setContext('bus-moving');
    this.game.events.emit('commute:bus-stop', 'Departing Kadaloor Stn Exit B');
    this.game.events.emit('commute:bus-stop-requested', false);
    this.game.events.emit('commute:bus-dwell', undefined);
    this.cameraShake(350, 0.0025);
    this.travelToBusStop(0);
  }

  private requestBusStop() {
    if (
      this.mode !== 'bus-interior' ||
      !this.busMoving ||
      this.busDoorsOpen ||
      this.busStopRequested
    ) return;
    this.busStopRequested = true;
    this.game.events.emit('commute:bus-stop-requested', true);
    this.cameraFlash(90, 255, 190, 80);
  }

  private travelToBusStop(index: number) {
    if (this.mode !== 'bus-interior' || !this.busMoving) return;
    this.currentBusStopIndex = index;
    this.setBusInteriorMoving();
    this.game.events.emit('commute:bus-dwell', undefined);
    this.game.events.emit('commute:bus-stop', `Next stop · ${BUS_ROUTE_STOPS[index]}`);
    this.cameraShake(180, 0.0012);
    this.time.delayedCall(BUS_TRAVEL_BETWEEN_STOPS_MS, () => this.arriveAtBusStop(index));
  }

  private arriveAtBusStop(index: number) {
    if (this.mode !== 'bus-interior' || !this.busMoving) return;
    const isDestination = index === BUS_ROUTE_STOPS.length - 1;
    const wasRequested = this.busStopRequested;
    this.busStopRequested = false;
    this.game.events.emit('commute:bus-stop-requested', false);
    this.game.events.emit('commute:bus-stop', BUS_ROUTE_STOPS[index]);
    this.cameraShake(240, 0.0018);

    if (isDestination) {
      this.setBusInteriorDoors(true);
      this.finishBusJourneyAtPunggol();
      return;
    }

    this.setBusInteriorDoors(true);
    const dwellMs = wasRequested ? BUS_REQUESTED_DWELL_MS : BUS_NORMAL_DWELL_MS;
    this.startBusDwellCountdown(dwellMs, wasRequested);
    this.time.delayedCall(dwellMs, () => this.travelToBusStop(index + 1));
  }

  private startBusDwellCountdown(durationMs: number, requested: boolean) {
    let seconds = Math.ceil(durationMs / 1000);
    this.game.events.emit('commute:bus-dwell', { requested, seconds });
    this.time.addEvent({
      delay: 1000,
      repeat: Math.max(0, seconds - 1),
      callback: () => {
        seconds = Math.max(0, seconds - 1);
        this.game.events.emit(
          'commute:bus-dwell',
          seconds > 0 ? { requested, seconds } : undefined,
        );
      },
    });
  }

  private finishBusJourneyAtPunggol() {
    if (!this.player) return;
    this.busMoving = false;
    this.atDestination = true;
    this.inputLocked = false;
    this.game.events.emit('commute:bus-dwell', undefined);
    this.cameraFlash(180, 255, 222, 120);
    this.fareReader = this.exitFareReader;
    this.exitFareReader?.clearTint().setVisible(true);
    this.player.setVisible(true).setVelocity(0, 0);
    this.carriedItemIcon?.setVisible(true);
    this.setContext('choose-exit-item');
    this.destinationArrivalPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.time.delayedCall(3000, () => {
      if (
        !this.atDestination ||
        this.fareTappedOut ||
        !this.player ||
        !this.destinationArrivalPosition
      ) return;
      const hasMoved = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.destinationArrivalPosition.x,
        this.destinationArrivalPosition.y,
      ) > 12;
      if (!hasMoved) {
        this.finalReminderVisible = true;
        this.setContext('last-stop-reminder');
      }
    });
  }

  private setBusInteriorDoors(open: boolean) {
    if (this.mode !== 'bus-interior') return;
    this.busDoorsOpen = open;
    this.background?.setTexture(
      open ? INTERIOR_DOORS_OPEN_KEY : INTERIOR_DOORS_CLOSED_KEY,
    );
    this.game.events.emit('commute:bus-doors', open);
  }

  private setBusInteriorMoving() {
    if (this.mode !== 'bus-interior') return;
    this.busDoorsOpen = false;
    this.tapOutExitWarning = false;
    if (this.fareTapped && !this.fareTappedOut && this.carriedItem) {
      this.storeFareItemInBackpack();
    }
    this.background?.setTexture(INTERIOR_MOVING_KEY);
    this.game.events.emit('commute:bus-doors', false);
  }

  private destroyFareReaders() {
    this.entryFareReader?.destroy();
    this.exitFareReader?.destroy();
    this.entryFareReader = undefined;
    this.exitFareReader = undefined;
    this.fareReader = undefined;
  }

  private updateStation() {
    if (!this.player || !this.stationStage || this.inputLocked) return;
    const map = this.cache.json.get(STATION_STAGES[this.stationStage].map) as Scene4MapData;

    if (this.stationStage === 'kadaloor-lrt-concourse' && !this.lrtGateTapped) {
      return;
    }

    if (
      this.stationStage === 'punggol-interchange' &&
      !this.lrtGateTapped &&
      !this.punggolGateTapped
    ) {
      // Closed flaps are a real barrier: the unpaid side cannot be crossed
      // before a reader accepts the card.
      if (this.player.y < PUNGGOL_GATE_EXIT_Y + 20) {
        this.player.y = PUNGGOL_GATE_EXIT_Y + 20;
        this.player.setVelocityY(0);
      }
      return;
    }

    if (
      this.stationStage === 'punggol-interchange' &&
      !this.lrtGateTapped &&
      this.punggolGateTapped &&
      this.openedStationGateLaneX !== undefined &&
      this.openedStationGateEntryY !== undefined
    ) {
      const alignedWithOpenedLane =
        Math.abs(this.player.x - this.openedStationGateLaneX) <= PUNGGOL_GATE_LANE_TOLERANCE;
      if (!alignedWithOpenedLane && this.player.y < PUNGGOL_GATE_EXIT_Y + 20) {
        this.player.y = PUNGGOL_GATE_EXIT_Y + 20;
        this.player.setVelocityY(0);
      }
      const passedThroughOpenedLane =
        alignedWithOpenedLane &&
        this.player.y <= Math.min(
          PUNGGOL_GATE_EXIT_Y,
          this.openedStationGateEntryY - 110,
        );
      if (passedThroughOpenedLane) {
        this.inputLocked = true;
        this.player.setVelocity(0, 0);
        this.enterStationStage('punggol-nel-escalator');
      }
      return;
    }

    if (this.stationStage === 'expo-fare-gates' && !this.expoGateTapped) {
      // Keep the player on the paid side until an exit reader accepts the card.
      if (this.player.y < PUNGGOL_GATE_EXIT_Y + 20) {
        this.player.y = PUNGGOL_GATE_EXIT_Y + 20;
        this.player.setVelocityY(0);
      }
      return;
    }

    if (
      this.stationStage === 'expo-fare-gates' &&
      this.expoGateTapped &&
      this.openedStationGateLaneX !== undefined &&
      this.openedStationGateEntryY !== undefined
    ) {
      const alignedWithOpenedLane =
        Math.abs(this.player.x - this.openedStationGateLaneX) <= PUNGGOL_GATE_LANE_TOLERANCE;
      if (!alignedWithOpenedLane && this.player.y < PUNGGOL_GATE_EXIT_Y + 20) {
        this.player.y = PUNGGOL_GATE_EXIT_Y + 20;
        this.player.setVelocityY(0);
      }
      const passedThroughOpenedLane =
        alignedWithOpenedLane &&
        this.player.y <= Math.min(PUNGGOL_GATE_EXIT_Y, this.openedStationGateEntryY - 110);
      if (passedThroughOpenedLane) {
        this.inputLocked = true;
        this.player.setVelocity(0, 0);
        this.enterStationStage('expo-exit-d');
      }
      return;
    }

    if (this.stationStage === 'punggol-nel-escalator' && !this.escalatorRideComplete) {
      const escalatorEntry = objectByName(map, 'Interactions', 'Escalator entry');
      if (!this.escalatorRideStarted && containsPoint(escalatorEntry, this.player.x, this.player.y)) {
        this.ridePunggolEscalator();
      }
      return;
    }

    if (containsPoint(this.stationPortal, this.player.x, this.player.y)) {
      this.inputLocked = true;
      this.player.setVelocity(0, 0);
      const destination = STATION_DESTINATIONS[this.stationStage];
      if (destination.kind === 'station') this.enterStationStage(destination.id);
      else if (destination.kind === 'rail') this.enterRailLeg(destination.id);
      else this.finishJourney();
    }
  }

  private currentWalkableFloorBounds(): WalkableFloorBounds | undefined {
    if (this.inputLocked) return undefined;
    if (this.mode === 'exterior') return EXTERIOR_FLOOR_BOUNDS;
    if (this.mode === 'bus-interior') {
      return this.seatedSeatIndex === undefined ? BUS_INTERIOR_FLOOR_BOUNDS : undefined;
    }
    if (this.mode === 'rail-interior') {
      const alignedWithOpenDoor = Boolean(
        this.player &&
        this.railInteriorDoorsOpen &&
        RAIL_EXIT_ZONES.some((zone) => (
          this.player!.x >= zone.x && this.player!.x <= zone.x + zone.width
        )),
      );
      return {
        minY: alignedWithOpenDoor
          ? RAIL_INTERIOR_OPEN_DOOR_MIN_Y
          : RAIL_INTERIOR_FLOOR_MIN_Y,
        maxY: RAIL_INTERIOR_FLOOR_BOUNDS.maxY,
      };
    }
    if (this.mode === 'rail' && this.railLeg) return RAIL_PLATFORM_FLOOR_BOUNDS[this.railLeg];
    if (this.mode !== 'station' || !this.stationStage) return undefined;
    if (this.stationStage === 'punggol-nel-escalator' && this.escalatorRideComplete) {
      return { minY: 540, maxY: 690 };
    }
    return STATION_FLOOR_BOUNDS[this.stationStage];
  }

  private constrainPlayerToWalkableFloor() {
    if (!this.player) return;
    const bounds = this.currentWalkableFloorBounds();
    if (!bounds) return;
    const worldBounds = this.physics.world.bounds;
    const constrained = clampToWalkableBounds(
      this.player.x,
      this.player.y,
      bounds,
      worldBounds.left,
      worldBounds.right,
    );
    const constrainedX = constrained.x;
    const constrainedY = constrained.y;
    if (constrainedX !== this.player.x) {
      this.player.x = constrainedX;
      this.player.setVelocityX(0);
    }
    if (constrainedY !== this.player.y) {
      this.player.y = constrainedY;
      this.player.setVelocityY(0);
    }
  }

  private beginStageTransition() {
    this.transitionStarted = true;
    this.transitionAwaitingRelease = false;
    this.inputLocked = true;
    this.player?.setVelocity(0, 0);
  }

  private resetPlayerToWalkingPose(profile: PlayerScaleProfile) {
    this.player?.anims.stop();
    this.player
      ?.setTexture(PLAYER_FRONT_KEY, 1)
      .setOrigin(PLAYER_ANCHORS.walkingFeet.x, PLAYER_ANCHORS.walkingFeet.y)
      .setScale(playerScaleFor(profile))
      .setFlipX(false);
    this.playerFacing = 'front';
  }

  private armStageInputRelease(minimumGuardMs = 140) {
    this.inputLocked = true;
    this.transitionAwaitingRelease = true;
    this.transitionReleaseGuardUntil = this.time.now + minimumGuardMs;
    this.player?.setVelocity(0, 0);
  }

  private clearStationPortalCue() {
    if (!this.stationPortalCue) return;
    this.tweens.killTweensOf(this.stationPortalCue);
    this.stationPortalCue.destroy(true);
    this.stationPortalCue = undefined;
  }

  private showStationPortalCue(zone: TiledObject | undefined, label = 'GO') {
    this.clearStationPortalCue();
    if (!zone) return;
    const x = zone.x + (zone.width ?? 0) / 2;
    const y = zone.y - 24;
    const badge = this.add.circle(0, 0, 29, 0xf7b928, 0.94).setStrokeStyle(4, 0xffffff, 0.9);
    const text = this.add.text(0, 0, `${label} ↓`, {
      color: '#12233f',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.stationPortalCue = this.add.container(x, y, [badge, text]).setDepth(70);
    this.tweens.add({
      targets: this.stationPortalCue,
      y: y + 9,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private clearRailDoorCue() {
    if (!this.railDoorCue) return;
    this.tweens.killTweensOf(this.railDoorCue);
    this.railDoorCue.destroy(true);
    this.railDoorCue = undefined;
  }

  private showRailDoorCue(zone: TiledObject | { height: number; width: number; x: number; y: number } | undefined, label: string) {
    this.clearRailDoorCue();
    if (!zone) return;
    const width = zone.width ?? 0;
    const height = zone.height ?? 0;
    const frame = this.add.rectangle(0, 0, width, height, 0xf7b928, 0.08)
      .setStrokeStyle(5, 0xf7b928, 0.95);
    const text = this.add.text(0, -height / 2 - 22, label, {
      backgroundColor: '#12233f',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      padding: { x: 11, y: 6 },
    }).setOrigin(0.5);
    this.railDoorCue = this.add.container(
      zone.x + width / 2,
      zone.y + height / 2,
      [frame, text],
    ).setDepth(55);
    this.tweens.add({ targets: frame, alpha: 0.42, duration: 500, yoyo: true, repeat: -1 });
  }

  private showPlatformBoardingCue() {
    const boardingZone = this.railMap?.layers
      .find((layer) => layer.name === 'Interactions')
      ?.objects?.find((object) => propertyValue(object, 'action') === 'board');
    this.showRailDoorCue(boardingZone, 'BOARD HERE ↑');
  }

  private createStationFareGates(stageId: StationStageId) {
    const isKadaloor = stageId === 'kadaloor-lrt-concourse';
    const isPunggolEntry =
      stageId === 'punggol-interchange' && !this.lrtGateTapped;
    const isExpoExit = stageId === 'expo-fare-gates';
    const usesFanGates = isPunggolEntry || isExpoExit;
    if (!isKadaloor && !isPunggolEntry && !isExpoExit) return;

    // Fill the architectural opening from the map wall (left) to the large
    // silver column (right) with standard-width lanes. Adding lanes here keeps
    // each gate correctly proportioned instead of stretching a smaller bank.
    // Five full-width lanes leave enough clearance for the passenger artwork.
    // The previous ten-lane bank left only a sliver between cabinets and made
    // the otherwise-open route look physically impossible to walk through.
    const punggolPostXs = [600, 785, 970, 1155, 1340, 1525];
    const laneXs = isKadaloor
      ? [724, 808, 892, 976, 1060, 1145, 1230, 1315]
      : [693, 878, 1063, 1248, 1433];
    this.stationFareGateSpecs = laneXs.map((laneX, index) => ({
      entry: isKadaloor || isExpoExit || index < 3,
      laneX,
      readerX: isKadaloor ? laneX - 48 : punggolPostXs[index],
      readerY: isKadaloor ? 442 : 390,
    }));
    if (isPunggolEntry) {
      // The terminal cabinet is also an exit-side reader. It has no lane to
      // open on its right, but should carry the same visible no-entry state as
      // the other red readers and reject entry taps consistently.
      this.stationFareGateSpecs.push({
        entry: false,
        laneX: punggolPostXs.at(-1)!,
        readerX: punggolPostXs.at(-1)!,
        readerY: 390,
      });
    }
    this.openedStationGateIndex = undefined;
    this.openedStationGateLaneX = undefined;
    this.openedStationGateEntryY = undefined;

    if (usesFanGates) {
      punggolPostXs.forEach((postX) => {
        this.stationFareGatePosts.push(
          this.add.image(postX, 460, PUNGGOL_GATE_READER_KEY)
            // Centre each short, sloped reader cabinet on the lane boundary;
            // its narrower body leaves the red fan flaps clearly visible.
            .setOrigin(0.5)
            .setDisplaySize(PUNGGOL_GATE_POST_WIDTH, PUNGGOL_GATE_POST_HEIGHT)
            .setDepth(46),
        );
      });
      laneXs.forEach((laneX) => {
        this.stationFareGateVisuals.push(
          // Each texture contains both opposing red swing flaps for one lane.
          this.add.image(laneX, 457, PUNGGOL_GATE_CLOSED_KEY)
            .setOrigin(0.5)
            .setDisplaySize(PUNGGOL_GATE_DOOR_WIDTH, PUNGGOL_GATE_DOOR_HEIGHT)
            .setDepth(45),
        );
      });
    }

    this.stationFareGateSpecs.forEach((gate, index) => {
      const color = gate.entry ? 0x31d67b : 0xff5b65;
      const markerY = usesFanGates ? gate.readerY : gate.readerY - 55;
      const markerRadius = usesFanGates ? 11 : 15;
      const marker = this.add.circle(gate.readerX, markerY, markerRadius, color, 0.96)
        .setStrokeStyle(isPunggolEntry ? 2 : 3, 0xffffff, 0.9)
        // The indicator is mounted on the gate reader. Keep it above the gate
        // body but behind the passenger when they walk across the same space.
        .setDepth(48);
      const label = this.add.text(
        gate.readerX,
        markerY,
        isExpoExit ? 'OUT' : gate.entry ? 'TAP' : 'EXIT',
        {
          align: 'center',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: usesFanGates ? (gate.entry ? '6px' : '5px') : (gate.entry ? '8px' : '7px'),
          fontStyle: 'bold',
        },
      ).setOrigin(0.5).setDepth(49);
      const target = this.add.zone(gate.readerX, gate.readerY, 76, 190)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      target.on('pointerover', () => marker.setScale(1.2));
      target.on('pointerout', () => marker.setScale(1));
      target.on('pointerdown', () => this.selectStationFareGate(stageId, gate, index));
      this.stationFareGateObjects.push(marker, label, target);
    });
  }

  private selectStationFareGate(
    stageId: StationStageId,
    gate: StationFareGateSpec,
    index: number,
  ) {
    if (!this.player || this.inputLocked || this.openedStationGateIndex !== undefined) return;
    const isFanGate = stageId === 'punggol-interchange' || stageId === 'expo-fare-gates';
    const inFrontOfReader = !isFanGate || this.player.y >= PUNGGOL_GATE_EXIT_Y - 5;
    if (Math.abs(this.player.x - gate.readerX) > 145 || !inFrontOfReader) {
      this.showStationGateMessage('Stand in front of this reader before tapping', gate.readerX, 365);
      return;
    }
    if (!gate.entry) {
      this.cameraFlash(100, 255, 70, 80);
      this.showStationGateMessage('Use a green fare gate', gate.readerX, 335);
      return;
    }
    if (stageId === 'kadaloor-lrt-concourse') this.tapIntoLrt(gate, index);
    else if (stageId === 'punggol-interchange') this.tapIntoPunggolNel(gate, index);
    else this.tapOutAtExpo(gate, index);
  }

  private showStationGateMessage(message: string, x: number, y: number) {
    this.stationGateMessage?.destroy();
    const text = this.add.text(x, y, message, {
      align: 'center',
      backgroundColor: '#13243be8',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setDepth(100);
    this.stationGateMessage = text;
    this.time.delayedCall(1600, () => {
      if (this.stationGateMessage === text) this.stationGateMessage = undefined;
      text.destroy();
    });
  }

  private openSelectedStationGate(gate: StationFareGateSpec, index: number) {
    this.openedStationGateIndex = index;
    this.openedStationGateLaneX = gate.laneX;
    this.openedStationGateEntryY = this.player?.y;
    this.stationFareGateObjects.forEach((object) => object.destroy());
    this.stationFareGateObjects = [];
    if (this.stationStage === 'punggol-interchange' || this.stationStage === 'expo-fare-gates') {
      const selectedGate = this.stationFareGateVisuals[index];
      if (selectedGate) {
        // Retract the two closed flaps, then reveal the same two flaps folded
        // back against their cabinets. Tapping never moves the player.
        this.tweens.add({
          targets: selectedGate,
          scaleX: selectedGate.scaleX * 0.18,
          alpha: 0.35,
          duration: 170,
          ease: 'Sine.In',
          onComplete: () => {
            selectedGate
              .setTexture(PUNGGOL_GATE_OPEN_KEY)
              .setDisplaySize(PUNGGOL_GATE_DOOR_WIDTH, PUNGGOL_GATE_DOOR_HEIGHT)
              .setAlpha(1);
          },
        });
      }
      return;
    }
    const floorPatch = this.add.graphics().setDepth(44);
    floorPatch.fillStyle(0xc7c3bd, 1);
    floorPatch.fillPoints([
      new Phaser.Math.Vector2(gate.laneX - 60, 410),
      new Phaser.Math.Vector2(gate.laneX + 60, 410),
      new Phaser.Math.Vector2(gate.laneX + 92, 650),
      new Phaser.Math.Vector2(gate.laneX - 92, 650),
    ], true);
    floorPatch.lineStyle(1, 0xaaa49e, 0.36);
    floorPatch.lineBetween(gate.laneX - 74, 535, gate.laneX + 74, 535);
    floorPatch.lineBetween(gate.laneX - 84, 600, gate.laneX + 84, 600);
    const openGate = this.add.image(gate.laneX, 500, STATION_GATE_OPEN_KEY)
      .setDisplaySize(205, 305)
      .setAlpha(0)
      .setDepth(46);
    this.stationFareGateObjects.push(floorPatch, openGate);
    this.tweens.add({ targets: openGate, alpha: 1, duration: 260, ease: 'Sine.Out' });
  }

  private tapIntoLrt(gate: StationFareGateSpec, index: number) {
    if (!this.player || this.lrtGateTapped) return;
    this.inputLocked = true;
    this.player.setVelocity(0, 0);
    this.setContext('lrt-tapping');
    const card = this.add.image(this.player.x + 35, this.player.y - 120, TRAVEL_CARD_KEY)
      .setDisplaySize(FARE_CARD_DISPLAY.width, FARE_CARD_DISPLAY.height)
      .setDepth(90);
    this.tweens.add({
      targets: card,
      x: gate.readerX,
      y: gate.readerY,
      duration: 480,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.cameraFlash(120, 90, 255, 180);
        this.openSelectedStationGate(gate, index);
        this.setContext('lrt-gates-open');
        this.time.delayedCall(520, () => {
          card.destroy();
          this.lrtGateTapped = true;
          this.inputLocked = false;
        });
      },
    });
  }

  private tapIntoPunggolNel(gate: StationFareGateSpec, index: number) {
    if (!this.player || this.punggolGateTapped || this.lrtGateTapped) return;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('punggol-tapping');
    const card = this.add.image(this.player.x + 35, this.player.y - 120, TRAVEL_CARD_KEY)
      .setDisplaySize(FARE_CARD_DISPLAY.width, FARE_CARD_DISPLAY.height)
      .setDepth(90);
    this.tweens.add({
      targets: card,
      x: gate.readerX,
      y: gate.readerY,
      duration: 480,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.cameraFlash(120, 90, 255, 180);
        this.openSelectedStationGate(gate, index);
        this.setContext('punggol-gates-open');
        this.time.delayedCall(520, () => {
          card.destroy();
          this.punggolGateTapped = true;
          this.inputLocked = false;
        });
      },
    });
  }

  private tapOutAtExpo(gate: StationFareGateSpec, index: number) {
    if (!this.player || this.expoGateTapped) return;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('expo-tapping');
    const card = this.add.image(this.player.x + 35, this.player.y - 120, TRAVEL_CARD_KEY)
      .setDisplaySize(FARE_CARD_DISPLAY.width, FARE_CARD_DISPLAY.height)
      .setDepth(90);
    this.tweens.add({
      targets: card,
      x: gate.readerX,
      y: gate.readerY,
      duration: 480,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.cameraFlash(120, 90, 255, 180);
        this.openSelectedStationGate(gate, index);
        this.setContext('expo-gates-open');
        this.time.delayedCall(520, () => {
          card.destroy();
          this.expoGateTapped = true;
          // Tap-out only unlocks the exit lane. The player must physically
          // leave Expo and complete the walk to The Signature entrance.
          this.inputLocked = false;
        });
      },
    });
  }

  private ridePunggolEscalator() {
    if (!this.player || this.escalatorRideStarted) return;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).setFlipX(false)
      .anims.play('scene4-player-walk-right', true);

    // Finish walking onto the upper landing before the escalator carries the
    // player. Keeping this separate prevents a diagonal slide from the
    // concourse when the edge of the entry trigger is reached.
    this.tweens.add({
      targets: this.player,
      x: ESCALATOR_BOARDING_X,
      y: ESCALATOR_BOARDING_Y,
      duration: 320,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (!this.player) return;
        this.escalatorRideStarted = true;
        this.playerFacing = 'front';
        this.player.anims.stop();
        this.player.setTexture(PLAYER_FRONT_KEY, 1).setFlipX(false);
        this.setContext('punggol-escalator-riding');
        this.startPunggolEscalatorMotion();
        this.tweens.add({
          targets: this.player,
          x: ESCALATOR_EXIT_X,
          y: ESCALATOR_EXIT_Y,
          scaleX: ESCALATOR_RIDE_SCALE,
          scaleY: ESCALATOR_RIDE_SCALE,
          duration: 1900,
          ease: 'Sine.InOut',
          onComplete: () => {
            this.escalatorRideComplete = true;
            this.enterRailLeg('punggol-nel');
          },
        });
      },
    });
  }

  private startPunggolEscalatorMotion() {
    this.stopPunggolEscalatorMotion();
    this.escalatorAnimationRuns += 1;
    for (let index = 0; index < 9; index += 1) {
      const stepHighlight = this.add.rectangle(
        ESCALATOR_BOARDING_X,
        ESCALATOR_BOARDING_Y,
        50,
        2,
        0xf4c95d,
        0.32,
      )
        .setDepth(38);
      this.railObjects.push(stepHighlight);
      this.escalatorMotionObjects.push(stepHighlight);
      this.tweens.add({
        targets: stepHighlight,
        x: ESCALATOR_EXIT_X,
        y: ESCALATOR_EXIT_Y - 10,
        scaleX: 1.55,
        alpha: 0.62,
        duration: 1550,
        delay: index * 175,
        repeat: -1,
        repeatDelay: 0,
        ease: 'Linear',
      });
    }
  }

  private stopPunggolEscalatorMotion() {
    this.escalatorMotionObjects.forEach((object) => {
      this.tweens.killTweensOf(object);
      object.destroy();
    });
    const motionObjects = new Set(this.escalatorMotionObjects);
    this.railObjects = this.railObjects.filter((object) => !motionObjects.has(object as Phaser.GameObjects.Rectangle));
    this.escalatorMotionObjects = [];
  }

  private enterStationStage(stageId: StationStageId) {
    if (!this.player) return;
    const stage = STATION_STAGES[stageId];
    const map = this.cache.json.get(stage.map) as Scene4MapData;
    this.mode = 'station';
    if (stageId === 'kadaloor-lrt-concourse') this.game.events.emit('commute:branch', 'lrt');
    this.stationStage = stageId;
    this.beginStageTransition();
    this.clearStationPortalCue();
    this.clearRailDoorCue();
    this.railLeg = undefined;
    this.railDoorsOpen = false;
    this.busMoving = false;
    this.background?.setVisible(false);
    this.bus?.setVisible(false);
    this.exteriorObjects.forEach((object) => object.destroy());
    this.exteriorObjects = [];
    this.collisionBodies.forEach((object) => object.destroy());
    this.collisionBodies = [];
    this.destroyFareReaders();
    this.destroyBusSeats();
    this.carriedItemIcon?.destroy();
    this.carriedItemIcon = undefined;
    this.train?.destroy();
    this.train = undefined;
    this.oppositeTrain?.destroy();
    this.oppositeTrain = undefined;
    this.platformDoorLayer = undefined;
    this.stopPunggolEscalatorMotion();
    this.destroyRailSeats();
    this.railObjects.forEach((object) => object.destroy());
    this.railObjects = [];
    this.railInteriorBackground = undefined;
    this.stopNelServiceClock();
    this.stopDtlServiceClock();
    this.nelHarbourFrontBoardText = undefined;
    this.nelPunggolCoastBoardText = undefined;
    this.dtlExpoBoardText = undefined;
    this.dtlBukitPanjangBoardText = undefined;
    this.railStopAdvanceTimer?.remove(false);
    this.railStopAdvanceTimer = undefined;
    this.railInteriorDoorsOpen = false;
    this.currentRailStopIndex = -1;
    this.railTravelDirection = 1;
    this.stationFareGateObjects.forEach((object) => object.destroy());
    this.stationFareGateObjects = [];
    this.stationFareGateVisuals.forEach((object) => object.destroy());
    this.stationFareGateVisuals = [];
    this.stationFareGatePosts.forEach((object) => object.destroy());
    this.stationFareGatePosts = [];
    this.stationFareGateSpecs = [];
    this.openedStationGateIndex = undefined;
    this.openedStationGateLaneX = undefined;
    this.openedStationGateEntryY = undefined;
    this.stationGateMessage?.destroy();
    this.stationGateMessage = undefined;
    this.cameras.main.fadeOut(160, 18, 27, 42);

    this.time.delayedCall(180, () => {
      this.worldWidth = RAIL_WORLD_WIDTH;
      this.physics.world.setBounds(0, 0, RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT).setScroll(0, 0);
      this.railObjects.push(
        this.add.image(0, 0, stage.background).setOrigin(0, 0)
          .setDisplaySize(RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT).setDepth(0),
      );
      if (stageId === 'punggol-nel-escalator') {
        // Repaint only the near glass balustrade above the player. The source
        // panorama is a single layer, so this crop supplies the missing
        // foreground occlusion while the player crosses the upper landing.
        this.railObjects.push(
          this.add.image(0, 0, stage.background)
            .setOrigin(0, 0)
            .setDisplaySize(RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT)
            .setCrop(0, 250, 1120, 215)
            .setDepth(61),
        );
      }
      const spawnName = stageId === 'punggol-interchange'
        ? this.lrtGateTapped ? 'from-lrt' : 'from-bus'
        : 'player-start';
      const spawn = objectByName(map, 'Spawns', spawnName);
      this.stationPortal = objectByName(map, 'Interactions', 'Next area');
      if (stageId === 'punggol-nel-escalator') {
        this.escalatorRideStarted = false;
        this.escalatorRideComplete = false;
      }
      this.resetPlayerToWalkingPose(stageId === 'punggol-nel-escalator' ? 'escalator' : 'station');
      this.player?.setPosition(spawn?.x ?? stage.spawnX, spawn?.y ?? 660)
        .setScale(playerScaleFor(stageId === 'punggol-nel-escalator' ? 'escalator' : 'station'))
        .setDepth(60).setFlipX(false).setVisible(true).setVelocity(0, 0);
      this.createStationFareGates(stageId);
      this.createOfficeWayfinding(stageId);
      const routeCue = stageId === 'punggol-nel-escalator'
        ? objectByName(map, 'Interactions', 'Escalator entry')
        : this.stationPortal;
      this.showStationPortalCue(routeCue, stageId === 'punggol-nel-escalator' ? 'DOWN' : 'GO');

      this.setContext(
        stageId === 'punggol-interchange' && this.lrtGateTapped
          ? 'punggol-transfer'
          : stage.context,
      );
      this.armStageInputRelease();
      this.cameras.main.fadeIn(220, 18, 27, 42);
    });
  }

  private updateRail() {
    if (!this.player || this.inputLocked) return;

    if (
      this.railLeg &&
      ['punggol-nel', 'little-india-dtl'].includes(this.railLeg) &&
      !this.selectedRailDirection
    ) {
      const directionZones = this.railMap?.layers
        .find((layer) => layer.name === 'Interactions')
        ?.objects?.filter((object) => propertyValue(object, 'action') === 'choose-direction') ?? [];
      const selectedZone = directionZones.find((zone) => containsPoint(zone, this.player!.x, this.player!.y));
      if (selectedZone) {
        this.chooseDirection(String(propertyValue(selectedZone, 'direction') ?? ''));
        return;
      }
      if (this.time.now >= this.wrongDirectionUntil) {
        if (this.lastContext === 'nel-wrong-direction') this.setContext('nel-transfer');
        if (this.lastContext === 'dtl-wrong-direction') this.setContext('dtl-transfer');
      }
    }

    if (!this.railDoorsOpen) return;
    const boardingZone = this.railMap?.layers
      .find((layer) => layer.name === 'Interactions')
      ?.objects?.find((object) => propertyValue(object, 'action') === 'board');
    if (containsPoint(boardingZone, this.player.x, this.player.y)) {
      this.boardTrain();
    }
  }

  private enterRailLeg(legId: RailLegId) {
    if (!this.player) return;
    const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId);
    if (!leg) return;
    const railMap = this.cache.json.get(RAIL_MAP_KEYS[legId]) as Scene4MapData;
    const cameraFrame = objectByName(railMap, 'Camera', 'Platform framing');
    const playerSpawn = objectByName(railMap, 'Spawns', 'player-start');
    this.railMap = railMap;

    this.mode = 'rail';
    this.stationStage = undefined;
    this.railLeg = legId;
    this.railDoorsOpen = false;
    this.railInteriorDoorsOpen = false;
    this.currentRailStopIndex = -1;
    this.railTravelDirection = 1;
    this.railStopAdvanceTimer?.remove(false);
    this.railStopAdvanceTimer = undefined;
    this.wrongRailStopInProgress = false;
    this.beginStageTransition();
    this.clearStationPortalCue();
    this.clearRailDoorCue();
    this.busMoving = false;
    this.background?.setVisible(false);
    this.bus?.setVisible(false);
    this.exteriorObjects.forEach((object) => object.destroy());
    this.exteriorObjects = [];
    this.collisionBodies.forEach((object) => object.destroy());
    this.collisionBodies = [];
    this.destroyFareReaders();
    this.destroyBusSeats();
    this.driverBubble?.destroy();
    this.carriedItemIcon?.destroy();
    this.stopNelServiceClock();
    this.stopDtlServiceClock();
    this.stopPunggolEscalatorMotion();
    this.destroyRailSeats();
    this.railObjects.forEach((object) => object.destroy());
    this.railObjects = [];
    this.railInteriorBackground = undefined;
    this.nelHarbourFrontBoardText = undefined;
    this.nelPunggolCoastBoardText = undefined;
    this.dtlExpoBoardText = undefined;
    this.dtlBukitPanjangBoardText = undefined;
    this.train?.destroy();
    this.train = undefined;
    this.oppositeTrain?.destroy();
    this.oppositeTrain = undefined;
    this.platformDoorLayer = undefined;
    this.selectedRailDirection = undefined;
    this.nelTrainsReady = false;
    this.dtlTrainsReady = false;
    this.cameras.main.fadeOut(180, 18, 27, 42);

    this.time.delayedCall(200, () => {
      const railWidth = Math.max(
        RAIL_WORLD_WIDTH,
        cameraFrame?.width ?? railMap.width * railMap.tilewidth,
      );
      const railHeight = Math.max(
        RAIL_WORLD_HEIGHT,
        cameraFrame?.height ?? railMap.height * railMap.tileheight,
      );
      this.worldWidth = railWidth;
      this.physics.world.setBounds(cameraFrame?.x ?? 0, cameraFrame?.y ?? 0, railWidth, railHeight);
      this.cameras.main.setBounds(cameraFrame?.x ?? 0, cameraFrame?.y ?? 0, railWidth, railHeight).setScroll(0, 0);
      this.drawRailPlatform(legId, railMap);
      this.resetPlayerToWalkingPose('station');
      this.player
        ?.setPosition(playerSpawn?.x ?? 220, playerSpawn?.y ?? 660)
        .setScale(playerScaleFor('station'))
        .setDepth(60)
        .setFlipX(false)
        .setVisible(true)
        .setVelocity(0, 0);
      this.cameras.main.fadeIn(240, 18, 27, 42);

      if (legId === 'kadaloor-lrt') {
        this.setContext('lrt-platform');
        this.armStageInputRelease();
        this.time.delayedCall(350, this.arriveRailTrain, [], this);
      } else {
        this.setContext(legId === 'punggol-nel' ? 'nel-transfer' : 'dtl-transfer');
        this.armStageInputRelease();
        if (legId === 'punggol-nel') this.startLiveNelService();
        if (legId === 'little-india-dtl') this.startLiveDtlService();
      }
    });
  }

  private drawRailPlatform(legId: RailLegId, map: Scene4MapData) {
    const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId)!;
    const accent = leg.accent;
    const isLrt = legId === 'kadaloor-lrt';
    const boardingZone = map.layers
      .find((layer) => layer.name === 'Interactions')
      ?.objects?.find((object) => propertyValue(object, 'action') === 'board');
    const add = <T extends Phaser.GameObjects.GameObject>(object: T) => {
      this.railObjects.push(object);
      return object;
    };

    add(
      this.add
        .image(0, 0, RAIL_BACKGROUND_KEYS[legId])
        .setOrigin(0, 0)
        .setDisplaySize(RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT)
        .setDepth(0),
    );

    const platformDoors = PLATFORM_DOOR_KEYS[legId];
    if (platformDoors) {
      this.platformDoorLayer = add(
        this.add
          .image(0, 0, platformDoors.closed)
          .setOrigin(0, 0)
          .setDisplaySize(RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT)
          .setDepth(30),
      );
    }

    const commuterPositions = isLrt ? [970, 1210] : [880, 1280];
    commuterPositions.forEach((x, index) => {
      add(
        this.add.image(x, 545 + index * 8, MRT_STAFF_KEY)
          .setOrigin(0.5, 1)
          .setScale(isLrt ? 0.14 : 0.13)
          .setFlipX(index % 2 === 1)
          .setTint(index === 0 ? 0xb7c6d3 : 0xd8c4ad)
          .setAlpha(0.72)
          .setDepth(35),
      );
    });

    if (legId === 'punggol-nel') {
      // Use the two electronic panels already built into the station artwork.
      // Each track gets a complete label so the live time cannot be mistaken
      // for the train on the other side of the island platform.
      const addNelBoard = (
        x: number,
        platform: string,
        destination: string,
        initialWait: string,
      ) => {
        add(this.add.rectangle(x, 145, 204, 76, 0x0d151d, 0.96)
          .setStrokeStyle(1, 0x4e5965).setDepth(40));
        add(this.add.rectangle(x, 108, 204, 4, accent, 1).setDepth(41));
        add(this.add.text(x - 94, 115, `NORTH EAST LINE · ${platform}`, {
          align: 'center', fixedWidth: 188,
          color: '#b7a3d8', fontFamily: 'Arial, sans-serif',
          fontSize: '8px', fontStyle: 'bold',
        }).setDepth(41));
        add(this.add.text(x - 94, 132, `TOWARDS ${destination}`, {
          align: 'center', fixedWidth: 188,
          color: '#ffffff', fontFamily: 'Arial, sans-serif',
          fontSize: '12px', fontStyle: 'bold',
        }).setDepth(41));
        add(this.add.text(x - 94, 157, 'NEXT TRAIN', {
          color: '#c7d1da', fontFamily: 'Arial, sans-serif', fontSize: '9px',
        }).setDepth(41));
        return add(this.add.text(x + 94, 154, initialWait, {
          align: 'right', color: '#f6cf57', fontFamily: 'Arial, sans-serif',
          fontSize: '12px', fontStyle: 'bold',
        }).setOrigin(1, 0).setDepth(41));
      };
      this.nelPunggolCoastBoardText = addNelBoard(
        580,
        'PLATFORM B',
        'PUNGGOL COAST',
        '4 min',
      );
      this.nelHarbourFrontBoardText = addNelBoard(
        1576,
        'PLATFORM A',
        'HARBOURFRONT',
        '2 min',
      );
      return;
    }

    if (legId === 'little-india-dtl') {
      const closedDoorSource = this.textures
        .get(PLATFORM_DOOR_KEYS['little-india-dtl']!.closed)
        .getSourceImage() as CanvasImageSource;
      if (!this.textures.exists(DTL_LEFT_END_WALL_KEY)) {
        const leftWall = this.textures.createCanvas(DTL_LEFT_END_WALL_KEY, 168, 282);
        if (leftWall) {
          leftWall.context.drawImage(closedDoorSource, 530, 210, 168, 282, 0, 0, 168, 282);
          leftWall.refresh();
        }
      }
      if (!this.textures.exists(DTL_RIGHT_END_WALL_KEY)) {
        const rightWall = this.textures.createCanvas(DTL_RIGHT_END_WALL_KEY, 220, 282);
        if (rightWall) {
          rightWall.context.drawImage(closedDoorSource, 1353, 210, 118, 282, 0, 0, 220, 282);
          rightWall.refresh();
        }
      }
      add(this.add.image(0, 210, DTL_LEFT_END_WALL_KEY).setOrigin(0, 0).setDepth(31));
      add(this.add.image(1956, 210, DTL_RIGHT_END_WALL_KEY).setOrigin(0, 0).setDepth(31));

      const addDtlBoard = (
        x: number,
        platform: string,
        destination: string,
        wait: string,
      ) => {
        add(this.add.rectangle(x, 144, 210, 72, 0x101820, 0.98)
          .setStrokeStyle(2, 0x64717d).setDepth(40));
        add(this.add.rectangle(x, 111, 210, 4, accent, 1).setDepth(41));
        add(this.add.text(x - 96, 116, `DOWNTOWN LINE  ·  ${platform}`, {
          color: '#9fc8e8', fontFamily: 'Arial, sans-serif',
          fontSize: '9px', fontStyle: 'bold',
        }).setDepth(41));
        add(this.add.text(x - 96, 130, `TOWARDS ${destination.toUpperCase()}`, {
          color: '#ffffff', fontFamily: 'Arial, sans-serif',
          fontSize: '13px', fontStyle: 'bold',
        }).setDepth(41));
        add(this.add.text(x - 96, 151, 'NEXT TRAIN', {
          color: '#c7d1da', fontFamily: 'Arial, sans-serif', fontSize: '9px',
        }).setDepth(41));
        return add(this.add.text(x + 95, 148, wait, {
          align: 'right', color: '#f6cf57', fontFamily: 'Arial, sans-serif',
          fontSize: '15px', fontStyle: 'bold',
        }).setOrigin(1, 0).setDepth(41));
      };
      // Match the exact centres of the two blank electronic screens baked into
      // the DTL station artwork. The previous anchors sat left of both frames.
      this.dtlBukitPanjangBoardText = addDtlBoard(570, 'PLATFORM A', 'Bukit Panjang', '4 min');
      this.dtlExpoBoardText = addDtlBoard(1560, 'PLATFORM B', 'Expo', '2 min');
    } else {
      add(
        this.add
          .rectangle(225, 94, 382, 116, 0x14283a, 0.92)
          .setStrokeStyle(5, accent)
          .setDepth(40),
      );
    }

    add(
      this.add
        .text(58, 50, leg.station, {
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '32px',
          fontStyle: 'bold',
        })
        .setDepth(41),
    );
    add(
      this.add
        .text(60, 92, `${leg.service} · towards ${leg.direction}`, {
          color: '#dceaf0',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
        })
        .setDepth(41),
    );
    add(
      this.add
        .text(374, 54, isLrt ? 'PE5' : 'DT12', {
          backgroundColor: Phaser.Display.Color.IntegerToColor(accent).rgba,
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '17px',
          fontStyle: 'bold',
          padding: { x: 10, y: 6 },
        })
        .setOrigin(1, 0)
        .setDepth(41),
    );
    add(
      this.add
        .text(
          (boardingZone?.x ?? 530) + (boardingZone?.width ?? 220) / 2,
          655,
          'BOARD HERE',
          {
          backgroundColor: '#14283ad9',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          padding: { x: 12, y: 7 },
        })
        .setOrigin(0.5)
        .setDepth(42),
    );
  }

  private chooseDirection(choice: string) {
    if (!this.railLeg || !['punggol-nel', 'little-india-dtl'].includes(this.railLeg)) return;
    const directionChoice = objectByName(
      this.railMap!,
      'Interactions',
      'Platform direction choice',
    );
    if (propertyValue(directionChoice, 'correctDirection') !== choice) {
      this.wrongDirectionUntil = this.time.now + 1600;
      this.setContext(
        this.railLeg === 'punggol-nel'
          ? 'nel-wrong-direction'
          : 'dtl-wrong-direction',
      );
      return;
    }
    if (this.railLeg === 'punggol-nel') {
      this.selectedRailDirection = choice;
      this.inputLocked = false;
      this.setContext('nel-arriving');
      if (this.nelTrainsReady) this.openSelectedNelTrain();
      return;
    }
    this.selectedRailDirection = choice;
    this.inputLocked = false;
    this.setContext('dtl-arriving');
    if (this.dtlTrainsReady) this.openSelectedDtlTrain();
  }

  private formatLiveNelWait(countdownMs: number, atPlatform: boolean) {
    if (atPlatform) return 'AT PLATFORM';
    if (countdownMs <= 0) return 'ARRIVING';
    return `${Math.ceil(countdownMs / LIVE_SERVICE_MINUTE_MS)} min`;
  }

  private updateLiveNelBoard() {
    this.nelHarbourFrontBoardText?.setText(
      this.formatLiveNelWait(this.nelHarbourFrontCountdownMs, this.nelTrainsReady),
    );
    this.nelPunggolCoastBoardText?.setText(
      this.formatLiveNelWait(this.nelPunggolCoastCountdownMs, Boolean(this.oppositeTrain?.active && this.oppositeTrain.x >= 300)),
    );
  }

  private maskTrainToTrack(
    train: Phaser.GameObjects.Image,
    apertures: ReadonlyArray<{ x: number; y: number; width: number; height: number }>,
  ) {
    const maskShape = this.make.graphics({ x: 0, y: 0 }, false);
    maskShape.fillStyle(0xffffff, 1);
    apertures.forEach((aperture) => {
      maskShape.fillRect(aperture.x, aperture.y, aperture.width, aperture.height);
    });
    const mask = maskShape.createGeometryMask();
    train.setMask(mask);
    train.setData('trackMaskBounds', apertures);
    train.once(Phaser.GameObjects.Events.DESTROY, () => {
      mask.destroy();
      maskShape.destroy();
    });
  }

  private startLiveNelService() {
    if (this.railLeg !== 'punggol-nel' || !this.railMap) return;
    this.stopNelServiceClock();
    this.nelHarbourFrontCountdownMs = LIVE_SERVICE_MINUTE_MS * 2;
    this.nelPunggolCoastCountdownMs = LIVE_SERVICE_MINUTE_MS * 4;
    this.updateLiveNelBoard();
    this.nelServiceClock = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.railLeg !== 'punggol-nel' || this.mode !== 'rail') return;
        if (!this.train) {
          this.nelHarbourFrontCountdownMs = Math.max(0, this.nelHarbourFrontCountdownMs - 1000);
          if (this.nelHarbourFrontCountdownMs === 0) this.arriveLiveHarbourFrontTrain();
        }
        if (!this.oppositeTrain) {
          this.nelPunggolCoastCountdownMs = Math.max(0, this.nelPunggolCoastCountdownMs - 1000);
          if (this.nelPunggolCoastCountdownMs === 0) this.arriveLivePunggolCoastTrain();
        }
        this.updateLiveNelBoard();
      },
    });
  }

  private arriveLiveHarbourFrontTrain() {
    if (this.railLeg !== 'punggol-nel' || !this.railMap || this.train) return;
    const trainStart = objectByName(this.railMap, 'Spawns', 'train-start');
    const trainStop = objectByName(this.railMap, 'Spawns', 'train-stop');
    const width = TRAIN_DISPLAY['punggol-nel'].width;
    const height = TRAIN_DISPLAY['punggol-nel'].height;
    const yOffset = TRAIN_DISPLAY['punggol-nel'].yOffset;
    const arrivingTrain = this.add.image(
      trainStart?.x ?? 2600,
      (trainStart?.y ?? 350) + yOffset,
      TRAIN_KEYS['punggol-nel'],
    ).setDisplaySize(width, height).setDepth(10);
    this.train = arrivingTrain;
    this.maskTrainToTrack(arrivingTrain, PUNGGOL_NEL_TRACK_MASKS.harbourFront);
    this.updateLiveNelBoard();
    this.tweens.add({
      targets: arrivingTrain,
      x: trainStop?.x ?? 1800,
      duration: 750,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.nelTrainsReady = true;
        arrivingTrain.setTexture(TRAIN_OPEN_KEYS['punggol-nel']);
        this.setPlatformDoors(true, 'punggol-nel');
        this.updateLiveNelBoard();
        if (this.selectedRailDirection === 'HarbourFront') this.openSelectedNelTrain();
        this.nelHarbourFrontDepartureTimer?.remove(false);
        this.nelHarbourFrontDepartureTimer = this.time.delayedCall(
          NEL_PLATFORM_DWELL_MS,
          () => this.departLiveHarbourFrontTrain(arrivingTrain),
        );
      },
    });
  }

  public debugEnterStationStage(stageId: StationStageId) {
    if (!import.meta.env.DEV || !STATION_STAGES[stageId]) return;
    this.enterStationStage(stageId);
  }

  public debugFinishJourney() {
    if (!import.meta.env.DEV) return;
    this.finishJourney();
  }

  public debugEnterBusInterior() {
    if (!import.meta.env.DEV) return;
    this.enterBusInterior();
  }

  public debugEnterBusSeated() {
    if (!import.meta.env.DEV) return;
    this.enterBusInterior();
    this.time.delayedCall(360, () => {
      this.fareTapped = true;
      this.sitInBusSeat(0);
    });
  }

  public debugEnterRailSeated(legId: RailLegId) {
    if (!import.meta.env.DEV) return;
    this.railLeg = legId;
    this.enterRailTrainInterior(legId);
    this.time.delayedCall(360, () => this.sitInRailSeat(0));
  }

  public debugEnterRailPlatform(legId: RailLegId) {
    if (!import.meta.env.DEV) return;
    this.enterRailLeg(legId);
    if (legId === 'kadaloor-lrt') return;
    this.time.delayedCall(360, () => {
      this.selectedRailDirection = legId === 'punggol-nel' ? 'HarbourFront' : 'Expo';
      this.stopNelServiceClock();
      this.stopDtlServiceClock();
      if (legId === 'punggol-nel') this.arriveLiveHarbourFrontTrain();
      else this.arriveLiveDtlExpoTrain();
    });
  }

  private createOfficeWayfinding(stageId: StationStageId) {
    if (stageId === 'expo-exit-d') {
      [
        { x: 510, y: 245, width: 510, title: 'EXIT D  →', subtitle: 'CHANGI BUSINESS PARK' },
        { x: 1570, y: 300, width: 480, title: 'THE SIGNATURE  →', subtitle: '51 CHANGI BUSINESS PARK CENTRAL 2' },
      ].forEach(({ x, y, width, title, subtitle }) => {
        const sign = this.add.container(x, y).setDepth(20);
        sign.add([
          this.add.rectangle(0, 0, width, 92, 0x102f3c, 0.94)
            .setStrokeStyle(3, 0xffffff, 0.85),
          this.add.text(0, -13, title, {
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '30px',
            fontStyle: 'bold',
          }).setOrigin(0.5),
          this.add.text(0, 24, subtitle, {
            color: '#bce8eb',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
          }).setOrigin(0.5),
        ]);
        this.railObjects.push(sign);
      });
      return;
    }

    if (stageId === 'the-signature-exterior') {
      const entranceGlow = this.add.ellipse(1900, 555, 410, 250, 0xf7b928, 0.1).setDepth(5);
      this.railObjects.push(entranceGlow);
      if (!this.reducedMotion) {
        this.tweens.add({
          targets: entranceGlow,
          alpha: 0.24,
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }
      const sign = this.add.container(1600, 318).setDepth(20);
      sign.add([
        this.add.rectangle(0, 0, 420, 90, 0x102f3c, 0.9)
          .setStrokeStyle(3, 0xffffff, 0.85),
        this.add.text(0, -12, 'THE SIGNATURE', {
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '31px',
          fontStyle: 'bold',
        }).setOrigin(0.5),
        this.add.text(0, 23, '51 CHANGI BUSINESS PARK CENTRAL 2', {
          color: '#bce8eb',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
        }).setOrigin(0.5),
      ]);
      this.railObjects.push(sign);
      return;
    }

  }

  private departLiveHarbourFrontTrain(departingTrain: Phaser.GameObjects.Image) {
    if (
      this.railLeg !== 'punggol-nel' ||
      this.mode !== 'rail' ||
      this.train !== departingTrain
    ) return;
    const trainExit = objectByName(this.railMap!, 'Spawns', 'train-exit');
    this.nelHarbourFrontDepartureTimer = undefined;
    this.nelTrainsReady = false;
    this.railDoorsOpen = false;
    this.setPlatformDoors(false, 'punggol-nel');
    departingTrain.setTexture(TRAIN_KEYS['punggol-nel']);
    if (this.selectedRailDirection === 'HarbourFront') this.setContext('nel-arriving');

    this.tweens.add({
      targets: departingTrain,
      x: trainExit?.x ?? -780,
      duration: 650,
      ease: 'Cubic.In',
      onComplete: () => {
        if (this.train !== departingTrain) return;
        departingTrain.destroy();
        this.train = undefined;
        this.nelTrainsReady = false;
        // The ten-second headway begins after the previous train has cleared
        // the platform, rather than while it is still departing.
        this.nelHarbourFrontCountdownMs = NEL_NEXT_TRAIN_MS;
        this.updateLiveNelBoard();
      },
    });
  }

  private arriveLivePunggolCoastTrain() {
    if (this.railLeg !== 'punggol-nel' || !this.railMap || this.oppositeTrain) return;
    const oppositeStart = objectByName(this.railMap, 'Spawns', 'opposite-train-start');
    const oppositeStop = objectByName(this.railMap, 'Spawns', 'opposite-train-stop');
    const oppositeExit = objectByName(this.railMap, 'Spawns', 'opposite-train-exit');
    const width = TRAIN_DISPLAY['punggol-nel'].width;
    const height = TRAIN_DISPLAY['punggol-nel'].height;
    const yOffset = TRAIN_DISPLAY['punggol-nel'].yOffset;
    const arrivingTrain = this.add.image(
      oppositeStart?.x ?? -500,
      (oppositeStart?.y ?? 350) + yOffset,
      TRAIN_KEYS['punggol-nel'],
    ).setDisplaySize(width, height).setDepth(10).setFlipX(true);
    this.maskTrainToTrack(arrivingTrain, PUNGGOL_NEL_TRACK_MASKS.punggolCoast);
    this.oppositeTrain = arrivingTrain;
    this.updateLiveNelBoard();
    this.tweens.add({
      targets: arrivingTrain,
      x: oppositeStop?.x ?? 360,
      duration: 750,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.updateLiveNelBoard();
        this.time.delayedCall(NEL_PLATFORM_DWELL_MS, () => {
          if (this.oppositeTrain !== arrivingTrain || this.railLeg !== 'punggol-nel') return;
          this.tweens.add({
            targets: arrivingTrain,
            x: oppositeExit?.x ?? 1220,
            duration: 600,
            ease: 'Cubic.In',
            onComplete: () => {
              arrivingTrain.destroy();
              if (this.oppositeTrain === arrivingTrain) this.oppositeTrain = undefined;
              this.nelPunggolCoastCountdownMs = NEL_NEXT_TRAIN_MS;
              this.updateLiveNelBoard();
            },
          });
        });
      },
    });
  }

  private stopNelServiceClock() {
    this.nelServiceClock?.remove(false);
    this.nelServiceClock = undefined;
    this.nelHarbourFrontDepartureTimer?.remove(false);
    this.nelHarbourFrontDepartureTimer = undefined;
  }

  private openSelectedNelTrain() {
    if (
      this.railLeg !== 'punggol-nel' ||
      !this.train ||
      !this.nelTrainsReady ||
      this.railDoorsOpen
    ) return;
    this.time.delayedCall(100, () => {
      if (!this.train || this.railLeg !== 'punggol-nel' || !this.nelTrainsReady) return;
      this.train.setTexture(TRAIN_OPEN_KEYS['punggol-nel']);
      this.setPlatformDoors(true);
      this.railDoorsOpen = true;
      this.inputLocked = false;
      this.showPlatformBoardingCue();
      this.setContext('nel-boarding');
    });
  }

  private updateLiveDtlBoard() {
    this.dtlExpoBoardText?.setText(
      this.formatLiveNelWait(this.dtlExpoCountdownMs, this.dtlTrainsReady),
    );
    this.dtlBukitPanjangBoardText?.setText(
      this.formatLiveNelWait(
        this.dtlBukitPanjangCountdownMs,
        Boolean(this.oppositeTrain?.active && this.oppositeTrain.x >= 0),
      ),
    );
  }

  private startLiveDtlService() {
    if (this.railLeg !== 'little-india-dtl' || !this.railMap) return;
    this.stopDtlServiceClock();
    this.dtlExpoCountdownMs = LIVE_SERVICE_MINUTE_MS * 2;
    this.dtlBukitPanjangCountdownMs = LIVE_SERVICE_MINUTE_MS * 4;
    this.updateLiveDtlBoard();
    this.dtlServiceClock = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.railLeg !== 'little-india-dtl' || this.mode !== 'rail') return;
        if (!this.train) {
          this.dtlExpoCountdownMs = Math.max(0, this.dtlExpoCountdownMs - 1000);
          if (this.dtlExpoCountdownMs === 0) this.arriveLiveDtlExpoTrain();
        }
        if (!this.oppositeTrain) {
          this.dtlBukitPanjangCountdownMs = Math.max(0, this.dtlBukitPanjangCountdownMs - 1000);
          if (this.dtlBukitPanjangCountdownMs === 0) this.arriveLiveDtlBukitPanjangTrain();
        }
        this.updateLiveDtlBoard();
      },
    });
  }

  private arriveLiveDtlExpoTrain() {
    if (this.railLeg !== 'little-india-dtl' || !this.railMap || this.train) return;
    const trainStart = objectByName(this.railMap, 'Spawns', 'train-start');
    const trainSize = TRAIN_DISPLAY['little-india-dtl'];
    const arrivingTrain = this.add.image(
      trainStart?.x ?? 2860,
      (trainStart?.y ?? 350) + trainSize.yOffset,
      TRAIN_KEYS['little-india-dtl'],
    ).setDisplaySize(trainSize.width, trainSize.height).setDepth(10);
    this.train = arrivingTrain;
    this.maskTrainToTrack(arrivingTrain, LITTLE_INDIA_DTL_TRACK_MASKS.expo);
    this.tweens.add({
      targets: arrivingTrain,
      x: DTL_TRAIN_STOP_X,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.dtlTrainsReady = true;
        arrivingTrain.setTexture(TRAIN_OPEN_KEYS['little-india-dtl']);
        this.setPlatformDoors(true, 'little-india-dtl');
        this.updateLiveDtlBoard();
        if (this.selectedRailDirection === 'Expo') this.openSelectedDtlTrain();
        this.dtlExpoDepartureTimer?.remove(false);
        this.dtlExpoDepartureTimer = this.time.delayedCall(
          NEL_PLATFORM_DWELL_MS,
          () => this.departLiveDtlExpoTrain(arrivingTrain),
        );
      },
    });
  }

  private departLiveDtlExpoTrain(departingTrain: Phaser.GameObjects.Image) {
    if (
      this.railLeg !== 'little-india-dtl' ||
      this.mode !== 'rail' ||
      this.train !== departingTrain
    ) return;
    const trainExit = objectByName(this.railMap!, 'Spawns', 'train-exit');
    this.dtlExpoDepartureTimer = undefined;
    this.dtlTrainsReady = false;
    this.railDoorsOpen = false;
    this.setPlatformDoors(false, 'little-india-dtl');
    departingTrain.setTexture(TRAIN_KEYS['little-india-dtl']);
    if (this.selectedRailDirection === 'Expo') this.setContext('dtl-arriving');
    this.tweens.add({
      targets: departingTrain,
      x: trainExit?.x ?? 900,
      duration: 650,
      ease: 'Cubic.In',
      onComplete: () => {
        if (this.train !== departingTrain) return;
        departingTrain.destroy();
        this.train = undefined;
        this.dtlExpoCountdownMs = NEL_NEXT_TRAIN_MS;
        this.updateLiveDtlBoard();
      },
    });
  }

  private arriveLiveDtlBukitPanjangTrain() {
    if (this.railLeg !== 'little-india-dtl' || !this.railMap || this.oppositeTrain) return;
    const oppositeStart = objectByName(this.railMap, 'Spawns', 'opposite-train-start');
    const trainSize = TRAIN_DISPLAY['little-india-dtl'];
    const arrivingTrain = this.add.image(
      oppositeStart?.x ?? -720,
      (oppositeStart?.y ?? 350) + trainSize.yOffset,
      TRAIN_KEYS['little-india-dtl'],
    ).setDisplaySize(trainSize.width, trainSize.height).setDepth(10).setFlipX(true);
    this.oppositeTrain = arrivingTrain;
    this.maskTrainToTrack(arrivingTrain, LITTLE_INDIA_DTL_TRACK_MASKS.bukitPanjang);
    this.tweens.add({
      targets: arrivingTrain,
      x: 386,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => {
        arrivingTrain.setTexture(TRAIN_OPEN_KEYS['little-india-dtl']);
        this.updateLiveDtlBoard();
        this.time.delayedCall(NEL_PLATFORM_DWELL_MS, () => {
          if (this.oppositeTrain !== arrivingTrain || this.railLeg !== 'little-india-dtl') return;
          arrivingTrain.setTexture(TRAIN_KEYS['little-india-dtl']);
          this.tweens.add({
            targets: arrivingTrain,
            x: 1450,
            duration: 650,
            ease: 'Cubic.In',
            onComplete: () => {
              arrivingTrain.destroy();
              if (this.oppositeTrain === arrivingTrain) this.oppositeTrain = undefined;
              this.dtlBukitPanjangCountdownMs = NEL_NEXT_TRAIN_MS;
              this.updateLiveDtlBoard();
            },
          });
        });
      },
    });
  }

  private openSelectedDtlTrain() {
    if (
      this.railLeg !== 'little-india-dtl' ||
      !this.train ||
      !this.dtlTrainsReady ||
      this.railDoorsOpen
    ) return;
    this.railDoorsOpen = true;
    this.inputLocked = false;
    this.showPlatformBoardingCue();
    this.setContext('dtl-boarding');
  }

  private stopDtlServiceClock() {
    this.dtlServiceClock?.remove(false);
    this.dtlServiceClock = undefined;
    this.dtlExpoDepartureTimer?.remove(false);
    this.dtlExpoDepartureTimer = undefined;
  }

  private arriveRailTrain() {
    if (!this.railLeg || this.train) return;
    const isLrt = this.railLeg === 'kadaloor-lrt';
    this.setContext(
      isLrt ? 'lrt-arriving' : this.railLeg === 'punggol-nel' ? 'nel-arriving' : 'dtl-arriving',
    );

    const trainSize = TRAIN_DISPLAY[this.railLeg];
    const trainStart = objectByName(this.railMap!, 'Spawns', 'train-start');
    const trainStop = objectByName(this.railMap!, 'Spawns', 'train-stop');
    const train = this.add.image(
      trainStart?.x ?? 2500,
      (trainStart?.y ?? (isLrt ? 335 : 350)) + trainSize.yOffset,
      TRAIN_KEYS[this.railLeg],
    ).setDisplaySize(trainSize.width, trainSize.height).setDepth(10);
    if (this.railLeg === 'little-india-dtl') {
      this.maskTrainToTrack(train, LITTLE_INDIA_DTL_TRACK_MASKS.expo);

      // Mirror the NEL island-platform treatment: the opposite-direction train
      // is visible on the other side, while only straight middle-car sections
      // are exposed through the glass door apertures.
      const oppositeStart = objectByName(this.railMap!, 'Spawns', 'opposite-train-start');
      const oppositeStop = objectByName(this.railMap!, 'Spawns', 'opposite-train-stop');
      const oppositeTrain = this.add.image(
        oppositeStart?.x ?? -720,
        (oppositeStart?.y ?? 350) + trainSize.yOffset,
        TRAIN_KEYS['little-india-dtl'],
      ).setDisplaySize(trainSize.width, trainSize.height).setDepth(10).setFlipX(true);
      this.maskTrainToTrack(oppositeTrain, LITTLE_INDIA_DTL_TRACK_MASKS.bukitPanjang);
      this.oppositeTrain = oppositeTrain;
      this.tweens.add({
        targets: oppositeTrain,
        x: oppositeStop?.x ?? 120,
        duration: 800,
        ease: 'Cubic.Out',
      });
    }
    this.train = train;

    this.tweens.add({
      targets: train,
      x: trainStop?.x ?? 640,
        duration: isLrt ? 700 : 800,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.time.delayedCall(120, () => {
          this.railDoorsOpen = true;
          this.inputLocked = false;
          train.setTexture(TRAIN_OPEN_KEYS[this.railLeg!]);
          this.setPlatformDoors(true);
          this.showPlatformBoardingCue();
          this.setContext(
            isLrt ? 'lrt-boarding' : this.railLeg === 'punggol-nel' ? 'nel-boarding' : 'dtl-boarding',
          );
        });
      },
    });
  }

  private boardTrain() {
    if (!this.railLeg || !this.train || !this.railDoorsOpen || this.journeyComplete) return;
    const currentLeg = this.railLeg;
    this.clearRailDoorCue();
    if (currentLeg === 'punggol-nel') {
      this.nelHarbourFrontDepartureTimer?.remove(false);
      this.nelHarbourFrontDepartureTimer = undefined;
    }
    if (currentLeg === 'little-india-dtl') {
      this.dtlExpoDepartureTimer?.remove(false);
      this.dtlExpoDepartureTimer = undefined;
    }
    const trainExit = objectByName(this.railMap!, 'Spawns', 'train-exit');
    const boardingZone = this.railMap?.layers
      .find((layer) => layer.name === 'Interactions')
      ?.objects?.find((object) => propertyValue(object, 'action') === 'board');
    this.inputLocked = true;
    this.playerFacing = 'back';
    this.player?.setFlipX(false).setVelocity(0, 0).anims.play('scene4-player-walk-back', true);
    this.tweens.add({
      targets: this.player,
      x: (boardingZone?.x ?? 530) + (boardingZone?.width ?? 220) / 2,
      y: boardingZone?.y ?? 500,
      duration: 350,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.player?.anims.stop();
        this.player?.setVisible(false);
        this.setContext(
          currentLeg === 'kadaloor-lrt'
            ? 'lrt-riding'
            : currentLeg === 'punggol-nel'
              ? 'nel-riding'
              : 'dtl-riding',
        );
        this.cameraShake(260, 0.002);
      },
    });
    this.time.delayedCall(250, () => {
      this.setPlatformDoors(false, currentLeg);
      this.train?.setTexture(TRAIN_KEYS[currentLeg]);
    });
    this.time.delayedCall(350, () => {
      this.tweens.add({
        targets: this.train,
        x: trainExit?.x ?? -780,
        duration: 550,
        ease: 'Cubic.In',
        onComplete: () => {
          this.enterRailTrainInterior(currentLeg);
        },
      });
    });
  }

  private enterRailTrainInterior(legId: RailLegId) {
    if (!this.player || this.railLeg !== legId) return;
    const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId);
    if (!leg) return;
    this.mode = 'rail-interior';
    this.railInteriorDoorsOpen = false;
    this.currentRailStopIndex = -1;
    this.railTravelDirection = 1;
    this.clearDtlTerminalStaff();
    this.railStopAdvanceTimer?.remove(false);
    this.railStopAdvanceTimer = undefined;
    this.stopNelServiceClock();
    this.stopDtlServiceClock();
    this.nelHarbourFrontBoardText = undefined;
    this.nelPunggolCoastBoardText = undefined;
    this.dtlExpoBoardText = undefined;
    this.dtlBukitPanjangBoardText = undefined;
    this.beginStageTransition();
    this.clearRailDoorCue();
    this.background?.setVisible(false);
    this.bus?.setVisible(false);
    this.exteriorObjects.forEach((object) => object.destroy());
    this.exteriorObjects = [];
    this.collisionBodies.forEach((object) => object.destroy());
    this.collisionBodies = [];
    this.train?.destroy();
    this.train = undefined;
    this.oppositeTrain?.destroy();
    this.oppositeTrain = undefined;
    this.platformDoorLayer = undefined;
    this.destroyRailSeats();
    this.railObjects.forEach((object) => object.destroy());
    this.railObjects = [];
    this.railInteriorBackground = undefined;
    this.cameras.main.fadeOut(180, 18, 27, 42);

    this.time.delayedCall(200, () => {
      this.worldWidth = RAIL_WORLD_WIDTH;
      this.physics.world.setBounds(0, 0, RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT);
      this.cameras.main
        .setBounds(0, 0, RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT)
        .setScroll(0, 0);
      this.railInteriorBackground = this.add
        .image(0, 0, RAIL_INTERIOR_BACKGROUND_KEYS[legId])
        .setOrigin(0, 0)
        .setDisplaySize(RAIL_WORLD_WIDTH, RAIL_WORLD_HEIGHT)
        .setDepth(0);
      this.railObjects.push(this.railInteriorBackground);

      this.createRailSeats();

      this.resetPlayerToWalkingPose('rail-standing');
      this.player?.setPosition(500, 682)
        .setScale(playerScaleFor('rail-standing'))
        .setDepth(60)
        .setFlipX(false)
        .setVisible(true)
        .setVelocity(0, 0);
      this.armStageInputRelease();
      this.setContext(
        legId === 'kadaloor-lrt'
          ? 'lrt-riding'
          : legId === 'punggol-nel'
            ? 'nel-riding'
            : 'dtl-riding',
      );
      this.cameras.main.fadeIn(240, 18, 27, 42);
      this.time.delayedCall(120, () => this.playRailStopSequence(legId));
    });
  }

  private updateRailInterior() {
    if (
      !this.player ||
      !this.railInteriorDoorsOpen ||
      this.wrongRailStopInProgress ||
      this.seatedSeatIndex !== undefined
    ) return;
    const isAtOpenDoor = RAIL_EXIT_ZONES.some((zone) => (
      this.player!.x >= zone.x &&
      this.player!.x <= zone.x + zone.width &&
      this.player!.y >= zone.y &&
      this.player!.y <= zone.y + zone.height
    ));
    if (isAtOpenDoor) this.alightAtCurrentRailStop();
  }

  private setRailInteriorDoorVisualState(open: boolean) {
    if (!this.railLeg || !this.railInteriorBackground) return;
    this.railInteriorBackground.setTexture(
      open
        ? RAIL_INTERIOR_OPEN_BACKGROUND_KEYS[this.railLeg]
        : RAIL_INTERIOR_BACKGROUND_KEYS[this.railLeg],
    );
  }

  private playRailStopSequence(legId: RailLegId, index = 0) {
    if (
      this.railLeg !== legId ||
      (this.mode !== 'rail' && this.mode !== 'rail-interior')
    ) return;
    const stops = RAIL_PLAYABLE_STOP_FACTS[legId];
    if (index < 0 || index >= stops.length) {
      return;
    }

    this.currentRailStopIndex = index;
    this.railInteriorDoorsOpen = true;
    this.setRailInteriorDoorVisualState(true);
    this.game.events.emit('commute:rail-interior-doors', true);
    this.game.events.emit('commute:rail-stop', {
      ...stops[index],
      index: index + 1,
      nextStation: stops[index + 1]?.station,
      targetIsNext: stops[index + 1]?.station === SCENE4_ROUTE.find((candidate) => candidate.id === legId)?.alightAt,
      legId,
      total: stops.length,
    } satisfies ActiveRailStop);
    this.cameraShake(140, 0.0012);
    this.cameraFlash(90, 120, 190, 220);

    const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId);
    if (stops[index].station === leg?.alightAt) {
      this.showRailDoorCue(RAIL_EXIT_ZONES[0], `EXIT FOR ${stops[index].station.toUpperCase()} ↑`);
    } else {
      this.clearRailDoorCue();
    }
    const isDtl = legId === 'little-india-dtl';
    const isExpoTerminal = isDtl && stops[index].station === 'Expo';
    if (isExpoTerminal) {
      // Expo is the end of the Downtown Line journey in this game. Keep the
      // doors open and never reverse the train back through the stop list.
      this.dtlTerminalStaffTimer?.remove(false);
      this.dtlTerminalStaffTimer = this.time.delayedCall(
        DTL_EXPO_STAFF_DELAY_MS,
        () => this.summonDtlTerminalStaff(),
      );
      return;
    }

    const dwellMs = isDtl
      ? DTL_INTERMEDIATE_STOP_DWELL_MS
      : stops[index].station === leg?.alightAt
      ? RAIL_TARGET_STOP_DWELL_MS
      : RAIL_STOP_DWELL_MS;
    this.railStopAdvanceTimer = this.time.delayedCall(dwellMs, () => {
      if (this.railLeg !== legId || this.mode !== 'rail-interior') return;
      this.railInteriorDoorsOpen = false;
      this.setRailInteriorDoorVisualState(false);
      this.clearRailDoorCue();
      this.game.events.emit('commute:rail-interior-doors', false);
      this.game.events.emit('commute:rail-stop', undefined);
      this.cameraShake(120, 0.001);
      this.railStopAdvanceTimer = this.time.delayedCall(
        RAIL_BETWEEN_STOPS_MS,
        () => this.playRailStopSequence(
          legId,
          isDtl ? index + 1 : this.nextRailStopIndex(index, stops.length),
        ),
      );
    });
  }

  private summonDtlTerminalStaff() {
    this.dtlTerminalStaffTimer = undefined;
    if (
      !this.player ||
      this.railLeg !== 'little-india-dtl' ||
      this.mode !== 'rail-interior' ||
      !this.railInteriorDoorsOpen ||
      RAIL_PLAYABLE_STOP_FACTS['little-india-dtl'][this.currentRailStopIndex]?.station !== 'Expo'
    ) return;

    this.setContext('dtl-last-stop-reminder');
    const spawnX = 1570;
    const approachFromRight = spawnX >= this.player.x;
    const targetX = Phaser.Math.Clamp(
      this.player.x + (approachFromRight ? 125 : -125),
      140,
      RAIL_WORLD_WIDTH - 140,
    );
    const staff = this.add.image(spawnX, 680, MRT_STAFF_KEY)
      .setOrigin(0.5, 1)
      .setScale(MRT_STAFF_SCALE)
      .setFlipX(approachFromRight)
      .setDepth(58);
    this.mrtStaff = staff;
    this.mrtStaffTween = this.tweens.add({
      targets: staff,
      x: targetX,
      duration: Phaser.Math.Clamp(Math.abs(spawnX - targetX) * 2.5, 800, 3500),
      ease: 'Linear',
      onComplete: () => {
        this.mrtStaffTween = undefined;
        if (!staff.active || this.mode !== 'rail-interior') return;
        this.showMrtStaffBubble(staff.x, staff.y - staff.displayHeight - 54);
      },
    });
  }

  private showMrtStaffBubble(x: number, y: number) {
    this.mrtStaffBubble?.destroy();
    const width = 360;
    const height = 96;
    const bubbleX = Phaser.Math.Clamp(x, width / 2 + 22, RAIL_WORLD_WIDTH - width / 2 - 22);
    const bubbleY = Math.max(78, y);
    const background = this.add.rectangle(0, 0, width, height, 0xffffff, 0.98)
      .setStrokeStyle(4, 0x182235);
    const tail = this.add.triangle(
      0,
      height / 2 + 10,
      -14,
      -9,
      14,
      -9,
      0,
      13,
      0xffffff,
      0.98,
    ).setStrokeStyle(3, 0x182235);
    const message = this.add.text(
      0,
      -2,
      'Please get down. Expo is the last stop.',
      {
        color: '#182235',
        fontFamily: 'Arial, sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width - 36 },
      },
    ).setOrigin(0.5);
    this.mrtStaffBubble = this.add.container(bubbleX, bubbleY, [tail, background, message])
      .setDepth(75);
  }

  private clearDtlTerminalStaff() {
    this.dtlTerminalStaffTimer?.remove(false);
    this.dtlTerminalStaffTimer = undefined;
    this.mrtStaffTween?.stop();
    this.mrtStaffTween = undefined;
    this.mrtStaffBubble?.destroy();
    this.mrtStaffBubble = undefined;
    this.mrtStaff?.destroy();
    this.mrtStaff = undefined;
  }

  private nextRailStopIndex(index: number, total: number) {
    const next = nextBouncingStopIndex(index, total, this.railTravelDirection);
    this.railTravelDirection = next.direction;
    return next.index;
  }

  private alightAtCurrentRailStop() {
    if (
      !this.railLeg ||
      this.mode !== 'rail-interior' ||
      !this.railInteriorDoorsOpen ||
      this.currentRailStopIndex < 0 ||
      this.wrongRailStopInProgress
    ) return;

    const legId = this.railLeg;
    const stops = RAIL_PLAYABLE_STOP_FACTS[legId];
    const stop = stops[this.currentRailStopIndex];
    if (!stop) return;
    const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId);
    const isCorrectStop = stop.station === leg?.alightAt;
    if (legId === 'little-india-dtl') this.clearDtlTerminalStaff();
    this.railStopAdvanceTimer?.remove(false);
    this.railStopAdvanceTimer = undefined;
    this.railInteriorDoorsOpen = false;
    this.setRailInteriorDoorVisualState(false);
    this.game.events.emit('commute:rail-interior-doors', false);
    this.game.events.emit('commute:rail-stop', undefined);
    this.inputLocked = true;
    this.player?.setVelocity(0, 0);

    if (isCorrectStop) {
      if (legId === 'kadaloor-lrt') this.enterStationStage('punggol-interchange');
      else if (legId === 'punggol-nel') this.enterStationStage('little-india-nel-arrival');
      else this.enterStationStage('expo-dtl-arrival');
      return;
    }

    this.wrongRailStopInProgress = true;
    this.railHearts = Math.max(0, this.railHearts - 1);
    this.game.events.emit('commute:lose-heart', {
      checkpoint: stop.station,
      legId,
      station: stop.station,
    } satisfies WrongRailStop);
    if (this.railHearts === 0) {
      this.setContext('out-of-time');
      return;
    }
    this.setContext('rail-wrong-stop');
    this.railStopAdvanceTimer = this.time.delayedCall(2200, () => {
      if (this.railLeg !== legId || this.mode !== 'rail-interior') return;
      this.wrongRailStopInProgress = false;
      this.armStageInputRelease();
      this.setContext(
        legId === 'kadaloor-lrt'
          ? 'lrt-riding'
          : legId === 'punggol-nel'
            ? 'nel-riding'
            : 'dtl-riding',
      );
      // The passenger has stepped back into the same carriage at this station.
      // Move them just clear of the exit trigger so the next stop does not
      // automatically count as another alight attempt.
      this.player?.setPosition(this.player.x, 680).setVelocity(0, 0);
      this.cameraShake(120, 0.001);
      this.railStopAdvanceTimer = this.time.delayedCall(
        RAIL_BETWEEN_STOPS_MS,
        () => this.playRailStopSequence(
          legId,
          legId === 'little-india-dtl'
            ? this.currentRailStopIndex + 1
            : this.nextRailStopIndex(this.currentRailStopIndex, stops.length),
        ),
      );
    });
  }

  private setPlatformDoors(open: boolean, legId = this.railLeg) {
    if (!legId || !this.platformDoorLayer) return;
    const textures = PLATFORM_DOOR_KEYS[legId];
    if (!textures) return;
    this.platformDoorLayer.setTexture(open ? textures.open : textures.closed);
  }

  private finishJourney() {
    if (this.journeyComplete) return;
    this.journeyComplete = true;
    this.inputLocked = true;
    this.player?.setVelocity(0, 0).anims.stop();
    this.player?.setTexture(PLAYER_FRONT_KEY, 1).setFlipX(false);
    this.clearDtlTerminalStaff();
    this.train?.destroy();
    this.train = undefined;
    this.oppositeTrain?.destroy();
    this.oppositeTrain = undefined;
    this.destroyRailSeats();
    this.add.rectangle(640, 360, 1280, 720, 0x071b24, 0.3)
      .setDepth(100)
      .setScrollFactor(0);
    this.add.rectangle(640, 330, 780, 310, 0x0f3b4a, 0.96)
      .setStrokeStyle(4, 0xf7b928, 0.95)
      .setDepth(101)
      .setScrollFactor(0);
    this.add.text(640, 230, 'ARRIVED AT THE ENTRANCE', {
      color: '#f7b928',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
    this.add.text(640, 305, 'TCS · The Signature', {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
    this.add.text(640, 365, '51 Changi Business Park Central 2', {
      color: '#c9e2e5',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
    this.add.text(640, 415, 'Journey complete · arrived at The Signature entrance', {
      color: '#c9e2e5',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
    this.setContext('complete');
    this.game.events.emit('commute:complete');
  }

  private nudgePlayer(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.player || this.inputLocked) return;
    const amount = 56;
    if (direction === 'left') this.player.x -= amount;
    if (direction === 'right') this.player.x += amount;
    if (direction === 'up') this.player.y -= amount;
    if (direction === 'down') this.player.y += amount;
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, this.worldWidth - 30);
    this.constrainPlayerToWalkableFloor();
    if (direction === 'up') {
      this.playerFacing = 'back';
      this.player.setFlipX(false).setTexture(PLAYER_BACK_KEY, 1);
    } else if (direction === 'down') {
      this.playerFacing = 'front';
      this.player.setFlipX(false).setTexture(PLAYER_FRONT_KEY, 1);
    } else {
      this.playerFacing = 'side';
      this.player.setFlipX(direction === 'left').setTexture(PLAYER_KEY, 1);
    }
  }

  private activateNearestInteraction() {
    if (!this.player) return;
    if (this.inputLocked) {
      if (this.transitionAwaitingRelease) this.queuedInteraction = true;
      return;
    }
    if (this.mode === 'bus-interior') {
      if (this.seatedSeatIndex !== undefined) {
        this.standUpFromBusSeat();
        return;
      }
      const reader = this.fareTapped && this.atDestination ? this.exitFareReader : this.entryFareReader;
      if (reader && Math.abs(this.player.x - reader.x) <= 220) {
        this.handleBusFareReaderClick(reader);
        return;
      }
      if (this.fareTapped && !this.busDoorsOpen) this.sitInNearestAvailableSeat();
      else if (reader) this.showStationGateMessage('Walk beside the reader, then press E', reader.x, reader.y - 35);
      return;
    }
    if (this.mode === 'rail-interior') {
      if (this.seatedSeatIndex !== undefined) this.standUpFromRailSeat();
      else this.sitInNearestAvailableSeat();
      return;
    }
    if (this.mode === 'station' && this.stationStage && this.stationFareGateSpecs.length > 0) {
      let nearestIndex = 0;
      this.stationFareGateSpecs.forEach((gate, index) => {
        const current = this.stationFareGateSpecs[nearestIndex];
        if (Math.abs(gate.readerX - this.player!.x) < Math.abs(current.readerX - this.player!.x)) {
          nearestIndex = index;
        }
      });
      this.selectStationFareGate(this.stationStage, this.stationFareGateSpecs[nearestIndex], nearestIndex);
      return;
    }
    if (this.mode === 'rail' && this.railDoorsOpen) this.boardTrain();
  }

  private setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
  }

  private cameraShake(duration: number, intensity: number) {
    if (!this.reducedMotion) this.cameras.main.shake(duration, intensity);
  }

  private cameraFlash(duration: number, red: number, green: number, blue: number) {
    if (!this.reducedMotion) this.cameras.main.flash(duration, red, green, blue, false);
  }

  private drawDebugGeometry() {
    const graphics = this.debugGraphics;
    if (!graphics) return;
    graphics.clear();
    if (!this.debugGeometryVisible || !this.player) return;

    const floor = this.currentWalkableFloorBounds();
    if (floor) {
      const minX = floor.minX ?? 0;
      const maxX = floor.maxX ?? this.worldWidth;
      graphics.lineStyle(3, 0x41f5a6, 0.9);
      graphics.strokeRect(minX, floor.minY, maxX - minX, floor.maxY - floor.minY);
    }
    graphics.lineStyle(3, 0xff4c74, 1);
    graphics.strokeRect(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);
    graphics.fillStyle(0xff4c74, 1);
    graphics.fillCircle(this.player.x, this.player.y, 6);

    if (this.stationPortal) {
      graphics.lineStyle(4, 0xf7b928, 0.95);
      graphics.strokeRect(
        this.stationPortal.x,
        this.stationPortal.y,
        this.stationPortal.width ?? 0,
        this.stationPortal.height ?? 0,
      );
    }
    graphics.lineStyle(3, 0x4cc9ff, 0.9);
    this.railSeatZones.forEach((seat) => graphics.strokeRect(
      seat.x - seat.displayWidth / 2,
      seat.y - seat.displayHeight / 2,
      seat.displayWidth,
      seat.displayHeight,
    ));
    RAIL_EXIT_ZONES.forEach((zone) => graphics.strokeRect(zone.x, zone.y, zone.width, zone.height));

    const masks = this.railLeg === 'punggol-nel'
      ? [...PUNGGOL_NEL_TRACK_MASKS.harbourFront, ...PUNGGOL_NEL_TRACK_MASKS.punggolCoast]
      : this.railLeg === 'little-india-dtl'
        ? [...LITTLE_INDIA_DTL_TRACK_MASKS.expo, ...LITTLE_INDIA_DTL_TRACK_MASKS.bukitPanjang]
        : [];
    graphics.lineStyle(3, 0xbf70ff, 0.9);
    masks.forEach((mask) => graphics.strokeRect(mask.x, mask.y, mask.width, mask.height));
  }

  private createExteriorCollisions(map: Scene4MapData) {
    if (!this.player) return;

    const collisionLayer = map.layers.find((layer) => layer.name === 'Collision');
    collisionLayer?.objects?.forEach((object) => {
      const width = object.width ?? 0;
      const height = object.height ?? 0;
      if (width <= 0 || height <= 0) return;

      const body = this.add
        .rectangle(
          object.x + width / 2,
          object.y + height / 2,
          width,
          height,
          0xff3156,
          0,
        )
        .setDepth(900);
      this.physics.add.existing(body, true);
      this.physics.add.collider(this.player!, body);
      this.collisionBodies.push(body);
    });
  }

  private createExteriorEnvironment() {
    const objects: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(object: T) => {
      objects.push(object);
      return object;
    };

    add(
      this.add
        .image(1145, 210, SHELTER_KEY)
        .setOrigin(0, 0)
        .setDisplaySize(520, 322)
        .setDepth(410),
    );
    add(
      this.add
        .image(1300, 445, BENCH_KEY)
        .setOrigin(0, 0)
        .setDisplaySize(280, 88)
        .setDepth(542),
    );
    add(
      this.add
        .image(1608, 108, STOP_POLE_KEY)
        .setOrigin(0, 0)
        .setDisplaySize(130, 428)
        .setDepth(537),
    );

    [1855, 1965].forEach((x) => {
      add(
        this.add
          .image(x, 431, BOLLARD_KEY)
          .setOrigin(0, 0)
          .setDisplaySize(34, 105)
          .setDepth(540),
      );
    });

    // Exact stop data is rendered once over a clean panel so generated text
    // can never become gameplay data or wrap unpredictably.
    add(
      this.add
        .rectangle(1673, 190, 112, 58, 0x075965, 1)
        .setStrokeStyle(2, 0xe8f4ef)
        .setDepth(538),
    );
    add(
      this.add.text(1622, 165, '65321', {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
      }).setDepth(539),
    );
    add(
      this.add
        .text(1673, 193, 'Kadaloor Stn\nExit B', {
          align: 'center',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          lineSpacing: 0,
        })
        .setOrigin(0.5)
        .setDepth(539),
    );
    const stopServices = ['50', '666', '683'];
    stopServices.forEach((service, index) => {
      const x = 1625 + index * 34;
      add(
        this.add
          .rectangle(x + 13, 255, 27, 20, service === '50' ? 0xf7b928 : 0x172133)
          .setOrigin(0.5)
          .setDepth(539),
      );
      add(
        this.add
          .text(x + 13, 255, service, {
            color: service === '50' ? '#111827' : '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontSize: service.length === 2 ? '10px' : '8px',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setDepth(540),
      );
    });

    return objects;
  }
}

export interface CommuteGameProps {
  completionXp: number;
  onSessionComplete: () => void;
  onDone: () => void;
}

export function CommuteGame({
  completionXp,
  onSessionComplete,
  onDone,
}: CommuteGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const mapCloseRef = useRef<HTMLButtonElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const completionHandledRef = useRef(false);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const [context, setContext] = useState<InteractionContext>('walking');
  const [raisedHand, setRaisedHand] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FareItemKind>();
  const [busStopName, setBusStopName] = useState<string>();
  const [busDoorsOpen, setBusDoorsOpen] = useState(false);
  const [busStopRequested, setBusStopRequested] = useState(false);
  const [busDwell, setBusDwell] = useState<BusDwellState>();
  const [railStop, setRailStop] = useState<ActiveRailStop>();
  const [railInteriorDoorsOpen, setRailInteriorDoorsOpen] = useState(false);
  const [railHearts, setRailHearts] = useState(3);
  const [wrongRailStop, setWrongRailStop] = useState<WrongRailStop>();
  const [busTaskPopupVisible, setBusTaskPopupVisible] = useState(false);
  const [mrtMapOpen, setMrtMapOpen] = useState(false);
  const [journeyBranch, setJourneyBranch] = useState<'bus' | 'lrt'>();

  useEffect(() => {
    const repeatsUntilActionIsComplete =
      context === 'last-stop-reminder' || context === 'tap-out-warning';
    if (!repeatsUntilActionIsComplete) {
      setBusTaskPopupVisible(false);
      return;
    }

    let hideTimer: number | undefined;
    const showForFiveSeconds = () => {
      setBusTaskPopupVisible(true);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setBusTaskPopupVisible(false), 5000);
    };
    showForFiveSeconds();
    const repeatTimer = window.setInterval(showForFiveSeconds, 10_000);

    return () => {
      window.clearInterval(repeatTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [context]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  useEffect(() => {
    if (!gameRef.current) return;
    if (mrtMapOpen) {
      gameRef.current.scene.pause('CommuteQuest');
      window.setTimeout(() => mapCloseRef.current?.focus(), 0);
    } else {
      gameRef.current.scene.resume('CommuteQuest');
    }
  }, [mrtMapOpen]);

  useEffect(() => {
    if (!mrtMapOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMrtMapOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mrtMapOpen]);

  useEffect(() => {
    if (!parentRef.current || gameRef.current) return;

    const scene = new CommuteQuestScene();
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: parentRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#273341',
      physics: {
        default: 'arcade',
        arcade: { debug: false, gravity: { x: 0, y: 0 } },
      },
      render: { antialias: true, pixelArt: false, roundPixels: false },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene,
    });

    const handleContext = (nextContext: InteractionContext) => {
      setContext(nextContext);
    };
    const handleComplete = () => {
      if (completionHandledRef.current) return;
      completionHandledRef.current = true;
      onSessionCompleteRef.current();
    };
    const handleBusStop = (stopName: string) => {
      setBusStopName(stopName);
    };
    const handleBusDoors = (open: boolean) => {
      setBusDoorsOpen(open);
    };
    const handleBusStopRequested = (requested: boolean) => {
      setBusStopRequested(requested);
    };
    const handleBusDwell = (dwell: BusDwellState | undefined) => {
      setBusDwell(dwell);
    };
    const handleRailStop = (stop: ActiveRailStop | undefined) => {
      setRailStop(stop);
    };
    const handleRailInteriorDoors = (open: boolean) => {
      setRailInteriorDoorsOpen(open);
    };
    const handleLoseHeart = (stop: WrongRailStop) => {
      setWrongRailStop(stop);
      setRailHearts((current) => Math.max(0, current - 1));
    };
    const handleFareItemStored = () => {
      setSelectedItem(undefined);
    };
    const handleBranch = (branch: 'bus' | 'lrt') => setJourneyBranch(branch);
    const handleJourneyReset = () => {
      setContext('walking');
      setRaisedHand(false);
      setSelectedItem(undefined);
      setBusStopName(undefined);
      setBusDoorsOpen(false);
      setBusStopRequested(false);
      setBusDwell(undefined);
      setRailStop(undefined);
      setRailInteriorDoorsOpen(false);
      setRailHearts(3);
      setWrongRailStop(undefined);
      setJourneyBranch(undefined);
    };
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReducedMotion = () => {
      game.events.emit('commute:reduced-motion', reducedMotionQuery.matches);
    };
    game.events.on('commute:context', handleContext);
    game.events.on('commute:complete', handleComplete);
    game.events.on('commute:bus-stop', handleBusStop);
    game.events.on('commute:bus-doors', handleBusDoors);
    game.events.on('commute:bus-stop-requested', handleBusStopRequested);
    game.events.on('commute:bus-dwell', handleBusDwell);
    game.events.on('commute:rail-stop', handleRailStop);
    game.events.on('commute:rail-interior-doors', handleRailInteriorDoors);
    game.events.on('commute:lose-heart', handleLoseHeart);
    game.events.on('commute:fare-item-stored', handleFareItemStored);
    game.events.on('commute:branch', handleBranch);
    game.events.on('commute:journey-reset', handleJourneyReset);
    game.events.on('commute:ready', syncReducedMotion);
    reducedMotionQuery.addEventListener('change', syncReducedMotion);
    gameRef.current = game;

    return () => {
      game.events.off('commute:context', handleContext);
      game.events.off('commute:complete', handleComplete);
      game.events.off('commute:bus-stop', handleBusStop);
      game.events.off('commute:bus-doors', handleBusDoors);
      game.events.off('commute:bus-stop-requested', handleBusStopRequested);
      game.events.off('commute:bus-dwell', handleBusDwell);
      game.events.off('commute:rail-stop', handleRailStop);
      game.events.off('commute:rail-interior-doors', handleRailInteriorDoors);
      game.events.off('commute:lose-heart', handleLoseHeart);
      game.events.off('commute:fare-item-stored', handleFareItemStored);
      game.events.off('commute:branch', handleBranch);
      game.events.off('commute:journey-reset', handleJourneyReset);
      game.events.off('commute:ready', syncReducedMotion);
      reducedMotionQuery.removeEventListener('change', syncReducedMotion);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleRaiseHand = () => {
    setRaisedHand(true);
    gameRef.current?.events.emit('commute:raise-hand');
  };

  const handleSelectItem = (kind: FareItemKind) => {
    setSelectedItem(kind);
    gameRef.current?.events.emit('commute:select-item', kind);
  };

  const handleNudge = (direction: 'left' | 'right' | 'up' | 'down') => {
    gameRef.current?.events.emit('commute:nudge', direction);
    gameRef.current?.canvas.focus();
  };

  const handleRequestBusStop = () => {
    gameRef.current?.events.emit('commute:request-bus-stop');
    gameRef.current?.canvas.focus();
  };

  const handleInteract = () => {
    gameRef.current?.events.emit('commute:interact');
    gameRef.current?.canvas.focus();
  };

  const handleDirectionChoice = (direction: string) => {
    gameRef.current?.events.emit('commute:choose-direction', direction);
    gameRef.current?.canvas.focus();
  };

  const handleRestartJourney = () => {
    completionHandledRef.current = false;
    const scene = gameRef.current?.scene.getScene('CommuteQuest');
    scene?.scene.restart();
    window.setTimeout(() => gameRef.current?.canvas.focus(), 0);
  };

  const handleDebugCheckpoint = (checkpointId: DebugCheckpointId) => {
    const scene = gameRef.current?.scene.getScene('CommuteQuest') as CommuteQuestScene | undefined;
    if (!scene || !gameRef.current) return;
    // Development jumps are visual inspection tools, not reward-bearing runs.
    completionHandledRef.current = true;
    gameRef.current.events.once('commute:ready', () => {
      const restartedScene = gameRef.current?.scene.getScene('CommuteQuest') as CommuteQuestScene | undefined;
      if (checkpointId === 'the-signature-arrival') {
        restartedScene?.debugEnterStationStage('the-signature-exterior');
        window.setTimeout(() => restartedScene?.debugFinishJourney(), 260);
      } else if (checkpointId === 'bus-entry' || checkpointId === 'bus-seated') {
        if (checkpointId === 'bus-seated') restartedScene?.debugEnterBusSeated();
        else restartedScene?.debugEnterBusInterior();
      } else if (
        checkpointId === 'lrt-seated' ||
        checkpointId === 'nel-seated' ||
        checkpointId === 'dtl-seated'
      ) {
        restartedScene?.debugEnterRailSeated(
          checkpointId === 'lrt-seated'
            ? 'kadaloor-lrt'
            : checkpointId === 'nel-seated'
              ? 'punggol-nel'
              : 'little-india-dtl',
        );
      } else if (
        checkpointId === 'lrt-platform-open' ||
        checkpointId === 'nel-platform-open' ||
        checkpointId === 'dtl-platform-open'
      ) {
        restartedScene?.debugEnterRailPlatform(
          checkpointId === 'lrt-platform-open'
            ? 'kadaloor-lrt'
            : checkpointId === 'nel-platform-open'
              ? 'punggol-nel'
              : 'little-india-dtl',
        );
      } else {
        restartedScene?.debugEnterStationStage(checkpointId);
      }
      gameRef.current?.canvas.focus();
    });
    scene.scene.restart();
  };

  const closeMrtMap = () => {
    setMrtMapOpen(false);
    window.setTimeout(() => gameRef.current?.canvas.focus(), 0);
  };

  const isBusInterior = [
    'choose-item',
    'item-selected',
    'reader',
    'wrong-item',
    'driver-warning',
    'tapping',
    'fare-success',
    'standing',
    'seated',
    'bus-moving',
    'aisle',
    'bus-stop-open',
    'tap-out',
    'choose-exit-item',
    'exit-item-selected',
    'tap-out-warning',
    'last-stop-reminder',
    'exit-ok',
    'alighting',
    'wrong-stop',
  ].includes(context);
  const busJourneyLabel = [
    'choose-item',
    'item-selected',
    'reader',
    'wrong-item',
    'driver-warning',
    'tapping',
    'fare-success',
    'standing',
    'seated',
  ].includes(context)
    ? 'Service 50 · Boarding'
    : context === 'wrong-stop'
      ? 'Service 50 · Wrong stop'
      : context === 'alighting'
        ? 'Service 50 · Punggol Interchange'
        : busDoorsOpen && busStopName
          ? `Service 50 · ${busStopName}`
          : 'Service 50 · To Punggol';
  const showBag = [
    'choose-item',
    'wrong-item',
    'driver-warning',
    'choose-exit-item',
    'tap-out-warning',
    'last-stop-reminder',
  ].includes(context);
  const railStep = context === 'rail-wrong-stop' || context === 'out-of-time'
    ? wrongRailStop?.legId === 'kadaloor-lrt'
      ? 1
      : wrongRailStop?.legId === 'punggol-nel'
        ? 2
        : 3
    : context.startsWith('lrt-')
    ? 1
    : context.startsWith('nel-') || context.startsWith('punggol-') || context === 'little-india-alight'
      ? 2
      : context.startsWith('dtl-') || context === 'little-india-transfer' || context.startsWith('expo-')
        ? 3
        : 0;
  const isExpoExit = context === 'expo-exit';
  const isRail = railStep > 0 && !isExpoExit;
  const vehicleDoorPhase = vehicleDoorPhaseFor(
    context,
    context.includes('riding') ? railInteriorDoorsOpen : busDoorsOpen,
  );
  const railProgressStep = journeyBranch === 'bus' && railStep >= 2 ? railStep - 1 : railStep;
  const railProgressTotal = journeyBranch === 'bus' ? 2 : 3;
  const isOffice = context === 'office-walk';
  const controlsLocked = [
    'bus-arriving',
    'tapping',
    'lrt-tapping',
    'punggol-tapping',
    'expo-tapping',
    'expo-gates-open',
    'punggol-escalator-riding',
    'standing',
    'seated',
    'lrt-arriving',
    'dtl-arriving',
    'wrong-stop',
    'rail-wrong-stop',
    'out-of-time',
    'complete',
  ].includes(context);
  const directionChoices = context === 'nel-transfer' || context === 'nel-wrong-direction'
    ? ['HarbourFront', 'Punggol Coast']
    : context === 'dtl-transfer' || context === 'dtl-wrong-direction'
      ? ['Expo', 'Bukit Panjang']
      : undefined;
  const showInteractControl = !controlsLocked && (isBusInterior || isRail);
  return (
    <section
      className="relative mx-auto w-full max-h-[calc(100dvh-7rem)] max-w-[1280px] overflow-hidden rounded-[28px] bg-sg-navy shadow-card [&_button:focus-visible]:outline [&_button:focus-visible]:outline-4 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-amber-300 [&_select:focus-visible]:outline [&_select:focus-visible]:outline-4 [&_select:focus-visible]:outline-amber-300"
      data-commute-context={context}
      data-bus-stop={busStopName ?? ''}
      data-bus-doors={busDoorsOpen ? 'open' : 'closed'}
      data-bus-stop-requested={busStopRequested ? 'true' : 'false'}
      data-bus-dwell-seconds={busDwell?.seconds ?? ''}
      data-rail-stop={railStop?.station ?? ''}
      data-rail-doors={railInteriorDoorsOpen ? 'open' : 'closed'}
      data-vehicle-door-phase={vehicleDoorPhase}
      data-rail-hearts={railHearts}
      data-last-wrong-rail-stop={wrongRailStop?.station ?? ''}
    >
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {CONTEXT_COPY[context]}
        {busStopName ? ` Bus stop: ${busStopName}.` : ''}
        {railStop ? ` Current stop: ${railStop.station}.` : ''}
        {railInteriorDoorsOpen ? ' Train doors open.' : ''}
        {isRail ? ` ${railHearts} travel chances remaining.` : ''}
      </p>
      <div ref={parentRef} className="aspect-video w-full [&>canvas]:block" />

      {context !== 'complete' && (
        <button
          type="button"
          aria-label="Open Singapore MRT map"
          aria-expanded={mrtMapOpen}
          className="absolute bottom-2 right-2 z-[83] flex size-11 items-center justify-center rounded-xl border-2 border-white bg-sg-navy/95 p-0 text-[10px] font-black text-white shadow-xl transition-transform hover:scale-105 active:scale-95 sm:bottom-auto sm:left-3 sm:right-auto sm:top-3 sm:size-auto sm:px-3 sm:py-2 sm:text-xs"
          onClick={() => setMrtMapOpen(true)}
        >
          <span aria-hidden="true">🗺️</span><span className="sr-only sm:not-sr-only sm:ml-1">MRT MAP</span>
        </button>
      )}

      {mrtMapOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Singapore MRT and LRT system map"
          className="absolute inset-0 z-[120] flex flex-col bg-sg-navy/95 p-3 backdrop-blur-sm sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-4 text-white">
            <div>
              <p className="text-lg font-black sm:text-2xl">Singapore MRT/LRT System Map</p>
              <p className="text-xs font-bold text-white/70">Reference map — work out the route yourself</p>
            </div>
            <button
              ref={mapCloseRef}
              type="button"
              className="rounded-xl border-2 border-white bg-white px-4 py-2 text-sm font-black text-sg-navy"
              onClick={closeMrtMap}
            >
              CLOSE ×
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-[#dcecf2] shadow-2xl">
            <img
              src="/scenes/scene4/reference/singapore-rail-network-map.png"
              alt="Official Singapore MRT and LRT system map showing every line and station"
              className="mx-auto block h-auto w-[1050px] max-w-none"
            />
          </div>
          <p className="mt-2 text-right text-[10px] font-bold text-white/60">
            Source: Land Transport Authority Singapore
          </p>
        </div>
      )}

      {context !== 'complete' && (
      <div className={`pointer-events-none absolute left-2 right-2 top-2 z-[65] rounded-2xl bg-sg-navy/90 px-3 py-2 text-center text-white shadow-lg backdrop-blur-sm sm:left-1/2 sm:right-auto sm:w-[min(46%,34rem)] sm:-translate-x-1/2 ${directionChoices ? 'sm:top-3' : 'sm:bottom-3 sm:top-auto'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sg-xp">
          {isExpoExit
            ? 'Expo · Exit D'
            : isRail
            ? `${railProgressStep} / ${railProgressTotal} · ${railStep === 1 ? 'Punggol LRT' : railStep === 2 ? 'North East Line' : 'Downtown Line'} · to TCS entrance`
            : isOffice
              ? 'Final walk · The Signature'
            : isBusInterior
              ? busJourneyLabel
              : 'Kadaloor · Exit B'}
        </p>
        <p className="mt-0.5 text-xs font-extrabold leading-snug sm:text-sm">{CONTEXT_COPY[context]}</p>
      </div>
      )}

      {railStop && ['lrt-riding', 'nel-riding', 'dtl-riding'].includes(context) && (
        <div className="pointer-events-none absolute left-2 top-32 z-50 w-[min(42%,20rem)] sm:left-3 sm:top-16 sm:w-[min(30%,20rem)]">
          <div className="w-full overflow-hidden rounded-2xl border-2 border-white bg-sg-navy/90 text-white shadow-xl backdrop-blur-sm">
            <div className="h-1 bg-white/15">
              <div
                className="h-full bg-sg-xp transition-[width] duration-300"
                style={{ width: `${(railStop.index / railStop.total) * 100}%` }}
              />
            </div>
            <div className="px-3 py-2.5 text-left sm:px-4 sm:py-3">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sg-xp sm:text-[9px]">
                Stop {railStop.index} of {railStop.total} · {railInteriorDoorsOpen ? 'Doors open' : 'Now passing'}
              </p>
              <p className="mt-0.5 text-lg font-black sm:text-xl">{railStop.station}</p>
              <p className="mt-1 hidden text-[11px] font-bold leading-snug text-white/80 sm:block">
                {railStop.fact}
              </p>
              {railStop.nextStation && (
                <p className={`mt-1.5 text-[10px] font-black uppercase tracking-wide ${railStop.targetIsNext ? 'text-amber-300' : 'text-white/70'}`}>
                  Next: {railStop.nextStation}{railStop.targetIsNext ? ' · prepare to alight' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isRail && (
        <div
          aria-label={`${railHearts} rail hearts remaining`}
          className="pointer-events-none absolute right-2 top-20 z-[70] flex gap-0.5 rounded-xl bg-sg-navy/90 px-2.5 py-1.5 text-base shadow-lg sm:right-3 sm:top-3 sm:gap-1 sm:px-3 sm:py-2 sm:text-lg"
        >
          {[0, 1, 2].map((index) => <span key={index}>{index < railHearts ? '❤️' : '🤍'}</span>)}
        </div>
      )}

      {context === 'rail-wrong-stop' && wrongRailStop && (
        <div className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center bg-sg-navy/70 p-5 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border-4 border-red-300 bg-sg-navy px-7 py-6 text-center text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Wrong MRT stop · −1 heart</p>
            <p className="mt-2 text-2xl font-black">You alighted at {wrongRailStop.station}</p>
            <p className="mt-2 text-sm font-bold text-white/85">Returning to the MRT at {wrongRailStop.checkpoint}. Your journey continues from this checkpoint.</p>
          </div>
        </div>
      )}

      {context === 'out-of-time' && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-sg-navy/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-300 bg-sg-navy px-7 py-7 text-center text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Journey ended</p>
            <p className="mt-2 text-3xl font-black">You ran out of travel time</p>
            <p className="mt-3 text-sm font-bold leading-relaxed text-white/85">
              Too many wrong stops delayed your trip. Check the MRT map and try the route again.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-sg-xp px-6 py-3 text-sm font-black text-sg-navy shadow-lg"
              onClick={handleRestartJourney}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {isBusInterior && busStopName && (
        <div className={`pointer-events-none absolute left-2 top-32 z-50 w-[min(46%,20rem)] rounded-xl border-2 bg-black/90 px-3 py-2 text-left text-white shadow-xl backdrop-blur-sm sm:left-3 sm:top-16 sm:w-[min(30%,20rem)] ${busDoorsOpen ? 'border-emerald-400' : 'border-amber-300'}`}>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">Service 50 · Bus stop</p>
          <p className="truncate text-sm font-black sm:text-base">{busStopName}</p>
          {busDoorsOpen && (
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
              Doors open{busDwell ? ` · ${busDwell.seconds}s` : ''}
              {busDwell?.requested ? ' · requested stop' : ''}
            </p>
          )}
        </div>
      )}

      {context === 'last-stop-reminder' && busTaskPopupVisible && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-sg-navy/25 p-5">
          <div className="max-w-sm rounded-2xl border-4 border-white bg-sg-navy/95 px-6 py-5 text-center text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sg-xp">Bus 50 · Last stop</p>
            <p className="mt-2 text-xl font-black">Punggol Interchange</p>
            <p className="mt-1 text-sm font-bold">Tap out at the rear reader and get down here.</p>
          </div>
        </div>
      )}

      {context === 'tap-out-warning' && busTaskPopupVisible && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-sg-navy/30 p-5">
          <div className="max-w-sm rounded-2xl border-4 border-amber-300 bg-sg-navy/95 px-7 py-5 text-center text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Fare required</p>
            <p className="mt-2 text-2xl font-black">Tap out first</p>
            <p className="mt-1 text-sm font-bold text-white/85">Click the fare reader beside the open doors, then walk out.</p>
          </div>
        </div>
      )}

      {context === 'wrong-stop' && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-sg-navy/65 p-5 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border-4 border-red-300 bg-sg-navy px-7 py-6 text-center text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Wrong stop</p>
            <p className="mt-2 text-2xl font-black">You got down too early</p>
            <p className="mt-2 text-sm font-bold text-white/85">Respawning at Kadaloor so you can try Bus 50 again.</p>
          </div>
        </div>
      )}

      {context !== 'complete' && (
        <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded-xl bg-black/65 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm sm:block">
          ↑ ↓ ← → or W A S D to walk
        </div>
      )}

      {!controlsLocked && (
        <TouchMovementControls onNudge={handleNudge} />
      )}

      {context === 'bus-stop' && !raisedHand && (
        <button
          type="button"
          className="absolute bottom-2 right-16 z-[84] min-h-11 rounded-xl border-2 border-white bg-sg-xp px-3 py-2 text-xs font-black text-sg-navy shadow-xl transition-transform hover:scale-105 active:scale-95 sm:bottom-5 sm:right-5 sm:rounded-2xl sm:border-4 sm:px-5 sm:py-3 sm:text-sm"
          onClick={handleRaiseHand}
        >
          RAISE HAND
        </button>
      )}

      {showBag && (
        <FareBag selectedItem={selectedItem} onSelect={handleSelectItem} />
      )}

      {context === 'bus-moving' && (
        <button
          type="button"
          aria-label="Request next bus stop"
          aria-pressed={busStopRequested}
          disabled={busStopRequested || busDoorsOpen}
          className={`absolute bottom-2 right-16 z-[84] flex size-14 flex-col items-center justify-center rounded-full border-3 text-[10px] font-black shadow-2xl transition-transform sm:bottom-5 sm:right-5 sm:size-24 sm:border-4 sm:text-sm ${
            busDoorsOpen
              ? 'border-emerald-100 bg-emerald-600 text-white'
              : busStopRequested
              ? 'border-amber-200 bg-amber-500 text-sg-navy'
              : 'border-white bg-red-600 text-white hover:scale-105 active:scale-95'
          }`}
          onClick={handleRequestBusStop}
        >
          <span className="text-lg sm:text-xl">●</span>
          {busDoorsOpen ? 'DOORS OPEN' : busStopRequested ? 'STOPPING' : 'STOP'}
        </button>
      )}

      {directionChoices && (
        <DirectionControls directions={directionChoices} onChoose={handleDirectionChoice} />
      )}

      {showInteractControl && !directionChoices && (
        <button
          type="button"
          className="absolute bottom-2 left-auto right-14 z-[84] min-h-11 rounded-xl border-2 border-white bg-sg-xp px-3 py-2 text-xs font-black text-sg-navy shadow-xl sm:bottom-3 sm:right-3 sm:px-4"
          onClick={handleInteract}
        >
          INTERACT <span className="hidden sm:inline">· E / SPACE</span>
        </button>
      )}

      {import.meta.env.DEV && (
        <DebugCheckpointSelector onChoose={handleDebugCheckpoint} />
      )}

      {context === 'complete' && (
        <CompletionReward xp={completionXp} onDone={onDone} />
      )}

    </section>
  );
}
