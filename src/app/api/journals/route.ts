import { NextResponse } from "next/server";
import { getPaginationParams } from "@/lib/pagination";
import {
  getJournalSearchParams,
  buildJournalSearchCondition,
} from "@/lib/search";
import { indie } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // 获取分页参数
    const { pageSize, offset } = getPaginationParams(request);

    // 获取搜索参数
    const searchParams = getJournalSearchParams(request);

    // 构建搜索条件
    const { whereClause, values } = buildJournalSearchCondition(searchParams);

    // 查询分页后的日志条目
    const dataQuery = `
      SELECT id, journalno AS "journalNo", title, image, summary, content, editor, date, tags FROM journal
      ${whereClause}
      ORDER BY date DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataValues = [...values, pageSize, offset];
    console.log(dataQuery, dataValues);
    const journals = (await indie.query(dataQuery, dataValues)) as Journal[];

    return NextResponse.json({
      success: true,
      data: journals,
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

interface Journal {
  id: string;
  journalNo: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  editor: string;
  date: number;
  tag: string;
}
