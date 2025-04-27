import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ journalNo: string }> }
) {
  try {
    const { journalNo } = await params;
    const prisma = new PrismaClient();

    const journal = await prisma.journal.findUnique({
      where: {
        journalNo: Number.parseInt(journalNo),
      },
      include: {
        tracks: true,
      },
    });
    return NextResponse.json({
      success: true,
      data: journal,
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
