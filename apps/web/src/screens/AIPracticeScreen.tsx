import { useRef, useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useAIPractice } from '@/state/useAIPractice';
import { useProgress } from '@/state/useProgress';
import { isScenarioUnlocked } from '@/game/aiScenarioUnlocks';
import { activeCountryPack } from '@/content/activeCountryPack';
import { ChatBubble, TypingBubble } from '@/components/practice/ChatBubble';
import { ConversationControls } from '@/components/practice/ConversationControls';
import { Button } from '@/components/ui/Button';
import { ChallengeScene } from '@/components/challenges/scenes/ChallengeScene';
import { VisualNovelScene } from '@/components/practice/VisualNovelScene';
import { HawkerScene } from '@/components/practice/scene3/HawkerScene';
import { CommuteGame } from '@/components/practice/scene4/CommuteGame';
import { KopiGame } from '@/components/practice/scene2/KopiGame';

// Natural-ending policy shared by every scenario, scripted or not: never
// finish before MIN_TURNS_TO_FINISH even if the AI signals readiness early,
// but force it open by MAX_TURNS_TO_FINISH so a practice session can't run
// forever if the AI never signals. Scenarios with a full scripted ending
// (visualScene + completionScript) define their own minTurns/maxTurns instead.
const MIN_TURNS_TO_FINISH = 2;
const MAX_TURNS_TO_FINISH = 6;

// Scene 3 owns a self-contained stage component, separate from the shared
// visual-novel one scenes 1 and 2 use. It closes its own session and
// awards its own XP, so the generic "Finish Practice" button below the stage
// would be a duplicate.
const HAWKER_SCENARIO_ID = 'hawker-lunch';
const COMMUTE_SCENARIO_ID = 'commute-to-changi';
const KOPI_SCENARIO_ID = 'ordering-kopi';
const SELF_CONTAINED_SCENE_IDS = new Set([
  HAWKER_SCENARIO_ID,
  COMMUTE_SCENARIO_ID,
  KOPI_SCENARIO_ID,
]);

const PRACTICE_SKILLS = [
  'Casual communication',
  'Understanding Singlish',
  'Responding naturally',
];

