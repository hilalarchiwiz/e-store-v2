
// // 'use client'
// // import { useState, useRef } from 'react'
// // import { useEditor, EditorContent } from '@tiptap/react'
// // import StarterKit from '@tiptap/starter-kit'
// // import Underline from '@tiptap/extension-underline'
// // import Highlight from '@tiptap/extension-highlight'
// // import Superscript from '@tiptap/extension-superscript'
// // import Subscript from '@tiptap/extension-subscript'
// // import Color from '@tiptap/extension-color'
// // import { TextStyle } from '@tiptap/extension-text-style'
// // import TaskList from '@tiptap/extension-task-list'
// // import TaskItem from '@tiptap/extension-task-item'
// // import Youtube from '@tiptap/extension-youtube'
// // import Image from '@tiptap/extension-image'
// // import { Table } from '@tiptap/extension-table'
// // import TableRow from '@tiptap/extension-table-row'
// // import TableCell from '@tiptap/extension-table-cell'
// // import TableHeader from '@tiptap/extension-table-header'
// // import {
// //     Bold, Italic, Underline as UnderlineIcon, Strikethrough,
// //     Highlighter, Superscript as SuperIcon, Subscript as SubIcon,
// //     Code, Quote, Heading1, Heading2, Heading3,
// //     List, ListOrdered, CheckSquare, AlignLeft,
// //     AlignCenter, AlignRight, Eraser, Type,
// //     ImageIcon,
// //     Grid3X3,
// //     PlusSquare,
// //     Trash2,
// //     Plus,
// //     Columns,
// //     Rows
// // } from 'lucide-react'
// // import { uploadToAzure } from '@/lib/azure-upload'
// // import ResizableImage from 'tiptap-extension-resize-image'
// // import TextAlign from '@tiptap/extension-text-align'
// // import { Video } from '@/lib/tiptap-video'
// // const PageEditor = ({ initialContent = "", name = "content" }: any) => {
// //     const [content, setContent] = useState(initialContent);
// //     const [image, setImage] = useState('');

// //     const editor = useEditor({
// //         extensions: [
// //             StarterKit,
// //             Underline,
// //             Image.configure({
// //                 HTMLAttributes: {
// //                     class: 'rounded-2xl border-4 border-transparent hover:border-emerald-500 transition-all duration-300 shadow-lg my-8 mx-auto block',
// //                 },
// //             }),
// //             ResizableImage.configure({
// //                 HTMLAttributes: {
// //                     class: 'resizable-image shadow-lg rounded-xl my-4 border-2 border-transparent hover:border-emerald-500 transition-colors',
// //                 },
// //             }),
// //             TextAlign.configure({
// //                 types: ['heading', 'paragraph', 'image'],
// //             }),

// //             TextStyle,
// //             Color,
// //             Video,
// //             Highlight.configure({ multicolor: true }),
// //             Superscript,
// //             Subscript,
// //             TaskList,
// //             Youtube.configure({ width: 840, height: 480 }),
// //             TaskItem.configure({ nested: true }),
// //             Table.configure({
// //                 resizable: true,
// //                 HTMLAttributes: {
// //                     class: 'border-collapse table-auto w-full my-6',
// //                 },
// //             }),

// //             TableRow,
// //             TableHeader,
// //             TableCell,
// //         ],
// //         content: initialContent,
// //         immediatelyRender: false,
// //         onUpdate: ({ editor }) => setContent(editor.getHTML()),
// //         editorProps: {
// //             attributes: {
// //                 class: 'prose prose-emerald lg:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-8 lg:p-16 bg-white dark:bg-slate-950 shadow-inner',
// //             },
// //         },
// //     })

// //     const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //         const files = e.target.files;
// //         if (!files) return;

// //         // Show a loading state if you have one
// //         for (const file of Array.from(files)) {
// //             try {
// //                 const { url } = await uploadToAzure(file);

