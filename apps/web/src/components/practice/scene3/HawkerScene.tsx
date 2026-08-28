import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/content/types';
import type { AIPracticeBeat } from '@/services/aiPractice/types';
import { Button } from '@/components/ui/Button';

/**
 * Scene 3 — the hawker centre. Deliberately self-contained: it shares no
 * markup with scene 1 / scene 2 (VisualNovelScene) so its frames can evolve
 * on their own without dragging the other scenes along.
 *
 * The scene runs as a chain of frames, all the same shape: an optional clip
 * that plays the frame in, a still to talk over, and a goal telling Siti what
 * THIS beat is about. The player types their own lines throughout; Siti's are
 * AI-generated.
 *
 *   1. arrive — walking into a packed lunchtime hawker centre.
 *   2. chope  — they stop at a free table and Siti asks the player to chope it.
 *   3. queue  — both of them queueing at the chicken rice stall.
 *   4. eat    — plates cleared, and the tray return comes up.
 *
 * The last beat hands off to a closing clip (returning the trays) which plays
 * the scene out — there is no dialogue over it, and the scene ends when it does.
 */

const ART = {
  arrive: '/scenes/scene3/images/arrive.png',
  table: '/scenes/scene3/images/3img.png',
  player: '/scenes/scene3/images/player.png',
  siti: '/scenes/scene3/images/siti.png',
  tissue: '/scenes/scene3/images/tissue.png',
  findTableClip: '/scenes/scene3/videos/2vid.mp4',
  queueClip: '/scenes/scene3/videos/queue%20chicken%20rice.mp4',
  queue: '/scenes/scene3/images/framecut%20chicken%20rice.png',
  eatClip: '/scenes/scene3/videos/get%20food+eat.mp4',
  finishedEating: '/scenes/scene3/images/finish%20eating.png',
  trayReturnClip: '/scenes/scene3/videos/tray%20return%20video.mp4',
};

interface Frame {
  /** The still talked over once any clip has played. */
  background: string;
  /** Plays full-bleed as this frame opens; its last frame matches `background`. */
  video?: string;
  /** Drops the tissue packet onto the table when this frame closes. */
  dropsTissue?: boolean;
  /** A closed set of answers for this beat — the player picks one instead of
   * typing. Ordering chicken rice is a two-way choice, not an open question. */
  choices?: string[];
  /** Replaces the scenario setup in Siti's prompt while this frame is running. */
  goal: string;
  /** Offscreen cue that gets Siti talking as the frame opens. Absent on the
   * first frame, which the scenario's own autoOpen already covers. */
  openingNudge?: string;
  /** The two of them are drawn INTO the table still, so that frame overlays no
   * sprites of its own. */
  showSprites: boolean;
  /** Where each speaker's head sits across the frame, as a % of its width, so
   * their bubble hangs over THEM instead of in a frame corner — every frame
   * draws the two of them somewhere different, and on the sprite frame they
   * stand where the centred sprite row puts them (~37% / ~63%). Each bubble
   * grows outward from that point, away from the other speaker. */
  heads: { you: number; siti: number };
  /** How far DOWN the frame those bubbles hang, as a % of its height. `heads`
   * puts a bubble over the right person; this keeps it off their face, since
   * every still sets its eye-line at a different height. Defaults to the top. */
  bubbleTopPct?: number;
  /** What has to have happened for this frame to be over. Sent to the AI, which
   * flags the reply that gets there — the generic "natural lull" test it used
   * before almost never fired, which left the player typing "ok" at a beat that
   * had already closed itself. */
  endWhen: string;
  /** Cheap belt on top of the AI's judgement: if her line plainly says it, move
   * on regardless. */
  closingCue: RegExp;
  /** Won't hand off before this many player turns; hands off regardless at the cap. */
  minTurns: number;
  maxTurns: number;
  closingLine: string;
  advanceLabel: string;
}

