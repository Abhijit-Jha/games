import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, GameId, Score } from "@/lib/mongodb";

const VALID_GAME_IDS: GameId[] = ["snake", "flappy", "typing", "reaction", "trex"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twitterHandle, gameId, score } = body;

    if (!twitterHandle || typeof twitterHandle !== "string") {
      return NextResponse.json({ error: "Invalid twitter handle" }, { status: 400 });
    }

    if (!VALID_GAME_IDS.includes(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<Score>("scores");

    const existingScore = await collection.findOne({
      twitterHandle: twitterHandle.toLowerCase(),
      gameId,
    });

    if (existingScore && existingScore.score >= score) {
      const rank = await collection.countDocuments({
        gameId,
        score: { $gt: existingScore.score },
      });
      return NextResponse.json({ success: true, rank: rank + 1, isNewHighScore: false });
    }

    if (existingScore) {
      await collection.updateOne(
        { _id: existingScore._id },
        { $set: { score, createdAt: new Date() } }
      );
    } else {
      await collection.insertOne({
        twitterHandle: twitterHandle.toLowerCase(),
        gameId,
        score,
        createdAt: new Date(),
      });
    }

    const rank = await collection.countDocuments({
      gameId,
      score: { $gt: score },
    });

    return NextResponse.json({ success: true, rank: rank + 1, isNewHighScore: true });
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
