import { Node, mergeAttributes } from '@tiptap/core'
export const Video = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            controls: { default: true },
            width: { default: '100%' },
            style: { default: 'max-width: 100%; height: auto; display: block; margin: 1rem auto; border-radius: 8px;' }
        }
    },

    parseHTML() {
        return [{
            tag: 'video',
            getAttrs: dom => ({
                src: dom.getAttribute('src'),
            }),
        }]
    },

    renderHTML({ HTMLAttributes }) {
        // This generates the actual <video> tag in the editor's HTML
        return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    },
})