const FRAMES: Frame[] = [
  {
    background: ART.arrive,
    heads: { you: 37, siti: 63 },
    // Sprites stand in the lower half, so the top of the frame is already clear.
    bubbleTopPct: 4,
    goal:
      'You have both just walked into a packed hawker centre at lunch peak. React to the crowd, insist lunch is your treat, and talk up the famous chicken rice stall. ' +
      'Close the exchange by saying you should go find a place to sit before all the tables get taken — the reason is the TABLES filling up, not the queue. ' +
      'Queueing and ordering happen in a later part of the scene, so do not suggest joining the queue yet.',
    endWhen: 'you have suggested going to find a table or somewhere to sit',
    closingCue: /(find|grab|look for|chope|get)( us| a| an)? (place|seat|table|spot)|go (and )?sit|we can sit|somewhere to sit/i,
    showSprites: true,
    minTurns: 2,
    maxTurns: 6,
    closingLine: "It's packed — better grab a table first.",
    advanceLabel: "Let's go find a place to sit →",
  },
  {
    background: ART.table,
    heads: { you: 41, siti: 62 },
    bubbleTopPct: 32,
    video: ART.findTableClip,
    goal:
      'You have both just stopped at a free table in the packed hawker centre. You realise you have no packet of tissue on you to chope the table with, ' +
      'so ask the player to chope it with theirs. ' +
      'If they are unsure what choping means, explain it plainly: leaving a packet of tissue on the table is how Singaporeans reserve it, and nobody will take a table with a tissue packet on it. ' +
      'The whole point is that the packet holds the table for you, so NEITHER of you stays behind to guard it — once it is down, say the two of you should go and queue at the chicken rice stall together. ' +
      'Never tell the player to wait at the table or to enjoy the table while you go alone.',
    openingNudge:
      '(You both stop at a free table with nothing on it. Speak first: you have just realised you have no tissue packet on you.)',
    endWhen:
      'the player has agreed to chope the table with a tissue packet and you have said the two of you should go and queue at the chicken rice stall together',
    closingCue: /queue|line up|go (and )?order|chicken rice stall/i,
    showSprites: false,
    minTurns: 2,
    maxTurns: 5,
    dropsTissue: true,
    closingLine: 'Tissue packet down — that table is yours now.',
    advanceLabel: "Let's go queue together →",
  },
  {
    background: ART.queue,
    heads: { you: 39, siti: 49 },
    bubbleTopPct: 42,
    video: ART.queueClip,
    goal:
      'You are both in the queue at the famous chicken rice stall, the table already choped behind you. ' +
      'Ask the player which one they want, and offer exactly two options and nothing else: ROASTED chicken rice or STEAMED chicken rice. ' +
      'Do not suggest any other dish, side or drink. Once they pick one, react warmly to their choice in one short line — say what is good about it — and that is the end of this exchange.',
    openingNudge:
      '(You are both in the queue, almost at the stall. Speak first: ask whether they want roasted or steamed chicken rice.)',
    endWhen: 'the player has picked either roasted or steamed chicken rice and you have reacted to their choice',
    closingCue: /good (choice|pick)|nice (choice|pick)|steamed|roasted/i,
    showSprites: false,
    choices: ['Roasted chicken rice for me.', 'Steamed chicken rice for me.'],
    minTurns: 1,
    maxTurns: 2,
    closingLine: 'Order settled — chicken rice on the way.',
    advanceLabel: 'Collect the food →',
  },
  {
    background: ART.finishedEating,
    heads: { you: 24, siti: 77 },
    bubbleTopPct: 42,
    video: ART.eatClip,
    goal:
      'You have both just finished eating — empty plates and used cutlery still on the table. ' +
      'Start by asking how the food was and react to what they say. ' +
      'Then let the tray return come up naturally out of that, not as a lecture: in Singapore you clear your own table, taking the tray, plates and used tissues to the tray return point, and since 2021 it is actually enforced — leaving your dirty plates behind can get you a fine, first time usually a warning. ' +
      'Say it the way a friend would mention it while getting up, and close the exchange by suggesting the two of you go and return the trays now.',
    openingNudge:
      '(You have both just finished the chicken rice. Empty plates on the table. Speak first: ask how the food was.)',
    endWhen:
      'you have asked how the food was and then suggested that the two of you go and return the trays',
    closingCue: /return (the |our |your )?trays?|tray return|clear (the |our )?(table|plates)|bring (the |our )?trays?/i,
    showSprites: false,
    minTurns: 2,
    maxTurns: 5,
    closingLine: 'Plates cleared — trays go back to the tray return point.',
    advanceLabel: 'Go return the trays →',
  },
];

export const HAWKER_OPENING_BEAT: AIPracticeBeat = {
  situation: FRAMES[0].goal,
  endWhen: FRAMES[0].endWhen,
  historyFrom: 0,
  suggestReplies: true,
};

