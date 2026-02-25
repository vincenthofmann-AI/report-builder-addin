/**
 * Progress Bar Component
 * Shows progress through the wizard steps
 */


interface ProgressBarProps {
  current: number;
  total: number;
  showLabels?: boolean;
}

export function ProgressBar({
  current,
  total,
  showLabels = true
}: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && (
        <div className="progress-bar__label">
          Step {current} of {total}
        </div>
      )}
    </div>
  );
}
