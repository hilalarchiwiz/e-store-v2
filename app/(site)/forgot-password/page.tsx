"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Input from "@/components/v2/Input";
import Button from "@/components/v2/Button";
import { requestPasswordReset } from "@/lib/auth-client";
import { checkEmailExists } from "./actions";

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        toast.error("No account found with this email address.");
        setIsLoading(false);
        return;
      }

      const res = await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/v2/reset-password`,
      });

      if (res.error) {
        toast.error(res.error.message || "Something went wrong");
      } else {
        setSubmitted(true);
        toast.success("Reset instructions sent!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-6">
      <section className="w-full max-w-xl">
        <div className="bg-white dark:bg-[#1a251d] border border-primary/10 shadow-2xl rounded-3xl p-8 md:p-10">
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-2xl text-primary mb-6">
                  <span className="material-symbols-outlined !text-4xl">
                    lock_reset
                  </span>
                </div>
                <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-3">
                  Reset Password
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Enter your email and we'll send you reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  id="reset-email"
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  icon="mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <Button
                  fullWidth
                  type="submit"
                  isLoading={isLoading}
                  icon="send"
                >
                  Send Instructions
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center size-20 bg-green-500/10 rounded-full text-green-500 mb-6 font-bold">
                <span className="material-symbols-outlined !text-5xl">
                  mark_email_read
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#121714] dark:text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                We've sent password reset instructions to{" "}
                <strong>{email}</strong>. Please check your inbox and spam
                folder.
              </p>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setSubmitted(false)}
              >
                Didn't receive email? Try again
              </Button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
