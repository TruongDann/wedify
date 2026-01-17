/**
 * Music library configuration for wedding card editor
 */

export interface MusicTrack {
  id: number;
  name: string;
  artist: string;
  duration: string;
  src?: string; // Optional URL to music file
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: 1, name: "50 Năm Về Sau", artist: "Unknown", duration: "03:54" },
  { id: 2, name: "A Little Love", artist: "Unknown", duration: "03:11" },
  { id: 3, name: "A Thousand Years", artist: "Unknown", duration: "04:48" },
  { id: 4, name: "All of Me", artist: "Unknown", duration: "04:30" },
  { id: 5, name: "Beautiful In White", artist: "Unknown", duration: "03:58" },
  {
    id: 6,
    name: "Can't Help Falling In Love",
    artist: "Unknown",
    duration: "03:07",
  },
  { id: 7, name: "Perfect", artist: "Unknown", duration: "04:23" },
  { id: 8, name: "Thinking Out Loud", artist: "Unknown", duration: "04:41" },
];
