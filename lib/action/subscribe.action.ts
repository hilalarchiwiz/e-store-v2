'use server';

import prisma from '@/lib/prisma';

export async function subscribeEmail(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const existing = await prisma.subscribe.findFirst({ where: { email } });
    if (existing) {
      return { success: false, error: 'This email is already subscribed.' };
    }

    await prisma.subscribe.create({ data: { email } });
    return { success: true };
  } catch (error) {
    console.error('Subscribe error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