function Bubble({
  text,
  side,
  tail = side,
}: {
  text: string;
  side: 'left' | 'right';
  tail?: 'left' | 'right';
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className={
        'relative w-max max-w-full rounded-2xl bg-white px-3 py-2 text-xs font-semibold leading-snug text-sg-navy shadow-lg sm:px-4 sm:py-2.5 sm:text-sm ' +
        (side === 'left' ? '' : 'ml-auto ') +
        (tail === 'left' ? 'rounded-bl-sm' : 'rounded-br-sm')
      }
    >
      {text}
      <div
        className={
          'absolute bottom-0 h-3 w-3 translate-y-1/2 rotate-45 bg-white ' +
          (tail === 'left' ? 'left-6' : 'right-6')
        }
      />
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-max rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-lg"
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-sg-navy/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-6 h-3 w-3 translate-y-1/2 rotate-45 bg-white" />
    </motion.div>
  );
}

/** Both sprites are used exactly as drawn — the art already has them facing
 * each other, so nothing here mirrors them. */
function Sprite({
  src,
  alt,
  fromX,
  delay,
}: {
  src: string;
  alt: string;
  fromX: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromX, y: 24 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16, delay }}
      className="h-40 w-[6.7rem] overflow-hidden drop-shadow-xl sm:h-56 sm:w-[9.3rem] lg:h-72 lg:w-48"
    >
      <img src={src} alt={alt} className="size-full object-cover object-center" />
    </motion.div>
  );
}

