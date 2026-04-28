'use client'
import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Youtube from '@tiptap/extension-youtube'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import {
    Bold, Italic, Strikethrough, Code, Quote,
    List, ListOrdered, CheckSquare, AlignLeft,
    AlignCenter, AlignRight, Eraser, FileText,
    PlusSquare, Trash2, Plus, Columns, Rows,
    Settings, Eye, Save, Palette, Grid3X3, Upload,
} from 'lucide-react'
import { Video } from '@/lib/tiptap-video'

// Custom Image Extension with Resizing and Alignment
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: attributes => {
                    if (!attributes.width) return {}
                    return { width: attributes.width }
                },
            },
            height: {
                default: null,
                renderHTML: attributes => {
                    if (!attributes.height) return {}
                    return { height: attributes.height }
                },
            },
            style: {
                default: 'float: none; margin: 1rem auto; display: block;',
                renderHTML: attributes => {
                    return { style: attributes.style }
                },
            },
        }
    },
    addNodeView() {
        return ({ node, getPos, editor }) => {
            const container = document.createElement('div')
            container.className = 'image-wrapper relative group inline-block'

            const img = document.createElement('img')
            img.src = node.attrs.src
            img.className = 'rounded-lg shadow-lg max-w-full h-auto'
            if (node.attrs.width) img.style.width = node.attrs.width + 'px'
            if (node.attrs.height) img.style.height = node.attrs.height + 'px'
            img.style.cssText += node.attrs.style || ''

            const controls = document.createElement('div')
            controls.className = 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-slate-800 p-1 rounded shadow-lg'
            controls.innerHTML = `
                <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" data-action="left">Left</button>
                <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" data-action="center">Center</button>
                <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" data-action="right">Right</button>
                <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" data-action="delete">Delete</button>
            `

            controls.addEventListener('click', (e) => {
                const action = (e.target as HTMLElement).getAttribute('data-action')
                const pos = getPos()

                if (action === 'left') {
                    editor.commands.updateAttributes('image', { style: 'float: left; margin: 0 1rem 1rem 0;' })
                } else if (action === 'center') {
                    editor.commands.updateAttributes('image', { style: 'float: none; margin: 1rem auto; display: block;' })
                } else if (action === 'right') {
                    editor.commands.updateAttributes('image', { style: 'float: right; margin: 0 0 1rem 1rem;' })
                } else if (action === 'delete') {
                    editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize })
                }
            })

            container.appendChild(img)
            container.appendChild(controls)

            return {
                dom: container,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== 'image') return false
                    img.src = updatedNode.attrs.src
                    if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width + 'px'
                    if (updatedNode.attrs.height) img.style.height = updatedNode.attrs.height + 'px'
                    img.style.cssText += updatedNode.attrs.style || ''
                    return true
                },
            }
        }
    },
})

