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
import { ScreenCornerArt } from '@/components/shell/ScreenCornerArt';
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
    <div className="relative -mx-4 -my-5 min-h-[calc(100dvh+0.5rem)] shrink-0 px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={PROGRESS_BG_URL} />
      <ScreenCornerArt image={CORNER_ART_URL} />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-extrabold text-sg-navy lg:text-2xl">Your Progress</h1>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
          {/* Left & Middle Area Container (Spans 2 columns) */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            
            {/* Top Row of the Left Area */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:items-start">
              
              {/* Original Left Column (Stats & Streak) */}
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
              </div>

              {/* Original Middle Column (Savvy & Recent Achievement) */}
              <div className="flex flex-col gap-5">
                <Card className={clsx('flex flex-col items-center justify-center py-6', GLASS)}>
                  <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                    Singapore Savvy
                  </p>
                  <div className="mt-3">
                    <SavvyRing value={savvy.overall} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-sg-navy/60">Keep it up! 💪</p>
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
                    <div className="mt-2 text-sm text-sg-navy/60">
                      <p>No badges earned yet.</p>
                      {nextUnlock && (
                        <p className="mt-1 flex items-center gap-2">
                          <span className="text-lg opacity-50 grayscale">{nextUnlock.icon}</span>
                          <span>
                            Next up:{' '}
                            <span className="font-semibold text-sg-navy">{nextUnlock.name}</span>
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Bottom Row of the Left Area (Badges) */}
            <Card className={GLASS}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
                  Your Badges
                </p>
                <span className="text-xs font-bold text-sg-navy/40">
                  {state.earnedBadgeIds.length}/{activeCountryPack.badges.length}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8">
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

          {/* Right Area Container (Categories & Tip of the Day) */}
          <div className="flex flex-col gap-5 lg:col-span-1 lg:pt-[130px] xl:pt-[150px]">
            <Card className={clsx('flex flex-col justify-center', GLASS)}>
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
            <TipOfTheDayCard />
          </div>
        </div>

        <div className="mt-12 hidden">
          <h2 className="mb-4 text-xl font-extrabold text-sg-navy">Collections</h2>
          <div className="flex flex-col gap-4">
            <CollectionsRow />
          </div>
        </div>
      </div>
    </div>
  );
}
