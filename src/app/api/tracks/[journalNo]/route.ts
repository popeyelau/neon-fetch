import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ journalNo: string }> }
) {
  try {
    const { journalNo } = await params;
    const prisma = new PrismaClient();
    const where: Prisma.TrackWhereInput = {
      journalNo: Number.parseInt(journalNo),
    };

    const tracks = await prisma.track.findMany({
      orderBy: {
        songNo: "desc",
      },
      where: where,
    });

    return NextResponse.json({
      success: true,
      data: tracks,
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