// //                 if (file.type.startsWith('image/')) {
// //                     editor?.chain().focus().setImage({ src: url }).run();
// //                 } else if (file.type.startsWith('video/')) {
// //                     // Using the custom video extension command
// //                     editor?.chain().focus().insertContent({
// //                         type: 'video',
// //                         attrs: { src: url }
// //                     }).run();
// //                 }
// //             } catch (error) {
// //                 console.error("Azure Upload Failed:", error);
// //                 alert("Upload failed. Check your Azure configuration.");
// //             }
// //         }
// //     };

// //     if (!editor) return null

// //     return (
// //         <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden">
// //             <input type="hidden" name={name} value={content} />

// //             {/* ULTIMATE TOOLBAR */}
// //             <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">

// //                 {/* Basic Group */}
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={18} /></ToolbarButton>
// //                 </ToolbarGroup>

// //                 {/* Advanced Typography */}
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#10b981' }).run()} active={editor.isActive('highlight')} title="Emerald Highlight"><Highlighter size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><SuperIcon size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><SubIcon size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={18} /></ToolbarButton>
// //                 </ToolbarGroup>

// //                 {/* Headings */}
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 size={18} /></ToolbarButton>
// //                 </ToolbarGroup>

// //                 {/* Lists & Tasks */}
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={18} /></ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List"><CheckSquare size={18} /></ToolbarButton>
// //                 </ToolbarGroup>

