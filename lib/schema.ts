import { z } from 'zod';

// Define the schema for the invite form
export const inviteFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'manager', 'developer', 'viewer'], {
        required_error: 'Please select a role',
    }),
});

//Define the schema for the team object
export const teamSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    invitations: z.array(inviteFormSchema).optional().default([]),
    icon: z.string().max(1, 'Icon must be a single character').optional().default(''),
});

// Define the schema for the organization object
export const organizationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    icon: z.string().max(1, 'Icon must be a single character').optional().default(''),
    description: z.string().optional(),
    teams: z.array(teamSchema).optional().default([])
});

// Define the schema for the ticket object
export const ticketSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().optional(),
    status: z.enum(['OPEN', 'IN PROGRESS', 'BLOCKED', 'CLOSED']).optional(),
    sprintId: z.string().optional(),
    priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
    assigneeId: z.string().optional(),
    tags: z.array(z.string()).max(10, "Must have less than 32 tags").optional().default([]),
});

// Define the schema for the sprint object
export const sprintSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    teamId: z.string().min(1, 'Team ID is required'),
    completed: z.boolean().optional(),
});

// Define the schema for the article object
export const pageSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
});

// Define the schema for the comment object
export const commentSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    authorId: z.string().min(1, 'Author ID is required'),
    ticketId: z.string().min(1, 'Ticket ID is required'),
});

export const teamInviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.number().int().max(3, 'Invalid role').min(0, 'Invalid role'),
});
