import { NextResponse } from "next/server";
import { Journal, Track } from "@/lib/types";
import { PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  try {
    if (
      request.headers.get("Authorization") !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
      });
    }

    const res = await (
      await fetch("https://api.indie.cn/luoo-music/journal/list")
    ).json();

    const rows = (res.data?.rows || []) as Journal[];
    if (!rows) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch upstream",
      });
    }

    const upstream = Number.parseInt(rows[0].journalNo);

    const prisma = new PrismaClient();
    const latest = await prisma.journal.findFirst({
      orderBy: {
        journalNo: "desc",
      },
      select: {
        journalNo: true,
      },
    });

    if (!latest) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch journals",
      });
    }

    const local = latest.journalNo;

    if (local == upstream) {
      return NextResponse.json({
        success: true,
        error: `Already updated db: ${local} upstream: ${upstream}`,
      });
    }

    const results: string[] = [];
    for (let i = local + 1; i <= upstream; i++) {
      const journal = rows.find((v) => v.journalNo == i.toString());
      if (!journal) continue;

      const tracks = await fetchTracks(i);
      if (!tracks) continue;

      const [res1, res2] = await prisma.$transaction([
        prisma.journal.create({
          data: {
            id: journal.id,
            journalNo: Number.parseInt(journal.journalNo),
            title: journal.title,
            image: journal.image,
            summary: journal.summary,
            content: journal.content,
            editor: journal.editor,
            date: journal.date,
            tags: Array.isArray(journal.tags)
              ? journal.tags.join(",")
              : journal.tags,
          },
          select: {
            journalNo: true,
          },
        }),

        prisma.track.createManyAndReturn({
          data: tracks.map((v) => ({
            id: v.id,
            title: v.title,
            artist: v.artist,
            album: v.album,
            src: v.src,
            pic: v.pic,
            lrc: v.lrc,
            journalNo: Number.parseInt(v.journalNo),
            songNo: v.songNo,
            duration: v.duration,
          })),
          select: {
            id: true,
            journalNo: true,
          },
        }),
      ]);
      results.push(res1.journalNo.toString());
      results.push(...res2.map((v) => v.id));
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

const fetchTracks = async (journalNo: number) => {
  const res = await (
    await fetch(
      `https://api.indie.cn/luoo-music/song/getByJournalNo/${journalNo}`
    )
  ).json();
  const tracks = (res?.data || []) as Track[];
  return tracks;
};
