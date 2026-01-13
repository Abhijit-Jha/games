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

const INITIAL_TIME = 10;
const MIN_TIME = 3;
const TIME_DECREMENT = 0.5;

export function QuickMathGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: QuickMathGameProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [maxTime, setMaxTime] = useState(INITIAL_TIME);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDifficultyRange = useCallback((currentScore: number) => {
    if (currentScore < 50) return { min: 1, max: 10 };
    if (currentScore < 100) return { min: 5, max: 20 };
    if (currentScore < 200) return { min: 10, max: 50 };
    if (currentScore < 300) return { min: 20, max: 100 };
    return { min: 50, max: 200 };
  }, []);

  const generateQuestion = useCallback((currentScore: number): Question => {
    const operations: Operation[] = ["+", "-", "×", "÷"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const range = getDifficultyRange(currentScore);
    
    let num1: number, num2: number, answer: number;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case "×":
        const multRange = currentScore < 50 ? { min: 1, max: 10 } : { min: 2, max: 15 };
        num1 = Math.floor(Math.random() * (multRange.max - multRange.min + 1)) + multRange.min;
        num2 = Math.floor(Math.random() * (multRange.max - multRange.min + 1)) + multRange.min;
        answer = num1 * num2;
        break;
      case "÷":
        const divRange = currentScore < 50 ? { min: 1, max: 10 } : { min: 2, max: 15 };
        num2 = Math.floor(Math.random() * (divRange.max - divRange.min + 1)) + divRange.min;
        answer = Math.floor(Math.random() * (divRange.max - divRange.min + 1)) + divRange.min;
        num1 = num2 * answer;
        break;
    }

    return { num1, num2, operation, answer };
  }, [getDifficultyRange]);

  const resetGame = useCallback(() => {
    const newQuestion = generateQuestion(0);
    setQuestion(newQuestion);
    setUserAnswer("");
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setMaxTime(INITIAL_TIME);
    onScoreUpdate(0);
  }, [generateQuestion, onScoreUpdate]);

  const handleCorrectAnswer = useCallback(() => {
    const newScore = score + 10;
    setScore(newScore);
    onScoreUpdate(newScore);
    playSound("score");

    const newMaxTime = Math.max(MIN_TIME, maxTime - TIME_DECREMENT);
    setMaxTime(newMaxTime);
    setTimeLeft(newMaxTime);

    const newQuestion = generateQuestion(newScore);
    setQuestion(newQuestion);
    setUserAnswer("");
  }, [score, maxTime, generateQuestion, onScoreUpdate]);

  const handleWrongAnswer = useCallback(() => {
    playSound("error");
    onGameOver(score);
  }, [score, onGameOver]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!question || isPaused) return;

    const userNum = parseInt(userAnswer.trim(), 10);
    if (isNaN(userNum)) {
      playSound("error");
      setUserAnswer("");
      return;
    }

    if (userNum === question.answer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }, [question, userAnswer, isPaused, handleCorrectAnswer, handleWrongAnswer]);

  useEffect(() => {
    if (isPlaying) {
      resetGame();
    }
  }, [isPlaying, resetGame]);

  useEffect(() => {
    if (inputRef.current && isPlaying && !isPaused) {
      inputRef.current.focus();
    }
  }, [isPlaying, isPaused, question]);

  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          handleWrongAnswer();
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isPaused, handleWrongAnswer]);

  if (!question) return null;

  const timePercentage = (timeLeft / maxTime) * 100;
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
      <div className="w-full bg-card border border-border rounded-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Time Left</span>
            <span className="text-sm font-mono text-muted-foreground">
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                timePercentage > 50
                  ? "bg-green-500"
                  : timePercentage > 25
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.max(0, timePercentage)}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-bold font-mono mb-4">
            {question.num1} {question.operation} {question.num2}
          </div>
          <div className="text-2xl text-muted-foreground">= ?</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9-]*"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isPaused}
            className="w-full h-16 px-6 text-3xl font-mono text-center bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            placeholder="Type answer..."
            autoComplete="off"
          />
          <button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            disabled={isPaused || !userAnswer.trim()}
          >
            Submit Answer
          </button>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Type your answer and press Enter or click Submit
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Difficulty increases with each correct answer
        </p>
      </div>
    </div>
  );
}
