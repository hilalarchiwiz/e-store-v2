"use client";

import React from "react";
import RegisterForm from "@/components/v2/Auth/RegisterForm";

const RegisterPage = () => {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-6">
      <section className="w-full max-w-xl" id="register">
        <RegisterForm />
      </section>
    </main>
  );
};

export default RegisterPage;
