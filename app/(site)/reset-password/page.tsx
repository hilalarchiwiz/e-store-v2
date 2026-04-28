"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { resetPassword } from "@/lib/auth-client";
import Input from "@/components/v2/Input";
import Button from "@/components/v2/Button";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });

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

    const token = searchParams.get("token") || "";
    if (!token) {
      toast.error("Invalid or expired reset link. Please request a new one.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await resetPassword({
        newPassword: password,
        token,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to reset password");
      } else {
        toast.success("Password reset successfully!");
        router.push("/login");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a251d] border border-primary/10 shadow-2xl rounded-3xl p-8 md:p-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-2xl text-primary mb-6">
          <span className="material-symbols-outlined !text-4xl">lock_open</span>
        </div>
        <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-3">
          Set New Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Please enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="password"
          name="password"
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          icon="lock"
          error={errors.password}
          disabled={isLoading}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          placeholder="Repeat your password"
          icon="lock_reset"
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        <Button
          fullWidth
          type="submit"
          isLoading={isLoading}
          icon="check_circle"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-6">
      <section className="w-full max-w-xl">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