// //                 {/* Clear Formatting */}
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => {
// //                         editor.chain().focus().unsetAllMarks().run();
// //                         editor.chain().focus().clearNodes().run();
// //                     }} title="Clear Formatting"><Eraser size={18} /></ToolbarButton>
// //                 </ToolbarGroup>

// //                 {/* Color Picker (Basic Example) */}
// //                 <ToolbarGroup>
// //                     <input
// //                         type="color"
// //                         onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
// //                         className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
// //                         value={editor.getAttributes('textStyle').color || '#000000'}
// //                     />
// //                 </ToolbarGroup>

// //                 <ToolbarGroup>
// //                     {/* Media Picker */}
// //                     <input
// //                         type="file"
// //                         id="media-upload"
// //                         multiple
// //                         hidden
// //                         accept="image/*,video/*"
// //                         onChange={handleMediaUpload}
// //                     />
// //                     <ToolbarButton onClick={() => document.getElementById('media-upload')?.click()}>
// //                         <ImageIcon size={18} className="text-emerald-600" />
// //                     </ToolbarButton>

// //                     <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
// //                         <div className="w-5 h-[2px] bg-slate-400" /> {/* Custom Separator Icon */}
// //                     </ToolbarButton>
// //                 </ToolbarGroup>

// //                 <ToolbarGroup>
// //                     {/* Main Insert Button */}
// //                     <ToolbarButton
// //                         onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
// //                         active={editor.isActive('table')}
// //                     >
// //                         <Grid3X3 size={18} />
// //                     </ToolbarButton>

// //                     {/* Contextual Table Tools - Only show when inside a table */}
// //                     {editor.isActive('table') && (
// //                         <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-300 dark:border-slate-700">
// //                             <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
// //                                 <div className="flex flex-col items-center"><Plus size={12} /><Columns size={14} /></div>
// //                             </ToolbarButton>

// //                             <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
// //                                 <div className="flex flex-row items-center"><Plus size={12} /><Rows size={14} /></div>
// //                             </ToolbarButton>

// //                             <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} className="hover:text-red-500 hover:bg-red-50">
// //                                 <Trash2 size={16} />
// //                             </ToolbarButton>
// //                         </div>
// //                     )}
// //                 </ToolbarGroup>

// //                 <ToolbarGroup>
// //                     <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Layout</span>

// //                     {/* Align Left (Text wraps on right) */}
// //                     <ToolbarButton
// //                         onClick={() => {
// //                             if (editor.isActive('image') || editor.isActive('resizable-image')) {
// //                                 editor.chain().focus().updateAttributes('resizable-image', { align: 'left' }).run()
// //                             } else if (editor.isActive('video')) {
// //                                 editor.chain().focus().updateAttributes('video', { align: 'left' }).run()
// //                             }
// //                         }}
// //                     >
// //                         <AlignLeft size={18} />
// //                     </ToolbarButton>

// //                     {/* Align Center (Break text) */}
// //                     <ToolbarButton
// //                         onClick={() => {
// //                             editor.chain().focus().updateAttributes('video', { align: 'center' }).run()
// //                             editor.chain().focus().updateAttributes('resizable-image', { align: 'center' }).run()
// //                         }}
// //                     >
// //                         <AlignCenter size={18} />
// //                     </ToolbarButton>

// //                     {/* Align Right (Text wraps on left) */}
// //                     <ToolbarButton
// //                         onClick={() => {
// //                             editor.chain().focus().updateAttributes('video', { align: 'right' }).run()
// //                             editor.chain().focus().updateAttributes('resizable-image', { align: 'right' }).run()
// //                         }}
// //                     >
// //                         <AlignRight size={18} />
// //                     </ToolbarButton>
// //                 </ToolbarGroup>
// //                 <ToolbarGroup>
// //                     <ToolbarButton onClick={() => editor.chain().focus().updateAttributes('video', { width: '100%' }).run()}>
// //                         <span className="text-xs font-bold">100%</span>
// //                     </ToolbarButton>
// //                     <ToolbarButton onClick={() => editor.chain().focus().updateAttributes('video', { width: '50%' }).run()}>
// //                         <span className="text-xs font-bold">50%</span>
// //                     </ToolbarButton>
// //                 </ToolbarGroup>
// //             </div>

// //             <EditorContent editor={editor} />
// //         </div>
// //     )
// // }

// // // Sub-components for cleaner code
// // const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
// //     <div className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
// //         {children}
// //     </div>
// // )

// // const ToolbarButton = ({ onClick, active, children, title }: any) => (
// //     <button
// //         type="button"
// //         onClick={onClick}
// //         title={title}
// //         className={`p-2 rounded-lg flex items-center justify-center transition-all ${active
// //             ? 'bg-emerald-500 text-white shadow-md scale-105'
// //             : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600'
// //             }`}
// //     >
// //         {children}
// //     </button>
// // )

// // export default PageEditor;

// 'use client'
// import { useState, useRef } from 'react'
// import { useEditor, EditorContent } from '@tiptap/react'
// import StarterKit from '@tiptap/starter-kit'
// import Underline from '@tiptap/extension-underline'
// import Highlight from '@tiptap/extension-highlight'
// import Color from '@tiptap/extension-color'
// import { TextStyle } from '@tiptap/extension-text-style'
// import TaskList from '@tiptap/extension-task-list'
// import TaskItem from '@tiptap/extension-task-item'
// import Youtube from '@tiptap/extension-youtube'
// import Image from '@tiptap/extension-image'
// import { Table } from '@tiptap/extension-table'
// import TableRow from '@tiptap/extension-table-row'
// import TableCell from '@tiptap/extension-table-cell'
// import TableHeader from '@tiptap/extension-table-header'
// import TextAlign from '@tiptap/extension-text-align'
// import { Bold, Italic, Strikethrough, Highlighter, Code, Quote, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, AlignLeft, Camera, AlignCenter, AlignRight, AlignJustify, Grid3X3, Plus, Columns, Rows, Trash2, Minus, X, Type, Palette } from 'lucide-react'

// const PageEditor = ({ initialContent = "", name = "content" }: any) => {
//     const [content, setContent] = useState(initialContent);
//     const [showBlockMenu, setShowBlockMenu] = useState(false);
//     const [showColorPicker, setShowColorPicker] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const editor = useEditor({
//         extensions: [
//             StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
//             Underline,
//             Image.configure({
//                 HTMLAttributes: { class: 'rounded-xl shadow-xl my-6 mx-auto block max-w-full cursor-pointer hover:shadow-2xl transition-shadow' },
//             }),
//             TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
//             TextStyle,
//             Color,
//             Highlight.configure({ multicolor: true }),
//             TaskList,
//             Youtube.configure({ width: 840, height: 480, HTMLAttributes: { class: 'rounded-xl my-6 mx-auto shadow-xl' } }),
//             TaskItem.configure({ nested: true }),
//             Table.configure({
//                 resizable: true,
//                 HTMLAttributes: { class: 'border-collapse table-auto w-full my-6 shadow-md rounded-lg overflow-hidden' },
//             }),
//             TableRow.configure({ HTMLAttributes: { class: 'border-b border-slate-200 dark:border-slate-700' } }),
//             TableHeader.configure({ HTMLAttributes: { class: 'bg-slate-100 dark:bg-slate-800 font-bold p-3 text-left border border-slate-200 dark:border-slate-700' } }),
//             TableCell.configure({ HTMLAttributes: { class: 'p-3 border border-slate-200 dark:border-slate-700' } }),
//         ],
//         content: initialContent,
//         immediatelyRender: false,
//         onUpdate: ({ editor }) => setContent(editor.getHTML()),
//         editorProps: { attributes: { class: 'prose prose-lg prose-emerald dark:prose-invert max-w-4xl mx-auto focus:outline-none min-h-[70vh] px-8 py-12' } },
//     })

//     const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = e.target.files;
//         if (!files || !editor) return;
//         for (const file of Array.from(files)) {
//             const url = URL.createObjectURL(file);
//             if (file.type.startsWith('image/')) {
//                 editor.chain().focus().setImage({ src: url }).run();
//             } else if (file.type.startsWith('video/')) {
//                 editor.chain().focus().insertContent(`<video controls src="${url}" class="rounded-xl my-6 mx-auto shadow-xl max-w-full"></video>`).run();
//             }
//         }
//     };

//     const insertBlock = (type: string) => {
//         if (!editor) return;
//         const actions: any = {
//             h1: () => editor.chain().focus().setHeading({ level: 1 }).run(),
//             h2: () => editor.chain().focus().setHeading({ level: 2 }).run(),
//             h3: () => editor.chain().focus().setHeading({ level: 3 }).run(),
//             paragraph: () => editor.chain().focus().setParagraph().run(),
//             bulletList: () => editor.chain().focus().toggleBulletList().run(),
//             orderedList: () => editor.chain().focus().toggleOrderedList().run(),
//             taskList: () => editor.chain().focus().toggleTaskList().run(),
//             quote: () => editor.chain().focus().toggleBlockquote().run(),
//             code: () => editor.chain().focus().toggleCodeBlock().run(),
//             table: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
//             image: () => fileInputRef.current?.click(),
//             youtube: () => {
//                 const url = window.prompt('Enter YouTube URL:');
//                 if (url) editor.commands.setYoutubeVideo({ src: url });
//             },
//             divider: () => editor.chain().focus().setHorizontalRule().run(),
//         };
//         actions[type]?.();
//         setShowBlockMenu(false);
//     };

//     if (!editor) return null;

//     const blocks = [
//         { id: 'h1', icon: <Heading1 size={20} />, label: 'Heading 1', desc: 'Big section heading' },
//         { id: 'h2', icon: <Heading2 size={20} />, label: 'Heading 2', desc: 'Medium section heading' },
//         { id: 'h3', icon: <Heading3 size={20} />, label: 'Heading 3', desc: 'Small section heading' },
//         { id: 'paragraph', icon: <Type size={20} />, label: 'Paragraph', desc: 'Start writing with plain text' },
//         { id: 'bulletList', icon: <List size={20} />, label: 'Bulleted List', desc: 'Create a simple list' },
//         { id: 'orderedList', icon: <ListOrdered size={20} />, label: 'Numbered List', desc: 'Create a numbered list' },
//         { id: 'taskList', icon: <CheckSquare size={20} />, label: 'Task List', desc: 'Track tasks with checkboxes' },
//         { id: 'quote', icon: <Quote size={20} />, label: 'Quote', desc: 'Capture a quote' },
//         { id: 'code', icon: <Code size={20} />, label: 'Code Block', desc: 'Display code snippet' },
//         { id: 'table', icon: <Grid3X3 size={20} />, label: 'Table', desc: 'Insert a table' },
//         { id: 'image', icon: <Camera size={20} />, label: 'Image', desc: 'Upload an image' },
//         { id: 'youtube', icon: <Camera size={20} />, label: 'YouTube', desc: 'Embed a YouTube video' },
//         { id: 'divider', icon: <Minus size={20} />, label: 'Divider', desc: 'Add a horizontal line' },
//     ];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
//             <input type="hidden" name={name} value={content} />
//             <input ref={fileInputRef} type="file" multiple hidden accept="image/*,video/*" onChange={handleMediaUpload} />

//             <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
//                 <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
//                     <div className="flex items-center gap-3 flex-wrap">
//                         <button type="button" onClick={() => setShowBlockMenu(!showBlockMenu)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
//                             <Plus size={20} /> Add Block
//                         </button>
//                         <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
//                         <div className="flex items-center gap-1 flex-wrap">
//                             <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={18} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={18} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><div className="h-4 w-4 border-b-2 border-current" /></TBtn>
//                             <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
//                             <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left"><AlignLeft size={18} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={18} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right"><AlignRight size={18} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={18} /></TBtn>
//                             <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
//                             <div className="relative">
//                                 <TBtn onClick={() => setShowColorPicker(!showColorPicker)} title="Color"><Palette size={18} /></TBtn>
//                                 {showColorPicker && (
//                                     <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
//                                         <div className="flex items-center gap-2 mb-2">
//                                             <span className="text-sm font-medium">Color</span>
//                                             <button onClick={() => setShowColorPicker(false)}><X size={16} /></button>
//                                         </div>
//                                         <div className="grid grid-cols-6 gap-2">
//                                             {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'].map(c => (
//                                                 <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }} className="w-8 h-8 rounded-md border-2 shadow-sm hover:scale-110 transition" style={{ backgroundColor: c }} />
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                             <TBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={18} /></TBtn>
//                         </div>
//                     </div>
//                     {editor.isActive('table') && (
//                         <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
//                             <span className="text-xs font-medium mr-2">Table:</span>
//                             <TBtn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column"><Columns size={16} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row"><Rows size={16} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column"><Trash2 size={16} /></TBtn>
//                             <TBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row"><Trash2 size={16} /></TBtn>
//                             <button onClick={() => editor.chain().focus().deleteTable().run()} className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md text-sm font-medium">Delete Table</button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {showBlockMenu && (
//                 <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={() => setShowBlockMenu(false)}>
//                     <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
//                         <div className="p-6 border-b border-slate-200 dark:border-slate-800">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-2xl font-bold">Add Block</h2>
//                                 <button onClick={() => setShowBlockMenu(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={24} /></button>
//                             </div>
//                             <p className="text-slate-600 dark:text-slate-400">Choose a block to add to your page</p>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 overflow-y-auto max-h-[60vh]">
//                             {blocks.map(b => (
//                                 <button key={b.id} onClick={() => insertBlock(b.id)} className="flex items-start gap-4 p-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-2 border-transparent hover:border-emerald-500 transition-all group text-left">
//                                     <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">{b.icon}</div>
//                                     <div className="flex-1">
//                                         <div className="font-semibold mb-1">{b.label}</div>
//                                         <div className="text-sm text-slate-600 dark:text-slate-400">{b.desc}</div>
//                                     </div>
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="max-w-5xl mx-auto py-8 px-4">
//                 <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
//                     <EditorContent editor={editor} />
//                 </div>
//             </div>

//             <button onClick={() => setShowBlockMenu(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40" title="Add Block">
//                 <Plus size={28} />
//             </button>
//         </div>
//     )
// }

// const TBtn = ({ onClick, active, children, title }: any) => (
//     <button type="button" onClick={onClick} title={title} className={`p-2 rounded-lg transition-all ${active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{children}</button>
// )

// export default PageEditor;

