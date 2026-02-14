"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { CourseCard } from "./CourseCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
    user: User;
    onAddNew: () => void;
}

export function Dashboard({ user, onAddNew }: DashboardProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const coursesRef = collection(db, "users", user.uid, "courses");
        const q = query(coursesRef, orderBy("lastUpdated", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const coursesData: any[] = [];
            querySnapshot.forEach((doc) => {
                coursesData.push({ id: doc.id, ...doc.data() });
            });
            setCourses(coursesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Learning Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user.displayName?.split(" ")[0]}! Continue where you left off.</p>
                </div>
                <Button onClick={onAddNew} className="gap-2 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" /> Start New Course
                </Button>
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center px-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">No courses yet</h2>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                        Paste a YouTube playlist URL to turn it into your first interactive course.
                    </p>
                    <Button variant="outline" onClick={onAddNew} className="mt-6">
                        Start Your First Course
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}
