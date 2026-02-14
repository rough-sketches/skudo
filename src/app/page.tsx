"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleStartCourse = () => {
    let playlistId = url;
    // Basic extraction of playlist ID from URL
    try {
      const urlObj = new URL(url);
      playlistId = urlObj.searchParams.get("list") || url;
    } catch (e) {
      // If not a URL, assume it's the ID
    }

    if (playlistId) {
      router.push(`/course/${playlistId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 pb-4 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
            Video Course Tracker
          </CardTitle>
          <CardDescription className="text-slate-500 text-base">
            Turn any YouTube Playlist into a trackable course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Paste YouTube Playlist URL or ID"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleStartCourse} disabled={!url}>
            Start Learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
