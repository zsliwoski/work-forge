"use server"
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_SECRET);

interface InviteEmailData {
    email: string;
    teamName: string;
    inviteLink: string;
}

export async function sendInviteEmail(data: InviteEmailData) {
    const fromEmail = process.env.RESEND_EMAIL;
    const toEmail = data.email;

    if (!fromEmail || !toEmail) {
        throw new Error('Email addresses are required');
    }

    const emailContent = `
        Hi there!,

        You have been invited to join our work-forge team

        ${data.teamName}

        Please click the link below to accept the invitation:
        ${data.inviteLink}

        Best regards,
        The Team
    `;

    try {

        const response = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: `Invite to join ${data.teamName}`,
            text: emailContent,
        });
        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}