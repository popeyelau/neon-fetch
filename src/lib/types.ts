export interface Journal {
  id: string;
  journalNo: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  editor: string;
  date: string;
  tags: string | string[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  pic: string;
  lrc: string;
  journalNo: string;
  songNo: number;
  duration: string;
}
