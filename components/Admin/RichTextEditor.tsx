'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
    name: string;
    placeholder?: string;
    defaultValue?: string | null;
    onChange?: (content: string) => void;
}

const RichTextEditor = ({ name, placeholder, defaultValue, onChange }: RichTextEditorProps) => {
    const [content, setContent] = useState(defaultValue ?? '');
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
        ],
        content: defaultValue ?? '',
        immediatelyRender: false,
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.getHTML();
            setContent(html);
            onChange?.(html);
        },
        editorProps: {
            attributes: {
                class: 'min-h-64 p-4 focus:outline-none prose max-w-none',
                'aria-label': placeholder ?? 'Rich text editor',
            },
        },
    });

    const setLink = () => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter a link URL', previousUrl ?? 'https://');
        if (url === null) return;
        if (!url.trim()) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    const toolbarButton = (label: string, active: boolean, onClick: () => void) => (
        <button
            type="button"
            onClick={onClick}
            disabled={!editor}
            aria-pressed={active}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:cursor-not-allowed disabled:opacity-50`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white">
            <input type="hidden" name={name} value={content} />
            <div className="flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-2">
                {toolbarButton('H1', editor?.isActive('heading', { level: 1 }) ?? false, () => editor?.chain().focus().toggleHeading({ level: 1 }).run())}
                {toolbarButton('H2', editor?.isActive('heading', { level: 2 }) ?? false, () => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
                {toolbarButton('Bold', editor?.isActive('bold') ?? false, () => editor?.chain().focus().toggleBold().run())}
                {toolbarButton('Italic', editor?.isActive('italic') ?? false, () => editor?.chain().focus().toggleItalic().run())}
                {toolbarButton('Underline', editor?.isActive('underline') ?? false, () => editor?.chain().focus().toggleUnderline().run())}
                {toolbarButton('Strike', editor?.isActive('strike') ?? false, () => editor?.chain().focus().toggleStrike().run())}
                {toolbarButton('Bullets', editor?.isActive('bulletList') ?? false, () => editor?.chain().focus().toggleBulletList().run())}
                {toolbarButton('Numbered', editor?.isActive('orderedList') ?? false, () => editor?.chain().focus().toggleOrderedList().run())}
                {toolbarButton('Link', editor?.isActive('link') ?? false, setLink)}
                {toolbarButton('Clear', false, () => editor?.chain().focus().unsetAllMarks().clearNodes().run())}
            </div>
            <EditorContent editor={editor} className="rounded-b-lg border border-gray-300" />
        </div>
    );
};

export default RichTextEditor;
