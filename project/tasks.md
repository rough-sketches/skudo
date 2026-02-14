# Skudo Project Roadmap & Pending Tasks

This document outlines the planned enhancements and future features for the Skudo YouTube Course Tracker.

## 🏗️ Infrastructure & Quality

### 0. Dev Environment & Testing
- [x] **Unit Testing**: Setup Vitest and React Testing Library for core logic and components.
- [x] **E2E Testing**: Setup Playwright for critical user flows (Login, Course Enrollment).
- [x] **Local Firebase Emulators**: Configure emulators for Auth and Firestore to avoid using production data during dev.

## 🚀 Priority Roadmap

### 1. "My Courses" Dashboard
- [x] **Implementation**: Create a dedicated view for logged-in users to see their collection of started courses.
- [x] **Details**: Show progress bars, last-watched timestamps, and metadata (thumbnail, title) for each playlist saved in Firestore.

### 2. Video Notes & Timestamps
- [x] **Implementation**: Add a "Notes" section below or beside the video player.
- [x] **Details**: Allow users to save text notes tied to specific timestamps in the video. Clicking a note should seek the player to that time.

### 3. Dark Mode Support
- [ ] **Implementation**: Leverage Tailwind's `dark` mode and Shadcn/UI themes.
- [ ] **Details**: Add a theme toggle in the header and ensure all components (Cards, ScrollArea, Inputs) have appropriate dark variants.

### 4. Playlist Search (In-App)
- [ ] **Implementation**: Integrate the YouTube Search API.
- [ ] **Details**: Instead of requiring a URL, allow users to search for topics (e.g., "React Tutorial") and see a list of playlists to start immediately.

## 🛠️ Performance & Polish

### 5. Skeleton Loading States
- [ ] **Implementation**: Replace the "Loading course..." text with Shadcn Skeleton components.
- [ ] **Details**: Animate placeholder cards and lines to match the final layout while `swr` fetches data.

### 6. Course Sorting & Management
- [ ] **Implementation**: Add filtering and sorting to the dashboard.
- [ ] **Details**: Sort courses by "Most Recent," "Most Complete," or "Alphabetical." Allow users to "Archive" completed courses.

### 7. Offline Support (PWA)
- [ ] **Implementation**: Add `next-pwa` or basic service workers.
- [ ] **Details**: Enable the app to be "installed" on mobile/desktop and allow checking off videos while offline, with background sync to Firestore.
