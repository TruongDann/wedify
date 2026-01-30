"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Play,
  Pause,
  X,
  Music,
  Trash2,
  Upload as UploadIcon,
  Volume2,
  Crown,
} from "lucide-react";
import { Button, Upload, Input, Slider } from "antd";
import { MUSIC_LIBRARY } from "@/constants/music";
import { useEditorStore } from "@/store/editorStore";

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

  return (
    <div className="flex flex-col h-full">
      {/* Sub Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              musicSubTab === "library"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMusicSubTab("library")}
          >
            Thư viện nhạc
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              musicSubTab === "mymusic"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMusicSubTab("mymusic")}
          >
            Nhạc của tôi
          </button>
        </div>
      </div>

      {/* Current Music Section - Always show */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
          Nhạc hiện tại
        </p>
        {currentMusic ? (
          <>
            <div className="flex items-center gap-3 bg-primary/5 rounded-xl p-3 border border-primary/10">
              <button
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  currentMusic.src
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-gray-300 cursor-not-allowed"
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
                  <Pause size={18} className="text-white" fill="white" />
                ) : (
                  <Play size={18} className="text-white ml-0.5" fill="white" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {currentMusic.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentMusic.artist} •{" "}
                  {currentMusic.src
                    ? formatTime(currentTime) + " / " + formatTime(duration)
                    : currentMusic.duration}
                </p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleRemoveMusic}
                title="Xóa nhạc"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Progress Bar - Only show when playing uploaded music */}
            {currentMusic.src && (
              <div className="mt-3 px-1">
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration || 100}
                  onChange={handleSeek}
                  tooltip={{ formatter: (val) => formatTime(val || 0) }}
                  className="!m-0"
                />
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 mt-3 px-1">
              <Volume2 size={16} className="text-gray-400" />
              <Slider
                value={volume}
                onChange={(val) => setVolume(val)}
                className="flex-1"
                tooltip={{ formatter: (val) => `${val}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 py-2">Chưa chọn bài hát nào</p>
        )}
      </div>

      {/* Library Tab Content */}
      {musicSubTab === "library" && (
        <>
          {/* Search Bar */}
          <div className="p-4 pb-3">
            <Input
              prefix={<Search size={18} className="text-gray-400" />}
              placeholder="Tìm kiếm bài hát"
              className="rounded-full !py-2 !px-4 !border-gray-200"
              style={{ backgroundColor: "white" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>

          {/* Filter Chips */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  musicFilter === filter.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setMusicFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Music List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMusic.length > 0 ? (
              filteredMusic.map((song) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer ${
                    currentMusic?.name === song.name ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectMusic(song)}
                >
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentMusic?.name === song.name
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Play
                      size={16}
                      className="ml-0.5"
                      fill={currentMusic?.name === song.name ? "white" : "none"}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {song.name}
                    </p>
                    <p className="text-xs text-gray-500">{song.duration}</p>
                  </div>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      currentMusic?.name === song.name
                        ? "bg-primary text-white"
                        : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMusic(song);
                    }}
                  >
                    {currentMusic?.name === song.name ? "Đang dùng" : "Sử dụng"}
                    <Crown
                      size={14}
                      className={
                        currentMusic?.name === song.name
                          ? "text-white"
                          : "text-primary"
                      }
                    />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Music size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Không tìm thấy bài hát</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* My Music Tab Content */}
      {musicSubTab === "mymusic" && (
        <div className="flex-1 overflow-y-auto">
          {/* Upload Section */}
          <div className="p-4">
            <Upload
              accept="audio/*"
              showUploadList={false}
              beforeUpload={(file) => {
                // Validate file type
                const isAudio = file.type.startsWith("audio/");
                if (!isAudio) {
                  console.error("File không phải là audio");
                  return false;
                }

                // Use URL.createObjectURL instead of DataURL for better compatibility
                const src = URL.createObjectURL(file);

                // Create temporary audio to get duration
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
                  const minutes = Math.floor(tempAudio.duration / 60);
                  const seconds = Math.floor(tempAudio.duration % 60);
                  const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
                  addMusic(durationStr);
                });

                tempAudio.addEventListener("error", () => {
                  // Still add the music even if we can't get duration
                  console.error("Không thể đọc file audio:", tempAudio.error);
                  addMusic("--:--");
                });

                // Set source after adding listeners
                tempAudio.src = src;
                tempAudio.load();

                return false;
              }}
              className="block w-full [&_.ant-upload]:w-full"
            >
              <Button
                type="primary"
                size="large"
                icon={<UploadIcon size={18} />}
                className="!font-medium !text-sm !rounded-lg h-11 !w-full flex items-center justify-center gap-2"
              >
                Tải nhạc lên
              </Button>
            </Upload>
          </div>

          {/* Uploaded Music List */}
          {uploadedMusic.length > 0 ? (
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Nhạc đã tải lên ({uploadedMusic.length})
              </h3>
              <div className="space-y-2">
                {uploadedMusic.map((song) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      currentMusic?.name === song.name
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                    }`}
                    onClick={() =>
                      handleSelectMusic({
                        name: song.name,
                        artist: "Nhạc của tôi",
                        duration: song.duration,
                        src: song.src,
                      })
                    }
                  >
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                        currentMusic?.name === song.name
                          ? "bg-primary text-white"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      <Play
                        size={16}
                        className="ml-0.5"
                        fill={
                          currentMusic?.name === song.name ? "white" : "none"
                        }
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {song.name}
                      </p>
                      <p className="text-xs text-gray-500">{song.duration}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          currentMusic?.name === song.name
                            ? "bg-primary text-white"
                            : "text-primary bg-primary/10 hover:bg-primary/20"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMusic({
                            name: song.name,
                            artist: "Nhạc của tôi",
                            duration: song.duration,
                            src: song.src,
                          });
                        }}
                      >
                        {currentMusic?.name === song.name
                          ? "Đang dùng"
                          : "Sử dụng"}
                      </button>
                      <button
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Music size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Chưa có nhạc nào
              </p>
              <p className="text-xs text-center text-gray-400">
                Tải lên nhạc của bạn để sử dụng
              </p>
              <p className="text-xs text-center text-gray-400 mt-1">
                Hỗ trợ: MP3, WAV, OGG, M4A
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
