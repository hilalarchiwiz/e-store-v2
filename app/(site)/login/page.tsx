import React, { Suspense } from "react";
import LoginForm from "@/components/v2/Auth/LoginForm";

const LoginPage = () => {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-6">
      <section className="w-full max-w-xl">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
};

export default LoginPage;
