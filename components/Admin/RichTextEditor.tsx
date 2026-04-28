'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

interface RichTextEditorProps {
    name: string;
    placeholder?: string;
    defaultValue?: string | null; // Added nullable defaultValue
    onChange?: (content: string) => void; // Add this
}

const RichTextEditor = ({ name, placeholder, defaultValue, onChange }: RichTextEditorProps) => {
    // Initialize state with defaultValue or empty string
    const [content, setContent] = useState(defaultValue || '');
    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        if (onChange) {
            onChange(newContent); // Send HTML string to parent
        }
    };
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <div className="bg-white pb-12">
            <input type="hidden" name={name} value={content} />

            <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={modules}
                placeholder={placeholder}
                className="h-64"
            />
        </div>
    );
};

export default RichTextEditor;