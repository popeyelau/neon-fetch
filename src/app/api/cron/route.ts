import { NextResponse } from "next/server";
import { indie } from "@/lib/db";
import { Journal, Track } from "@/lib/types";

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

    const latest = await (
      await fetch("https://api.indie.cn/luoo-music/journal/list")
    ).json();

    const rows = (latest.data?.rows || []) as Journal[];
    if (!rows) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch upstream",
      });
    }

    const upstream = rows[0].journalNo;

    const res = await indie.query(
      "select journalno AS count from journal  order by journalno desc limit 1"
    );

    if (res.length < 1) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch journals",
      });
    }
    const { count } = res[0];
    const local = Number.parseInt(count);

    if (local == upstream) {
      return NextResponse.json({
        success: true,
        error: `Already updated db: ${count} upstream: ${upstream}`,
      });
    }

    const journals: Journal[] = [];

    for (let i = local + 1; i <= upstream; i++) {
      const journal = rows.find((v) => v.journalNo == i);
      if (!journal) continue;

      const tracks = await fetchTracks(i);
      if (!tracks) continue;
      await insertJournal(journal, tracks);
      journals.push(journal);
    }

    return NextResponse.json({
      success: true,
      data: journals.map((v) => v.title),
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

async function insertJournal(journal: Journal, tracks: Track[]) {
  await indie.query(
    `insert into journal (id, journalno, title, image, summary, content, editor, "date", tracks, tags)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
    [
      journal.id,
      journal.journalNo,
      journal.title,
      journal.image,
      journal.summary,
      journal.content,
      journal.editor,
      convertDate(journal.date),
      JSON.stringify(tracks),
      Array.isArray(journal.tag) ? journal.tag.join(",") : journal.tag,
    ]
  );

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    await indie.query(
      `insert into track (id, title, artist, album, src, pic, lrc, journalno, songno, duration)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        track.id,
        track.title,
        track.artist,
        track.album,
        track.src,
        track.pic,
        track.lrc,
        track.journalNo,
        track.songNo,
        track.duration,
      ]
    );
  }
}

function convertDate(dateStr: string) {
  const normalized = dateStr.replace(/\./g, "-"); // 先把 . 换成 -
  const date = new Date(normalized);
  const timestamp = date.getTime();
  return timestamp;
}
