'use server';

import { PAGE_SIZE } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { gradingSchema } from "../validators/grading.validator";

// ===================== GET =====================

export async function getGradings(searchParams: any) {
    const query = searchParams.search || "";
    const currentPage = Number(searchParams.page) || 1;
    const itemsPerPage = Number(searchParams.limit) || PAGE_SIZE;
    const skip = (currentPage - 1) * itemsPerPage;

    const where = query
        ? {
            OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { description: { contains: query, mode: "insensitive" as const } },
            ],
        }
        : {};

    const [gradings, totalCount] = await Promise.all([
        prisma.grading.findMany({
            where,
            skip,
            take: itemsPerPage,
            orderBy: { createdAt: "desc" },
        }),
        prisma.grading.count({ where }),
    ]);

    return {
        success: true,
        gradings,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        totalCount,
    };
}

// ===================== CREATE =====================

export async function createGrading(_: any, formData: FormData) {
    const parsed = gradingSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0].message,
        };
    }

    await prisma.grading.create({
        data: {
            title: parsed.data.title,
            description: parsed.data.description ?? "",
        },
    });

    revalidatePath("/admin/grading");

    return {
        success: true,
        message: "Grading created successfully",
    };
}

// ===================== UPDATE =====================

export async function updateGrading(
    id: string,
    _: any,
    formData: FormData
) {
    const parsed = gradingSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0].message,
        };
    }

    await prisma.grading.update({
        where: { id: Number(id) },
        data: {
            title: parsed.data.title,
            description: parsed.data.description ?? "",
        },
    });

    revalidatePath("/admin/grading");

    return {
        success: true,
        message: "Grading updated successfully",
    };
}

// ===================== DELETE =====================

export async function deleteGrading(id: string) {
    await prisma.grading.delete({
        where: { id: Number(id) },
    });

    revalidatePath("/admin/grading");

    return {
        success: true,
        message: "Grading deleted successfully",
    };
}

// ===================== GET BY ID =====================

export async function getGradingById(id: string) {
    const grading = await prisma.grading.findUnique({
        where: { id: Number(id) },
    });

    return {
        success: true,
        grading,
    };
}