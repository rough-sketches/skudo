# Skudo Development Learnings & Patterns 💡

This document captures architectural insights and efficient workflows discovered during the development of Skudo. These patterns help maintain a high-quality codebase and speed up future feature implementation.

## 1. Architectural Patterns

### Stable State Restoration
- **Pattern**: Use `useRef` for one-time initialization flags or to store third-party player instances (like YouTube).
- **Learning**: Using `useRef` for a `hasRestored` flag is more efficient than `useState` because it avoids an extra re-render cycle when synchronizing with external databases like Firestore. It also prevents infinite subscription loops in `useEffect`.

### Component-Driven Development
- **Pattern**: Decouple layout from logic using specialized components (e.g., `VideoNotes`, `CourseCard`).
- **Learning**: Keeping the "heavy lifting" (Firestore queries, YouTube API calls) inside focused components keeps the main page logic clean and responsive. It also makes unit testing with Vitest significantly more straightforward.

## 2. Efficiency Gains

### Firebase Emulator Suite
- **Insight**: Developing against the local Firebase Emulator (`:4000`) is vastly more efficient than deploying to live Firebase.
- **Workflow**: Keep the emulator running in a background tab to verify data shapes (Firestore) and authentication states in real-time without external network latency.

### Centralized Mocking
- **Insight**: Investing time in a robust `src/test/setup.ts` pays off quickly. 
- **Learning**: While mocked services need maintenance, they allow for instant feedback loops in UI development which is much faster than manual browser clicking for every state change.

## 3. UI/UX Refinements

### Directive Discipline
- **Insight**: Stick to a "Top-Down" `use client` approach. 
- **Learning**: Explicitly marking client components early avoids confusing hydration errors, especially when integrating with libraries that rely on browser globals like the YouTube IFrame API.

### Responsive-First Styling
- **Pattern**: Leverage Tailwind's arbitrary values and modifiers for "sticky" mobile players.
- **Learning**: Mobile layouts don't just need to be smaller subsets of desktop; they often benefit from different scrolling containers (e.g., `ScrollArea` for the playlist while the video remains fixed at the top).

## 4. Maintenance & Security

### Automated Pre-checks
- **Pattern**: Use Git Hooks (`Husky`) for more than just linting.
- **Learning**: Running a secret scan (`SecretLint`) automatically on every commit is a low-overhead way to ensure API keys (from `.env.local`) never leak into the repository.
