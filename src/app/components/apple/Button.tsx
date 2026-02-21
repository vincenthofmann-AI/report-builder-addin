/**
 * Apple-Level Button Component
 * Jony Ive Principles: Simplicity, Precision, Restraint
 */

import { ButtonHTMLAttributes, ReactNode } from "react";
import "./button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "medium" | "large";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  className = "",
  children,
  disabled = false,
  ...props
}: ButtonProps) {
  const classes = [
    "apple-button",
    `apple-button--${variant}`,
    `apple-button--${size}`,
    disabled && "apple-button--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
