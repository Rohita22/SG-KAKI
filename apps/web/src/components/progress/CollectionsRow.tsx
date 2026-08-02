import { useNavigate } from 'react-router-dom';
import { useDerivedProgress } from '@/state/useDerivedProgress';
import { useProgress } from '@/state/useProgress';

function CollectionTile({
  emoji,
  count,
  label,
  to,
  tab,
}: {
  emoji: string;
  count: number;
  label: string;
  to?: string;
  tab?: 'phrases' | 'culture';
}) {
  const navigate = useNavigate();
  const content = (
    <>
      <span className="text-2xl">{emoji}</span>
      <span className="text-lg font-black text-sg-navy">{count}</span>
      <span className="text-xs font-bold text-sg-navy/50">{label}</span>
    </>
  );

  if (!to) {
    return (
      <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-white p-4 text-center shadow-card">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(to, tab ? { state: { tab } } : undefined)}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-white p-4 text-center shadow-card transition-transform active:scale-[0.98]"
    >
      {content}
    </button>
  );
}

/** "Collections" row — the Field Guide (phrases + culture) and badge tallies, all
 * built up through play. Lives on the Progress page alongside the full badge grid. */
export function CollectionsRow() {
  const { state } = useProgress();
  const { phrasesLearnedCount, cultureTopicsLearnedCount } = useDerivedProgress();

  return (
    <div className="flex gap-3">
      <CollectionTile
        emoji="📖"
        count={phrasesLearnedCount}
        label="Phrases"
        to="/field-guide"
        tab="phrases"
      />
      <CollectionTile
        emoji="🎓"
        count={cultureTopicsLearnedCount}
        label="Culture"
        to="/field-guide"
        tab="culture"
      />
      <CollectionTile emoji="🏆" count={state.earnedBadgeIds.length} label="Badges" />
    </div>
  );
}
