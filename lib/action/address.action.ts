"use server";

import prisma from "@/lib/prisma";
import generateSession from "@/lib/generate-session";
import { revalidatePath } from "next/cache";

export interface AddressData {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  phone: string;
  email: string;
  isDefault?: boolean;
}

async function getAuthUser() {
  const session = await generateSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user;
}

export async function getAddresses() {
  try {
    const user = await getAuthUser();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return { success: true, addresses };
  } catch (error) {
    return { success: false, addresses: [], error: (error as Error).message };
  }
}

export async function createAddress(data: AddressData) {
  try {
    const user = await getAuthUser();

    // If this is set as default, unset all others first
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // If no other addresses exist, make this the default
    const count = await prisma.address.count({ where: { userId: user.id } });
    const isDefault = data.isDefault || count === 0;

    await prisma.address.create({
      data: { ...data, isDefault, userId: user.id },
    });

    revalidatePath("/v2/dashboard/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAddress(id: string, data: AddressData) {
  try {
    const user = await getAuthUser();

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { success: false, error: "Address not found" };

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.update({ where: { id }, data });

    revalidatePath("/v2/dashboard/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAddress(id: string) {
  try {
    const user = await getAuthUser();

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { success: false, error: "Address not found" };

    await prisma.address.delete({ where: { id } });

    // If the deleted address was default, make the oldest remaining one default
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/v2/dashboard/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const user = await getAuthUser();

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { success: false, error: "Address not found" };

    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });

    revalidatePath("/v2/dashboard/addresses");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
