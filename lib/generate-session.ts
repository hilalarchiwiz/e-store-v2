import { headers } from "next/headers";
import { auth } from "./auth";

export default async function generateSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

// const session = await generateSession();
// export const user = session?.user;