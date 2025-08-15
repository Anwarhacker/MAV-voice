import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type Video = {
  id: number;
  title: string;
  url: string;
  description: string;
};

const filePath = path.join(process.cwd(), "db.json");

async function getVideos(): Promise<Video[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(data);
    return json.videos || [];
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveVideos(videos: Video[]) {
  const data = JSON.stringify({ videos }, null, 2);
  await fs.writeFile(filePath, data, "utf-8");
}

export async function GET() {
  const videos = await getVideos();
  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const { title, url, description } = await request.json();
  const videos = await getVideos();

  const newVideo: Video = {
    id: videos.length > 0 ? Math.max(...videos.map((v) => v.id)) + 1 : 1,
    title,
    url,
    description,
  };

  videos.push(newVideo);
  await saveVideos(videos);

  return NextResponse.json(newVideo, { status: 201 });
}