const PageEditor = ({ initialContent = "", name = "content", uploadToAzure }) => {
    const [content, setContent] = useState(initialContent)
    const [showBlockMenu, setShowBlockMenu] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [uploading, setUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6]
                }
            }),
            Underline,
            Video,
            CustomImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg shadow-lg',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Superscript,
            Subscript,
            TaskList,
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'my-6 rounded-lg shadow-lg'
                }
            }),
            TaskItem.configure({ nested: true }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse w-full my-6',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 dark:border-slate-600',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 dark:border-slate-600 bg-emerald-100 dark:bg-emerald-900 font-bold p-2 text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 dark:border-slate-600 p-2',
                },
            }),
        ],
        content: initialContent,
        immediatelyRender: false,
        onUpdate: ({ editor }) => setContent(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-screen p-8',
            },
        },
    })

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const result = await uploadToAzure(file)
            if (result.success && result.url) {
                editor?.chain().focus().setImage({
                    src: result.url,
                    style: 'float: none; margin: 1rem auto; display: block; max-width: 100%;'
                }).run()
            } else {
                alert('Failed to upload image: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const result = await uploadToAzure(file)
            if (result.success && result.url) {
                editor?.chain().focus().insertContent({
                    type: 'video', // This must match the 'name' in your Video extension
                    attrs: {
                        src: result.url,
                        controls: true
                    }
                }).run()
            } else {
                alert('Failed to upload video: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload video')
        } finally {
            setUploading(false)
        }
    }

    const insertBlock = (type) => {
        setShowBlockMenu(false)

        switch (type) {
            case 'heading1':
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
                break
            case 'heading2':
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
                break
            case 'heading3':
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
                break
            case 'paragraph':
                editor?.chain().focus().setParagraph().run()
                break
            case 'bulletList':
                editor?.chain().focus().toggleBulletList().run()
                break
            case 'orderedList':
                editor?.chain().focus().toggleOrderedList().run()
                break
            case 'taskList':
                editor?.chain().focus().toggleTaskList().run()
                break
            case 'quote':
                editor?.chain().focus().toggleBlockquote().run()
                break
            case 'code':
                editor?.chain().focus().toggleCodeBlock().run()
                break
            case 'table':
                editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                break
            case 'divider':
                editor?.chain().focus().setHorizontalRule().run()
                break
            case 'image':
                document.getElementById('image-upload')?.click()
                break
            case 'video':
                document.getElementById('video-upload')?.click()
                break
            case 'youtube':
                const youtubeUrl = prompt('Enter YouTube URL:')
                if (youtubeUrl) {
                    editor?.commands.setYoutubeVideo({ src: youtubeUrl })
                }
                break
        }
    }

    if (!editor) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
            <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
            />

            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 shadow-sm z-50">
                <div className="mx-auto py-3 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        {uploading && (
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                                Uploading...
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type='button'
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto flex">
                {/* Left Sidebar */}
                <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[73px] h-[calc(100vh-73px)]">
                    <div className="p-2 flex flex-col gap-2">
                        <button
                            type='button'
                            onClick={() => setShowBlockMenu(!showBlockMenu)}
                            className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 rounded-lg transition-all relative group"
                            title="Add Block"
                        >
                            <PlusSquare size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 relative">
                    <input type="hidden" name={name} value={content} />

                    {/* Floating Toolbar */}
                    <div className="sticky top-[73px] z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="mx-auto px-4 py-2">
                            <div className="flex flex-wrap items-center gap-1">
                                <ToolbarGroup>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        active={editor.isActive('bold')}
                                        title="Bold"
                                    >
                                        <Bold size={16} />
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        active={editor.isActive('italic')}
                                        title="Italic"
                                    >
                                        <Italic size={16} />
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                        active={editor.isActive('underline')}
                                        title="Underline"
                                    >
                                        <span className="font-bold text-sm underline">U</span>
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleStrike().run()}
                                        active={editor.isActive('strike')}
                                        title="Strike"
                                    >
                                        <Strikethrough size={16} />
                                    </ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()}
                                        active={editor.isActive('highlight')}
                                        title="Highlight"
                                    >
                                        <Palette size={16} />
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().toggleCode().run()}
                                        active={editor.isActive('code')}
                                        title="Code"
                                    >
                                        <Code size={16} />
                                    </ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                        active={editor.isActive({ textAlign: 'left' })}
                                    >
                                        <AlignLeft size={16} />
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                        active={editor.isActive({ textAlign: 'center' })}
                                    >
                                        <AlignCenter size={16} />
                                    </ToolbarButton>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                        active={editor.isActive({ textAlign: 'right' })}
                                    >
                                        <AlignRight size={16} />
                                    </ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <input
                                        type="color"
                                        onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                        className="w-8 h-8 rounded cursor-pointer border-2 border-slate-200"
                                        value={editor.getAttributes('textStyle').color || '#000000'}
                                        title="Text Color"
                                    />
                                </ToolbarGroup>

                                {editor.isActive('table') && (
                                    <ToolbarGroup>
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().addColumnBefore().run()}
                                            title="Add Column"
                                        >
                                            <Columns size={16} />
                                        </ToolbarButton>
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().addRowBefore().run()}
                                            title="Add Row"
                                        >
                                            <Rows size={16} />
                                        </ToolbarButton>
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().deleteTable().run()}
                                            title="Delete Table"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </ToolbarButton>
                                    </ToolbarGroup>
                                )}

                                <ToolbarGroup>
                                    <ToolbarButton
                                        onClick={() => editor.chain().focus().unsetAllMarks().run()}
                                        title="Clear Format"
                                    >
                                        <Eraser size={16} />
                                    </ToolbarButton>
                                </ToolbarGroup>
                            </div>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="mx-auto">
                        <EditorContent editor={editor} />
                    </div>

                    {/* Block Menu */}
                    {showBlockMenu && (
                        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-start justify-center pt-32" onClick={() => setShowBlockMenu(false)}>
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Insert Block</h3>

                                <div className="space-y-6">
                                    <BlockSection title="Text">
                                        <BlockButton onClick={() => insertBlock('paragraph')} icon={<FileText size={20} />} label="Paragraph" desc="Start with plain text" />
                                        <BlockButton onClick={() => insertBlock('heading1')} icon={<span className="text-2xl font-bold">H1</span>} label="Heading 1" desc="Large section heading" />
                                        <BlockButton onClick={() => insertBlock('heading2')} icon={<span className="text-xl font-bold">H2</span>} label="Heading 2" desc="Medium section heading" />
                                        <BlockButton onClick={() => insertBlock('heading3')} icon={<span className="text-lg font-bold">H3</span>} label="Heading 3" desc="Small section heading" />
                                    </BlockSection>

                                    <BlockSection title="Lists">
                                        <BlockButton onClick={() => insertBlock('bulletList')} icon={<List size={20} />} label="Bullet List" desc="Create a simple list" />
                                        <BlockButton onClick={() => insertBlock('orderedList')} icon={<ListOrdered size={20} />} label="Numbered List" desc="Create a numbered list" />
                                        <BlockButton onClick={() => insertBlock('taskList')} icon={<CheckSquare size={20} />} label="Task List" desc="Track tasks with checkboxes" />
                                    </BlockSection>

                                    <BlockSection title="Media">
                                        <BlockButton onClick={() => insertBlock('image')} icon={<Upload size={20} />} label="Upload Image" desc="Upload from your device" />
                                        <BlockButton onClick={() => insertBlock('video')} icon={<Upload size={20} />} label="Upload Video" desc="Upload video file" />
                                        <BlockButton onClick={() => insertBlock('youtube')} icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>} label="YouTube" desc="Embed a YouTube video" />
                                    </BlockSection>

                                    <BlockSection title="Layout">
                                        <BlockButton onClick={() => insertBlock('table')} icon={<Grid3X3 size={20} />} label="Table" desc="Insert a table" />
                                        <BlockButton onClick={() => insertBlock('quote')} icon={<Quote size={20} />} label="Quote" desc="Add a blockquote" />
                                        <BlockButton onClick={() => insertBlock('code')} icon={<Code size={20} />} label="Code Block" desc="Display code with syntax" />
                                        <BlockButton onClick={() => insertBlock('divider')} icon={<div className="w-6 h-0.5 bg-slate-400" />} label="Divider" desc="Add a horizontal line" />
                                    </BlockSection>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                {showSettings && (
                    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Document Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Word Count
                                    </label>
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {editor.storage.characterCount?.words() || 0}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <button type='button' onClick={() => alert(editor.getHTML())} className="w-full text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
                                            View HTML
                                        </button>
                                        <button type='button' onClick={() => confirm('Clear all content?') && editor.commands.setContent('')} className="w-full text-left px-3 py-2 text-sm bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition">
                                            Clear Document
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .ProseMirror {
                    outline: none;
                }
                .ProseMirror strong {
                    font-weight: 700;
                    color: inherit;
                }
                .ProseMirror em {
                    font-style: italic;
                }
                .ProseMirror u {
                    text-decoration: underline;
                }
                .ProseMirror s {
                    text-decoration: line-through;
                }
                .ProseMirror code {
                    background-color: #f1f5f9;
                    padding: 0.2em 0.4em;
                    border-radius: 0.25rem;
                    font-family: monospace;
                }
                .dark .ProseMirror code {
                    background-color: #1e293b;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1.5rem 0;
                }
                .ProseMirror th {
                    background-color: #d1fae5;
                    font-weight: 700;
                    padding: 0.5rem;
                    border: 1px solid #cbd5e1;
                    text-align: left;
                }
                .dark .ProseMirror th {
                    background-color: #064e3b;
                    border-color: #475569;
                }
                .ProseMirror td {
                    padding: 0.5rem;
                    border: 1px solid #cbd5e1;
                }
                .dark .ProseMirror td {
                    border-color: #475569;
                }
                .image-wrapper {
                    position: relative;
                    display: inline-block;
                    max-width: 100%;
                }
            `}</style>
        </div>
    )
}

const BlockSection = ({ title, children }) => (
    <div>
        <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
            {children}
        </div>
    </div>
)

const BlockButton = ({ onClick, icon, label, desc }) => (
    <button
        type='button'
        onClick={onClick}
        className="flex flex-col items-start p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg transition-all group hover:shadow-lg"
    >
        <div className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="text-left">
            <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{desc}</div>
        </div>
    </button>
)

const ToolbarGroup = ({ children }) => (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
        {children}
    </div>
)

const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-2 rounded transition-all ${active
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
    >
        {children}
    </button>
)

export default PageEditor