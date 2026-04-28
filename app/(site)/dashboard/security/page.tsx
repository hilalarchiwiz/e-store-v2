"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { changePassword } from "@/lib/auth-client";
import Button from "@/components/v2/Button";
import Input from "@/components/v2/Input";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SecurityPage() {
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

    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.flatten().fieldErrors &&
        Object.entries(result.error.flatten().fieldErrors).forEach(([key, val]) => {
          if (val && val.length > 0) fieldErrors[key] = val[0];
        });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to update password");
      } else {
        toast.success("Password updated successfully!");
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-2">
          Security Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Protect your account with a strong password.
        </p>
      </div>

      <div className="w-full">
        <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">key</span>
            </div>
            <h2 className="text-xl font-black text-[#121714] dark:text-white">
              Change Password
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Your current password"
              icon="lock_open"
              showToggle
              error={errors.currentPassword}
              disabled={isLoading}
            />
            <Input
              id="newPassword"
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              icon="lock"
              showToggle
              error={errors.newPassword}
              disabled={isLoading}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              icon="verified_user"
              showToggle
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            <div className="pt-4">
              <Button variant="primary" icon="update" fullWidth isLoading={isLoading} type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
