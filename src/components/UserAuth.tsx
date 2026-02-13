"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export function UserAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Hi, {user.displayName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <Button size="sm" onClick={handleLogin}>
            Sign In with Google
        </Button>
    );
}
