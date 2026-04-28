'use server'

import prisma from '@/lib/prisma'

export async function checkEmailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findFirst({ where: { email } })
    return !!user
}
