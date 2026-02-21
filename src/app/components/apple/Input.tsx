/**
 * Apple-Level Input Component
 * Jony Ive Principles: Clarity, Precision, Deference
 */

import { InputHTMLAttributes, forwardRef } from "react";
import "./input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="apple-input-wrapper">
        {label && (
          <label className="apple-input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`apple-input ${error ? "apple-input--error" : ""} ${className}`}
          {...props}
        />
        {(error || helperText) && (
          <span className={`apple-input-hint ${error ? "apple-input-hint--error" : ""}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
