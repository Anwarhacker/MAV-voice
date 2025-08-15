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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const videos = await getVideos();
  const video = videos.find((v) => v.id === parseInt(params.id));

  if (!video) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { title, url, description } = await request.json();
  const videos = await getVideos();
  const videoIndex = videos.findIndex((v) => v.id === parseInt(params.id));

  if (videoIndex === -1) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }

  const updatedVideo = { ...videos[videoIndex], title, url, description };
  videos[videoIndex] = updatedVideo;
  await saveVideos(videos);

  return NextResponse.json(updatedVideo);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let videos = await getVideos();
  const videoIndex = videos.findIndex((v) => v.id === parseInt(params.id));

  if (videoIndex === -1) {
    return NextResponse.json({ message: "Video not found" }, { status: 404 });
  }

  videos = videos.filter((v) => v.id !== parseInt(params.id));
  await saveVideos(videos);

  return new NextResponse(null, { status: 204 });
}
