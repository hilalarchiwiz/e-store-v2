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
            className={`inline-flex font-medium text-white py-3 px-7 rounded-md ease-out duration-200
                ${pending
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
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