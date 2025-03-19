"use server"
import { Resend } from 'resend';

// NOTE: This may live in a cloud function or a separate serverless function
// this will make it easier to renotify users if the email fails to send
// or if the user needs to be reminded to accept the invite

const resend = new Resend(process.env.RESEND_EMAIL_SECRET);

interface InviteEmailData {
    email: string;
    teamName: string;
    inviteId: string;
}

export async function sendInviteEmail(data: InviteEmailData) {
    const fromEmail = process.env.RESEND_EMAIL;
    const toEmail = data.email;
    const domainUrl = process.env.DOMAIN_URL ? process.env.DOMAIN_URL : 'http://localhost:3000'
    const inviteLink = `${domainUrl}/invite/accepted?inviteId=${data.inviteId}`;

    if (!fromEmail || !toEmail) {
        throw new Error('Email addresses are required');
    }

    const emailContent = `
        Hi there!,

        You have been invited to join our work-forge team

        ${data.teamName}

        Please click the link below to accept the invitation:
        ${inviteLink}

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