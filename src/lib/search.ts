import type { NextRequest } from "next/server";

export interface JournalSearchParams {
  query?: string;
  title?: string;
  content?: string;
  summary?: string;
  tags?: string;
}

export interface TrackSearchParams {
  query?: string;
  title?: string;
  artist?: string;
  album?: string;
}

/**
 * 从请求中提取日志搜索参数
 */
export function getJournalSearchParams(
  request: Request | NextRequest
): JournalSearchParams {
  const { searchParams } = new URL(request.url);

  return {
    query: searchParams.get("query") || undefined,
    title: searchParams.get("title") || undefined,
    content: searchParams.get("content") || undefined,
    summary: searchParams.get("summary") || undefined,
    tags: searchParams.get("tags") || undefined,
  };
}

/**
 * 从请求中提取音轨搜索参数
 */
export function getTrackSearchParams(
  request: Request | NextRequest
): TrackSearchParams {
  const { searchParams } = new URL(request.url);

  return {
    query: searchParams.get("query") || undefined,
    title: searchParams.get("title") || undefined,
    artist: searchParams.get("artist") || undefined,
    album: searchParams.get("album") || undefined,
  };
}

/**
 * 构建日志搜索条件
 */
export function buildJournalSearchCondition(params: JournalSearchParams) {
  const conditions = [];
  const values = [];

  // 通用搜索查询
  if (params.query) {
    conditions.push(`(
      title ILIKE $${values.length + 1} OR
      content ILIKE $${values.length + 1} OR
      summary ILIKE $${values.length + 1} OR
      tags ILIKE $${values.length + 1}
    )`);
    values.push(`%${params.query}%`);
  }

  // 特定字段搜索
  if (params.title) {
    conditions.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${params.title}%`);
  }

  if (params.content) {
    conditions.push(`content ILIKE $${values.length + 1}`);
    values.push(`%${params.content}%`);
  }

  if (params.summary) {
    conditions.push(`summary ILIKE $${values.length + 1}`);
    values.push(`%${params.summary}%`);
  }

  if (params.tags) {
    conditions.push(`tags ILIKE $${values.length + 1}`);
    values.push(`%${params.tags}%`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

/**
 * 构建音轨搜索条件
 */
export function buildTrackSearchCondition(params: TrackSearchParams) {
  const conditions = [];
  const values = [];

  // 通用搜索查询
  if (params.query) {
    conditions.push(`(
      title ILIKE $${values.length + 1} OR
      artist ILIKE $${values.length + 1} OR
      album ILIKE $${values.length + 1} OR
    )`);
    values.push(`%${params.query}%`);
  }

  // 特定字段搜索
  if (params.title) {
    conditions.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${params.title}%`);
  }

  if (params.artist) {
    conditions.push(`artist ILIKE $${values.length + 1}`);
    values.push(`%${params.artist}%`);
  }

  if (params.album) {
    conditions.push(`album ILIKE $${values.length + 1}`);
    values.push(`%${params.album}%`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}
