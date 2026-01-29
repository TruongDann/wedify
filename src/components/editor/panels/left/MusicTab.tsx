"use client";

import React, { useState, useRef } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentMusic = canvasSettings.backgroundMusic;

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
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
    });
    setIsPlaying(false);
  };

  const handleRemoveMusic = () => {
    setCanvasSettings({ backgroundMusic: null });
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
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                onClick={handlePlayPause}
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
                  {currentMusic.artist} • {currentMusic.duration}
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
                const reader = new FileReader();
                reader.onload = (e) => {
                  const src = e.target?.result as string;
                  const newMusic: UploadedMusic = {
                    id: Date.now().toString(),
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    src,
                    duration: "--:--",
                  };
                  setUploadedMusic((prev) => [newMusic, ...prev]);
                };
                reader.readAsDataURL(file);
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
