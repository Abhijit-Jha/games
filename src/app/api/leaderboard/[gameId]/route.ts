import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, GameId, Score } from "@/lib/mongodb";

const VALID_GAME_IDS: GameId[] = ["snake", "flappy", "typing", "reaction", "trex"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    
    if (!VALID_GAME_IDS.includes(gameId as GameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const { db } = await connectToDatabase();
    const collection = db.collection<Score>("scores");

    const scores = await collection
      .find({ gameId: gameId as GameId })
      .sort({ score: -1, createdAt: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
