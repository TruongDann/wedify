/**
 * Music library configuration for wedding card editor
 */

export type MusicCategory = "international" | "vpop";

export interface MusicTrack {
  id: number;
  name: string;
  artist: string;
  duration: string;
  src?: string;
  category: MusicCategory;
}

const sampleTrack = (index: number, name: string, artist: string, duration: string, category: MusicCategory) => ({
  id: index,
  name,
  artist,
  duration,
  category,
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index}.mp3`,
});

export const MUSIC_LIBRARY: MusicTrack[] = [
  sampleTrack(1, "50 Năm Về Sau", "Phan Mạnh Quỳnh", "03:54", "vpop"),
  sampleTrack(2, "A Little Love", "Fiona Fung", "03:11", "international"),
  sampleTrack(3, "A Thousand Years", "Christina Perri", "04:48", "international"),
  sampleTrack(4, "All of Me", "John Legend", "04:30", "international"),
  sampleTrack(5, "Beautiful In White", "Westlife", "03:58", "international"),
  sampleTrack(6, "Can't Help Falling In Love", "Elvis Presley", "03:07", "international"),
  sampleTrack(7, "Perfect", "Ed Sheeran", "04:23", "international"),
  sampleTrack(8, "Thinking Out Loud", "Ed Sheeran", "04:41", "international"),
  sampleTrack(9, "You Can Trust Me", "The Piano Guys", "03:03", "international"),
  sampleTrack(10, "You Got Me", "Colbie Caillat", "04:03", "international"),
  sampleTrack(11, "잘하고있잖아", "Radwimps", "03:50", "international"),
  sampleTrack(12, "周杰倫 Jay Chou", "Jay Chou", "04:02", "international"),
  sampleTrack(13, "Lạ Lùng", "Vũ", "04:15", "vpop"),
  sampleTrack(14, "Mình Cưới Nhau Đi", "Huỳnh James x Pjnboys", "03:42", "vpop"),
];
