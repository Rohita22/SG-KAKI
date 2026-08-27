import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const EXTERIOR_MAP_KEY = 'scene4-kadaloor-map';
const INTERIOR_MAP_KEY = 'scene4-service-50-interior-map';
const EXTERIOR_BACKGROUND_KEY = 'scene4-kadaloor-background';
const SHELTER_KEY = 'scene4-kadaloor-shelter';
const BENCH_KEY = 'scene4-kadaloor-bench';
const BOLLARD_KEY = 'scene4-kadaloor-bollard';
const STOP_POLE_KEY = 'scene4-kadaloor-stop-pole';
const INTERIOR_BACKGROUND_KEY = 'scene4-service-50-interior-background';
const PLAYER_KEY = 'scene4-player-walk';
const BUS_CLOSED_KEY = 'scene4-service-50-closed';
const BUS_OPEN_KEY = 'scene4-service-50-open';
const FARE_READER_KEY = 'scene4-simplygo-reader';
const TRAVEL_CARD_KEY = 'scene4-fare-item-travel-card';
const UMBRELLA_KEY = 'scene4-fare-item-umbrella';
const WATER_BOTTLE_KEY = 'scene4-fare-item-water-bottle';
const WALK_SPEED = 215;
const EXTERIOR_PLAYER_SCALE = 0.3;
const INTERIOR_PLAYER_SCALE = 0.7;
const EXTERIOR_BUS_WIDTH = 864;
const EXTERIOR_BUS_HEIGHT = 333;
// The held-item art and its hand anchors were authored against a 0.52 interior
// character. Deriving them keeps the item in his hand at any character size.
const INTERIOR_ART_BASE_SCALE = 0.52;
const ITEM_SCALE = INTERIOR_PLAYER_SCALE / INTERIOR_ART_BASE_SCALE;
const CARRIED_ITEM_Y_OFFSET = 140 * ITEM_SCALE;
const CARRIED_ITEM_X_OFFSET = 48 * ITEM_SCALE;
// The interior camera is fixed, so how far up the aisle he may stand is bound
// by his own height: any higher and the top of the frame crops his head.
const INTERIOR_WALK_Y_MIN = 24 + 768 * INTERIOR_PLAYER_SCALE + 30;
const INTERIOR_WALK_Y_MAX = 745;

type FareItemKind = 'travel-card' | 'umbrella' | 'water-bottle';

type InteractionContext =
  | 'walking'
  | 'bus-stop'
  | 'stairs'
  | 'bus-arriving'
  | 'boarding'
  | 'choose-item'
  | 'item-selected'
  | 'reader'
  | 'wrong-item'
  | 'driver-warning'
  | 'tapping'
  | 'fare-success'
  | 'bus-moving'
  | 'aisle';

type SceneMode = 'exterior' | 'bus-interior';

interface TiledProperty {
  name: string;
  value: unknown;
}

