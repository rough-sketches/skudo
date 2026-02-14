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
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

    // Fetch Course Data
    const { data: course, error } = useSWR(playlistId ? `playlist-${playlistId}` : null, () => fetchPlaylistAsCourse(playlistId));

    // Set first video as active by default
    useEffect(() => {
        if (course && course.videos.length > 0 && !activeVideoId) {
            setActiveVideoId(course.videos[0].id);
        }
    }, [course, activeVideoId]);

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

    const toggleVideoCompletion = async (e: React.MouseEvent | React.ChangeEvent, videoId: string) => {
        // Prevent event bubbling if clicking checkbox specifically
        e.stopPropagation();

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
        <div className="container mx-auto max-w-7xl p-4 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column: Video Player & Header */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200 sticky top-4 z-10 lg:relative lg:top-0">
                        {activeVideoId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Select a video to start learning
                            </div>
                        )}
                    </div>

                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-xl lg:text-3xl font-bold tracking-tight text-slate-900">
                                {course.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex-1 max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{progress}%</span>
                            </div>
                            <p className="text-slate-500 mt-4 leading-relaxed text-sm lg:text-base">
                                {course.description}
                            </p>
                        </CardHeader>
                    </Card>
                </div>

                {/* Right Column: Video Playlist */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 px-1 hidden lg:block">Course Content</h3>
                    <ScrollArea className="h-auto lg:h-[calc(100vh-250px)] max-h-[500px] lg:max-h-none w-full rounded-xl border border-slate-200 bg-white shadow-md lg:shadow-sm p-2">
                        <div className="space-y-1.5 lg:space-y-2">
                            {course.videos.map((video: Video, index: number) => (
                                <div
                                    key={video.id}
                                    onClick={() => setActiveVideoId(video.id)}
                                    className={`group flex items-start lg:items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${activeVideoId === video.id
                                        ? "bg-slate-50 border-slate-200 border shadow-sm ring-1 ring-slate-200"
                                        : "hover:bg-slate-50 border border-transparent"
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            id={video.id}
                                            checked={completedVideos.has(video.id)}
                                            onCheckedChange={(checked) => {
                                                toggleVideoCompletion({ stopPropagation: () => { } } as any, video.id);
                                            }}
                                            className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm lg:text-base font-medium leading-tight ${completedVideos.has(video.id) ? "text-slate-400 line-through" : "text-slate-800"
                                            }`}>
                                            {index + 1}. {video.title}
                                        </p>
                                        <p className="text-[10px] lg:text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">
                                            {video.channelTitle}
                                        </p>
                                    </div>
                                    {activeVideoId === video.id && (
                                        <div className="shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1.5 lg:mt-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
