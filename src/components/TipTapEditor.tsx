import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import IconButton from '@mui/material/IconButton';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
const editorExtensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
];
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className='control-group'>
      <div className='IconButton-group'>
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <FormatBoldIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <FormatItalicIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <FormatStrikethroughIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          <CodeIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive('heading', { level: 1 }) ? 'is-active' : ''
          }
        >
          H1
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
          }
        >
          H2
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive('heading', { level: 3 }) ? 'is-active' : ''
          }
        >
          H3
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive('heading', { level: 4 }) ? 'is-active' : ''
          }
        >
          H4
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive('heading', { level: 5 }) ? 'is-active' : ''
          }
        >
          H5
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive('heading', { level: 6 }) ? 'is-active' : ''
          }
        >
          H6
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <FormatListBulletedIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <FormatListNumberedIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          Code block
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Blockquote
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </IconButton>
        <IconButton onClick={() => editor.chain().focus().setHardBreak().run()}>
          Hard break
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          Undo
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          Redo
        </IconButton>
      </div>
    </div>
  );
};

const Tiptap = ({
  initialValue,
  onChange,
}: {
  initialValue: any;
  onChange: any;
}) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content: initialValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};

export default Tiptap;
