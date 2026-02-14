"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { fetchPlaylistAsCourse } from "@/lib/youtube";
import { Course, Video } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import confetti from "canvas-confetti";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import YouTube, { YouTubeProps } from "react-youtube";
import { VideoNotes } from "@/components/VideoNotes";

export default function CoursePage() {
    const params = useParams();
    const playlistId = params.id as string;
    const [user, setUser] = useState<User | null>(null);
    const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [player, setPlayer] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [initialTimestamp, setInitialTimestamp] = useState<number | null>(null);
    const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Fetch Progress from Firestore & Restore Active Video
    useEffect(() => {
        if (!user || !playlistId) return;

        const docRef = doc(db, "users", user.uid, "courses", playlistId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompletedVideos(new Set(data.completedVideoIds || []));

                // Restore last video if not already set by interaction
                if (!hasRestoredProgress) {
                    if (data.lastVideoId) {
                        setActiveVideoId(data.lastVideoId);
                    }
                    if (data.lastTimestamp) {
                        setInitialTimestamp(data.lastTimestamp);
                    }
                    setHasRestoredProgress(true);
                }
            } else if (course && course.videos.length > 0 && !activeVideoId) {
                // If no progress exists, default to first video
                setActiveVideoId(course.videos[0].id);
                setHasRestoredProgress(true);
            }
        });

        return () => unsubscribe();
    }, [user, playlistId, course, hasRestoredProgress, activeVideoId]);

    // Set first video as active if no progress exists after course load
    useEffect(() => {
        if (course && course.videos.length > 0 && !activeVideoId && hasRestoredProgress) {
            setActiveVideoId(course.videos[0].id);
        }
    }, [course, activeVideoId, hasRestoredProgress]);

    // Track Player Time & Periodically Save Progress
    useEffect(() => {
        if (player) {
            timerRef.current = setInterval(() => {
                const time = Math.floor(player.getCurrentTime());
                setCurrentTime(time);

                // Save progress every 10 seconds if user is logged in
                if (user && activeVideoId && time % 10 === 0 && time > 0) {
                    const docRef = doc(db, "users", user.uid, "courses", playlistId);
                    setDoc(docRef, {
                        lastVideoId: activeVideoId,
                        lastTimestamp: time,
                        lastUpdated: Date.now(),
                    }, { merge: true });
                }
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [player, user, activeVideoId, playlistId]);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        const p = event.target;
        setPlayer(p);

        // Seek to initial timestamp if one was restored
        if (initialTimestamp && initialTimestamp > 0) {
            p.seekTo(initialTimestamp, true);
            // We clear it after seeking so it doesn't keep seeking back if user refreshes or switches videos
            setInitialTimestamp(null);
        }
    };

    const handleSeek = (time: number) => {
        if (player) {
            player.seekTo(time, true);
            player.playVideo();
        }
    };

    const handleVideoSelect = (videoId: string) => {
        setActiveVideoId(videoId);
        // Reset timestamp when manually switching videos
        setInitialTimestamp(null);

        // Save choice immediately
        if (user) {
            const docRef = doc(db, "users", user.uid, "courses", playlistId);
            setDoc(docRef, {
                lastVideoId: videoId,
                lastTimestamp: 0,
                lastUpdated: Date.now(),
            }, { merge: true });
        }
    };

    const toggleVideoCompletion = async (e: React.MouseEvent | React.ChangeEvent, videoId: string) => {
        e.stopPropagation();

        const newCompleted = new Set(completedVideos);
        const isComplete = newCompleted.has(videoId);

        if (isComplete) {
            newCompleted.delete(videoId);
        } else {
            newCompleted.add(videoId);
            if (course && newCompleted.size === course.videos.length) {
                confetti({
                    particleCount: 150,
                    spread: 60,
                    origin: { y: 0.6 },
                });
            }
        }

        setCompletedVideos(newCompleted);

        if (user) {
            const docRef = doc(db, "users", user.uid, "courses", playlistId);
            await setDoc(docRef, {
                playlistId,
                completedVideoIds: Array.from(newCompleted),
                lastUpdated: Date.now(),
                title: course?.title || "",
                totalVideos: course?.totalVideos || 0,
                thumbnailUrl: course?.thumbnailUrl || "",
                // Ensure we also keep the current state when completing video
                lastVideoId: activeVideoId,
                lastTimestamp: currentTime,
            }, { merge: true });
        }
    };

    if (error) return <div className="p-8 text-center text-red-500">Error loading course. Please check the ID/URL and API Key.</div>;
    if (!course) return <div className="p-8 text-center">Loading course...</div>;

    const progress = Math.round((completedVideos.size / course.videos.length) * 100);

    return (
        <div className="container mx-auto max-w-7xl p-4 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                {/* Left Column: Video Player & Content */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-10">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200 sticky top-4 z-10 lg:relative lg:top-0">
                        {activeVideoId ? (
                            <YouTube
                                videoId={activeVideoId}
                                className="w-full h-full"
                                opts={{
                                    height: '100%',
                                    width: '100%',
                                    playerVars: {
                                        autoplay: 1,
                                        rel: 0,
                                        modestbranding: 1,
                                    },
                                }}
                                onReady={onPlayerReady}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Select a video to start learning
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                    {course.title}
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-6">
                                    <div className="flex-1 max-w-md h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-green-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{progress}% Complete</span>
                                </div>
                                <p className="text-slate-500 mt-6 leading-relaxed text-sm lg:text-lg max-w-3xl">
                                    {course.description}
                                </p>
                            </CardHeader>
                        </Card>

                        {/* Video Notes Integration */}
                        {user && activeVideoId && (
                            <VideoNotes
                                videoId={activeVideoId}
                                playlistId={playlistId}
                                userId={user.uid}
                                currentTime={currentTime}
                                onSeek={handleSeek}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Video Playlist */}
                <div className="space-y-6 lg:mt-0">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-50">Course Content</h3>
                        <ScrollArea className="h-auto lg:h-[calc(100vh-280px)] max-h-[500px] lg:max-h-none w-full mt-4">
                            <div className="space-y-1.5 pr-3">
                                {course.videos.map((video: Video, index: number) => (
                                    <div
                                        key={video.id}
                                        onClick={() => handleVideoSelect(video.id)}
                                        className={`group flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer border ${activeVideoId === video.id
                                            ? "bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-100"
                                            : "hover:bg-slate-50 border-transparent"
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                id={video.id}
                                                checked={completedVideos.has(video.id)}
                                                onCheckedChange={(checked) => {
                                                    toggleVideoCompletion({ stopPropagation: () => { } } as any, video.id);
                                                }}
                                                className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm lg:text-base font-semibold leading-snug transition-colors ${completedVideos.has(video.id) ? "text-slate-400 line-through" : "text-slate-800"
                                                }`}>
                                                {index + 1}. {video.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                                    {video.channelTitle}
                                                </span>
                                                {activeVideoId === video.id && (
                                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
