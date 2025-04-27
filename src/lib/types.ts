export interface Journal {
  id: string;
  journalNo: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  editor: string;
  date: string;
  tag: string | string[];
}

export interface Track {
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
