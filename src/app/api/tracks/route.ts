import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { buildTrackSearchCondition, getTrackSearchParams } from "@/lib/search";
import { useSql } from "@/app/hooks/useSql";

export async function GET(request: Request) {
  try {
    const searchParams = getTrackSearchParams(request);

    // 构建搜索条件
    const { whereClause, values } = buildTrackSearchCondition(searchParams);
    // 创建数据库连接
    const sql = useSql();

    // 查询分页后的日志条目
    const dataQuery = `
      SELECT id, title, artist, album, src, pic, lrc,  journalno AS "journalNo",  songno AS "songNo", duration FROM track
      ${whereClause}
    `;

    console.log(dataQuery, values);
    const tracks = (await sql.query(dataQuery, values)) as Track[];

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

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  pic: string;
  lrc: string;
  journalNo: number;
  songNo: number;
  duration: string;
}
