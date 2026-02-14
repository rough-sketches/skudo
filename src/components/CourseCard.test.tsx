import { render, screen } from '@testing-library/react'
import { CourseCard } from '@/components/CourseCard'
import { vi, describe, it, expect } from 'vitest'

describe('CourseCard', () => {
    const mockCourse = {
        playlistId: 'test-id',
        title: 'Test Course',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        totalVideos: 10,
        completedVideoIds: ['1', '2'],
        lastUpdated: 1720000000000,
    }

    it('renders course information correctly', () => {
        render(<CourseCard course={mockCourse} />)

        expect(screen.getByText('Test Course')).toBeInTheDocument()
        expect(screen.getByText('2 / 10 Videos')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })
})
