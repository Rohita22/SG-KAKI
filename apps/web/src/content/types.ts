export type Category =
  | 'lingo'
  | 'food'
  | 'gettingAround'
  | 'socialVibes'
  | 'workCulture';

export const CATEGORY_META: Record<
  Category,
  { label: string; emoji: string }
> = {
  lingo: { label: 'Lingo', emoji: '🗣️' },
  food: { label: 'Food', emoji: '🍜' },
  gettingAround: { label: 'Getting Around', emoji: '🚇' },
  socialVibes: { label: 'Social Vibes', emoji: '👀' },
  workCulture: { label: 'Work Culture', emoji: '💼' },
};

export type SceneKey =
  | 'escalator'
  | 'train'
  | 'hawker'
  | 'queue'
  | 'chat'
  | 'office'
  | 'street'
  | 'classroom'
  | 'none';

export interface Mission {
  id: string;
  title: string;
  icon: string;
  category: Category;
  subtitle: string;
  order: number;
  prerequisiteMissionIds: string[];
  lessonIds: string[];
  completionXp: number;
  badgeIdOnComplete?: string;
}

export interface Lesson {
  id: string;
  missionId: string;
  title: string;
  order: number;
  challengeIds: string[];
  /** Pre-assessment "Discover" cards. Absent = lesson skips straight to assessment. */
  discover?: DiscoverFact[];
  /** Phrases taught by this lesson, shown as Phrase Cards during Discover. */
  phraseIds?: string[];
  exampleConversation?: ConversationLine[];
  guidedPractice?: GuidedPracticeExercise[];
  /** Culture topics taught/unlocked by this lesson. */
  cultureTopicIds?: string[];
  /** Bullet lines shown in the Lesson Recap. */
  recap?: string[];
}

export type ChallengeType =
  | 'multiple-choice'
  | 'scenario-decision'
  | 'sort'
  | 'match'
  | 'can-cannot'
  | 'pick-reply'
  | 'read-the-room'
  | 'culture-card';

interface BaseChallenge {
  id: string;
  lessonId: string;
  type: ChallengeType;
  prompt: string;
  context?: string;
  scene: SceneKey;
  xp: number;
  difficulty: 1 | 2 | 3;
  explanation: string;
  category: Category;
}

export interface ChallengeOption {
  id: string;
  label: string;
}

export interface OptionChallenge extends BaseChallenge {
  type:
    | 'multiple-choice'
    | 'scenario-decision'
    | 'can-cannot'
    | 'pick-reply'
    | 'read-the-room';
  options: ChallengeOption[];
  correctOptionId: string;
  /** For read-the-room / pick-reply: the chat transcript leading up to the question */
  chatThread?: { from: 'them' | 'you'; text: string }[];
}

export interface SortChallengeItem {
  id: string;
  label: string;
}

