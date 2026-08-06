import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Phrase, CultureTopic, Category } from "@/content/types";
import { CATEGORY_META } from "@/content/types";
import { activeCountryPack } from "@/content/activeCountryPack";
import { useProgress } from "@/state/useProgress";
import { useFavorites } from "@/state/useFavorites";
import { PhraseGridCard } from "@/components/learning/PhraseGridCard";
import { PhraseCard } from "@/components/learning/PhraseCard";
import { GuidedPractice } from "@/components/learning/GuidedPractice";
import { AskSGBuddy } from "@/components/learning/AskSGBuddy";
import { FieldGuideHero } from "@/components/learning/FieldGuideHero";
import { ScreenBackdrop } from "@/components/shell/ScreenBackdrop";
import { ScreenCornerArt } from "@/components/shell/ScreenCornerArt";
import { RecentlyLearnedRow } from "@/components/learning/RecentlyLearnedRow";
import { seededShuffle } from "@/lib/shuffle";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { clsx } from "@/lib/clsx";

const RECENT_COUNT = 12;
const FIELD_GUIDE_BG_URL = "/images/field-guide-bg.png";
const CORNER_ART_URL = "/images/field-guide-passport.png";

type Tab = "phrases" | "culture";
type Filter = "all" | Category | "favorites" | "recent";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "food", label: "Food" },
  { key: "lingo", label: "Lingo" },
  { key: "socialVibes", label: "Culture" },
  { key: "gettingAround", label: "Transport" },
  { key: "workCulture", label: "Work" },
  { key: "favorites", label: "Favorites" },
  { key: "recent", label: "Recently Learned" },
];

const SECTION_META: Record<Category, { title: string; description: string }> = {
  food: {
    title: "🍜 Food",
    description: "Hawker orders, kopi lingo, and what to say at the table.",
  },
  lingo: {
    title: "💬 Lingo",
    description: "Everyday Singlish that gets you talking like a local.",
  },
  socialVibes: {
    title: "🎭 Culture",
    description: "Unspoken rules, etiquette, and how to read the room.",
  },
  gettingAround: {
    title: "🚇 Transport",
    description: "MRT, buses, and getting around the island.",
  },
  workCulture: {
    title: "💼 Work",
    description: "Office norms and how work actually gets done here.",
  },
};

