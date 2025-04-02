import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '@/src/components/sidebar'
import { usePathname } from 'next/navigation'
import { useUser } from '@/src/contexts/user-provider'
import { useTeam } from '@/src/contexts/team-provider'

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}))

// Mock the context hooks
jest.mock('@/src/contexts/user-provider', () => ({
    useUser: jest.fn(),
}))

jest.mock('@/src/contexts/team-provider', () => ({
    useTeam: jest.fn(),
}))

// Mock the child components
jest.mock('@/src/components/user-badge', () => ({
    UserBadge: ({ expanded }) => <div data-testid="user-badge">{expanded ? 'Expanded' : 'Collapsed'}</div>,
}))

jest.mock('@/src/components/team-selector', () => ({
    TeamSelector: () => <div data-testid="team-selector">Team Selector</div>,
}))

jest.mock('@/src/components/organization-badge', () => ({
    OrganizationBadge: () => <div data-testid="org-badge">Organization Badge</div>,
}))

describe('Sidebar Component', () => {
    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        TeamRoles: [
            {
                Team: {
                    id: 'team1',
                    name: 'Team 1',
                    icon: 'T1',
                    Organization: {
                        id: 'org1',
                        name: 'Organization 1',
                        icon: 'O1',
                    },
                },
            },
        ],
    }

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

            // Setup default mocks
            ; (usePathname as jest.Mock).mockReturnValue('/dashboard/team1')
            ; (useUser as jest.Mock).mockReturnValue({ user: mockUser })
            ; (useTeam as jest.Mock).mockReturnValue({ teamId: 'team1' })
    })

    test('renders expanded sidebar by default', () => {
        render(<Sidebar />)

        // Check that the sidebar is expanded
        expect(screen.getByText('WorkForge')).toBeInTheDocument()
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Sprint Board')).toBeInTheDocument()
        expect(screen.getByTestId('user-badge')).toHaveTextContent('Expanded')
    })

    test('collapses sidebar when toggle button is clicked', () => {
        render(<Sidebar />)

        // Find and click the collapse button
        const collapseButton = screen.getByLabelText('Collapse sidebar')
        fireEvent.click(collapseButton)

        // Check that the sidebar is collapsed
        expect(screen.queryByText('WorkForge')).not.toBeInTheDocument()
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
        expect(screen.getByTestId('user-badge')).toHaveTextContent('Collapsed')
    })

    test('expands sidebar when toggle button is clicked in collapsed state', () => {
        render(<Sidebar />)

        // First collapse the sidebar
        const collapseButton = screen.getByLabelText('Collapse sidebar')
        fireEvent.click(collapseButton)

        // Then expand it again
        const expandButton = screen.getByLabelText('Expand sidebar')
        fireEvent.click(expandButton)

        // Check that the sidebar is expanded again
        expect(screen.getByText('WorkForge')).toBeInTheDocument()
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    test('highlights active navigation item', () => {
        render(<Sidebar />)

        // Find all navigation links
        const navLinks = screen.getAllByRole('link')

        // The Dashboard link should be active (current pathname is /dashboard/team1)
        const dashboardLink = navLinks.find(link => link.textContent?.includes('Dashboard'))
        expect(dashboardLink).toHaveClass('bg-primary')

        // Other links should not be active
        const sprintBoardLink = navLinks.find(link => link.textContent?.includes('Sprint Board'))
        expect(sprintBoardLink).not.toHaveClass('bg-primary')
    })

    test('renders team and organization information when expanded', () => {
        render(<Sidebar />)

        // Check that team and organization components are rendered
        expect(screen.getByTestId('org-badge')).toBeInTheDocument()
        expect(screen.getByTestId('team-selector')).toBeInTheDocument()
    })

    test('renders team and organization icons when collapsed', () => {
        render(<Sidebar />)

        // First collapse the sidebar
        const collapseButton = screen.getByLabelText('Collapse sidebar')
        fireEvent.click(collapseButton)

        // Check that team and organization icons are rendered
        const icons = screen.getAllByText(/T1|O1/)
        expect(icons.length).toBe(2)
    })

    test('renders correct navigation links with team ID', () => {
        render(<Sidebar />)

        // Check that all navigation links have the correct href
        const navLinks = screen.getAllByRole('link')

        // Skip the first link (home link)
        const navigationLinks = navLinks.slice(1)

        // Check each navigation link has the team ID in the href
        navigationLinks.forEach(link => {
            expect(link.getAttribute('href')).toContain('team1')
        })
    })
})