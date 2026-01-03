"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { playSound } from "@/lib/sounds";

interface ReactionGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

type GameState = "waiting" | "ready" | "go" | "early" | "result";

const ROUNDS = 5;
const MIN_DELAY = 1500;
const MAX_DELAY = 4000;

export function ReactionGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: ReactionGameProps) {
  const [state, setState] = useState<GameState>("waiting");
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const triggerTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const startRound = useCallback(() => {
    setState("ready");
    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
    
    timeoutRef.current = setTimeout(() => {
      triggerTimeRef.current = performance.now();
      setState("go");
      playSound("click");
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (isPaused) return;

    if (state === "waiting") {
      startRound();
      return;
    }

    if (state === "ready") {
      clearTimeout(timeoutRef.current);
      setState("early");
      playSound("error");
      return;
    }

    if (state === "go") {
      const reactionTime = Math.round(performance.now() - triggerTimeRef.current);
      setCurrentTime(reactionTime);
      setTimes((prev) => [...prev, reactionTime]);
      setState("result");
      playSound("success");

      const newRound = round + 1;
      setRound(newRound);

      const allTimes = [...times, reactionTime];
      const avgTime = Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);
      const score = Math.max(0, 1000 - avgTime);
      onScoreUpdate(score);

      if (newRound >= ROUNDS) {
        setTimeout(() => {
          onGameOver(score);
        }, 1500);
      }
    }

    if (state === "early" || state === "result") {
      if (round < ROUNDS) {
        startRound();
      }
    }
  }, [state, isPaused, round, times, startRound, onScoreUpdate, onGameOver]);

  useEffect(() => {
    if (isPlaying) {
      setState("waiting");
      setTimes([]);
      setCurrentTime(null);
      setRound(0);
      onScoreUpdate(0);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, onScoreUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClick]);

  const getBackgroundColor = () => {
    switch (state) {
      case "ready":
        return "bg-destructive";
      case "go":
        return "bg-primary";
      case "early":
        return "bg-destructive";
      default:
        return "bg-secondary";
    }
  };

  const getMessage = () => {
    switch (state) {
      case "waiting":
        return "Click to start";
      case "ready":
        return "Wait...";
      case "go":
        return "Click!";
      case "early":
        return "Too early!";
      case "result":
        return `${currentTime}ms`;
    }
  };

  const avgTime = times.length > 0 
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 text-sm font-mono">
        <div>
          <span className="text-muted-foreground">Round: </span>
          <span className="font-semibold">{round}/{ROUNDS}</span>
        </div>
        {avgTime !== null && (
          <div>
            <span className="text-muted-foreground">Average: </span>
            <span className="font-semibold">{avgTime}ms</span>
          </div>
        )}
      </div>

      <motion.button
        onClick={handleClick}
        className={`w-80 h-80 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${getBackgroundColor()}`}
        whileTap={{ scale: 0.98 }}
      >
        <span className={`text-3xl font-semibold ${
          state === "ready" || state === "early" 
            ? "text-destructive-foreground" 
            : state === "go"
            ? "text-primary-foreground"
            : "text-secondary-foreground"
        }`}>
          {getMessage()}
        </span>
      </motion.button>

      {times.length > 0 && (
        <div className="flex gap-2 font-mono text-sm">
          {times.map((time, i) => (
            <span key={i} className="px-2 py-1 bg-secondary rounded">
              {time}ms
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Click or press Space when the box turns. Lower is better.
      </p>
    </div>
  );
}
