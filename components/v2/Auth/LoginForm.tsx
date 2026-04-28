"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { signIn, authClient } from "@/lib/auth-client";
import Input from "../Input";
import Button from "../Button";

// Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate
    const result = loginSchema.safeParse({ email, password });

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
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        toast.error(res.error.message || "Invalid email or password");
      } else {
        toast.success("Signed in successfully!");
        const session = await authClient.getSession();
        const roleName = (session.data?.user as any)?.roleName;
        const destination = roleName && roleName !== "user" ? "/admin" : redirectTo;
        router.push(destination);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch (err) {
      toast.error("Google login failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a251d] border border-primary/10 shadow-2xl rounded-3xl p-8 md:p-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-2xl text-primary mb-6">
          <span className="material-symbols-outlined !text-4xl">login</span>
        </div>
        <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-3">
          Welcome Back
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sign in to continue your green journey
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 mb-8 px-6 shadow-sm active:scale-[0.98] disabled:opacity-50"
      >
        {googleLoading ? (
          <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            ></path>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="bg-white dark:bg-[#1a251d] px-4 text-gray-400">
            Or use email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon="mail"
          error={errors.email}
          disabled={isLoading}
        />
        <div className="space-y-1">
          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Your password"
            icon="lock"
            showToggle
            error={errors.password}
            disabled={isLoading}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button fullWidth type="submit" isLoading={isLoading} icon="login">
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          <Link
            href="/register"
            className="text-primary font-bold hover:underline ml-1"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
