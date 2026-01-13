"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { QuickMathGame } from "./quickmath-game";

export default function QuickMathPage() {
  return (
    <GameWrapper gameId="quickmath" title="QuickMath Rush">
      {(props) => <QuickMathGame {...props} />}
    </GameWrapper>
  );
}
