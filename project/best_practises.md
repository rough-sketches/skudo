# Skudo Development Best Practices 💡

This document tracks technical insights and best practices derived from common pitfalls encountered during development. Follow these to prevent regressions and maintain code quality.

## 1. Next.js & React (Client/Server)

### Directive Discipline
- **"use client"**: Always add this directive at the very top of files that use React hooks (`useState`, `useEffect`), browser APIs (`window`), or event handlers. 
- **Hydration Safety**: Avoid using browser-only variables (like `window.localStorage`) directly in the initial render or `useState` initializers. Wrap them in `useEffect` to ensure the server and client initial HTML match.

### Component Isolation
- Keep complex logic like the YouTube Player or Video Notes in standalone components. This makes testing easier and prevents a crash in one feature from taking down the entire page.

## 2. Firebase & Data Persistence

### Atomic Saves
- When updating course progress, use `{ merge: true }` in `setDoc` to prevent accidentally overwriting other fields (like notes or metadata).

### Mocking for Tests
- **Comprehensive Mocks**: When adding new Firebase functionality (e.g., Auth Emulators, Firestore `where` queries), ensure the corresponding mock in `src/test/setup.ts` is updated. Missing exports like `connectAuthEmulator` or `getApps` will cause test suites to fail.
- **Cleanup Handlers**: Mock functions like `onSnapshot` must return a cleanup function (unsubscribe) to prevent "unsubscribe is not a function" errors during component unmounting in tests.

## 3. State Restoration & Race Conditions

### Player Initialization
- **The "Ready" Check**: Never attempt to control the YouTube player (e.g., `seekTo`) before the `onReady` event has fired. 
- **State Sync**: Use a dedicated `useEffect` that monitors both the `player` instance and the `restoredTimestamp`. Trigger the seek only when both are present and valid.

## 4. CSS & UI
- **Responsive-First**: Always use mobile-friendly classes (e.g., `aspect-video`, `container mx-auto p-4 lg:p-8`). Test UI changes at multiple zoom levels and screen sizes.
- **Z-Index Awareness**: Be careful with `sticky` positioning on video players; ensure they don't overlap with navigation menus or modals.

## 5. Security & Secrets
- **SecretLint**: Always run `npm run secret-scan` before pushing code. Never commit `.env.local` or hardcoded API keys.
