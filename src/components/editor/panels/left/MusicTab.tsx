"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  X,
  Music,
  Trash2,
  Upload as UploadIcon,
  Volume2,
} from "lucide-react";
import { Upload, Slider } from "antd";
import { MUSIC_LIBRARY } from "@/constants/music";
import { useEditorStore } from "@/store/editorStore";
import { Chip, ChipRow, PanelTabs, SearchBox, SectionTitle } from "./ui";

type MusicSubTab = "library" | "mymusic";
type MusicFilter = "all" | "international" | "vpop";

interface UploadedMusic {
  id: string;
  name: string;
  src: string;
  duration: string;
}

export const MusicTab: React.FC = () => {
  const { canvasSettings, setCanvasSettings } = useEditorStore();
  const [musicSubTab, setMusicSubTab] = useState<MusicSubTab>("library");
  const [musicFilter, setMusicFilter] = useState<MusicFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [uploadedMusic, setUploadedMusic] = useState<UploadedMusic[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentMusic = canvasSettings.backgroundMusic;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCanvasSettings({ isMusicPlaying: false });
        setCurrentTime(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio source when music changes
  useEffect(() => {
    if (audioRef.current && currentMusic?.src) {
      audioRef.current.src = currentMusic.src;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setCanvasSettings({ isMusicPlaying: false });
    }
  }, [currentMusic?.src]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const FILTERS = [
    { key: "all" as MusicFilter, label: "Tất cả" },
    { key: "international" as MusicFilter, label: "Nhạc ngoại" },
    { key: "vpop" as MusicFilter, label: "V-POP" },
  ];

  const filteredMusic = MUSIC_LIBRARY.filter((song) => {
    const matchesSearch =
      song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      musicFilter === "all" || song.category === musicFilter;
    return matchesSearch && matchesFilter;
  });

  const handlePlayPause = () => {
    if (audioRef.current && currentMusic?.src) {
      if (isPlaying) {
        audioRef.current.pause();
        setCanvasSettings({ isMusicPlaying: false });
      } else {
        audioRef.current.play().catch(console.error);
        setCanvasSettings({ isMusicPlaying: true });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSelectMusic = (song: {
    name: string;
    artist: string;
    duration: string;
    src?: string;
  }) => {
    setCanvasSettings({
      backgroundMusic: {
        ...song,
        icon: currentMusic?.icon || "music",
        iconColor: currentMusic?.iconColor || "#000000",
      },
      isMusicPlaying: false,
    });
    setIsPlaying(false);
  };

  const handleRemoveMusic = () => {
    setCanvasSettings({ backgroundMusic: null, isMusicPlaying: false });
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleMusicUpload = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      console.error("File không phải là audio");
      return false;
    }

    // Dùng object URL thay cho DataURL để tương thích tốt hơn
    const src = URL.createObjectURL(file);
    const tempAudio = new Audio();

    const addMusic = (durationStr: string) => {
      const newMusic: UploadedMusic = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        src,
        duration: durationStr,
      };
      setUploadedMusic((prev) => [newMusic, ...prev]);
    };

    tempAudio.addEventListener("loadedmetadata", () => {
      addMusic(formatTime(tempAudio.duration));
    });
    tempAudio.addEventListener("error", () => {
      // Vẫn thêm bài dù không đọc được thời lượng
      console.error("Không thể đọc file audio:", tempAudio.error);
      addMusic("--:--");
    });
    tempAudio.src = src;
    tempAudio.load();
    return false;
  };

  const renderSongRow = (
    song: { key: string; name: string; meta: string },
    onUse: () => void,
    extra?: React.ReactNode,
  ) => {
    const isCurrent = currentMusic?.name === song.name;
    return (
      <li
        key={song.key}
        className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${
          isCurrent ? "bg-surface-muted" : "hover:bg-surface-muted"
        }`}
        onClick={onUse}
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isCurrent ? "bg-primary text-white" : "text-ink-3"
          }`}
        >
          <Play size={12} fill="currentColor" className="ml-0.5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm leading-5 text-ink line-clamp-2">
            {song.name}
          </div>
          <div className="text-xs leading-4 text-ink-3">{song.meta}</div>
        </div>
        <button
          type="button"
          className={`h-8 px-3 rounded-full text-[13px] font-medium shrink-0 transition-colors ${
            isCurrent ? "text-ink-3" : "text-link hover:bg-[#EEF4FD]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          {isCurrent ? "Đang dùng" : "Dùng"}
        </button>
        {extra}
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nhạc đang dùng */}
      <div className="px-4 pt-2 pb-3 shrink-0">
        {currentMusic ? (
          <div className="rounded-xl border border-line p-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  currentMusic.src
                    ? "bg-primary text-white hover:bg-accent"
                    : "bg-surface-muted text-ink-4 cursor-not-allowed"
                }`}
                onClick={handlePlayPause}
                disabled={!currentMusic.src}
                title={
                  currentMusic.src
                    ? isPlaying
                      ? "Tạm dừng"
                      : "Phát"
                    : "Không có file nhạc"
                }
              >
                {isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-ink-3">Nhạc nền đang dùng</div>
                <div className="text-sm font-medium text-ink truncate">
                  {currentMusic.name}
                </div>
                <div className="text-xs text-ink-3 truncate">
                  {currentMusic.artist} ·{" "}
                  {currentMusic.src
                    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                    : currentMusic.duration}
                </div>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-3 hover:bg-surface-muted hover:text-ink"
                onClick={handleRemoveMusic}
                title="Bỏ nhạc nền"
              >
                <X size={15} />
              </button>
            </div>

            {currentMusic.src && (
              <Slider
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
                tooltip={{ formatter: (val) => formatTime(val || 0) }}
                className="mt-3! mb-0! mx-1!"
              />
            )}
            <div className="flex items-center gap-2 mt-2 px-1">
              <Volume2 size={15} className="text-ink-3 shrink-0" />
              <Slider
                value={volume}
                onChange={(val) => setVolume(val)}
                className="flex-1 my-1!"
                tooltip={{ formatter: (val) => `${val}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-3 text-[13px] leading-[19px] text-ink-3">
            <Music size={20} className="shrink-0" />
            <div>
              <div className="text-ink-2">Chưa có nhạc nền</div>
              Chọn một bài trong thư viện hoặc nhạc của bạn.
            </div>
          </div>
        )}
      </div>

      <PanelTabs
        tabs={[
          { key: "library" as MusicSubTab, label: "Thư viện nhạc" },
          { key: "mymusic" as MusicSubTab, label: "Nhạc của tôi" },
        ]}
        active={musicSubTab}
        onChange={setMusicSubTab}
      />

      {/* Thư viện nhạc */}
      {musicSubTab === "library" && (
        <>
          <div className="px-4 pt-3 pb-2 flex flex-col gap-2.5 shrink-0">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm bài hát"
            />
            <ChipRow>
              {FILTERS.map((filter) => (
                <Chip
                  key={filter.key}
                  active={musicFilter === filter.key}
                  onClick={() => setMusicFilter(filter.key)}
                >
                  {filter.label}
                </Chip>
              ))}
            </ChipRow>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-6">
            {filteredMusic.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {filteredMusic.map((song) =>
                  renderSongRow(
                    {
                      key: String(song.id),
                      name: song.name,
                      meta: song.duration,
                    },
                    () => handleSelectMusic(song),
                  ),
                )}
              </ul>
            ) : (
              <p className="py-12 text-center text-[13px] text-ink-3">
                Không tìm thấy bài hát
              </p>
            )}
          </div>
        </>
      )}

      {/* Nhạc của tôi */}
      {musicSubTab === "mymusic" && (
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-4 pt-3 pb-3">
            <Upload.Dragger
              accept="audio/*"
              multiple
              showUploadList={false}
              beforeUpload={handleMusicUpload}
              className="block [&_.ant-upload-drag]:rounded-[10px]! [&_.ant-upload-drag]:border-line-strong! [&_.ant-upload-drag]:bg-surface-subtle! [&_.ant-upload-btn]:py-3! [&_.ant-upload-btn]:px-4!"
            >
              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
                <UploadIcon size={16} />
                Tải nhạc lên
              </div>
              <div className="text-xs text-ink-3 mt-0.5">
                MP3, WAV, OGG, M4A
              </div>
            </Upload.Dragger>
          </div>

          {uploadedMusic.length > 0 ? (
            <div className="px-2">
              <div className="px-2">
                <SectionTitle
                  title={`Nhạc đã tải lên (${uploadedMusic.length})`}
                />
              </div>
              <ul className="flex flex-col gap-0.5">
                {uploadedMusic.map((song) =>
                  renderSongRow(
                    { key: song.id, name: song.name, meta: song.duration },
                    () =>
                      handleSelectMusic({
                        name: song.name,
                        artist: "Nhạc của tôi",
                        duration: song.duration,
                        src: song.src,
                      }),
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-ink-4 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedMusic((prev) =>
                          prev.filter((m) => m.id !== song.id),
                        );
                        if (currentMusic?.name === song.name) {
                          setCanvasSettings({ backgroundMusic: null });
                        }
                      }}
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>,
                  ),
                )}
              </ul>
            </div>
          ) : (
            <p className="px-4 py-10 text-center text-[13px] text-ink-3">
              Chưa có nhạc nào. Tải lên nhạc của bạn để sử dụng.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
