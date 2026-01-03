"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { TrexGame } from "./trex-game";

export default function TrexPage() {
  return (
    <GameWrapper gameId="trex" title="T-Rex Runner">
      {(props) => <TrexGame {...props} />}
    </GameWrapper>
  );
}
