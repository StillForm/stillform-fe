"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[rgba(207,175,109,0.9)] to-[rgba(230,195,106,0.9)] text-canvas shadow-[0_6px_20px_rgba(207,175,109,0.35)] border border-transparent",
  secondary:
    "bg-panel text-text-primary border border-[rgba(207,175,109,0.4)] hover:border-[rgba(230,195,106,0.7)]",
  tertiary:
    "bg-[rgba(18,18,21,0.7)] text-text-secondary border border-transparent hover:border-[rgba(207,175,109,0.2)]",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:border-[rgba(207,175,109,0.3)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-12 px-8 text-lg",
  xl: "h-14 px-10 text-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      loading,
      icon,
      asChild,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const baseClass = cn(
      "relative inline-flex items-center justify-center gap-2 rounded-[12px] font-medium leading-tight transition-all duration-200 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-45",
      sizeStyles[size],
      variantStyles[variant],
      icon && "h-11 w-11 px-0",
      className,
      asChild && isDisabled && "pointer-events-none opacity-70"
    );

    const sharedProps: Record<string, unknown> = {
      ref: ref as never,
      className: baseClass,
      "data-variant": variant,
      ...props,
    };

    if (asChild) {
      sharedProps["data-disabled"] = isDisabled ? "true" : undefined;
    } else {
      (sharedProps as ButtonHTMLAttributes<HTMLButtonElement>).disabled =
        isDisabled;
    }

    return (
      <Comp {...sharedProps}>
        <span
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            loading && "opacity-0"
          )}
        >
          {children}
        </span>
        {loading ? (
          <span className="absolute inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        ) : null}
      </Comp>
    );
  }
);

Button.displayName = "Button";
