import { NextResponse } from "next/server";
import { getPaginationParams } from "@/lib/pagination";

import { Prisma, PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // 获取分页参数
    const { pageSize, offset } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    const prisma = new PrismaClient();
    const where: Prisma.JournalWhereInput = {};
    const query = searchParams.get("query") || undefined;
    if (query) {
      where.title = {
        contains: query,
      };
    }

    const result = await prisma.journal.findMany({
      skip: offset,
      take: pageSize,
      orderBy: {
        journalNo: "desc",
      },
      where: where,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}
