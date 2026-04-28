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
    Settings, Eye, Save, Palette, Grid3X3
} from 'lucide-react'

const PageEditor = ({ initialContent = "", name = "content" }) => {
    const [content, setContent] = useState(initialContent)
    const [showBlockMenu, setShowBlockMenu] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [documentTitle, setDocumentTitle] = useState("Untitled Document")

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6]
                }
            }),
            Underline,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4 shadow-lg',
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
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: initialContent,
        immediatelyRender: false,
        onUpdate: ({ editor }) => setContent(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-screen p-2',
            },
        },
    })

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
                const imageUrl = prompt('Enter image URL:')
                if (imageUrl) {
                    editor?.chain().focus().setImage({ src: imageUrl }).run()
                }
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
            {/* Top Bar - Gutenberg Style */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 shadow-sm">
                <div className=" mx-auto  py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                    </div>

                    <div className="flex items-center gap-2">
                        {/* <button type='button' className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                            <Eye size={16} />
                            Preview
                        </button>
                        <button type='button' className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition font-medium shadow-sm">
                            <Save size={16} />
                            Publish
                        </button> */}
                        <button type='button'
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className=" mx-auto flex">
                {/* Left Sidebar - Block Inserter */}
                <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[73px] h-[calc(100vh-73px)]">
                    <div className="p-2 flex flex-col gap-2">
                        <button type='button'
                            onClick={() => setShowBlockMenu(!showBlockMenu)}
                            className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 rounded-lg transition-all relative group"
                            title="Add Block"
                        >
                            <PlusSquare size={24} />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                Add Block
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 relative">
                    <input type="hidden" name={name} value={content} />

                    {/* Floating Toolbar */}
                    <div className="sticky top-[73px] z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className=" mx-auto px-4 py-2">
                            <div className="flex flex-wrap items-center gap-1">
                                <ToolbarGroup>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="font-bold text-sm">U</span></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><Strikethrough size={16} /></ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()} active={editor.isActive('highlight')} title="Highlight"><Palette size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code"><Code size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><span className="text-xs">x²</span></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><span className="text-xs">x₂</span></ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={16} /></ToolbarButton>
                                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={16} /></ToolbarButton>
                                </ToolbarGroup>

                                <ToolbarGroup>
                                    <input
                                        type="color"
                                        onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                        className="w-8 h-8 rounded cursor-pointer"
                                        value={editor.getAttributes('textStyle').color || '#000000'}
                                        title="Text Color"
                                    />
                                </ToolbarGroup>

                                {editor.isActive('table') && (
                                    <ToolbarGroup>
                                        <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column"><Columns size={16} /></ToolbarButton>
                                        <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row"><Rows size={16} /></ToolbarButton>
                                        <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Trash2 size={16} className="text-red-500" /></ToolbarButton>
                                    </ToolbarGroup>
                                )}

                                <ToolbarGroup>
                                    <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Format"><Eraser size={16} /></ToolbarButton>
                                </ToolbarGroup>
                            </div>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className=" mx-auto">
                        <EditorContent editor={editor} />
                    </div>

                    {/* Block Menu Popup */}
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
                                        <BlockButton onClick={() => insertBlock('image')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>} label="Image" desc="Insert an image" />
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

                {/* Right Sidebar - Settings Panel */}
                {showSettings && (
                    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Document Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Document Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Ready to publish</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <button type='button' onClick={() => alert(editor.getHTML())} className="w-full text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
                                            View HTML
                                        </button>
                                        <button type='button' onClick={() => editor.commands.setContent('')} className="w-full text-left px-3 py-2 text-sm bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition">
                                            Clear Document
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Keyboard Shortcuts</h4>
                                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Bold</span>
                                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+B</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Italic</span>
                                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+I</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Underline</span>
                                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+U</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
    <button type='button'
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
            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600'
            }`}
    >
        {children}
    </button>
)

export default PageEditor