export interface Video {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    position: number;
}

export interface Course {
    id: string; // generated ID (could be same as playlistId for simplicity, or UUID)
    playlistId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    totalVideos: number;
    videos: Video[];
}

export interface UserCourseProgress {
    courseId: string;
    completedVideoIds: string[];
    lastUpdated: number; // timestamp
    lastVideoId?: string;
    lastTimestamp?: number;
}

export interface VideoNote {
    id: string;
    videoId: string;
    playlistId: string;
    userId: string;
    timestamp: number;
    text: string;
    createdAt: number;
}
