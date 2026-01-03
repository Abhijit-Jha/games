"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { TypingGame } from "./typing-game";

export default function TypingPage() {
  return (
    <GameWrapper gameId="typing" title="Typing Race">
      {(props) => <TypingGame {...props} />}
    </GameWrapper>
  );
}
