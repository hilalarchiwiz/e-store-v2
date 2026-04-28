import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function getOrCreateAnonymousId() {
    const cookieStore = await cookies();
    const existingId = cookieStore.get("anonymous_id")?.value;

    if (existingId) {
        return existingId;
    }
    // Generate new ID if it doesn't exist
    const newId = uuidv4();

    // Set the cookie to last for 30 days
    cookieStore.set("anonymous_id", newId, {
        httpOnly: true, // Security: prevents JS from reading it directly
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
    });

    return newId;
}