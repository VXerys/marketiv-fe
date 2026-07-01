interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-neutral-200/60 rounded-full overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full relative overflow-hidden"
        style={{ width: `${value}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full animate-[shimmer_2.5s_infinite]"></div>
      </div>
    </div>
  );
}
