import type { NextRequest } from "next/server";

export interface PaginationParams {
  pageSize: number;
  offset: number;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 从请求中提取分页参数
 */
export function getPaginationParams(
  request: Request | NextRequest
): PaginationParams {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");

  // 验证分页参数
  const validPage = page > 0 ? page : 1;
  const validPageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 10;

  // 计算偏移量
  const offset = (validPage - 1) * validPageSize;

  return {
    pageSize: validPageSize,
    offset,
  };
}
