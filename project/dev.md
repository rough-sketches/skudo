# Skudo Development Guide

Welcome to the Skudo development environment! This guide will help you get started with the local dev server, testing infrastructure, and Firebase emulators.

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Setup environment variables**:
    Create a `.env.local` file with your Firebase and YouTube API keys.

3.  **Start the local environment**:
    We recommend using two terminal windows/tabs:

    **Terminal 1 (Firebase Emulators)**:
    ```bash
    npm run emulators:start
    ```
    *Access the Emulator UI at [http://localhost:4000](http://localhost:4000)*.

    **Terminal 2 (Next.js Dev Server)**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

### Unit & Integration Tests (Vitest)
Run tests once:
```bash
npm run test
```
Watch mode (recommended during dev):
```bash
npm run test:watch
```

### End-to-End Tests (Playwright)
Ensure the dev server is NOT running (the test runner will start its own):
```bash
npm run test:e2e
```

## 🔒 Security
Skudo uses a pre-commit hook to prevent secrets from being committed. If your commit is blocked, check the terminal output for the location of the detected secret.
