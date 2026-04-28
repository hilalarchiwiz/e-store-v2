import { nextCookies } from 'better-auth/next-js'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    plugins: [
        nextCookies(),
    ],
    user: {
        additionalFields: {
            roleName: {
                type: 'string',
            }
        }
    }
})

export const { signIn, signUp, signOut, useSession, updateUser, changePassword, requestPasswordReset, resetPassword } = authClient