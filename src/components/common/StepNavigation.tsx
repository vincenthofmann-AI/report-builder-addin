/**
 * Step Navigation Component
 * Back/Next buttons for wizard navigation
 */


interface StepNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export function StepNavigation({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  nextLabel = 'Continue',
  backLabel = 'Back'
}: StepNavigationProps) {
  return (
    <div className="step-navigation">
      <div className="step-navigation__left">
        {onBack && (
          <button
            className="step-navigation__button step-navigation__button--back"
            onClick={onBack}
            disabled={!canGoBack}
          >
            ← {backLabel}
          </button>
        )}
      </div>
      <div className="step-navigation__right">
        {onNext && (
          <button
            className="step-navigation__button step-navigation__button--next"
            onClick={onNext}
            disabled={!canGoNext}
          >
            {nextLabel} →
          </button>
        )}
      </div>
    </div>
  );
}