interface TiledObject {
  id: number;
  name: string;
  height?: number;
  width?: number;
  x: number;
  y: number;
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
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private background?: Phaser.GameObjects.Image;
  private bus?: Phaser.GameObjects.Image;
  private fareReader?: Phaser.GameObjects.Image;
  private driverBubble?: Phaser.GameObjects.Container;
  private carriedItemIcon?: Phaser.GameObjects.Image;
  private exteriorObjects: Phaser.GameObjects.GameObject[] = [];
  private collisionBodies: Phaser.GameObjects.Rectangle[] = [];
  private waitZone?: TiledObject;
  private stairZone?: TiledObject;
  private readerZone?: TiledObject;
  private aisleZone?: TiledObject;
  private carriedItem?: FareItemKind;
  private lastContext: InteractionContext = 'walking';
  private busArriving = false;
  private busReady = false;
  private inputLocked = false;
  private fareTapped = false;
  private tapInProgress = false;
  private busMoving = false;
  private warningCooldown = false;
  private handRaised = false;
  private busPassing = false;
  private busTween?: Phaser.Tweens.Tween;

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
    this.load.image(
      EXTERIOR_BACKGROUND_KEY,
      '/scenes/scene4/props/kadaloor-exterior-base-v2.png',
    );
    this.load.image(SHELTER_KEY, '/scenes/scene4/props/kadaloor-shelter-v2.png');
    this.load.image(BENCH_KEY, '/scenes/scene4/props/kadaloor-bench-v2.png');
    this.load.image(BOLLARD_KEY, '/scenes/scene4/props/kadaloor-bollard-v2.png');
    this.load.image(STOP_POLE_KEY, '/scenes/scene4/props/kadaloor-stop-pole-v2.png');
    this.load.image(
      INTERIOR_BACKGROUND_KEY,
      '/scenes/scene4/props/bus-interior-entry-v5.png',
    );
    this.load.image(
      BUS_CLOSED_KEY,
      '/scenes/scene4/vehicles/service-50-closed-v1.png',
    );
    this.load.image(
      BUS_OPEN_KEY,
      '/scenes/scene4/vehicles/service-50-open-v1.png',
    );
    this.load.image(
      FARE_READER_KEY,
      '/scenes/scene4/props/simplygo-reader-v1.png',
    );
    this.load.image(
      TRAVEL_CARD_KEY,
      '/scenes/scene4/props/fare-item-travel-card-v1.png',
    );
    this.load.image(
      UMBRELLA_KEY,
      '/scenes/scene4/props/fare-item-umbrella-v1.png',
    );
    this.load.image(
      WATER_BOTTLE_KEY,
      '/scenes/scene4/props/fare-item-water-bottle-v1.png',
    );
    this.load.spritesheet(
      PLAYER_KEY,
      '/scenes/scene4/characters/player-walk-right-v1.png',
      { frameWidth: 512, frameHeight: 768 },
    );
  }

  create() {
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

    this.anims.create({
      key: 'scene4-player-walk-right',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.player = this.physics.add
      .sprite(spawn?.x ?? 1750, spawn?.y ?? 550, PLAYER_KEY, 1)
      .setOrigin(0.5, 1)
      .setScale(EXTERIOR_PLAYER_SCALE)
      .setCollideWorldBounds(true)
      .setDepth(20);

    this.player.body.setAllowGravity(false);
    // A small footbox keeps the character solid against prop bases while
    // preserving the walkable strip directly in front of the furniture.
    this.player.body.setSize(120, 70);
    this.player.body.setOffset(196, 675);

    this.createExteriorCollisions(exteriorMap);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.movementKeys = this.input.keyboard?.addKeys('W,A,S,D') as {
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      W: Phaser.Input.Keyboard.Key;
    };

    this.waitZone = objectByName(exteriorMap, 'Interactions', 'Wait inside bus stop');
    this.stairZone = objectByName(exteriorMap, 'Interactions', 'Exit B stair entry');
    this.cameras.main.setScroll(896, 24);
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute('aria-label', 'Scene 4 walkable commute game');

    this.game.events.on('commute:raise-hand', this.startBusArrival, this);
    this.game.events.on('commute:select-item', this.selectFareItem, this);
    this.events.once('shutdown', () => {
      this.game.events.off('commute:raise-hand', this.startBusArrival, this);
      this.game.events.off('commute:select-item', this.selectFareItem, this);
    });
    this.time.delayedCall(900, this.startPassingBus, [], this);
    this.game.events.emit('commute:ready');
  }

  update() {
    if (!this.player || !this.cursors || !this.movementKeys) return;

    const left = this.cursors.left.isDown || this.movementKeys.A.isDown;
    const right = this.cursors.right.isDown || this.movementKeys.D.isDown;
    const up = this.cursors.up.isDown || this.movementKeys.W.isDown;
    const down = this.cursors.down.isDown || this.movementKeys.S.isDown;
    const directionX = this.inputLocked ? 0 : Number(right) - Number(left);
    const directionY = this.inputLocked ? 0 : Number(down) - Number(up);
    const movement = new Phaser.Math.Vector2(directionX, directionY);

    if (movement.lengthSq() > 0) {
      movement.normalize().scale(WALK_SPEED);
    }

    this.player.setVelocity(movement.x, movement.y);
    if (this.mode === 'bus-interior') {
      this.player.y = Phaser.Math.Clamp(
        this.player.y,
        INTERIOR_WALK_Y_MIN,
        INTERIOR_WALK_Y_MAX,
      );
    }
    if (!this.busMoving) {
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
    }
    this.cameras.main.scrollY = 24;
    this.game.canvas.dataset.scene4Debug = JSON.stringify({
      backgroundHeight: this.background?.displayHeight,
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
    });

    if (movement.lengthSq() > 0) {
      if (directionX !== 0) this.player.setFlipX(directionX < 0);
      this.player.anims.play('scene4-player-walk-right', true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(1);
    }

    if (this.mode === 'bus-interior') {
      this.updateBusInterior();
      return;
    }

    // Shelter furniture remains in front of the character at the rear of the
    // pavement. At the curb the character comes forward, but the bus always
    // remains the topmost physical object.
    this.player.setDepth(this.player.y >= 520 ? 600 : 20);

    const nextContext: InteractionContext = this.busReady
      ? 'boarding'
      : this.busArriving
        ? 'bus-arriving'
        : containsPoint(this.stairZone, this.player.x, this.player.y)
          ? 'stairs'
          : containsPoint(this.waitZone, this.player.x, this.player.y)
            ? 'bus-stop'
            : 'walking';

    this.setContext(nextContext);
  }

  private updateBusInterior() {
    if (!this.player) return;

    if (this.busMoving) return;

    this.carriedItemIcon?.setPosition(
      this.player.x +
        (this.player.flipX ? -CARRIED_ITEM_X_OFFSET : CARRIED_ITEM_X_OFFSET),
      this.player.y - CARRIED_ITEM_Y_OFFSET,
    );

    // The tap tween owns the interaction state until its accepted-card
    // response has been shown; normal proximity checks resume afterwards.
    if (this.tapInProgress) return;

    if (
      !this.fareTapped &&
      this.carriedItem === 'travel-card' &&
      containsPoint(this.readerZone, this.player.x, this.player.y)
    ) {
      this.beginFareTap();
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
        this.setContext('driver-warning');
        this.showDriverWarning('Eh boy, tap in lah!');
      }
      return;
    }

    if (
      this.fareTapped &&
      containsPoint(this.aisleZone, this.player.x, this.player.y)
    ) {
      this.setContext('aisle');
      return;
    }

    this.setContext(
      this.fareTapped
        ? 'aisle'
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
    this.inputLocked = true;
    this.player.setVelocity(0, 0).setVisible(false);
    this.cameras.main.fadeOut(220, 20, 30, 42);

    this.time.delayedCall(240, () => {
      const interiorMap = this.cache.json.get(
        INTERIOR_MAP_KEY,
      ) as Scene4MapData;
      const spawn = objectByName(interiorMap, 'Spawns', 'from-front-door');

      this.background?.setTexture(INTERIOR_BACKGROUND_KEY);
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
      this.aisleZone = objectByName(
        interiorMap,
        'Interactions',
        'Continue down lower-deck aisle',
      );

      this.fareReader = this.add
        .image(900, 330, FARE_READER_KEY)
        .setDisplaySize(106, 158)
        .setDepth(30);

      this.player
        ?.setPosition(spawn?.x ?? 340, spawn?.y ?? 670)
        .setScale(INTERIOR_PLAYER_SCALE)
        .setDepth(20)
        .setFlipX(false)
        .setVisible(true);
      this.cameras.main.setScroll(0, 24);
      this.inputLocked = false;
      this.cameras.main.fadeIn(260, 20, 30, 42);
      this.setContext('choose-item');
    });
  }

  private selectFareItem(kind: FareItemKind) {
    if (this.mode !== 'bus-interior' || this.tapInProgress || this.fareTapped) {
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
      this.carriedItemIcon.setDisplaySize(72 * ITEM_SCALE, 48 * ITEM_SCALE);
    } else if (kind === 'umbrella') {
      this.carriedItemIcon.setDisplaySize(34 * ITEM_SCALE, 76 * ITEM_SCALE);
    } else {
      this.carriedItemIcon.setDisplaySize(36 * ITEM_SCALE, 72 * ITEM_SCALE);
    }
    this.setContext('item-selected');
  }

  private rejectFareAttempt() {
    if (this.warningCooldown) return;
    this.fareReader?.setTint(0xff8f9d);
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

    this.time.delayedCall(1700, () => {
      bubble.destroy();
      if (this.driverBubble === bubble) this.driverBubble = undefined;
      this.warningCooldown = false;
      if (!this.fareTapped && !this.tapInProgress) {
        this.fareReader?.clearTint();
        this.setContext(this.carriedItem ? 'item-selected' : 'choose-item');
      }
    });
  }

  private beginFareTap() {
    if (!this.player || !this.fareReader || this.tapInProgress) return;

    this.tapInProgress = true;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).anims.stop();
    this.setContext('tapping');

    this.carriedItemIcon?.setVisible(false);
    const travelCard = this.add
      .image(
        this.player.x + 32 * ITEM_SCALE,
        this.player.y - 125 * ITEM_SCALE,
        TRAVEL_CARD_KEY,
      )
      .setDisplaySize(68 * ITEM_SCALE, 46 * ITEM_SCALE)
      .setDepth(50)
      .setRotation(-0.18);

    this.tweens.add({
      targets: travelCard,
      x: this.fareReader.x - 24,
      y: this.fareReader.y + 25,
      duration: 520,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.fareReader?.setTint(0x9dffca);
        this.cameras.main.flash(120, 92, 255, 190, false);
        this.setContext('fare-success');

        this.time.delayedCall(1400, () => {
          travelCard.destroy();
          this.tapInProgress = false;
          this.fareTapped = true;
          this.startBusJourney();
        });
      },
    });
  }

  private startBusJourney() {
    if (!this.player) return;
    this.busMoving = true;
    this.inputLocked = true;
    this.player.setVelocity(0, 0).setVisible(false);
    this.carriedItemIcon?.destroy();
    this.carriedItemIcon = undefined;
    this.setContext('bus-moving');
    this.cameras.main.shake(350, 0.0025);

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this.worldWidth - this.cameras.main.width,
      duration: 2400,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.cameras.main.flash(180, 255, 222, 120, false);
        this.setContext('aisle');
      },
    });
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

