import { Lightbulb } from 'lucide-react';

const TIPS = [
  'In Singapore, we say "thank you" a lot. It goes a long way!',
  'Tissue packets on a table mean the seat is taken — this is completely normal.',
  '"Can" is one of the most useful words you\'ll ever learn here.',
  'Stand on the left on escalators, always.',
  'Tapping in and out applies to buses too, not just the MRT.',
];

export function TipOfTheDayCard() {
  const dayIndex = new Date().getDate() % TIPS.length;

  return (
    <div className="rounded-2xl bg-sg-xp/15 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-sg-navy">
        <Lightbulb className="size-4" />
        Tip of the Day
      </div>
      <p className="mt-1.5 text-sm font-medium text-sg-navy/80">{TIPS[dayIndex]}</p>
    </div>
  );
}
