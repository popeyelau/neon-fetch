import { NextResponse } from "next/server";
import { getPaginationParams } from "@/lib/pagination";
import { Prisma, PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { pageSize, offset } = getPaginationParams(request);

    const prisma = new PrismaClient();
    const where: Prisma.TrackWhereInput = {};

    const query = searchParams.get("query") || undefined;
    if (query) {
      where.title = {
        contains: query,
      };
    }

    const tracks = await prisma.track.findMany({
      skip: offset,
      take: pageSize,
      orderBy: {
        journalNo: "desc",
      },

      where: where,
    });

    return NextResponse.json({
      success: true,
      data: tracks,
    });
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
