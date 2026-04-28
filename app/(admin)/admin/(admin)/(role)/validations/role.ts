import { z } from "zod";

export const RoleSchema = z.object({
    name: z.string().min(1, "Role name is required").max(50),
    modules: z.array(z.string()).default([]),
    permissions: z.array(z.string()).default([]),
});

export type RoleInput = z.infer<typeof RoleSchema>;