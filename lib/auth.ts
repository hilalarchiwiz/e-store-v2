import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { mergeGuestDataToUser } from './action/home.action'
import { sendEmail } from './mailer'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    socialProviders: {
        google: {
            prompt: 'select_account',
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            // redirectUri: process.env.GOOGLE_REDIRECT_URI,
        }
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: 'Reset your password',
                html: `
                    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                        <h2>Reset Your Password</h2>
                        <p>Hi ${user.name || user.email},</p>
                        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
                        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
                        <p style="margin-top:16px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `,
            });
        }
    },
    user: {
        additionalFields: {
            roleName: {
                type: 'string',
            }
        },
    },
})