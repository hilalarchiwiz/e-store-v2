'use server'

import { uploadImage } from "@/lib/action/FileUpload";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSetting(key: string) {
    try {
        const setting = await prisma.setting.findFirst({
            where: { key },
        });

        if (!setting) {
            return { success: false, message: "Setting not found", data: {} };
        }
        return {
            success: true,
            setting: setting ? JSON.parse(setting.value) : {}
        };
    } catch (err) {
        const error = err as Error;
        return {
            success: false,
            message: error.message
        }
    }
}

// const rawData = Object.fromEntries(formData.entries());
// const filteredData = Object.keys(rawData)
//     .filter((k) => !k.startsWith('$'))
//     .reduce((obj: any, k) => { obj[k] = rawData[k]; return obj; }, {});

// const jsonValue = JSON.stringify(filteredData);

// // 1. Find the existing record to get its ID
// const existing = await prisma.setting.findFirst({
//     where: { key }
// });

// if (existing) {
//     // 2. Update using the ID
//     await prisma.setting.update({
//         where: { id: existing.id }, // Use the actual ID here
//         data: { value: jsonValue }
//     });
// } else {
//     // 3. Create if it doesn't exist
//     await prisma.setting.create({
//         data: { key, value: jsonValue }
//     });
// }

// revalidatePath(path);
// return { success: true, message: "Updated!" };


export async function updateSettings(key: string, path: string, prevState: any, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const filteredData: any = {};

        for (const [name, value] of Object.entries(rawData)) {
            if (name.startsWith('$') || name.startsWith('next')) continue;

            if (value instanceof File && value.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append("image", value);
                const uploadResult = await uploadImage(imageFormData);
                if (uploadResult.url) filteredData[name] = uploadResult.url;
            } else if (!(value instanceof File)) {
                filteredData[name] = value;
            }
        }

        // 1. USE findFirst INSTEAD OF findUnique
        const existingRecord = await prisma.setting.findFirst({ where: { key } });
        const existingData = existingRecord ? JSON.parse(existingRecord.value) : {};

        const finalData = { ...existingData, ...filteredData };
        const jsonValue = JSON.stringify(finalData);

        // 2. USE MANUAL IF/ELSE INSTEAD OF UPSERT
        if (existingRecord) {
            await prisma.setting.update({
                where: { id: existingRecord.id }, // Update by the ID we just found
                data: { value: jsonValue },
            });
        } else {
            await prisma.setting.create({
                data: { key, value: jsonValue },
            });
        }

        revalidatePath(path);
        return { success: true, message: "Settings updated successfully" };
    } catch (error) {
        const err = error as Error;
        return { success: false, message: err.message };
    }
}