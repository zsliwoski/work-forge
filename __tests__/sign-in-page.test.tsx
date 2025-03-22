"use client"
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SignInPage from '@/src/app/sign-in/page'
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"
import { signIn } from "next-auth/react"

// Mock the dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}))

jest.mock("@/src/components/ui/use-toast", () => ({
    useToast: jest.fn(),
}))

jest.mock("next-auth/react", () => ({
    signIn: jest.fn(),
}))

// Mock the UI components
jest.mock("@/src/components/ui/button", () => ({
    Button: ({ children, onClick, type, disabled, variant, className }) => (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            data-variant={variant}
            className={className}
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

jest.mock("@/src/components/ui/input", () => ({
    Input: ({ id, type, placeholder, value, onChange, required }) => (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            data-testid={id}
        />
    ),
}))

jest.mock("@/src/components/ui/label", () => ({
    Label: ({ htmlFor, children }) => (
        <label htmlFor={htmlFor} data-testid={`label-${htmlFor}`}>
            {children}
        </label>
    ),
}))

jest.mock("@/src/components/ui/separator", () => ({
    Separator: ({ className }) => <div className={className} data-testid="separator" />,
}))

jest.mock("lucide-react", () => ({
    Github: () => <div data-testid="github-icon" />,
    Ticket: () => <div data-testid="ticket-icon" />,
}))

describe("SignInPage Component", () => {
    const mockPush = jest.fn()
    const mockToast = jest.fn()

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
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test("renders sign in form correctly", () => {
        render(<SignInPage />)

        // Check if the header is rendered
        expect(screen.getByText("WorkForge")).toBeInTheDocument()

        // Check if the form elements are rendered
        expect(screen.getByTestId("card-title")).toHaveTextContent("Sign in to WorkForge")
        expect(screen.getByTestId("email")).toBeInTheDocument()
        expect(screen.getByTestId("password")).toBeInTheDocument()
        expect(screen.getByText("Sign In with Email")).toBeInTheDocument()

        // Check if social sign in buttons are rendered
        expect(screen.getByText("GitHub")).toBeInTheDocument()
        expect(screen.getByText("Google")).toBeInTheDocument()
    })

    test("handles GitHub sign in correctly", async () => {
        // Mock successful sign in
        ; (signIn as jest.Mock).mockResolvedValue({ error: null })

        render(<SignInPage />)

        // Click GitHub sign in button
        fireEvent.click(screen.getByText("GitHub"))

        // Check if signIn was called with the correct provider
        expect(signIn).toHaveBeenCalledWith("github", { callbackUrl: "/" })

        // Wait for the promise to resolve
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })

        // Check if toast was called with the correct message
        expect(mockToast).toHaveBeenCalledWith({
            title: "Signed in successfully",
            description: "Welcome back to WorkForge! Signed in with github.",
        })
    })

    test("handles Google sign in correctly", async () => {
        // Mock successful sign in
        ; (signIn as jest.Mock).mockResolvedValue({ error: null })

        render(<SignInPage />)

        // Click Google sign in button
        fireEvent.click(screen.getByText("Google"))

        // Check if signIn was called with the correct provider
        expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" })

        // Wait for the promise to resolve
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })

        // Check if toast was called with the correct message
        expect(mockToast).toHaveBeenCalledWith({
            title: "Signed in successfully",
            description: "Welcome back to WorkForge! Signed in with google.",
        })
    })

    test("handles sign in error correctly", async () => {
        // Mock sign in error
        const errorMessage = "Authentication failed"
            ; (signIn as jest.Mock).mockResolvedValue({ error: errorMessage })

        render(<SignInPage />)

        // Click GitHub sign in button
        fireEvent.click(screen.getByText("GitHub"))

        // Wait for the promise to resolve
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Error signing in",
                description: errorMessage,
                variant: "destructive",
            })
        })
    })

    test("handles sign in exception correctly", async () => {
        // Mock sign in throwing an exception
        const errorMessage = "Network error"
            ; (signIn as jest.Mock).mockRejectedValue(new Error(errorMessage))

        render(<SignInPage />)

        // Click GitHub sign in button
        fireEvent.click(screen.getByText("GitHub"))

        // Wait for the promise to reject
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Error signing in",
                description: errorMessage,
                variant: "destructive",
            })
        })
    })

    test("navigates to landing page when clicking on logo", () => {
        render(<SignInPage />)

        // Click on the logo
        fireEvent.click(screen.getByText("WorkForge"))

        // Check if router.push was called with the correct path
        expect(mockPush).toHaveBeenCalledWith("/landing-page")
    })
})

