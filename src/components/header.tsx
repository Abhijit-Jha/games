"use client";

import Link from "next/link";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";
import { getSoundEnabled, setSoundEnabled, playSound } from "@/lib/sounds";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [soundOn, setSoundOn] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setSoundOn(getSoundEnabled());
  }, []);

  if (!mounted) {
    return (
      <header className="border-b-2 border-border-bright bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-black text-2xl tracking-tight uppercase">Arcade Royale</span>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground uppercase font-bold">Games</span>
            <span className="text-sm text-muted-foreground uppercase font-bold">Leaderboard</span>
          </nav>
        </div>
      </header>
    );
  }

  const handleSoundToggle = () => {
    const newValue = !soundOn;
    setSoundOn(newValue);
    setSoundEnabled(newValue);
    if (newValue) playSound("click");
  };

  const handleThemeToggle = () => {
    playSound("click");
    toggleTheme();
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className="relative group"
        onMouseEnter={() => playSound("click")}
      >
        <motion.span
          className={`text-sm uppercase font-bold tracking-wider transition-colors ${
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {children}
        </motion.span>
        {isActive && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
            layoutId="activeNav"
            style={{ boxShadow: "0 0 8px var(--primary-glow)" }}
          />
        )}
      </Link>
    );
  };

  return (
    <header className="border-b-2 border-border-bright bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3" onMouseEnter={() => playSound("click")}>
          <motion.span
            className="font-black text-2xl tracking-tight uppercase text-neon-green"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Arcade Royale
          </motion.span>
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            👾
          </motion.span>
        </Link>
        <nav className="flex items-center gap-8">
          <NavLink href="/games">Games</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>

          <div className="flex items-center gap-2 ml-2">
            <motion.button
              onClick={handleSoundToggle}
              className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-transparent hover:border-border-bright transition-all"
              style={{
                backgroundColor: soundOn ? "var(--primary)" : "var(--muted)",
                color: soundOn ? "var(--primary-foreground)" : "var(--muted-foreground)",
                boxShadow: soundOn ? "0 0 15px var(--primary-glow)" : "none",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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
          </div>
        </nav>
      </div>
    </header>
  );
}
