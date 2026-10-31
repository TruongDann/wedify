import type { BackgroundMusic } from "@/types/editor";

/**
 * Giới hạn audio trong đoạn [startTime, endTime] của nhạc nền và lặp lại trong đoạn đó.
 * Trả về hàm gỡ listener.
 */
export const bindMusicTrim = (
  audio: HTMLAudioElement,
  music: Pick<BackgroundMusic, "startTime" | "endTime">,
) => {
  const start = music.startTime ?? 0;
  const end = music.endTime;
  if (!start && !end) return () => {};

  // timeupdate bắn ~4 lần/giây nên điểm kết thúc lệch tối đa khoảng 0,25s;
  // audio.loop quay về 0 thì cũng kéo lại điểm bắt đầu
  const clamp = () => {
    if ((end && audio.currentTime >= end) || audio.currentTime < start - 0.3) {
      audio.currentTime = start;
    }
  };
  const onEnded = () => {
    audio.currentTime = start;
    audio.play().catch(() => {});
  };

  audio.addEventListener("loadedmetadata", clamp);
  audio.addEventListener("timeupdate", clamp);
  audio.addEventListener("ended", onEnded);
  if (audio.readyState >= 1) clamp();

  return () => {
    audio.removeEventListener("loadedmetadata", clamp);
    audio.removeEventListener("timeupdate", clamp);
    audio.removeEventListener("ended", onEnded);
  };
};

/** 75 → "1:15" */
export const formatSeconds = (value: number) => {
  const total = Math.max(0, Math.round(value));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};
