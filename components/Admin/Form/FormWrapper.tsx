'use client'

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SubmitButton } from "../SubmitButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormWrapperProps {
    children: React.ReactNode;
    action: (prevState: any, formData: FormData) => Promise<any>;
    buttonTitle: string;
    successMessage?: string;
    href: string;
}

const FormWrapper = ({
    children,
    action,
    buttonTitle,
    successMessage,
    href
}: FormWrapperProps) => {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(action, null);
    const [formKey, setFormKey] = useState(0);
    useEffect(() => {
        console.log(state)
        if (state?.success) {
            toast.success(state.message || successMessage || "Success!");
            setFormKey(prev => prev + 1);
            router.push(href);
        } else if (state?.success === false) {
            console.log(state.message)

            toast.error(state.message || "Something went wrong");
        }
    }, [state, successMessage]);

    return (
        <form key={formKey} action={formAction} className="space-y-6 p-4">

            {children}

            <div className="pt-4">
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <Link href={href}>
                        <button
                            type="button"
                            className="px-6 cursor-pointer py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                    </Link>
                    <SubmitButton
                        title={buttonTitle}
                    />
                </div>
            </div>
        </form>
    );
};

export default FormWrapper;