import { ProgressBar } from '@/components/ui/ProgressBar';

export function CategoryProgressBar({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg">{emoji}</span>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-sg-navy/70">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <ProgressBar progress={value / 100} color={color} />
      </div>
    </div>
  );
}