const CONTEXT_COPY: Record<InteractionContext, string> = {
  walking: 'Walk to the marked bus-stop shelter',
  'bus-stop': 'Wait inside bus stop 65321',
  stairs: 'Exit B stairs reached',
  'bus-arriving': 'Service 50 is approaching',
  boarding: 'Walk to the open front door',
  'choose-item': 'Choose an item from your bag',
  'item-selected': 'Walk to the SimplyGo reader and tap',
  reader: 'Walk to the SimplyGo reader',
  'wrong-item': 'That cannot pay your fare — choose the travel card',
  'driver-warning': 'Driver: “Eh boy, tap in lah!”',
  tapping: 'Tapping your travel card…',
  'fare-success': 'ENTRY OK — card accepted',
  'bus-moving': 'ENTRY OK — Service 50 is moving',
  aisle: 'Exit doors ahead — continue the journey',
};

const BAG_ITEMS: Array<{
  image: string;
  kind: FareItemKind;
  label: string;
}> = [
  {
    image: '/scenes/scene4/props/fare-item-umbrella-v1.png',
    kind: 'umbrella',
    label: 'Umbrella',
  },
  {
    image: '/scenes/scene4/props/fare-item-travel-card-v1.png',
    kind: 'travel-card',
    label: 'Travel card',
  },
  {
    image: '/scenes/scene4/props/fare-item-water-bottle-v1.png',
    kind: 'water-bottle',
    label: 'Bottle',
  },
];

