import { MessageCircle, GraduationCap } from 'lucide-react';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useDerivedProgress } from '@/state/useDerivedProgress';

interface StatPillProps {
  icon: React.ReactNode;
  iconClass: string;
  value: string;
  label: string;
}

/** One of the four at-a-glance counters under the Field Guide title. */
function StatPill({ icon, iconClass, value, label }: StatPillProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/80 px-3.5 py-2.5 shadow-card backdrop-blur-md">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-base font-black text-sg-navy">{value}</p>
        <p className="text-[11px] font-semibold text-sg-navy/45">{label}</p>
      </div>
    </div>
  );
}

export function FieldGuideHero() {
  const { phrasesLearnedCount, cultureTopicsLearnedCount } = useDerivedProgress();
  const totalPhrases = activeCountryPack.phrases.length;
  const totalTopics = activeCountryPack.cultureTopics.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sg-xp/30 to-sg-orange/20 text-2xl shadow-card"
          aria-hidden="true"
        >
          🧭
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-sg-navy lg:text-[32px]">
            Field Guide
          </h1>
          <p className="mt-0.5 text-sm font-medium text-sg-navy/55">
            Everything you&apos;ve discovered in Singapore.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <StatPill
          icon={<MessageCircle className="size-4 text-sg-blue" strokeWidth={2.5} />}
          iconClass="bg-sg-sky"
          value={`${phrasesLearnedCount} of ${totalPhrases}`}
          label="Phrases"
        />
        <StatPill
          icon={<GraduationCap className="size-4 text-sg-purple" strokeWidth={2.5} />}
          iconClass="bg-sg-purple/15"
          value={`${cultureTopicsLearnedCount} of ${totalTopics}`}
          label="Culture Topics"
        />
      </div>
    </div>
  );
}
