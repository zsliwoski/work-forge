"use client"
/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { act } from "react" // Import act from react
import InvitePage from "@/src/app/invite/page"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/hooks/use-toast"
import { useSession } from "next-auth/react"

// Mock the dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}))

jest.mock("@/src/hooks/use-toast", () => ({
    useToast: jest.fn(),
}))

jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
}))

// Mock the UI components
jest.mock("@/src/components/ui/button", () => ({
    Button: ({ children, onClick, variant, size, className, "aria-label": ariaLabel }) => (
        <button
            onClick={onClick}
            data-variant={variant}
            data-size={size}
            className={className}
            aria-label={ariaLabel}
            data-testid="button"
        >
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
    CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children, className }) => (
        <div className={className} data-testid="card-title">
            {children}
        </div>
    ),
}))

jest.mock("@/src/components/ui/separator", () => ({
    Separator: () => <div data-testid="separator" />,
}))

jest.mock("lucide-react", () => ({
    Check: () => <div data-testid="check-icon" />,
    Copy: () => <div data-testid="copy-icon" />,
    ArrowRight: () => <div data-testid="arrow-right-icon" />,
}))

describe("InvitePage Component", () => {
    const mockPush = jest.fn()
    const mockToast = jest.fn()
    const mockEmail = "test@example.com"
    const mockWriteText = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })

            // Setup toast mock
            ; (useToast as jest.Mock).mockReturnValue({
                toast: mockToast,
            })

            // Setup session mock with user email
            ; (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: {
                        email: mockEmail,
                    },
                },
            })

        // Mock clipboard API
        Object.defineProperty(navigator, "clipboard", {
            value: {
                writeText: mockWriteText,
            },
            configurable: true,
        })

        // Mock setTimeout
        jest.spyOn(global, "setTimeout")
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test("renders invite page with user email", () => {
        render(<InvitePage />)

        // Check if the card title is rendered
        expect(screen.getByTestId("card-title")).toHaveTextContent("Your Account")

        // Check if user email is displayed
        expect(screen.getByText(mockEmail)).toBeInTheDocument()

        // Check if copy button is rendered
        expect(screen.getByLabelText("Copy email to clipboard")).toBeInTheDocument()

        // Check if create organization button is rendered
        expect(screen.getByText("Create Organization")).toBeInTheDocument()
    })

    test("copies email to clipboard when copy button is clicked", async () => {
        mockWriteText.mockResolvedValue(undefined)

        render(<InvitePage />)

        // Click the copy button wrapped in act
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Copy email to clipboard"))
        })

        // Check if clipboard API was called with the correct email
        expect(mockWriteText).toHaveBeenCalledWith(mockEmail)

        // Check if toast was called with success message
        expect(mockToast).toHaveBeenCalledWith({
            title: "Email copied",
            description: "Your email has been copied to clipboard",
        })

        // Check if the icon changes to check mark
        expect(screen.getByTestId("check-icon")).toBeInTheDocument()

        // Fast-forward timer wrapped in act
        await act(async () => {
            jest.advanceTimersByTime(2000)
        })

        // Check if the copied state is reset after 2 seconds
        expect(screen.getByTestId("copy-icon")).toBeInTheDocument()
    })

    test("shows error toast when clipboard copy fails", async () => {
        // Mock clipboard API to throw an error
        mockWriteText.mockRejectedValue(new Error("Clipboard error"))

        render(<InvitePage />)

        // Click the copy button wrapped in act
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Copy email to clipboard"))
        })

        // Check if toast was called with error message
        expect(mockToast).toHaveBeenCalledWith({
            title: "Failed to copy",
            description: "Could not copy email to clipboard",
            variant: "destructive",
        })

        // Check that the icon doesn't change to check mark
        expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument()
    })

    test("redirects to create organization page when button is clicked", async () => {
        render(<InvitePage />)

        // Click the create organization button wrapped in act
        await act(async () => {
            fireEvent.click(screen.getByText("Create Organization"))
        })

        // Check if router.push was called with the correct path
        expect(mockPush).toHaveBeenCalledWith("/create-organization")
    })

    test("handles case when session has no user email", async () => {
        // Setup session mock with no user email
        ; (useSession as jest.Mock).mockReturnValue({
            data: {
                user: {
                    email: null,
                },
            },
        })

        render(<InvitePage />)

        // Try to copy non-existent email wrapped in act
        await act(async () => {
            fireEvent.click(screen.getByLabelText("Copy email to clipboard"))
        })

        // Check that clipboard API was not called
        expect(mockWriteText).not.toHaveBeenCalled()
    })
})

