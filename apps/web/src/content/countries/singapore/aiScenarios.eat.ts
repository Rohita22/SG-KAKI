import type { AIPracticeScenario } from '@/content/types';

export const eatAiScenarios: AIPracticeScenario[] = [
  {
    id: 'ordering-kopi',
    title: 'Ordering Kopi',
    setup:
      "You're queuing at a kopitiam stall. Make it to the counter and order a kopi the way a local would.",
    suggestedOpeners: [
      'One kopi peng, please.',
      'Kopi O kosong, can?',
      'What kind of kopi you recommend?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'eat',
    personaName: 'Auntie Poh',
    personaDescription:
      "a brisk, warm-hearted kopitiam stall auntie who's run this stall for 20 years — direct, quick to tease, speaks in natural Singlish, and softens up once you've made an effort to order properly. " +
      "She's mid-queue serving other customers too, so she keeps things short and transactional like a real stall exchange (calling out, confirming the order, maybe teasing about the kopi code), rather than drifting into unrelated small talk. " +
      'She knows the kopitiam order code well (kopi/teh, O, C, kosong, peng, siew dai, gao) and will gently correct or ask you to clarify if your order is ambiguous. ' +
      'IMPORTANT: this customer is a total stranger she has never served before. She does not know them, their name, or anything about them, and must never imply otherwise — no "welcome back", no "the usual", no acting like a regular. ' +
      'She has no idea whether they are local or foreign unless they say so. Keep every line to what a stall auntie would actually say to an unfamiliar face in a queue: take the order, confirm it, ask what they want if unclear.',
    autoOpen: true,
    hintCategories: ['lingo', 'food'],
    visualScene: {
      backgroundImage: '/scenes/scene2/background.png',
      characterImage: '/scenes/scene2/auntie-poh.png',
      playerImage: '/scenes/scene2/player.png',
      // The player art is a rear view — we're behind him as he faces the stall
      // — so it needs no mirroring. Auntie Poh is drawn facing her right, and
      // flips to look back across the counter at him.
      flipPlayer: false,
      flipCharacter: true,
      // The counter front, cropped from the background at the same position so
      // it lines up with the scenery, and drawn over the character layer so
      // Auntie Poh reads as standing behind it.
      // The counter, drawn a second time above the character layer so Auntie
      // Poh is occluded by it and reads as standing behind. It's a full-size
      // copy of the backdrop with everything above the counter erased, so it
      // crops identically under object-cover — a smaller cropped strip scales
      // differently and leaves a doubled counter edge.
      foregroundImage: '/scenes/scene2/counter.png',
      playerOffsetPct: 6,
      characterOffsetPct: -2,
      // This scene's art is portrait (2:3), so it fills the sprite frame
      // uncropped and needs the larger frame to read at room scale.
      spriteSize: 'large',
    },
    // Closes on Auntie Poh alone — no third character arrives, and she stays at
    // her stall as the player takes their drink and goes.
    completionScript: {
      minTurns: 2,
      maxTurns: 6,
      classmateLine: 'Okay, your kopi coming right up. Next!',
      closingCaption: 'You take your kopi and go…',
    },
  },
  {
    id: 'hawker-lunch',
    title: 'Hawker Centre Lunch',
    setup:
      "A friend jio you for lunch at the hawker centre. Figure out where to sit and what to eat together.",
    suggestedOpeners: [
      'Eh, where should we chope a table?',
      'What\'s good here?',
      'Should we dabao instead?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'eat',
    personaName: 'Mei',
    personaDescription:
      "a close friend who jio'd you out for hawker lunch — easygoing, hungry, and already scanning the stalls deciding what to eat. " +
      'Because you are old friends she is relaxed and teasing, talks in comfortable Singlish, and makes concrete suggestions rather than asking open-ended questions: she names actual stalls and dishes (chicken rice, laksa, char kway teow, ban mian, carrot cake) and asks you to pick. ' +
      'She is practical about the mechanics of a hawker centre — choping a table with a packet of tissue, queue lengths, who orders what, whether to dabao — and will happily explain any of it if you seem unsure. ' +
      'Keep the exchange moving toward actually deciding on food and a table, not abstract chat about cuisine.',
    hintCategories: ['food', 'lingo'],
    stages: [
      {
        id: 'crowd',
        goal:
          "You've just walked into a packed hawker centre with your friend at lunchtime — every table looks taken. Open by remarking on how crowded it is and suggest the two of you look around for a place to sit.",
        minTurns: 2,
        maxTurns: 6,
        visualScene: {
          backgroundImage: '/scenes/scene3/crowd.png',
          characterImage: '/scenes/scene3/crowdmei.png',
          playerImage: '/scenes/scene3/crowdplayer.png',
          // Both sprites are drawn gazing to their own right in the source
          // art. Mei stands on the right, so she's mirrored to face left,
          // toward the player; the player stands on the left and already
          // faces right toward her, so he's left unmirrored.
          flipCharacter: true,
          flipPlayer: false,
          spriteSize: 'padded',
        },
      },
      {
        id: 'chope',
        goal:
          "You've spotted one empty table. Tell your friend you found one and that you should chope (reserve) it before someone else takes it.",
        minTurns: 0,
        maxTurns: 0,
        visualScene: {
          backgroundImage: '/scenes/scene3/table.png',
          characterImage: '/scenes/scene3/crowdmei.png',
          playerImage: '/scenes/scene3/crowdplayer.png',
          // Same crowdmei/crowdplayer art as the crowd stage — same flips.
          flipCharacter: true,
          flipPlayer: false,
          spriteSize: 'padded',
        },
        minigame: {
          prompt: 'Dig through your bag — which item can chope the table?',
          correctItemId: 'tissue-packet',
          items: [
            { id: 'tissue-packet', label: 'Tissue packet', image: '/scenes/scene3/tissue-packet.png' },
            { id: 'umbrella', label: 'Umbrella', image: '/scenes/scene3/umbrella.png' },
            { id: 'phone', label: 'Phone', image: '/scenes/scene3/phone.png' },
            { id: 'wallet', label: 'Wallet', image: '/scenes/scene3/wallet.png' },
          ],
        },
      },
      {
        id: 'food',
        goal:
          "The table's choped. Now decide what to eat — tell your friend you're getting chicken rice today. Don't ask them to choose between options, just state it and keep the exchange moving toward queueing up.",
        minTurns: 2,
        maxTurns: 6,
        visualScene: {
          backgroundImage: '/scenes/scene3/table.png',
          characterImage: '/scenes/scene3/crowdmei.png',
          playerImage: '/scenes/scene3/crowdplayer.png',
          // Same crowdmei/crowdplayer art as the crowd stage — same flips.
          flipCharacter: true,
          flipPlayer: false,
          spriteSize: 'padded',
          // The tissue packet chosen in the chope minigame, now visibly
          // sitting on the table it just reserved.
          propImage: '/scenes/scene3/tissue-packet.png',
        },
      },
      {
        id: 'queue',
        goal:
          "You're both queueing at the chicken rice stall, one customer ahead of you. Make small talk while you wait your turn.",
        minTurns: 2,
        maxTurns: 6,
        visualScene: {
          backgroundImage: '/scenes/scene3/queue.png',
          characterImage: '/scenes/scene3/crowdmei.png',
          playerImage: '/scenes/scene3/crowdplayer.png',
          // Same crowdmei/crowdplayer art as the crowd stage — same flips.
          flipCharacter: true,
          flipPlayer: false,
          spriteSize: 'padded',
        },
      },
      {
        id: 'eat',
        goal:
          "You've both got your chicken rice and are back at the table, digging in. Chat about the food while you eat.",
        minTurns: 2,
        maxTurns: 6,
        visualScene: {
          backgroundImage: '/scenes/scene3/eat.png',
          characterImage: '/scenes/scene3/eatmei.png',
          playerImage: '/scenes/scene3/eatplayer.png',
          // Unlike the other sprite pairs, this pose has both of them
          // already gazing left in the source art — so the player (on the
          // left) is the one mirrored here, to face right toward Mei, and
          // Mei (on the right) is left unmirrored, already facing him.
          flipCharacter: false,
          flipPlayer: true,
          spriteSize: 'paddedClose',
          // eat.png is a much tighter close-up on the table than the other
          // backgrounds — the stools sit out near the frame edges, not in
          // the middle, so the default centered layout put both characters
          // on top of the tabletop instead of on the stools either side of it.
          spread: 'wide',
          // The seated pose's hip-level sits around the middle of its own
          // sprite frame (knees bent, no chair drawn under it) — at the
          // standing floor line that lands right at tabletop height in this
          // close-up background. Push down toward the lower stool height.
          characterOffsetPct: 24,
          playerOffsetPct: 24,
        },
      },
      {
        id: 'tray-return',
        goal:
          "You're both done eating and carrying your empty trays over to the tray return point. Wrap up the lunch outing as you walk over.",
        minTurns: 2,
        maxTurns: 6,
        visualScene: {
          backgroundImage: '/scenes/scene3/tray-return.png',
          characterImage: '/scenes/scene3/tray-returnmei.png',
          playerImage: '/scenes/scene3/tray-returnplayer.png',
          // Same as the eat stage's art — both gaze left natively, so the
          // player is mirrored to face Mei and Mei is left as drawn.
          flipCharacter: false,
          flipPlayer: true,
          spriteSize: 'padded',
        },
      },
    ],
    completionScript: {
      minTurns: 2,
      maxTurns: 6,
      classmateLine: "Alright, trays are back — let's jio again next time!",
      closingCaption: 'You return your trays and head off…',
    },
  },
];
