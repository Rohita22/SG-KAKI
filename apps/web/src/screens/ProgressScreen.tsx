import { CATEGORY_META, type Category } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { useDerivedProgress } from '@/state/useDerivedProgress';
import { SavvyRing } from '@/components/progress/SavvyRing';
import { CategoryProgressBar } from '@/components/progress/CategoryProgressBar';
import { CATEGORY_COLORS } from '@/components/progress/categoryColors';
import { ProgressStatsCard } from '@/components/progress/ProgressStatsCard';
import { CollectionsRow } from '@/components/progress/CollectionsRow';
import { BadgeCard } from '@/components/rewards/BadgeCard';
import { StreakCalendar } from '@/components/rewards/StreakCalendar';
import { TipOfTheDayCard } from '@/components/rewards/TipOfTheDayCard';
import { ScreenBackdrop } from '@/components/shell/ScreenBackdrop';
import { Card } from '@/components/ui/Card';
import { clsx } from '@/lib/clsx';

const PROGRESS_BG_URL = '/images/field-guide-bg.png';
const CORNER_ART_URL = '/images/field-guide-passport.png';

/** Frosted panels, so the illustrated backdrop reads through the cards. */
const GLASS = 'border border-white/60 bg-white/80 backdrop-blur-md';

export function ProgressScreen() {
  const { state } = useProgress();
  const { savvy, level, levelProgress } = useDerivedProgress();
  const categories = Object.keys(CATEGORY_META) as Category[];

  const nextUnlock = activeCountryPack.badges.find(
    (b) => !state.earnedBadgeIds.includes(b.id),
  );
  const recentBadgeId = state.earnedBadgeIds.at(-1);
  const recentBadge = activeCountryPack.badges.find((b) => b.id === recentBadgeId);

  return (
    <div className="relative -mx-4 -my-5 min-h-full px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={PROGRESS_BG_URL} />

      <div className="relative z-10">
        {/* The art sits in the heading row's own space — unlike the Field Guide,
         * this screen's cards start flush at the top-right, so a floating
         * overlay would land on top of "Your Standing". */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-extrabold text-sg-navy lg:text-2xl">Your Progress</h1>
          <img
            src={CORNER_ART_URL}
            alt=""
            aria-hidden="true"
            className="pointer-events-none -mt-3 hidden w-[220px] select-none opacity-85 mix-blend-multiply lg:block xl:w-[260px]"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Card className={clsx('flex flex-col items-center py-8 text-center', GLASS)}>
              <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                Singapore Savvy
              </p>
              <div className="mt-3">
                <SavvyRing value={savvy.overall} />
              </div>
              <p className="mt-3 text-sm font-semibold text-sg-navy/60">Keep it up! 💪</p>
            </Card>

            <Card className={GLASS}>
              {categories.map((category) => (
                <CategoryProgressBar
                  key={category}
                  emoji={CATEGORY_META[category].emoji}
                  label={CATEGORY_META[category].label}
                  value={savvy.categories[category]}
                  color={CATEGORY_COLORS[category]}
                />
              ))}
            </Card>

            <Card className={GLASS}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                  Your Badges
                </p>
                <span className="text-xs font-bold text-sg-navy/40">
                  {state.earnedBadgeIds.length}/{activeCountryPack.badges.length}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {activeCountryPack.badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={state.earnedBadgeIds.includes(badge.id)}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <ProgressStatsCard
              levelName={level.name}
              levelNumber={level.level}
              xp={state.xp}
              levelProgress={levelProgress}
              streakDays={state.streakDays}
            />

            <Card className={GLASS}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                Current Streak
              </p>
              <StreakCalendar streakDays={state.streakDays} />
            </Card>

            <Card className={GLASS}>
              <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                Recent Achievement
              </p>
              {recentBadge ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-sg-xp/20 text-xl">
                    {recentBadge.icon}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-sg-navy">{recentBadge.name}</p>
                    <p className="text-xs text-sg-navy/50">{recentBadge.description}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm font-semibold text-sg-navy/50">
                  Complete a mission to earn your first badge.
                </p>
              )}
            </Card>

            <Card className={GLASS}>
              <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                Next Unlock
              </p>
              {nextUnlock ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-black/5 text-xl grayscale">
                    {nextUnlock.icon}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-sg-navy">{nextUnlock.name}</p>
                    <p className="text-xs text-sg-navy/50">{nextUnlock.description}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm font-semibold text-sg-navy/50">
                  You've earned every badge!
                </p>
              )}
            </Card>
          </div>
        </div>

        <div className="mt-5">
          <CollectionsRow />
        </div>

        <div className="mt-5">
          <TipOfTheDayCard />
        </div>
      </div>
    </div>
  );
}
