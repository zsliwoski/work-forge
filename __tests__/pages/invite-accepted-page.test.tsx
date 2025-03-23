"use client"
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import InviteAcceptedPage from "@/src/app/invite/accepted/page"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import confetti from "canvas-confetti"

// Mock the dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
}))

jest.mock("canvas-confetti", () => ({
    __esModule: true,
    default: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock the UI components
jest.mock("@/src/components/ui/button", () => ({
    Button: ({ children, onClick, size, className }) => (
        <button onClick={onClick} data-size={size} className={className} data-testid="button">
            {children}
        </button>
    ),
}))

jest.mock("@/src/components/ui/card", () => ({
    Card: ({ children, className }) => (
        <div className={className} data-testid="card">
            {children}
        </div>
    ),
    CardContent: ({ children, className }) => (
        <div className={className} data-testid="card-content">
            {children}
        </div>
    ),
    CardDescription: ({ children }) => <div data-testid="card-description">{children}</div>,
    CardFooter: ({ children, className }) => (
        <div className={className} data-testid="card-footer">
            {children}
        </div>
    ),
    CardHeader: ({ children, className }) => (
        <div className={className} data-testid="card-header">
            {children}
        </div>
    ),
    CardTitle: ({ children, className }) => (
        <div className={className} data-testid="card-title">
            {children}
        </div>
    ),
}))

jest.mock("@/src/components/user-badge", () => ({
    UserBadge: () => <div data-testid="user-badge">User Badge</div>,
}))

jest.mock("lucide-react", () => ({
    CheckCircle2: () => <div data-testid="check-circle-icon" />,
    ArrowRight: () => <div data-testid="arrow-right-icon" />,
}))

describe("InviteAcceptedPage Component", () => {
    const mockPush = jest.fn()
    const mockGet = jest.fn()
    const mockInviteId = "mock-invite-id"
    const mockTeamId = "team-123"
    const mockTeamName = "Test Team"

    beforeEach(() => {
        jest.clearAllMocks()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })

            // Setup search params mock
            ; (useSearchParams as jest.Mock).mockReturnValue({
                get: mockGet,
            })
        mockGet.mockImplementation((param) => {
            if (param === "inviteId") return mockInviteId
            return null
        })

            // Setup session mock
            ; (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: {
                        email: "test@example.com",
                    },
                },
            })
    })

    test("redirects to homepage if no invite ID is found", async () => {
        // Override the mock to return null for inviteId
        mockGet.mockImplementation(() => null)

        render(<InviteAcceptedPage />)

        // Check if router.push was called with the homepage
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })

    test("redirects to homepage if no session is found", async () => {
        // Override the session mock to return null
        ; (useSession as jest.Mock).mockReturnValue({
            data: null,
        })

        render(<InviteAcceptedPage />)

        // Check if router.push was called with the homepage
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })

    test("shows loading state while accepting invite", () => {
        // Mock fetch to not resolve immediately
        ; (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }))

        render(<InviteAcceptedPage />)

        // Check if loading message is displayed
        expect(screen.getByText("Accepting your invitation...")).toBeInTheDocument()
    })

    test("handles successful invite acceptance", async () => {
        // Mock successful API response
        const mockRoleData = {
            Team: {
                id: mockTeamId,
                name: mockTeamName,
            },
        }
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockRoleData),
            })

        render(<InviteAcceptedPage />)

        // Check if API was called with the correct URL
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(`/api/invite/accept?inviteId=${mockInviteId}`, { method: "DELETE" })
        })

        // Check if success message is displayed
        await waitFor(() => {
            expect(screen.getByText(`Welcome to ${mockTeamName}!`)).toBeInTheDocument()
        })

        // Check if confetti was triggered
        expect(confetti).toHaveBeenCalled()
    })

    test("handles API error during invite acceptance", async () => {
        // Mock failed API response
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: "Not Found",
        })

        render(<InviteAcceptedPage />)

        // Check if router.push was called with the homepage on error
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })

    test("handles missing role data in API response", async () => {
        // Mock API response with null data
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(null),
        })

        render(<InviteAcceptedPage />)

        // Check if router.push was called with the homepage on error
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })

    test("navigates to dashboard when continue button is clicked", async () => {
        // Mock successful API response
        const mockRoleData = {
            Team: {
                id: mockTeamId,
                name: mockTeamName,
            },
        }
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockRoleData),
            })

        render(<InviteAcceptedPage />)

        // Wait for the success screen to appear
        await waitFor(() => {
            expect(screen.getByText(`Welcome to ${mockTeamName}!`)).toBeInTheDocument()
        })

        // Click the continue button
        fireEvent.click(screen.getByText("Continue to Dashboard"))

        // Check if router.push was called with the correct dashboard URL
        expect(mockPush).toHaveBeenCalledWith(`/dashboard/${mockTeamId}`)
    })
})

