"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseCardProps {
    course: {
        playlistId: string;
        title: string;
        thumbnailUrl: string;
        totalVideos: number;
        completedVideoIds: string[];
        lastUpdated: number;
    };
}

export function CourseCard({ course }: CourseCardProps) {
    const progress = Math.round((course.completedVideoIds.length / course.totalVideos) * 100) || 0;

    return (
        <Link href={`/course/${course.playlistId}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 group h-full flex flex-col">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200/50">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <CardHeader className="p-4 space-y-1 flex-1">
                    <CardTitle className="text-lg font-bold line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {course.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span>{course.completedVideoIds.length} / {course.totalVideos} Videos</span>
                        <span>{progress}%</span>
                    </div>
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Updated {new Date(course.lastUpdated).toLocaleDateString()}
                    </p>
                </CardFooter>
            </Card>
        </Link>
    );
}
