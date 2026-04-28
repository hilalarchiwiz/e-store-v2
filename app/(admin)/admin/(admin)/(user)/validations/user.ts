import { z } from "zod";

export const UserBaseSchema = z.object({
    roleName: z.string().nonempty({
        message: 'Role is required'
    }).min(1, "Role must be at least 1 character"),
    name: z.string().nonempty({
        message: 'Name is required'
    }).min(2, "Name must be at least 2 characters"),
    email: z.string().nonempty({
        message: 'Email required'
    }).email("Invalid email address"),
});

// For creation, we need a password
export const CreateUserSchema = UserBaseSchema.extend({
    password: z.string().nonempty({
        message: 'Password is required'
    }).min(8, "Password must be at least 8 characters"),
});

// For updates, we use the base (optionally exclude email if you don't want it changed)
export const UpdateUserSchema = UserBaseSchema;