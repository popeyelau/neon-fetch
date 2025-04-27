import { indie } from "@/lib/db";
import { Journal } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ journalNo: string }> }
) {
  try {
    const { journalNo } = await params;
    const journalQuery = `SELECT id, journalno AS "journalNo", title, image, summary, content, editor, to_timestamp(date/1000) AS date, tags FROM journal WHERE journalno = $1`;
    const journalResult = (await indie.query(journalQuery, [
      journalNo,
    ])) as Journal[];

    const data = (journalResult && journalResult[0]) || null;

    // 返回音轨和相关日志条目
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
