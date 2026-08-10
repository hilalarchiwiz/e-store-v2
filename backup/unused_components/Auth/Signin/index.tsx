'use client'

import Breadcrumb from "@/components/Common/Breadcrumb";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/user-slice";
import { mergeGuestDataToUser } from "@/lib/action/home.action";
import LoginWithGoogle from "../LoginWithGoogle";
import prisma from "@/lib/prisma";
import { createLoginLog } from "@/lib/action/logs";

const Signin = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 1. Added loading state
  const dispatch = useDispatch();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true); // 2. Start loading

    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
      if (res.error) {
        setError(res.error.message || res.error.statusText || "Something went wrong.");
        setLoading(false); // 3. Stop loading on error
      } else {
        if (res.data?.user?.roleName !== "user") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        const userId = res.data?.user?.id;
        await Promise.all([
          createLoginLog(userId),
          mergeGuestDataToUser(userId)
        ]);

        dispatch(
          setUser({
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            image: undefined,
          })
        )
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    // required
                    disabled={loading} // 4. Disable inputs while loading
                    placeholder="Enter your email"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Password Input */}
                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    // required
                    disabled={loading} // 4. Disable inputs while loading
                    placeholder="Enter your password"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 5. Animated Loading Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:bg-opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in to account"
                  )}
                </button>

                <a
                  href="#"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Forget your password?
                </a>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <LoginWithGoogle />
                </div>

                <p className="text-center mt-6">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign Up Now!
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

export default Signin;