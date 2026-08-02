import { useDerivedProgress } from '@/state/useDerivedProgress';

export function FieldGuideHero() {
  const { level } = useDerivedProgress();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/55 p-6 shadow-card backdrop-blur-md sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-sg-navy lg:text-3xl">
            🧭 Field Guide
          </h1>
          <p className="mt-1 text-sm font-medium text-sg-navy/55">
            Everything you&apos;ve discovered in Singapore.
          </p>
        </div>

        <div
          className="relative hidden shrink-0 items-center justify-center sm:flex"
          aria-hidden="true"
        >
          <div className="relative flex size-28 rotate-3 items-center justify-center rounded-[28px] border-2 border-dashed border-sg-xp/50 bg-gradient-to-br from-sg-xp/25 to-sg-blue/15 text-5xl shadow-card lg:size-32">
            🛂
            <span className="absolute -bottom-3 -left-4 -rotate-6 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-sg-navy shadow-card">
              SG Explorer
            </span>
            <span className="absolute -right-3 -top-3 rotate-6 rounded-full bg-sg-success px-2 py-1 text-[10px] font-black text-white shadow-card">
              Lv {level.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
