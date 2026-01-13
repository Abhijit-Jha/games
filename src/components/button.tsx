"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { playSound } from "@/lib/sounds";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, onClick, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";

    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow),0_0_60px_var(--primary-glow)] border-2 border-primary hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground shadow-[0_0_20px_var(--secondary-glow)] hover:shadow-[0_0_30px_var(--secondary-glow),0_0_60px_var(--secondary-glow)] border-2 border-secondary hover:bg-secondary/90",
      ghost: "hover:bg-muted hover:text-foreground border-2 border-transparent hover:border-border-bright",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs rounded-lg",
      md: "h-11 px-6 text-sm rounded-lg",
      lg: "h-14 px-8 text-base rounded-xl",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound("click");
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={handleClick}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <span className="relative z-10">{children}</span>
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.button>
    );
  }
);

Button.displayName = "Button";
