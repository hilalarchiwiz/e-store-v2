'use client';

import { Eye } from 'lucide-react';
import { useState } from 'react';
import FormTextarea from './Form/Textarea';
import FormWrapper from './Form/FormWrapper';

export default function ReplyModal({ contact }: { contact: any }) {
    const [isOpen, setIsOpen] = useState(false);

    async function handleReply(formData: FormData) {
        // const res = await sendReply(formData);
        // if (res.success) {
        //     toast.success("Reply sent!");
        //     setIsOpen(false);
        // } else {
        //     toast.error(res.message);
        // }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 cursor-pointer bg-blue-50 text-blue-600 rounded">
                <Eye size={14} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Contact Details</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 cursor-pointer hover:text-gray-600">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p><strong>From:</strong> {contact.name} ({contact.email})</p>
                                <p><strong>Subject:</strong> {contact.subject}</p>
                                <p className="mt-2 border-t pt-2 text-gray-700 italic">"{contact.message}"</p>
                            </div>

                            <FormWrapper action={handleReply}
                                buttonTitle='Send Reply'
                                href='/admin/contact'
                            >
                                <input type="hidden" name="email" value={contact.email} />
                                <input type="hidden" name="subject" value={`Re: ${contact.subject}`} />

                                <FormTextarea
                                    label='Your Reply'
                                    required
                                />
                            </FormWrapper>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}