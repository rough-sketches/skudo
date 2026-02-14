"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const [url, setUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartCourse = () => {
    let playlistId = url;
    try {
      const urlObj = new URL(url);
      playlistId = urlObj.searchParams.get("list") || url;
    } catch (e) { }

    if (playlistId) {
      router.push(`/course/${playlistId}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && !showEnrollment) {
    return <Dashboard user={user} onAddNew={() => setShowEnrollment(true)} />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-6 relative">
      {user && (
        <Button
          variant="ghost"
          onClick={() => setShowEnrollment(false)}
          className="absolute top-6 left-6"
        >
          ← Back to Dashboard
        </Button>
      )}
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
