import { z } from 'zod';

//Define the schema for the team object
export const teamSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    invitations: z.array(z.object({
        email: z.string().min(1, 'Member ID is required'),
        role: z.string().optional(),
    })).optional().default([]),
});

// Define the schema for the organization object
export const organizationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
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