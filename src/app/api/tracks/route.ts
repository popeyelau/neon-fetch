import { NextResponse } from "next/server";
import { buildTrackSearchCondition, getTrackSearchParams } from "@/lib/search";
import { indie } from "@/lib/db";
import { Track } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const searchParams = getTrackSearchParams(request);

    // 构建搜索条件
    const { whereClause, values } = buildTrackSearchCondition(searchParams);

    // 查询分页后的日志条目
    const dataQuery = `
      SELECT id, title, artist, album, src, pic, lrc,  journalno AS "journalNo",  songno AS "songNo", duration FROM track
      ${whereClause}
    `;

    console.log(dataQuery, values);
    const tracks = (await indie.query(dataQuery, values)) as Track[];

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
