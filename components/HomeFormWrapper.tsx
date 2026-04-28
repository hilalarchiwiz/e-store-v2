'use client'

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FormWrapperProps {
    children: React.ReactNode;
    action: (prevState: any, formData: FormData) => Promise<any>;
    successMessage?: string;
    href: string;
}

const HomeFormWrapper = ({
    children,
    action,
    successMessage,
    href
}: FormWrapperProps) => {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(action, null);
    const [formKey, setFormKey] = useState(0);
    useEffect(() => {
        if (state?.success) {
            toast.success(state.message || successMessage || "Success!");
            setFormKey(prev => prev + 1);
            if (href) router.push(href);
        } else if (state?.success === false) {

            // 1. Check if message is the object you're seeing in the console
            if (typeof state.message === 'object' && !Array.isArray(state.message)) {
                Object.values(state.message).flat().forEach((msg) => {
                    toast.error(msg as string);
                });
            }
            // 2. Check if it's already a flat array
            else if (Array.isArray(state.message)) {
                state.message.forEach(msg => toast.error(msg));
            }
            // 3. Fallback for simple strings
            else {
                toast.error(state.message || "Something went wrong");
            }
        }
    }, [state, successMessage, href, router]);

    return (
        <form key={formKey} action={formAction}>

            {children}

        </form>
    );
};

export default HomeFormWrapper;