export function CommuteGame({ completionXp: _completionXp }: CommuteGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [context, setContext] = useState<InteractionContext>('walking');
  const [raisedHand, setRaisedHand] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FareItemKind>();

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

    game.events.on('commute:context', handleContext);
    gameRef.current = game;

    return () => {
      game.events.off('commute:context', handleContext);
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

  const isBusInterior = [
    'choose-item',
    'item-selected',
    'reader',
    'wrong-item',
    'driver-warning',
    'tapping',
    'fare-success',
    'bus-moving',
    'aisle',
  ].includes(context);
  const showBag = [
    'choose-item',
    'item-selected',
    'wrong-item',
    'driver-warning',
  ].includes(context);

  return (
    <section
      className="relative overflow-hidden rounded-[28px] bg-sg-navy shadow-card"
      data-commute-context={context}
    >
      <div ref={parentRef} className="aspect-video w-full [&>canvas]:block" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-sg-navy/90 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sg-xp">
          {isBusInterior ? 'Service 50 · Boarding' : 'Kadaloor · Exit B'}
        </p>
        <p className="mt-0.5 text-sm font-extrabold">{CONTEXT_COPY[context]}</p>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-black/65 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
        ↑ ↓ ← → or W A S D to walk
      </div>

      {context === 'bus-stop' && !raisedHand && (
        <button
          type="button"
          className="absolute bottom-5 right-5 rounded-2xl border-4 border-white bg-sg-xp px-5 py-3 text-sm font-black text-sg-navy shadow-xl transition-transform hover:scale-105 active:scale-95"
          onClick={handleRaiseHand}
        >
          RAISE HAND
        </button>
      )}

      {showBag && (
        <aside
          aria-label="Your bag"
          className="absolute right-4 top-1/2 w-32 -translate-y-1/2 rounded-2xl border-2 border-white/20 bg-sg-navy/95 p-2.5 text-white shadow-2xl backdrop-blur-sm"
        >
          <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-sg-xp">
            Your bag
          </p>
          <div className="space-y-2">
            {BAG_ITEMS.map((item) => {
              const selected = selectedItem === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  aria-pressed={selected}
                  className={`flex w-full flex-col items-center rounded-xl border-2 px-2 py-2 text-[11px] font-extrabold transition ${
                    selected
                      ? 'border-sg-xp bg-sg-xp/20 text-sg-xp'
                      : 'border-white/15 bg-white/5 text-white hover:border-white/50 hover:bg-white/10'
                  }`}
                  onClick={() => handleSelectItem(item.kind)}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="mb-1 h-11 w-16 object-contain"
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>
      )}

    </section>
  );
}
