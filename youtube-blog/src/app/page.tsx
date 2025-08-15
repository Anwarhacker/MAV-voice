"use client";

import { useState, useEffect } from "react";

type Video = {
  id: number;
  title: string;
  url: string;
  description: string;
};

function getYouTubeVideoId(url: string) {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/
  );
  return match ? match[1] : null;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => setVideos(data.videos));
  }, []);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8">My YouTube Blog</h1>
      <div className="mb-8 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search videos by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map((video) => {
          const videoId = getYouTubeVideoId(video.url);
          return (
            <div key={video.id} className="border rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
              {videoId && (
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}
              <p>{video.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
