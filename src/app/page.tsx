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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Video Course Tracker</CardTitle>
          <CardDescription className="text-center">
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
