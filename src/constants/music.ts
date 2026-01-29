/**
 * Music library configuration for wedding card editor
 */

export type MusicCategory = "international" | "vpop";

export interface MusicTrack {
  id: number;
  name: string;
  artist: string;
  duration: string;
  src?: string; // Optional URL to music file
  category: MusicCategory;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 1,
    name: "50 Năm Về Sau",
    artist: "Phan Mạnh Quỳnh",
    duration: "03:54",
    category: "vpop",
  },
  {
    id: 2,
    name: "A Little Love",
    artist: "Fiona Fung",
    duration: "03:11",
    category: "international",
  },
  {
    id: 3,
    name: "A Thousand Years",
    artist: "Christina Perri",
    duration: "04:48",
    category: "international",
  },
  {
    id: 4,
    name: "All of Me",
    artist: "John Legend",
    duration: "04:30",
    category: "international",
  },
  {
    id: 5,
    name: "Beautiful In White",
    artist: "Westlife",
    duration: "03:58",
    category: "international",
  },
  {
    id: 6,
    name: "Can't Help Falling In Love",
    artist: "Elvis Presley",
    duration: "03:07",
    category: "international",
  },
  {
    id: 7,
    name: "Perfect",
    artist: "Ed Sheeran",
    duration: "04:23",
    category: "international",
  },
  {
    id: 8,
    name: "Thinking Out Loud",
    artist: "Ed Sheeran",
    duration: "04:41",
    category: "international",
  },
  {
    id: 9,
    name: "You Can Trust Me",
    artist: "The Piano Guys",
    duration: "03:03",
    category: "international",
  },
  {
    id: 10,
    name: "You Got Me",
    artist: "Colbie Caillat",
    duration: "04:03",
    category: "international",
  },
  {
    id: 11,
    name: "잘하고있잖아",
    artist: "Radwimps",
    duration: "03:50",
    category: "international",
  },
  {
    id: 12,
    name: "周杰倫 Jay Chou",
    artist: "Jay Chou",
    duration: "04:02",
    category: "international",
  },
  {
    id: 13,
    name: "Lạ Lùng",
    artist: "Vũ",
    duration: "04:15",
    category: "vpop",
  },
  {
    id: 14,
    name: "Mình Cưới Nhau Đi",
    artist: "Huỳnh James x Pjnboys",
    duration: "03:42",
    category: "vpop",
  },
];
