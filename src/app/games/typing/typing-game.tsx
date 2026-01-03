"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playSound } from "@/lib/sounds";

interface TypingGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const DAILY_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump! The five boxing wizards jump quickly at dawn.",
  "Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz.",
  "The job requires extra pluck and zeal from every young wage earner.",
  "A wizard's job is to vex chumps quickly in fog. Jackdaws love my big sphinx of quartz.",
  "We promptly judged antique ivory buckles for the next prize. Crazy Frederick bought many very exquisite opal jewels.",
  "Sixty zippers were quickly picked from the woven jute bag. The explorer was frozen in his big kayak just after making queer discoveries.",
];

function getDailyText(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TEXTS[dayOfYear % DAILY_TEXTS.length];
}

export function TypingGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: TypingGameProps) {
  const [text] = useState(getDailyText);
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateScore = useCallback((typedText: string, errorCount: number, elapsedMs: number) => {
    const words = typedText.trim().split(/\s+/).length;
    const minutes = elapsedMs / 60000;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    const accuracy = typedText.length > 0 
      ? Math.round(((typedText.length - errorCount) / typedText.length) * 100)
      : 100;
    return Math.round(wpm * (accuracy / 100));
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || isPaused) return;

    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    const lastChar = value[value.length - 1];
    const expectedChar = text[value.length - 1];

    if (lastChar !== expectedChar) {
      setErrors((prev) => prev + 1);
      playSound("error");
    } else {
      playSound("type");
    }

    setTyped(value);

    const elapsed = startTime ? Date.now() - startTime : 0;
    const score = calculateScore(value, errors, elapsed);
    onScoreUpdate(score);

    if (value.length >= text.length) {
      const finalScore = calculateScore(value, errors, Date.now() - (startTime || Date.now()));
      onGameOver(finalScore);
      playSound("success");
    }
  }, [isPlaying, isPaused, text, startTime, errors, calculateScore, onScoreUpdate, onGameOver]);

  useEffect(() => {
    if (isPlaying) {
      setTyped("");
      setStartTime(null);
      setErrors(0);
      onScoreUpdate(0);
      inputRef.current?.focus();
    }
  }, [isPlaying, onScoreUpdate]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isPaused]);

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-muted-foreground";
      
      if (index < typed.length) {
        className = typed[index] === char 
          ? "text-foreground" 
          : "text-destructive underline";
      } else if (index === typed.length) {
        className = "text-foreground bg-primary/20";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const accuracy = typed.length > 0 
    ? Math.round(((typed.length - errors) / typed.length) * 100)
    : 100;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex gap-8 text-sm font-mono">
        <div>
          <span className="text-muted-foreground">WPM: </span>
          <span className="font-semibold">{wpm}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Accuracy: </span>
          <span className="font-semibold">{accuracy}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Errors: </span>
          <span className="font-semibold">{errors}</span>
        </div>
      </div>

      <div className="w-full p-6 bg-card border border-border rounded-lg font-mono text-lg leading-relaxed tracking-wide">
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleInput}
        disabled={!isPlaying || isPaused}
        className="w-full h-12 px-4 bg-secondary border border-border rounded-lg font-mono text-lg outline-none focus:ring-2 focus:ring-ring"
        placeholder={isPlaying ? "Start typing..." : ""}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Type the text above as fast and accurately as possible
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Same text for all players today
        </p>
      </div>
    </div>
  );
}