function SearchBar({
  value,
  onChange,
  onToggleFilters,
  filtersOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sg-navy/35" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search phrases, culture notes..."
          className="w-full rounded-2xl border border-white/70 bg-white/85 py-3.5 pl-11 pr-4 text-sm font-semibold text-sg-navy shadow-card backdrop-blur-md outline-none placeholder:text-sg-navy/35 focus:border-sg-blue/40 focus:ring-4 focus:ring-sg-blue/15"
        />
      </div>
      <button
        type="button"
        onClick={onToggleFilters}
        aria-pressed={filtersOpen}
        aria-label="Toggle filters"
        className={clsx(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-card backdrop-blur-md transition-colors",
          filtersOpen
            ? "border-sg-navy bg-sg-navy text-white"
            : "border-white/70 bg-white/85 text-sg-navy/60 hover:text-sg-navy",
        )}
      >
        <SlidersHorizontal className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function FilterPills({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={clsx(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            active === f.key
              ? "bg-sg-navy text-white shadow-card"
              : "bg-white/60 text-sg-navy/60 hover:bg-white/90",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function PhrasesTab({ query, filter }: { query: string; filter: Filter }) {
  const { state, incrementMastery } = useProgress();
  const { favoriteIds, toggle } = useFavorites();
  const [selected, setSelected] = useState<Phrase | null>(null);
  const [practicing, setPracticing] = useState(false);

  const unlockedIds = new Set(state.unlockedPhraseIds);
  const favSet = new Set(favoriteIds);
  const categories = Object.keys(CATEGORY_META) as Category[];

  const recentIds = state.unlockedPhraseIds.slice(-RECENT_COUNT).reverse();
  const recentPhrases = recentIds
    .map((id) => activeCountryPack.phrases.find((p) => p.id === id))
    .filter((p): p is Phrase => !!p);

  const matchesFilter = (p: Phrase) => {
    if (
      query &&
      !matchesQuery(p.word, query) &&
      !matchesQuery(p.meaning, query)
    )
      return false;
    if (filter === "favorites") return favSet.has(p.id);
    if (filter === "recent") return recentIds.includes(p.id);
    if (filter === "all") return true;
    return p.category === filter;
  };

  const isOverview = filter === "all" && !query;
  const showRecentSection = isOverview && recentPhrases.length > 0;
  const visibleCategories =
    filter === "all" || filter === "favorites" || filter === "recent"
      ? categories
      : [filter as Category];

  return (
    <>
      {showRecentSection && (
        <RecentlyLearnedRow
          phrases={recentPhrases}
          favoriteIds={favSet}
          onToggleFavorite={toggle}
          onSelect={setSelected}
        />
      )}

      {filter === "recent" && recentPhrases.length === 0 && (
        <Card className="border border-white/50 bg-white/70 text-center text-sm font-semibold text-sg-navy/50 backdrop-blur-md">
          Nothing learned yet — complete a mission to start unlocking phrases.
        </Card>
      )}

      {visibleCategories.map((category) => {
        const phrasesInCategory = activeCountryPack.phrases
          .filter((p) => p.category === category)
          .filter(matchesFilter);
        if (phrasesInCategory.length === 0) return null;

        return (
          <Card
            key={category}
            className="border border-white/50 bg-white/70 backdrop-blur-md"
          >
            <p className="text-sm font-black text-sg-navy">
              {SECTION_META[category].title}
            </p>
            <p className="mb-3 mt-0.5 text-xs font-medium text-sg-navy/50">
              {SECTION_META[category].description}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {phrasesInCategory.map((p) => {
                const unlocked = unlockedIds.has(p.id);
                const mission = activeCountryPack.missions.find(
                  (m) => m.id === p.missionId,
                );
                return (
                  <PhraseGridCard
                    key={p.id}
                    icon={CATEGORY_META[p.category].emoji}
                    title={p.word}
                    subtitle={p.meaning}
                    category={p.category}
                    unlocked={unlocked}
                    xp={unlocked ? p.difficulty * 10 : undefined}
                    hint={mission ? `Unlock after ${mission.title}` : undefined}
                    favorited={favSet.has(p.id)}
                    onToggleFavorite={unlocked ? () => toggle(p.id) : undefined}
                    onClick={() => setSelected(p)}
                  />
                );
              })}
            </div>
          </Card>
        );
      })}

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setPracticing(false);
        }}
      >
        {selected && !practicing && (
          <PhraseCard
            phrase={selected}
            masteryLevel={state.phraseMastery[selected.id]}
            onPractice={() => setPracticing(true)}
          />
        )}
        {selected && practicing && (
          <div className="rounded-3xl bg-white p-6 shadow-card-lg">
            <GuidedPractice
              exercise={{
                id: `field-guide-practice-${selected.id}`,
                kind: "tap-phrase",
                prompt: `Tap the word for "${selected.meaning}"`,
                phraseId: selected.id,
                distractorPhraseIds: seededShuffle(
                  activeCountryPack.phrases
                    .filter(
                      (p) =>
                        p.id !== selected.id &&
                        p.category === selected.category,
                    )
                    .map((p) => p.id),
                  selected.id,
                ).slice(0, 2),
              }}
              phrases={activeCountryPack.phrases}
              onComplete={(correctPhraseId) => {
                if (correctPhraseId) incrementMastery(correctPhraseId);
                setPracticing(false);
              }}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function CultureTab({ query, filter }: { query: string; filter: Filter }) {
  const { state } = useProgress();
  const { favoriteIds, toggle } = useFavorites();
  const [selected, setSelected] = useState<CultureTopic | null>(null);

  const unlockedIds = new Set(state.unlockedCultureTopicIds);
  const favSet = new Set(favoriteIds);

  const topics = activeCountryPack.cultureTopics.filter((t) => {
    if (
      query &&
      !matchesQuery(t.title, query) &&
      !matchesQuery(t.summary, query)
    )
      return false;
    if (filter === "favorites") return favSet.has(t.id);
    if (filter === "recent") return unlockedIds.has(t.id);
    if (filter === "all") return true;
    return t.category === filter;
  });

  return (
    <>
      <Card className="border border-white/50 bg-white/70 backdrop-blur-md">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-sg-navy/40">
          🎓 Culture Notes
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {topics.map((topic) => {
            const unlocked = unlockedIds.has(topic.id);
            const mission = activeCountryPack.missions.find(
              (m) => m.id === topic.missionId,
            );
            return (
              <PhraseGridCard
                key={topic.id}
                icon={topic.icon}
                title={topic.title}
                subtitle={topic.summary}
                category={topic.category}
                unlocked={unlocked}
                hint={mission ? `Unlock after ${mission.title}` : undefined}
                favorited={favSet.has(topic.id)}
                onToggleFavorite={unlocked ? () => toggle(topic.id) : undefined}
                onClick={() => setSelected(topic)}
              />
            );
          })}
        </div>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card-lg">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-sg-xp/15 text-2xl">
                {selected.icon}
              </span>
              <h2 className="text-lg font-extrabold text-sg-navy">
                {selected.title}
              </h2>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-sg-navy/80">
              {selected.explanation}
            </p>
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">
                Examples
              </p>
              <ul className="space-y-1.5">
                {selected.examples.map((ex) => (
                  <li key={ex} className="text-sm font-medium text-sg-navy/70">
                    • {ex}
                  </li>
                ))}
              </ul>
            </div>
            <AskSGBuddy
              context={{
                missionTitle:
                  activeCountryPack.missions.find(
                    (m) => m.id === selected.missionId,
                  )?.title ?? "",
                lessonTitle: selected.title,
                cultureTopicTitle: selected.title,
              }}
              suggestedQuestions={selected.aiPrompts}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export function FieldGuideScreen() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: Tab } | null)?.tab ?? "phrases";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <div className="relative -mx-4 -my-5 min-h-full shrink-0 px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={FIELD_GUIDE_BG_URL} />
      <ScreenCornerArt image={CORNER_ART_URL} />

      <div className="relative z-10">
        <div className="flex min-w-0 flex-col gap-5">
          <FieldGuideHero />

          <SearchBar
            value={query}
            onChange={setQuery}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((v) => !v)}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit gap-1 rounded-2xl bg-white/70 p-1 shadow-card backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTab("phrases")}
                className={clsx(
                  "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
                  tab === "phrases"
                    ? "bg-white text-sg-navy shadow-card"
                    : "text-sg-navy/50",
                )}
              >
                📖 Phrases
              </button>
              <button
                type="button"
                onClick={() => setTab("culture")}
                className={clsx(
                  "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
                  tab === "culture"
                    ? "bg-white text-sg-navy shadow-card"
                    : "text-sg-navy/50",
                )}
              >
                🎓 Culture Notes
              </button>
            </div>
          </div>

          {filtersOpen && <FilterPills active={filter} onChange={setFilter} />}

          {tab === "phrases" ? (
            <PhrasesTab query={query} filter={filter} />
          ) : (
            <CultureTab query={query} filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
}
