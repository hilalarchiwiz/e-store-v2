// components/Admin/SubmitButton.tsx

'use client';

import { Save } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ title }: { title: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            aria-disabled={pending}
            className={`px-6 py-2.5 text-sm cursor-pointer font-medium text-white  hover:bg-emerald-700 rounded-md transition-colors
                ${pending
                    ? 'bg-emerald-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
            disabled={pending}
        >
            {pending ? (
                <>
                    {title}...
                </>
            ) : (
                <>
                    {title}
                </>
            )}
        </button>
    );
}