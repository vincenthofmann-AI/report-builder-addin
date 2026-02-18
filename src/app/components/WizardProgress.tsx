/**
 * Wizard Progress Component
 * ========================
 *
 * Visual step indicator for multi-step wizards.
 * Shows current step, completed steps, and future steps with connecting lines.
 */

import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void; // Optional: allow jumping to previous steps
}

export function WizardProgress({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-6">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;
        const isClickable = onStepClick && stepNumber < currentStep;

        return (
          <div key={stepNumber} className="flex items-center gap-2">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center gap-2 transition-all
                ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold transition-all
                  ${
                    isCompleted
                      ? "bg-[#78be20] text-white"
                      : isCurrent
                      ? "bg-[#003a63] text-white"
                      : "bg-[#e2e8f0] text-[#94a3b8]"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  text-[12px] font-medium text-center whitespace-nowrap transition-colors
                  ${
                    isCurrent
                      ? "text-[#003a63]"
                      : isCompleted
                      ? "text-[#78be20]"
                      : "text-[#94a3b8]"
                  }
                `}
              >
                {stepLabels[index]}
              </span>
            </button>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <div
                className={`
                  h-0.5 w-12 transition-colors
                  ${
                    isCompleted
                      ? "bg-[#78be20]"
                      : "bg-[#e2e8f0]"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
