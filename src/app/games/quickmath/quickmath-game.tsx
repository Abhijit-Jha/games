"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playSound } from "@/lib/sounds";

interface QuickMathGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

type Operation = "+" | "-" | "×" | "÷";

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

const INITIAL_TIME_LIMIT = 10000; // 10 seconds
const TIME_DECREASE_PER_LEVEL = 200; // Decrease by 0.2s per correct answer
const MIN_TIME_LIMIT = 3000; // Minimum 3 seconds

export function QuickMathGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: QuickMathGameProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME_LIMIT);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(INITIAL_TIME_LIMIT);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const generateQuestion = useCallback((currentScore: number): Question => {
    const operations: Operation[] = ["+", "-", "×", "÷"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    // Difficulty increases with score
    const difficulty = Math.min(Math.floor(currentScore / 5) + 1, 10);
    const maxNum = 10 + (difficulty * 10);

    let num1: number;
    let num2: number;
    let answer: number;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
        answer = num1 - num2;
        break;
      case "×":
        const maxMultiplier = Math.min(12, 5 + difficulty);
        num1 = Math.floor(Math.random() * maxMultiplier) + 1;
        num2 = Math.floor(Math.random() * maxMultiplier) + 1;
        answer = num1 * num2;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * (5 + difficulty)) + 1;
        num1 = num2 * answer; // Ensure clean division
        break;
    }

    return { num1, num2, operation, answer };
  }, []);

  const startNewQuestion = useCallback((currentScore: number) => {
    const newQuestion = generateQuestion(currentScore);
    setQuestion(newQuestion);
    setUserAnswer("");

    // Decrease time limit as player progresses, but don't go below minimum
    const newTimeLimit = Math.max(
      MIN_TIME_LIMIT,
      INITIAL_TIME_LIMIT - (currentScore * TIME_DECREASE_PER_LEVEL)
    );
    setCurrentTimeLimit(newTimeLimit);
    setTimeRemaining(newTimeLimit);
    questionStartTimeRef.current = Date.now();
    inputRef.current?.focus();
  }, [generateQuestion]);

  const handleSubmit = useCallback(() => {
    if (!question || !userAnswer.trim()) return;

    const parsedAnswer = parseInt(userAnswer, 10);

    if (parsedAnswer === question.answer) {
      playSound("success");
      const newScore = score + 1;
      setScore(newScore);
      onScoreUpdate(newScore);
      startNewQuestion(newScore);
    } else {
      playSound("error");
      onGameOver(score);
    }
  }, [question, userAnswer, score, onScoreUpdate, onGameOver, startNewQuestion]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and negative sign at the start
    if (value === "" || value === "-" || /^-?\d+$/.test(value)) {
      setUserAnswer(value);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }, [handleSubmit]);

  // Initialize game
  useEffect(() => {
    if (isPlaying && !question) {
      setScore(0);
      onScoreUpdate(0);
      startNewQuestion(0);
    }
  }, [isPlaying, question, startNewQuestion, onScoreUpdate]);

  // Timer logic
  useEffect(() => {
    if (!isPlaying || isPaused || !question) {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    let lastTime = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      setTimeRemaining((prev) => {
        const newTime = prev - delta;
        if (newTime <= 0) {
          playSound("gameOver");
          onGameOver(score);
          return 0;
        }
        return newTime;
      });

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isPlaying, isPaused, question, score, onGameOver]);

  // Focus input when game starts or resumes
  useEffect(() => {
    if (isPlaying && !isPaused) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isPaused]);

  if (!question) {
    return null;
  }

  const timePercentage = (timeRemaining / currentTimeLimit) * 100;
  const isLowTime = timePercentage < 30;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      {/* Timer Bar */}
      <div className="w-full">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isLowTime ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm font-mono text-muted-foreground">
          {(timeRemaining / 1000).toFixed(1)}s
        </div>
      </div>

      {/* Question Display */}
      <div className="bg-card border border-border rounded-lg p-8 w-full">
        <div className="text-center font-mono text-6xl font-bold mb-8">
          {question.num1} {question.operation} {question.num2}
        </div>

        {/* Answer Input */}
        <div className="flex items-center gap-4">
          <div className="text-3xl text-muted-foreground">=</div>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!isPlaying || isPaused}
            className="flex-1 h-16 px-6 bg-secondary border-2 border-border rounded-lg font-mono text-3xl text-center outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            placeholder="?"
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim() || !isPlaying || isPaused}
          className="w-full mt-6 h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Submit (Enter)
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Solve the equation before time runs out!
        </p>
        <p className="text-xs text-muted-foreground">
          Game ends on wrong answer or timeout • Difficulty increases with score
        </p>
      </div>
    </div>
  );
}
