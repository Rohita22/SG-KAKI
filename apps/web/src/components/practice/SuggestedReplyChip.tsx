export function SuggestedReplyChip({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="max-w-full rounded-full text-left border-2 border-sg-blue/20 bg-white px-3.5 py-2 text-xs font-bold text-sg-blue shadow-sm transition-colors hover:bg-sg-blue/5 disabled:opacity-40"
    >
      {label}
    </button>
  );
}
