import { hasPermission } from "@/lib/auth-utils";
import { userContext } from "./user-context";
import generateSession from "./generate-session";

type ActionFunction<T> = (...args: any[]) => Promise<T>;

export async function withPermission<T>(
    permission: string,
    action: ActionFunction<T>
): Promise<any> { // Returns a consistent response format
    try {
        // 1. Permission Check
        // const allowed = await hasPermission(permission);
        const auth = await hasPermission(permission);
        const session = await generateSession();
        if (!session?.user) {
            return {
                success: false,
                message: 'Unauthorized: You do not have permission for this action.'
            };
        };


        if (!auth) {
            return {
                success: false,
                message: 'Unauthorized: You do not have permission for this action.'
            };
        }

        // 2. Execute the Action
        // return await action();
        return await userContext.run(session?.user?.id, async () => {
            return await action();
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        return {
            success: false,
            message: errorMessage
        };
    }
}