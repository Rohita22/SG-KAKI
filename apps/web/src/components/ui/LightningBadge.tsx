import { Zap } from 'lucide-react';

export function LightningBadge({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-sg-xp/20 px-3 py-1.5 text-sm font-bold text-sg-navy">
      <Zap className="size-4 fill-sg-xp text-sg-xp" strokeWidth={2.5} />
      {xp}
    </div>
  );
}
