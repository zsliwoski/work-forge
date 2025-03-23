"use client"
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import CreateOrganizationPage from "@/src/app/create-organization/page"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"

// Mock the dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}))

jest.mock("@/src/components/ui/use-toast", () => ({
    useToast: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock the UI components
jest.mock("@/src/components/ui/button", () => ({
    Button: ({ children, onClick, type, disabled, variant, size, className }) => (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            data-variant={variant}
            data-size={size}
            className={className}
            data-testid="button"
        >
            {children}
        </button>
    ),
}))

jest.mock("@/src/components/ui/card", () => ({
    Card: ({ children }) => <div data-testid="card">{children}</div>,
    CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
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

jest.mock("@/src/components/ui/input", () => ({
    Input: ({ placeholder, ...props }) => (
        <input placeholder={placeholder} data-testid={`input-${placeholder}`} {...props} />
    ),
}))

jest.mock("@/src/components/ui/textarea", () => ({
    Textarea: ({ placeholder, className, ...props }) => (
        <textarea placeholder={placeholder} className={className} data-testid={`textarea-${placeholder}`} {...props} />
    ),
}))

jest.mock("@/src/components/ui/form", () => ({
    Form: ({ children, ...props }) => (
        <div data-testid="form" {...props}>
            {children}
        </div>
    ),
    FormControl: ({ children }) => <div data-testid="form-control">{children}</div>,
    FormDescription: ({ children }) => <div data-testid="form-description">{children}</div>,
    FormField: ({ children, control, name, render }) => {
        const field = { name, value: "", onChange: jest.fn() }
        return <div data-testid={`form-field-${name}`}>{render({ field })}</div>
    },
    FormItem: ({ children }) => <div data-testid="form-item">{children}</div>,
    FormLabel: ({ children }) => <div data-testid="form-label">{children}</div>,
    FormMessage: () => <div data-testid="form-message"></div>,
}))

jest.mock("@/src/components/ui/separator", () => ({
    Separator: () => <div data-testid="separator" />,
}))

jest.mock("lucide-react", () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    ArrowRight: () => <div data-testid="arrow-right-icon" />,
    ArrowLeft: () => <div data-testid="arrow-left-icon" />,
    Building: () => <div data-testid="building-icon" />,
    Users: () => <div data-testid="users-icon" />,
}))

// Mock the schema
jest.mock("@/src/lib/schema", () => ({
    organizationSchema: {
        parse: jest.fn(),
    },
}))

describe("CreateOrganizationPage Component", () => {
    const mockPush = jest.fn()
    const mockToast = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            // Setup router mock
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })

            // Setup toast mock
            ; (useToast as jest.Mock).mockReturnValue({
                toast: mockToast,
            })

            // Mock fetch to resolve successfully
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ id: "org-123" }),
            })
    })

    test("renders organization details form in step 1", () => {
        render(<CreateOrganizationPage />)

        // Check if step 1 content is rendered
        expect(screen.getByText("I. Organization Details")).toBeInTheDocument()
        expect(screen.getByText("Organization Name")).toBeInTheDocument()
        expect(screen.getByText("Description (Optional)")).toBeInTheDocument()

        // Check if the Next button is rendered
        const nextButton = screen.getByText("Next")
        expect(nextButton).toBeInTheDocument()
        expect(nextButton.closest("button")).not.toBeDisabled()
    })

    test("navigates to step 2 when Next button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Fill in organization name (required field)
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })

        // Click the Next button
        fireEvent.click(screen.getByText("Next"))

        // Check if step 2 content is rendered
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Check if the Back button is rendered
        expect(screen.getByText("Back")).toBeInTheDocument()

        // Check if the Create Organization button is rendered
        expect(screen.getByText("Create Organization")).toBeInTheDocument()
    })

    test("navigates back to step 1 when Back button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Fill in organization name and go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Click the Back button
        fireEvent.click(screen.getByText("Back"))

        // Check if step 1 content is rendered again
        await waitFor(() => {
            expect(screen.getByText("I. Organization Details")).toBeInTheDocument()
        })
    })

    test("adds a new team when Add Another Team button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Check if Team 1 is rendered
        expect(screen.getByText("Team 1")).toBeInTheDocument()

        // Click the Add Another Team button
        fireEvent.click(screen.getByText("Add Another Team"))

        // Check if Team 2 is rendered
        await waitFor(() => {
            expect(screen.getByText("Team 2")).toBeInTheDocument()
        })
    })

    test("removes a team when remove button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Add a second team
        fireEvent.click(screen.getByText("Add Another Team"))

        // Wait for Team 2 to render
        await waitFor(() => {
            expect(screen.getByText("Team 2")).toBeInTheDocument()
        })

        // Get all remove team buttons
        const removeButtons = screen.getAllByTestId("trash-icon")

        // Click the remove button for Team 2
        fireEvent.click(removeButtons[0].closest("button")!)

        // Check if Team 2 is removed
        await waitFor(() => {
            expect(screen.queryByText("Team 2")).not.toBeInTheDocument()
        })
    })

    test("shows error toast when trying to remove the only team", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Get the remove team button
        const removeButton = screen.getAllByTestId("trash-icon")[0].closest("button")!

        // Click the remove button for the only team
        fireEvent.click(removeButton)

        // Check if error toast was called
        expect(mockToast).toHaveBeenCalledWith({
            title: "Cannot remove team",
            description: "You need at least one team in your organization.",
            variant: "destructive",
        })
    })

    test("adds a new member when Add Member button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Check if one member input is rendered
        const memberInputs = screen.getAllByTestId("input-member@example.com")
        expect(memberInputs.length).toBe(1)

        // Click the Add Member button
        fireEvent.click(screen.getByText("Add Member"))

        // Check if two member inputs are rendered
        await waitFor(() => {
            const updatedMemberInputs = screen.getAllByTestId("input-member@example.com")
            expect(updatedMemberInputs.length).toBe(2)
        })
    })

    test("removes a member when remove button is clicked", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Add a second member
        fireEvent.click(screen.getByText("Add Member"))

        // Wait for the second member input to render
        await waitFor(() => {
            const memberInputs = screen.getAllByTestId("input-member@example.com")
            expect(memberInputs.length).toBe(2)
        })

        // Get all remove member buttons
        const removeButtons = screen.getAllByTestId("trash-icon")

        // Click the remove button for the second member
        fireEvent.click(removeButtons[1].closest("button")!)

        // Check if the second member is removed
        await waitFor(() => {
            const memberInputs = screen.getAllByTestId("input-member@example.com")
            expect(memberInputs.length).toBe(1)
        })
    })

    test("shows error toast when trying to remove the only member", async () => {
        render(<CreateOrganizationPage />)

        // Go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Get the remove member button
        const removeButtons = screen.getAllByTestId("trash-icon")
        const removeMemberButton = removeButtons[1].closest("button")!

        // Click the remove button for the only member
        fireEvent.click(removeMemberButton)

        // Check if error toast was called
        expect(mockToast).toHaveBeenCalledWith({
            title: "Cannot remove member",
            description: "Each team needs at least one member.",
            variant: "destructive",
        })
    })

    test("submits the form and creates organization successfully", async () => {
        render(<CreateOrganizationPage />)

        // Fill in organization details and go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })

        const descriptionInput = screen.getByTestId("textarea-Brief description of your organization")
        fireEvent.change(descriptionInput, { target: { value: "This is a test organization" } })

        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Fill in team details
        const teamNameInput = screen.getByTestId("input-Engineering")
        fireEvent.change(teamNameInput, { target: { value: "Engineering Team" } })

        const memberEmailInput = screen.getByTestId("input-member@example.com")
        fireEvent.change(memberEmailInput, { target: { value: "test@example.com" } })

        // Submit the form
        fireEvent.click(screen.getByText("Create Organization"))

        // Check if the form submission is in progress
        expect(screen.getByText("Creating...")).toBeInTheDocument()

        // Check if API was called with the correct data
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "/api/organization",
                expect.objectContaining({
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }),
            )
        })

        // Check if success toast was shown
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Organization created!",
                description: expect.stringContaining("Test Organization"),
            })
        })

        // Check if redirect happened
        expect(mockPush).toHaveBeenCalledWith("/")
    })

    test("handles API error during form submission", async () => {
        // Mock fetch to return an error
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: "Internal Server Error",
        })

        render(<CreateOrganizationPage />)

        // Fill in organization details and go to step 2
        const orgNameInput = screen.getByTestId("input-Acme Inc.")
        fireEvent.change(orgNameInput, { target: { value: "Test Organization" } })
        fireEvent.click(screen.getByText("Next"))

        // Wait for step 2 to render
        await waitFor(() => {
            expect(screen.getByText("II. Team Creation")).toBeInTheDocument()
        })

        // Submit the form
        fireEvent.click(screen.getByText("Create Organization"))

        // Check if error toast was shown
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Error",
                description: "There was an error creating your organization.",
                variant: "destructive",
            })
        })
    })
})

