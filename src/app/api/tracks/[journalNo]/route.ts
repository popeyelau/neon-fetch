import { indie } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { journalNo: string } }
) {
  try {
    const journalNo = params.journalNo;

    // 查询特定ID的音轨
    const trackQuery = `SELECT id, title, artist, album, src, pic, lrc,  journalno AS "journalNo",  songno AS "songNo", duration FROM track WHERE journalno = $1`;
    const trackResult = await indie.query(trackQuery, [journalNo]);

    // 返回音轨和相关日志条目
    return NextResponse.json({
      success: true,
      data: trackResult,
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
