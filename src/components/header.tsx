"use client";

import Link from "next/link";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";
import { getSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { motion } from "framer-motion";

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(getSoundEnabled());
  }, []);

  if (!mounted) {
    return (
      <header className="border-b-2 border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight uppercase">Arcade Royale</span>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Games</span>
            <span className="text-sm text-muted-foreground">Leaderboard</span>
          </nav>
        </div>
      </header>
    );
  }

  const handleSoundToggle = () => {
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
  };

  return (
    <header className="border-b-2 border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-xl tracking-tight uppercase group">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent group-hover:from-accent group-hover:via-primary group-hover:to-accent transition-all duration-500">
            Arcade Royale
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/games"
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors relative group"
          >
            Games
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors relative group"
          >
            Leaderboard
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSoundToggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors border-2 border-transparent hover:border-primary/30"
            aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
          >
            {soundOn ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors border-2 border-transparent hover:border-primary/30"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.button>
        </nav>
      </div>
    </header>
  );
}
