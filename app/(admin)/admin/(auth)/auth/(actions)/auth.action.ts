'use server'

import { auth } from "@/lib/auth"


export async function login(formData: FormData) {
    try {
        const email = formData.get('email')
        const password = formData.get('password')
        if (!email || !password) {
            throw new Error('Invalid email or password')
        }

        await auth.signIn.email({
            email: email as string,
            password: password as string,
            callbackURL: "/admin/dashboard"
        })
    } catch (error) {
        console.log(error)
    }
}