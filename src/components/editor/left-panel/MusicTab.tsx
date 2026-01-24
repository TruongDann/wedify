"use client";

import React, { useState } from "react";
import { Search, Play, X, Crown, Music, Trash2 } from "lucide-react";
import { Button, Upload, Input } from "antd";
import { MUSIC_LIBRARY } from "@/constants/music";

export const MusicTab: React.FC = () => {
  const [musicSubTab, setMusicSubTab] = useState<string>("library");
  const [musicFilter, setMusicFilter] = useState<string>("all");
  const [currentMusic, setCurrentMusic] = useState<{
    name: string;
    artist: string;
    duration: string;
  } | null>({ name: "Lẽ Đường", artist: "Kai Đinh", duration: "04:09" });
  const [uploadedMusic, setUploadedMusic] = useState<
    { id: string; name: string; src: string; duration: string }[]
  >([]);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs: Thư viện nhạc / Nhạc của tôi */}
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

      {/* Current Music */}
      {currentMusic && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Nhạc hiện tại</p>
          <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow">
              <Play size={16} className="text-primary ml-0.5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {currentMusic.name} - {currentMusic.artist}
              </p>
              <p className="text-xs text-gray-500">{currentMusic.duration}</p>
            </div>
            <button
              className="p-1.5 hover:bg-primary/20 rounded transition-colors"
              onClick={() => setCurrentMusic(null)}
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Content based on sub-tab */}
      {musicSubTab === "library" && (
        <>
          {/* Search Bar */}
          <div className="p-4 pb-3">
            <Input
              prefix={<Search size={18} className="text-gray-400" />}
              placeholder="Tìm kiếm bài hát"
              className="rounded-full !py-2 !px-4 !border-gray-200"
              style={{ backgroundColor: "white" }}
            />
          </div>

          {/* Filter Chips */}
          <div
            className="px-4 pb-3 flex gap-2 flex-nowrap overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[
              { key: "all", label: "Tất cả" },
              { key: "international", label: "Nhạc ngoại" },
              { key: "vpop", label: "V-POP" },
            ].map((filter) => (
              <button
                key={filter.key}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  musicFilter === filter.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setMusicFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Music List */}
          <div className="flex-1 overflow-y-auto">
            {MUSIC_LIBRARY.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Play size={16} className="text-gray-600 ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {song.name}
                  </p>
                  <p className="text-xs text-gray-500">{song.duration}</p>
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-sm text-primary hover:bg-primary/10 transition-colors"
                  onClick={() =>
                    setCurrentMusic({
                      name: song.name,
                      artist: song.artist,
                      duration: song.duration,
                    })
                  }
                >
                  Sử dụng
                  <Crown size={14} className="text-primary" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {musicSubTab === "mymusic" && (
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Upload Button */}
          <Upload
            accept="audio/*"
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                const newMusic = {
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
              className="!font-medium !text-sm !rounded-lg h-11 !w-full flex items-center justify-center gap-2"
            >
              <Music size={18} />
              Tải nhạc lên
            </Button>
          </Upload>

          {/* Uploaded Music List */}
          {uploadedMusic.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Nhạc đã tải lên
              </h3>
              {uploadedMusic.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <Play size={16} className="text-primary ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {song.name}
                    </p>
                    <p className="text-xs text-gray-500">{song.duration}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      onClick={() =>
                        setCurrentMusic({
                          name: song.name,
                          artist: "Nhạc của tôi",
                          duration: song.duration,
                        })
                      }
                    >
                      Sử dụng
                    </button>
                    <button
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() =>
                        setUploadedMusic((prev) =>
                          prev.filter((m) => m.id !== song.id)
                        )
                      }
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 mt-4">
              <Music size={48} className="mb-3 opacity-50" />
              <p className="text-sm text-center">Tải lên nhạc để xem tại đây</p>
              <p className="text-xs text-center mt-1 text-gray-400">
                Hỗ trợ: MP3, WAV, OGG...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
