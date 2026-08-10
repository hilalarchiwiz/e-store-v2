"use client";

import React, { useState } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { changePassword } from "@/lib/auth-client";
import Input from "../Input";
import Button from "../Button";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ChangePasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate
    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      const formattedErrors = result.error.flatten().fieldErrors;
      Object.keys(formattedErrors).forEach((key) => {
        const errorArr = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArr && errorArr.length > 0) {
          fieldErrors[key] = errorArr[0];
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#121714] dark:text-white mb-2 font-display">
          Change Password
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Regularly updating your password enhances your account security.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Input
          id="currentPassword"
          name="currentPassword"
          label="Current Password"
          type="password"
          placeholder="Enter current password"
          icon="lock"
          error={errors.currentPassword}
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="Min. 8 characters"
            icon="lock_open"
            error={errors.newPassword}
            disabled={isLoading}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            icon="lock_reset"
            error={errors.confirmPassword}
            disabled={isLoading}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            icon="shield_lock"
            className="!px-12"
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