export function AIPracticeScreen() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { state, awardXp } = useProgress();
  const {
    scenario,
    history,
    isTyping,
    suggestions,
    suggestionsLoading,
    readyToEnd,
    sendUserMessage,
    openFrame,
    restart,
  } = useAIPractice(scenarioId ?? '');
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isTyping]);

  if (!scenario) return null;

  if (!isScenarioUnlocked(scenario.id, state.completedMissionIds, activeCountryPack.aiScenarios)) {
    return <Navigate to="/practice" replace />;
  }

  const turnCount = history.filter((m) => m.role === 'user').length;
  const stepCount = Math.min(4, turnCount + 1);

  // A scripted ending closes the session in-scene, so the manual "Finish"
  // button below the stage would be a duplicate. Not gated on the arriving
  // third character: a scene can close on the persona alone.
  const hasScriptedEnding = Boolean(scenario.visualScene && scenario.completionScript);
  const canFinish =
    !hasScriptedEnding &&
    !SELF_CONTAINED_SCENE_IDS.has(scenario.id) &&
    turnCount >= MIN_TURNS_TO_FINISH &&
    (readyToEnd || turnCount >= MAX_TURNS_TO_FINISH);

  const singlishHints = activeCountryPack.phrases
    .filter((p) => state.unlockedPhraseIds.includes(p.id))
    .filter((p) => !scenario.hintCategories || scenario.hintCategories.includes(p.category))
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, 4)
    .map((p) => ({ id: p.id, word: p.word, meaning: p.meaning }));

  function handleSend(text: string) {
    setDraft('');
    void sendUserMessage(text);
  }

  function handleRestart() {
    setDraft('');
    restart();
  }

  function handleComplete() {
    if (!scenario) return;
    awardXp(scenario.completionXp);
    navigate('/practice');
  }

  function handleSessionComplete() {
    if (!scenario) return;
    awardXp(scenario.completionXp);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold text-sg-navy lg:text-2xl">Quests</h1>
        <span className="rounded-full bg-sg-xp/20 px-2 py-0.5 text-[10px] font-black text-sg-navy">
          BETA
        </span>
      </div>
      <p className="mt-1 text-sm text-sg-navy/50">
        {SELF_CONTAINED_SCENE_IDS.has(scenario.id)
          ? 'Complete this hands-on quest and practise like a local.'
          : 'Complete this conversation quest with an AI persona.'}
      </p>

      <div
        className={
          scenario.id === COMMUTE_SCENARIO_ID
            ? 'mt-6'
            : 'mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start'
        }
      >
        {scenario.id !== COMMUTE_SCENARIO_ID && <div
          className="min-w-0 rounded-3xl bg-white p-6 shadow-card lg:sticky lg:top-8"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                Scenario
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-sg-navy">{scenario.title}</h2>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleRestart}
                aria-label="Restart conversation"
                title="Restart conversation"
                className="flex shrink-0 items-center gap-1 rounded-full bg-sg-bg px-2.5 py-1.5 text-xs font-bold text-sg-navy/60 transition-colors hover:bg-black/10 hover:text-sg-navy"
              >
                <RotateCcw className="size-3.5" />
                Restart
              </button>
            )}
          </div>
          <p className="mt-1.5 text-sm text-sg-navy/60">{scenario.setup}</p>

          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-sg-navy/40">
            What you're practicing
          </p>
          <ul className="mt-2 space-y-1.5">
            {(scenario.skills || PRACTICE_SKILLS).map((skill) => (
              <li key={skill} className="flex items-center gap-2 text-sm text-sg-navy/70">
                <span className="size-1.5 shrink-0 rounded-full bg-sg-blue" />
                {skill}
              </li>
            ))}
          </ul>

          {!SELF_CONTAINED_SCENE_IDS.has(scenario.id) && (
            <div className="mt-5 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < stepCount ? 'bg-sg-xp' : 'bg-black/10'}`}
                />
              ))}
            </div>
          )}
        </div>}

        <div className="min-w-0">
          {scenario.id === COMMUTE_SCENARIO_ID ? (
            <CommuteGame
              completionXp={scenario.completionXp}
              onSessionComplete={handleSessionComplete}
              onDone={() => navigate('/practice')}
            />
          ) : scenario.id === KOPI_SCENARIO_ID ? (
            <KopiGame
              completionXp={scenario.completionXp}
              onSessionComplete={handleSessionComplete}
              onDone={() => navigate('/practice')}
            />
          ) : scenario.id === HAWKER_SCENARIO_ID ? (
            <HawkerScene
              personaName={scenario.personaName}
              history={history}
              isTyping={isTyping}
              suggestions={suggestions}
              suggestionsLoading={suggestionsLoading}
              readyToEnd={readyToEnd}
              draft={draft}
              onDraftChange={setDraft}
              onSend={(text, beat) => {
                setDraft('');
                void sendUserMessage(text, beat);
              }}
              onOpenFrame={(beat, nudge) => void openFrame(beat, nudge)}
              completionXp={scenario.completionXp}
              onSessionComplete={handleSessionComplete}
              onRestart={handleRestart}
              // Back to the Quests hub the scene was launched from, not the
              // progress screen — the XP is already banked on the end card.
              onDone={() => navigate('/practice')}
            />
          ) : scenario.visualScene ? (
            <VisualNovelScene
              visualScene={scenario.visualScene}
              personaName={scenario.personaName}
              history={history}
              isTyping={isTyping}
              turnCount={turnCount}
              suggestions={suggestions}
              suggestionsLoading={suggestionsLoading}
              readyToEnd={readyToEnd}
              fallbackOpeners={scenario.suggestedOpeners}
              singlishHints={singlishHints}
              completionScript={scenario.completionScript}
              completionXp={scenario.completionXp}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              onSessionComplete={handleSessionComplete}
              onRestart={handleRestart}
              onDone={() => navigate('/practice')}
            />
          ) : (
            <>
              {scenario.sceneKey && scenario.sceneKey !== 'none' && (
                <div className="mb-4">
                  <ChallengeScene scene={scenario.sceneKey} />
                  {scenario.personaName && (
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                      Chatting with {scenario.personaName}
                    </p>
                  )}
                </div>
              )}

              <div className="flex h-[440px] flex-col overflow-hidden rounded-3xl bg-white shadow-card sm:h-[520px] lg:h-[600px]">
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                  {history.map((m) => (
                    <ChatBubble key={m.id} message={m} />
                  ))}
                  {isTyping && <TypingBubble />}
                </div>

                <ConversationControls
                  turnCount={turnCount}
                  suggestions={suggestions}
                  suggestionsLoading={suggestionsLoading}
                  isTyping={isTyping}
                  fallbackOpeners={scenario.suggestedOpeners}
                  singlishHints={singlishHints}
                  draft={draft}
                  onDraftChange={setDraft}
                  onSend={handleSend}
                />
              </div>
            </>
          )}

          {canFinish && (
            <div className="mt-4 rounded-3xl bg-white px-5 py-4 shadow-card">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleComplete}
              >
                Finish Practice (+{scenario.completionXp} XP)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
