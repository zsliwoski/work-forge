/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import Home from "@/src/app/page"
import { useUser } from "@/src/contexts/user-provider"
import { useRouter } from "next/navigation"

// Mock the dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}))

jest.mock("@/src/app/landing-page/landing-page", () => {
    return jest.fn(() => <div data-testid="landing-page">Landing Page Mock</div>)
})

jest.mock("@/src/contexts/user-provider", () => ({
    __esModule: true,
    useUser: jest.fn(),
}))



describe("Home Component", () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
    })

    test("renders LandingPage when user is not authenticated", () => {
        // Setup user mock to return null (not authenticated)
        ; (useUser as jest.Mock).mockReturnValue({ user: null })

        render(<Home />)

        // Check if LandingPage is rendered
        expect(screen.getByTestId("landing-page")).toBeInTheDocument()
        expect(mockPush).not.toHaveBeenCalled()
    })

    test("redirects to invite page when user has no team roles", () => {
        // Setup user mock with no team roles
        const mockUser = {
            TeamRoles: [],
        }
            ; (useUser as jest.Mock).mockReturnValue({ user: mockUser })

        render(<Home />)

        // Check if router.push was called with the correct path
        expect(mockPush).toHaveBeenCalledWith("/invite")
        expect(screen.getByText("Redirecting to dashboard...")).toBeInTheDocument()
    })

    test("redirects to dashboard when user has team roles", () => {
        // Setup user mock with team roles
        const mockUser = {
            TeamRoles: [
                {
                    Team: {
                        id: "team-123",
                    },
                },
            ],
        }
            ; (useUser as jest.Mock).mockReturnValue({ user: mockUser })

        render(<Home />)

        // Check if router.push was called with the correct path
        expect(mockPush).toHaveBeenCalledWith("/dashboard/team-123")
        expect(screen.getByText("Redirecting to dashboard...")).toBeInTheDocument()
    })
})