export function HawkerScene({
  personaName = 'Siti',
  history,
  isTyping,
  suggestions,
  suggestionsLoading,
  readyToEnd,
  draft,
  onDraftChange,
  onSend,
  onOpenFrame,
  completionXp,
  onSessionComplete,
  onRestart,
  onDone,
}: {
  personaName?: string;
  history: ChatMessage[];
  isTyping: boolean;
  suggestions: string[];
  suggestionsLoading: boolean;
  /** True once the AI judged the exchange has reached its natural close. */
  readyToEnd: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  /** Sends the player's line, tagged with the current frame's beat. */
  onSend: (text: string, beat: AIPracticeBeat) => void;
  /** Gets Siti talking as a new frame opens. */
  onOpenFrame: (beat: AIPracticeBeat, nudge: string) => void;
  completionXp?: number;
  /** Called once, as the closing clip finishes — awards the XP. */
  onSessionComplete: () => void;
  /** "Try Again" — wipe the conversation and run the scene from the top. */
  onRestart: () => void;
  /** "Done" — leave the practice screen. */
  onDone: () => void;
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  // Where this frame's conversation starts in the shared history. Everything
  // on screen — bubbles and turn count alike — is scoped to it, so a line from
  // the previous frame doesn't hang over the new one.
  const [frameStart, setFrameStart] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  // The closing clip, after the final beat — it plays the scene out on its own.
  const [outroPlaying, setOutroPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const sessionCompleteFired = useRef(false);
  const endCardRef = useRef<HTMLDivElement>(null);
  const [choped, setChoped] = useState(false);
  const openedFrames = useRef(new Set<number>());
  // The hand-off runs on a timer, so `advance` would otherwise cut the beat at
  // whatever the history length was when the timer was SET — one message early
  // whenever the beat ended on its turn cap, before the persona had replied.
  // A ref reads the length at the moment the cut is actually made.
  const historyLength = useRef(history.length);
  historyLength.current = history.length;

  const frame = FRAMES[frameIndex];
  const isLastFrame = frameIndex === FRAMES.length - 1;
  const beatOf = (f: Frame, historyFrom: number): AIPracticeBeat => ({
    situation: f.goal,
    endWhen: f.endWhen,
    historyFrom,
    suggestReplies: !f.choices,
  });

  const frameHistory = history.slice(frameStart);
  // Tracked separately rather than "last message overall" so the player's line
  // stays on screen while Siti is typing her reply.
  const lastUserMessage = [...frameHistory].reverse().find((m) => m.role === 'user');
  const lastSitiMessage = [...frameHistory].reverse().find((m) => m.role === 'ai');
  const latestMessage = frameHistory[frameHistory.length - 1];

  const turnCount = frameHistory.filter((m) => m.role === 'user').length;
  // One player turn is enough alongside the cue — she has to have said the line
  // in reply to something, and by then the beat has played out.
  const saidClosingLine = turnCount >= 1 && frame.closingCue.test(lastSitiMessage?.text ?? '');
  const frameDone =
    !videoPlaying &&
    (saidClosingLine || (turnCount >= frame.minTurns && readyToEnd) || turnCount >= frame.maxTurns);

  // The packet only lands once the choping has actually been settled in the
  // conversation, so it reads as the outcome of it rather than set dressing.
  useEffect(() => {
    if (frameDone && frame.dropsTissue) setChoped(true);
  }, [frameDone, frame.dropsTissue]);

  // Once the beat lands ("come, let's go find a place to sit"), the next frame
  // rolls on its own — the scene should play out, not stop for a button. Just
  // long enough to read her last line first. The final frame is the exception:
  // finishing the whole scene stays a deliberate press.
  useEffect(() => {
    if (!frameDone) return;
    const timer = setTimeout(advance, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameDone, frameIndex]);

  // A restart wipes the history — drop back to the first frame with it.
  useEffect(() => {
    if (history.length === 0 && frameIndex !== 0) {
      setFrameIndex(0);
      setFrameStart(0);
      setChoped(false);
      setOutroPlaying(false);
      setComplete(false);
      sessionCompleteFired.current = false;
      openedFrames.current.clear();
    }
  }, [history.length, frameIndex]);

  /** Opens a frame's conversation, at most once per frame. `start` is passed in
   * rather than read from state: `advance` sets it in the same tick, and the
   * state update isn't visible here yet. */
  function openFrameChat(index: number, start: number) {
    const next = FRAMES[index];
    if (!next.openingNudge || openedFrames.current.has(index)) return;
    openedFrames.current.add(index);
    onOpenFrame(beatOf(next, start), next.openingNudge);
  }

  function endVideo() {
    setVideoPlaying(false);
    openFrameChat(frameIndex, frameStart);
  }

  function advance() {
    if (isLastFrame) {
      setOutroPlaying(true);
      return;
    }
    const nextIndex = frameIndex + 1;
    const nextStart = historyLength.current;
    setFrameStart(nextStart);
    setFrameIndex(nextIndex);

    if (FRAMES[nextIndex].video) {
      setVideoPlaying(true); // the clip plays first, then the chat opens
    } else {
      openFrameChat(nextIndex, nextStart);
    }
  }

  /** However the closing clip ends — played out, skipped, or failed to load —
   * the scene is over: bank the XP once and show the end card instead of
   * dropping the player back onto another screen unannounced. */
  function endScene() {
    setOutroPlaying(false);
    setComplete(true);
    if (!sessionCompleteFired.current) {
      sessionCompleteFired.current = true;
      onSessionComplete();
    }
  }

  // The card can land below the fold — bring it into view so the buttons
  // aren't left hidden behind the mobile bottom nav.
  useEffect(() => {
    if (complete) endCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [complete]);

  function submit(text: string) {
    if (!text.trim() || isTyping) return;
    onSend(text.trim(), beatOf(frame, frameStart));
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="relative h-64 w-full overflow-hidden bg-sg-navy sm:h-80 lg:h-[420px]">
        <img
          key={frame.background}
          src={frame.background}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />

        {/* The tissue packet, dropped onto the table once it's been choped.
            Positioned as a % of the frame: the still is wider than the stage,
            so object-cover crops the sides but never the vertical, which keeps
            the packet on the table top at every size. */}
        <AnimatePresence>
          {choped && frame.dropsTissue && !videoPlaying && (
            <motion.img
              src={ART.tissue}
              alt="A packet of tissue holding the table"
              initial={{ opacity: 0, y: -70, rotate: -25, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, rotate: -8, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              // Anchored by its middle on the table top rather than by its
              // upper edge — measured against the still, the old anchor left the
              // packet hanging over the front lip of the table.
              className="absolute left-1/2 top-[71%] w-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg sm:w-16 lg:w-20"
            />
          )}
        </AnimatePresence>

        {outroPlaying && (
          <>
            <video
              key={ART.trayReturnClip}
              src={ART.trayReturnClip}
              autoPlay
              muted
              playsInline
              onEnded={endScene}
              onError={endScene}
              className="absolute inset-0 size-full bg-sg-navy object-cover"
            />
            <button
              type="button"
              onClick={endScene}
              className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              Skip →
            </button>
          </>
        )}

        {videoPlaying && frame.video && (
          <>
            <video
              key={frame.video}
              src={frame.video}
              autoPlay
              muted
              playsInline
              onEnded={endVideo}
              // A clip that fails to load must not strand the scene behind it.
              onError={endVideo}
              className="absolute inset-0 size-full bg-sg-navy object-cover"
            />
            <button
              type="button"
              onClick={endVideo}
              className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              Skip →
            </button>
          </>
        )}

        {!videoPlaying && !outroPlaying && !complete && (
          <>
            {/* Narrow frames can't hold two side-by-side bubbles — they wrap
                into unreadable slivers — so below sm only the latest line is
                shown, at full width. */}
            <div
              className="absolute inset-x-0 px-3 sm:hidden"
              style={{ top: `${frame.bubbleTopPct ?? 4}%` }}
            >
              <AnimatePresence mode="popLayout">
                {isTyping ? (
                  <TypingBubble />
                ) : (
                  latestMessage && (
                    <Bubble
                      key={latestMessage.id}
                      text={latestMessage.text}
                      side={latestMessage.role === 'user' ? 'left' : 'right'}
                    />
                  )
                )}
              </AnimatePresence>
            </div>

            {/* Bubbles hang from the TOP of the frame so a long line grows
                downward into open space instead of upward into the frame edge.
                Each one is pinned over its own speaker rather than to a frame
                corner: the tail (6 = 1.5rem in from the bubble's near edge)
                lands on that speaker's `heads` %, and the bubble grows outward
                from there. The 1rem on the far side stops a long line running
                off the frame. */}
            <div
              className="absolute inset-x-0 hidden sm:block"
              style={{ top: `${frame.bubbleTopPct ?? 4}%` }}
            >
              <div
                className="absolute top-0"
                style={{ left: '1rem', right: `calc(${100 - frame.heads.you}% - 1.5rem)` }}
              >
                <div className="ml-auto max-w-[260px]">
                  <AnimatePresence mode="popLayout">
                    {lastUserMessage && (
                      <Bubble
                        key={lastUserMessage.id}
                        text={lastUserMessage.text}
                        side="right"
                        tail="right"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div
                className="absolute top-0"
                style={{ left: `calc(${frame.heads.siti}% - 1.5rem)`, right: '1rem' }}
              >
                <div className="max-w-[260px]">
                  <AnimatePresence mode="popLayout">
                    {isTyping ? (
                      <TypingBubble />
                    ) : (
                      lastSitiMessage && (
                        <Bubble
                          key={lastSitiMessage.id}
                          text={lastSitiMessage.text}
                          side="left"
                          tail="left"
                        />
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {frame.showSprites && (
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-4 px-5 pb-2 sm:gap-8 sm:px-6 sm:pb-4 lg:gap-12">
                <Sprite src={ART.player} alt="You" fromX={-40} delay={0.15} />
                <Sprite src={ART.siti} alt={personaName} fromX={40} delay={0.3} />
              </div>
            )}
          </>
        )}
      </div>

      {complete ? (
        <div ref={endCardRef} className="border-t border-black/5 px-5 py-5 text-center">
          <p className="text-sm font-bold text-sg-navy">
            Lunch done — table cleared like a local!{completionXp ? ` +${completionXp} XP` : ''}
          </p>
          <p className="mt-0.5 text-xs text-sg-navy/50">
            Want to run through it again, or head back?
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="secondary" onClick={onRestart}>
              Try Again
            </Button>
            <Button variant="primary" onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      ) : outroPlaying || frameDone ? (
        <div className="border-t border-black/5 px-5 py-5 text-center">
          <p className="text-sm font-bold text-sg-navy">{frame.closingLine}</p>
          <p className="mt-1 text-xs font-semibold text-sg-navy/40">{frame.advanceLabel}</p>
        </div>
      ) : frame.choices ? (
        // A closed beat: the stall sells one dish two ways, so there is nothing
        // to type — pick one and it goes to Siti as your line.
        <div className="grid gap-2 border-t border-black/5 p-4 sm:grid-cols-2">
          {frame.choices.map((choice) => (
            <Button
              key={choice}
              variant="secondary"
              size="lg"
              disabled={isTyping || videoPlaying}
              onClick={() => submit(choice)}
            >
              {choice.replace(/ for me\.$/, '')}
            </Button>
          ))}
        </div>
      ) : (
        <div className="border-t border-black/5 p-4">
          <div className="flex flex-wrap gap-2">
            {suggestionsLoading && (
              <span className="text-xs font-semibold text-sg-navy/40">
                {personaName} is waiting for you…
              </span>
            )}
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full bg-sg-bg px-3 py-1.5 text-xs font-bold text-sg-navy/70 transition-colors hover:bg-black/10 hover:text-sg-navy"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder={videoPlaying ? 'Watching…' : `Say something to ${personaName}…`}
              disabled={videoPlaying}
              className="min-w-0 flex-1 rounded-2xl bg-sg-bg px-4 py-3 text-sm font-semibold text-sg-navy outline-none placeholder:text-sg-navy/35 focus-visible:ring-4 focus-visible:ring-sg-blue/30"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!draft.trim() || isTyping || videoPlaying}
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
