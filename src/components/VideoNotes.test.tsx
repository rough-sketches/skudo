import { render, screen, fireEvent } from '@testing-library/react'
import { VideoNotes } from '@/components/VideoNotes'
import { vi, describe, it, expect } from 'vitest'

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Clock: () => <div>Clock</div>,
    Plus: () => <div>Plus</div>,
    Trash2: () => <div>Trash</div>,
}))

describe('VideoNotes', () => {
    const mockProps = {
        videoId: 'v1',
        playlistId: 'p1',
        userId: 'u1',
        currentTime: 125,
        onSeek: vi.fn(),
    }

    it('renders correctly and handles note text input', () => {
        render(<VideoNotes {...mockProps} />)

        expect(screen.getByText('Video Notes')).toBeInTheDocument()
        const input = screen.getByPlaceholderText(/Add note at 02:05/i)
        expect(input).toBeInTheDocument()

        fireEvent.change(input, { target: { value: 'Important concept' } })
        expect(input).toHaveValue('Important concept')
    })
})
