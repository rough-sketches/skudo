"use client";

import { useEffect, useState } from "react";
import useSWR from "swr"; // We'll need to install swr or use useEffect
import { useParams } from "next/navigation";
import { fetchPlaylistAsCourse } from "@/lib/youtube";
import { Course, Video } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import confetti from "canvas-confetti";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function CoursePage() {
    const params = useParams();
    const playlistId = params.id as string;
    const [user, setUser] = useState<User | null>(null);
    const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Fetch Course Data
    const { data: course, error } = useSWR(playlistId ? `playlist-${playlistId}` : null, () => fetchPlaylistAsCourse(playlistId));

    // Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Progress from Firestore
    useEffect(() => {
        if (!user || !playlistId) return;

        const docRef = doc(db, "users", user.uid, "courses", playlistId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompletedVideos(new Set(data.completedVideoIds || []));
            }
        });

        return () => unsubscribe();
    }, [user, playlistId]);

    const toggleVideoCompletion = async (videoId: string) => {
        const newCompleted = new Set(completedVideos);
        const isComplete = newCompleted.has(videoId);

        if (isComplete) {
            newCompleted.delete(videoId);
        } else {
            newCompleted.add(videoId);
            // Trigger confetti if this was the last video!
            if (course && newCompleted.size === course.videos.length) {
                confetti({
                    particleCount: 150,
                    spread: 60,
                    origin: { y: 0.6 },
                });
            }
        }

        setCompletedVideos(newCompleted);

        // Persist to Firestore if logged in
        if (user) {
            const docRef = doc(db, "users", user.uid, "courses", playlistId);
            await setDoc(docRef, {
                playlistId,
                completedVideoIds: Array.from(newCompleted),
                lastUpdated: Date.now(),
                // Save minimal course info for a "My Courses" list later
                title: course?.title || "",
                totalVideos: course?.totalVideos || 0,
                thumbnailUrl: course?.thumbnailUrl || "",
            }, { merge: true });
        }
    };

    if (error) return <div className="p-8 text-center text-red-500">Error loading course. Please check the ID/URL and API Key.</div>;
    if (!course) return <div className="p-8 text-center">Loading course...</div>;

    const progress = Math.round((completedVideos.size / course.videos.length) * 100);

    return (
        <div className="container mx-auto max-w-4xl p-4">
            <Card className="mb-6">
                <CardHeader className="flex flex-row gap-4">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-32 h-24 object-cover rounded-md" />
                    <div>
                        <CardTitle>{course.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{course.description.slice(0, 150)}...</p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-sm font-medium">{progress}%</span>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                <div className="space-y-4">
                    {course.videos.map((video: Video) => (
                        <div key={video.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <Checkbox
                                id={video.id}
                                checked={completedVideos.has(video.id)}
                                onCheckedChange={() => toggleVideoCompletion(video.id)}
                                className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none w-full">
                                <label
                                    htmlFor={video.id}
                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${completedVideos.has(video.id) ? "line-through text-gray-400" : ""
                                        }`}
                                >
                                    {video.title}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    {video.channelTitle}
                                </p>
                            </div>
                            <a
                                href={`https://www.youtube.com/watch?v=${video.id}&list=${playlistId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline shrink-0"
                            >
                                Watch
                            </a>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
