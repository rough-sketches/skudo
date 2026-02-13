import { Course, Video } from "@/types";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchPlaylistAsCourse(playlistId: string): Promise<Course | null> {
    if (!YOUTUBE_API_KEY) {
        console.error("YouTube API Key is missing");
        throw new Error("YouTube API Key is missing");
    }

    try {
        // 1. Fetch Playlist Details (Title, Description)
        const playlistResponse = await fetch(
            `${YOUTUBE_API_BASE}/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
        );
        const playlistData = await playlistResponse.json();

        if (!playlistData.items || playlistData.items.length === 0) {
            console.error("Playlist not found");
            return null;
        }

        const playlistSnippet = playlistData.items[0].snippet;

        // 2. Fetch Playlist Items (Videos)
        // Note: This fetches only the first 50 items. For production, we'd need pagination.
        const itemsResponse = await fetch(
            `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
        );
        const itemsData = await itemsResponse.json();

        if (!itemsData.items) {
            return null;
        }

        const videos: Video[] = itemsData.items
            .filter((item: any) => item.snippet.title !== "Private video") // Filter out private videos
            .map((item: any) => ({
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
                channelTitle: item.snippet.channelTitle,
                position: item.snippet.position,
            }));

        return {
            id: playlistId, // Using playlistId as courseId for simplicity
            playlistId: playlistId,
            title: playlistSnippet.title,
            description: playlistSnippet.description,
            thumbnailUrl: playlistSnippet.thumbnails?.high?.url || playlistSnippet.thumbnails?.medium?.url || "",
            totalVideos: videos.length,
            videos: videos,
        };
    } catch (error) {
        console.error("Error fetching playlist:", error);
        throw error;
    }
}
