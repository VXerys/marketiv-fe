interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="progress-track">
      <span style={{ width: `${value}%` }}></span>
    </div>
  );
}

