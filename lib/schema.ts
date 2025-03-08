import { z } from 'zod';

//Define the schema for the team object
export const teamSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    ownerId: z.string().min(1, 'Owner ID is required'),
});

// Define the schema for the ticket object
export const ticketSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    teamId: z.string().min(1, 'Team ID is required'),
    status: z.enum(['OPEN', 'IN PROGRESS', 'BLOCKED', 'CLOSED']).optional(),
    sprintId: z.string().optional(),
    reporterId: z.string().min(1, 'Reporter ID is required'),
});

// Define the schema for the sprint object
export const sprintSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    teamId: z.string().min(1, 'Team ID is required'),
    completed: z.boolean().optional(),
});

// Define the schema for the article object
export const articleSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    authorId: z.string().min(1, 'Author ID is required'),
});

// Define the schema for the comment object
export const commentSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    authorId: z.string().min(1, 'Author ID is required'),
    ticketId: z.string().min(1, 'Ticket ID is required'),
});
