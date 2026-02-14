"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plus, Trash2 } from "lucide-react";
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VideoNote } from "@/types";

interface VideoNotesProps {
    videoId: string;
    playlistId: string;
    userId: string;
    currentTime: number;
    onSeek: (time: number) => void;
}

export function VideoNotes({ videoId, playlistId, userId, currentTime, onSeek }: VideoNotesProps) {
    const [noteText, setNoteText] = useState("");
    const [notes, setNotes] = useState<VideoNote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !videoId) return;

        const notesRef = collection(db, "users", userId, "courses", playlistId, "notes");
        const q = query(
            notesRef,
            where("videoId", "==", videoId),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as VideoNote));
            setNotes(fetchedNotes);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [videoId, playlistId, userId]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;

        try {
            const notesRef = collection(db, "users", userId, "courses", playlistId, "notes");
            await addDoc(notesRef, {
                videoId,
                playlistId,
                userId,
                text: noteText,
                timestamp: Math.floor(currentTime),
                createdAt: Date.now()
            });
            setNoteText("");
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const noteRef = doc(db, "users", userId, "courses", playlistId, "notes", noteId);
            await deleteDoc(noteRef);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    return (
        <Card className="border-slate-200 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Video Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleAddNote} className="p-4 border-b border-slate-100 flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder={`Add note at ${formatTime(currentTime)}...`}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                            {formatTime(currentTime)}
                        </span>
                    </div>
                    <Button type="submit" size="icon" disabled={!noteText.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic">Loading notes...</div>
                    ) : notes.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic">
                            No notes for this video yet. Take some notes to help you learn!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notes.map((note) => (
                                <div key={note.id} className="p-4 group hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start gap-3">
                                        <button
                                            onClick={() => onSeek(note.timestamp)}
                                            className="text-[11px] font-mono font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            <Clock className="h-3 w-3" />
                                            {formatTime(note.timestamp)}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                                        {note.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