export interface SortChallengeData extends BaseChallenge {
  type: 'sort';
  items: SortChallengeItem[];
  correctOrder: string[];
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchChallengeData extends BaseChallenge {
  type: 'match';
  pairs: MatchPair[];
}

export interface CultureCardChallenge extends BaseChallenge {
  type: 'culture-card';
  body: string;
}

export type Challenge =
  | OptionChallenge
  | SortChallengeData
  | MatchChallengeData
  | CultureCardChallenge;

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Level {
  level: number;
  name: string;
  minXp: number;
}

/** A real illustrated backdrop + character art, rendered as an interactive
 * visual-novel-style scene instead of the plain chat panel. */
export interface AIPracticeVisualScene {
  backgroundImage: string;
  /** Sprite for the AI persona (e.g. the classmate). */
  characterImage: string;
  /** Sprite representing the player. Absent = player has no on-screen sprite. */
  playerImage?: string;
  /** Sprite for the scripted-ending character (e.g. the teacher). Absent = no scripted ending. */
  teacherImage?: string;
  /** Mirrors the player sprite so they face inward, toward the persona. Defaults
   * to true: sprites are drawn facing right, and the player stands on the left.
   * Set false when the player art is already drawn facing right-to-left. */
  flipPlayer?: boolean;
  /** Mirrors the persona sprite. Defaults to false, since a persona on the
   * right is normally drawn already facing left, toward the player. */
  flipCharacter?: boolean;
  /** A foreground strip (e.g. a stall counter front) drawn ABOVE the character
   * layer, so characters standing behind it are occluded from the waist down.
   * Depth in the background art alone can't do this — sprites always render
   * over the background, so the occluding element needs its own layer. */
  foregroundImage?: string;
  /** How far to push each character down, as a percentage of their own height,
   * so they sit behind `foregroundImage` instead of on top of it. Applied only
   * to the named character; the other stays on the front floor line. */
  characterOffsetPct?: number;
  playerOffsetPct?: number;
  /** Extra horizontal separation between the two characters, in Tailwind's
   * spacing scale, for scenes where they stand at opposite ends of a counter
   * rather than side by side. */
  spread?: 'default' | 'wide';
  /** Sprite frame size. Landscape (3:2) art is cropped inward by object-cover
   * and so reads large at the default size; portrait (2:3) art fills the frame
   * uncropped and needs 'large' to read at a comparable scale. */
  spriteSize?: 'default' | 'large';
}

/** The scripted cutscene that closes out a visual-scene practice session,
 * replacing a manual "Finish" button with an in-scene ending. */
export interface AIPracticeCompletionScript {
  /** The ending won't trigger before this many user turns, even if the AI
   * signals a natural pause earlier — keeps a too-short chat from cutting off. */
  minTurns: number;
  /** Hard cap: the ending triggers automatically at this many turns even
   * without an AI-detected natural pause, so the scene can't run forever. */
  maxTurns: number;
  teacherName: string;
  teacherLine: string;
  classmateLine: string;
}

export interface AIPracticeScenario {
  id: string;
  title: string;
  setup: string;
  suggestedOpeners: string[];
  completionXp: number;
  /** Unlocked once this mission is completed. Absent = available from the start. */
  unlocksAfterMissionId?: string;
  /** Illustrated gradient backdrop shown above the chat. Ignored when `visualScene` is set. */
  sceneKey?: SceneKey;
  /** Name of the character the AI is role-playing, e.g. "Wei Jie". */
  personaName?: string;
  /** Short description of who that character is, fed into the AI's system prompt. */
  personaDescription?: string;
  /** School the persona and player attend, fed into the AI's system prompt for consistent context. */
  schoolName?: string;
  /** Class/grade the persona and player are in, fed into the AI's system prompt. */
  className?: string;
  /** Real illustrated scene (background + character art). Takes priority over `sceneKey`. */
  visualScene?: AIPracticeVisualScene;
  /** If true, the AI persona sends the first message instead of waiting on the player. */
  autoOpen?: boolean;
  /** Scripted ending sequence. Absent = falls back to a manual "Finish Practice" button. */
  completionScript?: AIPracticeCompletionScript;
  /** Phrase categories relevant to this scenario's "Try using" hints — keeps
   * e.g. food vocab from showing up in a classroom chat. Absent = no filter. */
  hintCategories?: Category[];
}

export interface PhraseExample {
  text: string;
}

export interface Phrase {
  id: string;
  word: string;
  pronunciation: string;
  phonetic: string;
  meaning: string;
  category: Category;
  difficulty: 1 | 2 | 3;
  usedIn: string[];
  notUsedIn?: string[];
  commonMistakes?: string[];
  examples: PhraseExample[];
  /** Mission where this phrase is taught, for Phrase Book "unlock hint" copy. */
  missionId: string;
  /** Real recording URL, normal speed. Unset today — falls back to browser speech synthesis. */
  audioUrl?: string;
  /** Real recording URL, slow speed. */
  audioUrlSlow?: string;
}

export interface CultureTopic {
  id: string;
  title: string;
  icon: string;
  category: Category;
  summary: string;
  explanation: string;
  examples: string[];
  /** Seed questions for Ask SG Buddy. */
  aiPrompts: string[];
  missionId: string;
}

export interface DiscoverFact {
  emoji: string;
  title: string;
  body: string;
}

export interface ConversationLine {
  from: 'them' | 'you';
  speaker?: string;
  text: string;
}

export type GuidedPracticeExercise =
  | {
      id: string;
      kind: 'tap-phrase';
      prompt: string;
      phraseId: string;
      distractorPhraseIds: string[];
    }
  | {
      id: string;
      kind: 'fill-blank';
      prompt: string;
      sentence: string;
      answer: string;
      options: string[];
    }
  | {
      id: string;
      kind: 'rearrange';
      prompt: string;
      correctOrder: string[];
    }
  | {
      id: string;
      kind: 'match-pronunciation';
      prompt: string;
      phraseId: string;
      distractorPhraseIds: string[];
    };

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ProgressState {
  schemaVersion: number;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedChallengeIds: string[];
  completedLessonIds: string[];
  completedMissionIds: string[];
  unlockedMissionIds: string[];
  earnedBadgeIds: string[];
  aiPracticeHistory: Record<string, ChatMessage[]>;
  unlockedPhraseIds: string[];
  unlockedCultureTopicIds: string[];
  /** phraseId -> mastery level, 0..5 */
  phraseMastery: Record<string, number>;
}

export interface CountryPack {
  id: string;
  name: string;
  missions: Mission[];
  lessons: Lesson[];
  challenges: Challenge[];
  badges: Badge[];
  levels: Level[];
  aiScenarios: AIPracticeScenario[];
  phrases: Phrase[];
  cultureTopics: CultureTopic[];
}
