'use client'

import Breadcrumb from "@/components/Common/Breadcrumb";
import { signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";
import LoginWithGoogle from "../LoginWithGoogle";

// 1. Define the Validation Schema
const signupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

const Signup = () => {
  const router = useRouter();

  // States for handling UI and errors
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // 1. Validate with Zod
    const validation = signupSchema.safeParse({
      name: rawData.name,
      email: rawData.email,
      password: rawData.password,
      confirmPassword: rawData["re-type-password"],
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      // Safely flatten the Zod errors
      const formattedErrors = validation.error.flatten().fieldErrors;

      Object.keys(formattedErrors).forEach((key) => {
        if (formattedErrors[key]) {
          fieldErrors[key] = formattedErrors[key]![0];
        }
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    // 2. Submit to better-auth
    try {
      const res = await signUp.email({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        roleName: 'user',
      });

      if (res.error) {
        setServerError(res.error.message || "An error occurred during signup.");
        setLoading(false);
      } else {
        router.push("/signin");
      }
    } catch (err) {
      setServerError("A network error occurred. Please try again.");
      setLoading(false);
    }
  }

  // Helper to render input styling based on error state
  const inputClass = (fieldName: string) => `
    rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 
    focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed
    ${errors[fieldName] ? "border-red-500 focus:ring-red-500/20" : "border-gray-3 focus:border-blue"}
  `;

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            {/* Global Server Error Display */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500 text-sm text-center font-medium">{serverError}</p>
              </div>
            )}

            <div className="flex flex-col gap-4.5">
              <LoginWithGoogle />
            </div>

            <div className="mt-5.5">
              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2.5 font-medium text-dark">Full Name</label>
                  <input type="text" name="name" id="name" placeholder="Enter your full name" disabled={loading} className={inputClass("name")} />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2.5 font-medium text-dark">Email Address</label>
                  <input type="email" name="email" id="email" placeholder="Enter your email" disabled={loading} className={inputClass("email")} />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label htmlFor="password" name="password" className="block mb-2.5 font-medium text-dark">Password</label>
                  <input type="password" name="password" id="password" placeholder="Min 8 characters" autoComplete="new-password" disabled={loading} className={inputClass("password")} />
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </div>

                {/* Re-type Password */}
                <div className="mb-6">
                  <label htmlFor="re-type-password text-dark" className="block mb-2.5 font-medium text-dark">Re-type Password</label>
                  <input type="password" name="re-type-password" id="re-type-password" placeholder="Confirm your password" disabled={loading} className={inputClass("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:bg-dark/70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </button>

                <p className="text-center mt-6 text-dark-4">
                  Already have an account?
                  <Link href="/signin" className="text-dark font-medium ease-out duration-200 hover:text-blue pl-2">
                    Sign in Now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;