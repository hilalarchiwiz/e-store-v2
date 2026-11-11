'use client';

import { useFormStatus } from 'react-dom';

// Submits the surrounding form with `intent=draft`. `formNoValidate` skips the
// browser's `required` checks so partially filled products can be saved.
export function SaveDraftButton({ title = 'Save as Draft' }: { title?: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            name="intent"
            value="draft"
            formNoValidate
            disabled={pending}
            aria-disabled={pending}
            className={`px-6 py-2.5 text-sm font-medium rounded-md border transition-colors
                ${pending
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 cursor-pointer'
                }`}
        >
            {title}
        </button>
    );
}
