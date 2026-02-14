import '@testing-library/jest-dom'
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

// Mock Firebase
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
}))
