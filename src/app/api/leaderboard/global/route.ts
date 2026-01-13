import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Score, AggregatedScore, GameId } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const { db } = await connectToDatabase();
    const collection = db.collection<Score>("scores");

    const aggregation = await collection
      .aggregate([
        {
          $group: {
            _id: "$twitterHandle",
            totalScore: { $sum: "$score" },
            gamesPlayed: { $sum: 1 },
            scores: {
              $push: {
                gameId: "$gameId",
                score: "$score",
              },
            },
          },
        },
        { $sort: { totalScore: -1 } },
        { $limit: limit },
      ])
      .toArray();

    const leaderboard: AggregatedScore[] = aggregation.map((entry) => {
      const scores: Record<GameId, number> = {
        snake: 0,
        flappy: 0,
        typing: 0,
        reaction: 0,
        trex: 0,
        quickmath: 0,
      };

      entry.scores.forEach((s: { gameId: GameId; score: number }) => {
        scores[s.gameId] = s.score;
      });

      return {
        twitterHandle: entry._id,
        totalScore: entry.totalScore,
        gamesPlayed: entry.gamesPlayed,
        scores,
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
