'use client';

import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { common, createLowlight } from 'lowlight';
import {
  Box,
  Group,
  ActionIcon,
  Tooltip,
  Divider,
  useMantineColorScheme,
  Paper,
  TextInput,
  Button,
  Popover,
  Stack,
  Text,
  ColorSwatch,
  SimpleGrid,
} from '@mantine/core';
import { useState } from 'react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconHighlight,
  IconClearFormatting,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconList,
  IconListNumbers,
  IconListCheck,
  IconQuote,
  IconLink,
  IconLinkOff,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconSeparator,
  IconSourceCode,
  IconSuperscript,
  IconSubscript,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconColorPicker,
  IconCircleOff,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

const lowlight = createLowlight(common);

// Color palette for text colors
const TEXT_COLORS = [
  // Row 1: Grayscale
  { color: '#000000', label: 'Black' },
  { color: '#495057', label: 'Dark Gray' },
  { color: '#868e96', label: 'Gray' },
  { color: '#adb5bd', label: 'Light Gray' },
  // Row 2: GT Colors
  { color: GT_COLORS.navy, label: 'GT Navy' },
  { color: GT_COLORS.techGold, label: 'GT Gold' },
  { color: GT_COLORS.boldBlue, label: 'GT Blue' },
  { color: '#54585A', label: 'GT Gray' },
  // Row 3: Semantic colors
  { color: '#c92a2a', label: 'Red' },
  { color: '#e67700', label: 'Orange' },
  { color: '#2b8a3e', label: 'Green' },
  { color: '#1971c2', label: 'Blue' },
  // Row 4: More colors
  { color: '#862e9c', label: 'Purple' },
  { color: '#d6336c', label: 'Pink' },
  { color: '#0c8599', label: 'Cyan' },
  { color: '#5c940d', label: 'Lime' },
];

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, active, onClick, disabled }: ToolbarButtonProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Tooltip label={label} position="top" withArrow>
      <ActionIcon
        variant={active ? 'filled' : 'subtle'}
        size="md"
        onClick={onClick}
        disabled={disabled}
        styles={{
          root: {
            backgroundColor: active
              ? (dark ? GT_COLORS.navy : `${GT_COLORS.techGold}40`)
              : 'transparent',
            color: active
              ? (dark ? GT_COLORS.techGold : GT_COLORS.navy)
              : (dark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)'),
            '&:hover': {
              backgroundColor: active
                ? (dark ? GT_COLORS.navy : `${GT_COLORS.techGold}50`)
                : (dark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)'),
            },
            '&:disabled': {
              opacity: 0.4,
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
}

interface TipTapEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  initialValue = '',
  onChange,
  placeholder = 'Share your experience with this course...',
}: TipTapEditorProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const [linkPopoverOpened, setLinkPopoverOpened] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [colorPopoverOpened, setColorPopoverOpened] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Superscript,
      Subscript,
      Underline,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialValue && editor.isEmpty) {
      editor.commands.setContent(initialValue);
    }
  }, [editor, initialValue]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkPopoverOpened(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkPopoverOpened(true);
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    setColorPopoverOpened(false);
  }, [editor]);

  const unsetColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetColor().run();
    setColorPopoverOpened(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const currentColor = editor.getAttributes('textStyle').color;

  return (
    <Paper
      radius="md"
      withBorder
      style={{
        overflow: 'hidden',
        borderColor: dark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
      }}
    >
      {/* Toolbar */}
      <Box
        p="xs"
        style={{
          backgroundColor: dark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
          borderBottom: `1px solid ${dark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
        }}
      >
        <Group gap={4} wrap="wrap">
          {/* Text formatting */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconBold size={16} />}
              label="Bold (Ctrl+B)"
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              icon={<IconItalic size={16} />}
              label="Italic (Ctrl+I)"
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              icon={<IconUnderline size={16} />}
              label="Underline (Ctrl+U)"
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <ToolbarButton
              icon={<IconStrikethrough size={16} />}
              label="Strikethrough"
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <ToolbarButton
              icon={<IconCode size={16} />}
              label="Inline Code"
              active={editor.isActive('code')}
              onClick={() => editor.chain().focus().toggleCode().run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Highlight & Color */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconHighlight size={16} />}
              label="Highlight"
              active={editor.isActive('highlight')}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            />
            <Popover
              opened={colorPopoverOpened}
              onChange={setColorPopoverOpened}
              position="bottom"
              withArrow
            >
              <Popover.Target>
                <Box>
                  <Tooltip label="Text Color" position="top" withArrow>
                    <ActionIcon
                      variant="subtle"
                      size="md"
                      onClick={() => setColorPopoverOpened(!colorPopoverOpened)}
                      styles={{
                        root: {
                          color: dark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)',
                          '&:hover': {
                            backgroundColor: dark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)',
                          },
                        },
                      }}
                    >
                      <IconColorPicker size={16} style={{ color: currentColor || 'inherit' }} />
                    </ActionIcon>
                  </Tooltip>
                </Box>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Text Color</Text>
                  <SimpleGrid cols={4} spacing={4}>
                    {TEXT_COLORS.map(({ color, label }) => (
                      <Tooltip key={color} label={label} position="top" withArrow>
                        <ColorSwatch
                          color={color}
                          size={24}
                          onClick={() => setColor(color)}
                          style={{ cursor: 'pointer', border: currentColor === color ? '2px solid var(--mantine-color-blue-5)' : '1px solid var(--mantine-color-gray-4)' }}
                        />
                      </Tooltip>
                    ))}
                  </SimpleGrid>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    leftSection={<IconCircleOff size={14} />}
                    onClick={unsetColor}
                  >
                    Reset Color
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <ToolbarButton
              icon={<IconClearFormatting size={16} />}
              label="Clear Formatting"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Headings */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconH1 size={16} />}
              label="Heading 1"
              active={editor.isActive('heading', { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <ToolbarButton
              icon={<IconH2 size={16} />}
              label="Heading 2"
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              icon={<IconH3 size={16} />}
              label="Heading 3"
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
            <ToolbarButton
              icon={<IconH4 size={16} />}
              label="Heading 4"
              active={editor.isActive('heading', { level: 4 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Lists */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconList size={16} />}
              label="Bullet List"
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              icon={<IconListNumbers size={16} />}
              label="Numbered List"
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              icon={<IconListCheck size={16} />}
              label="Task List"
              active={editor.isActive('taskList')}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Block elements */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconQuote size={16} />}
              label="Blockquote"
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton
              icon={<IconSeparator size={16} />}
              label="Horizontal Rule"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />
            <ToolbarButton
              icon={<IconSourceCode size={16} />}
              label="Code Block"
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Sub/Superscript */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconSubscript size={16} />}
              label="Subscript"
              active={editor.isActive('subscript')}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            />
            <ToolbarButton
              icon={<IconSuperscript size={16} />}
              label="Superscript"
              active={editor.isActive('superscript')}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Link */}
          <Group gap={2}>
            <Popover
              opened={linkPopoverOpened}
              onChange={setLinkPopoverOpened}
              position="bottom"
              withArrow
            >
              <Popover.Target>
                <Box>
                  <ToolbarButton
                    icon={<IconLink size={16} />}
                    label="Add Link (Ctrl+K)"
                    active={editor.isActive('link')}
                    onClick={openLinkPopover}
                  />
                </Box>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Insert Link</Text>
                  <TextInput
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    size="xs"
                    styles={{
                      input: {
                        minWidth: 200,
                      },
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLink();
                      }
                    }}
                  />
                  <Group justify="flex-end" gap="xs">
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => setLinkPopoverOpened(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      onClick={setLink}
                      style={{
                        backgroundColor: GT_COLORS.techGold,
                        color: GT_COLORS.navy,
                      }}
                    >
                      Apply
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            {editor.isActive('link') && (
              <ToolbarButton
                icon={<IconLinkOff size={16} />}
                label="Remove Link"
                onClick={() => editor.chain().focus().unsetLink().run()}
              />
            )}
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Text Alignment */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconAlignLeft size={16} />}
              label="Align Left"
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />
            <ToolbarButton
              icon={<IconAlignCenter size={16} />}
              label="Align Center"
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />
            <ToolbarButton
              icon={<IconAlignJustified size={16} />}
              label="Align Justify"
              active={editor.isActive({ textAlign: 'justify' })}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            />
            <ToolbarButton
              icon={<IconAlignRight size={16} />}
              label="Align Right"
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
          </Group>

          <Divider orientation="vertical" color={dark ? 'dark.4' : 'gray.3'} />

          {/* Undo/Redo */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconArrowBackUp size={16} />}
              label="Undo (Ctrl+Z)"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              icon={<IconArrowForwardUp size={16} />}
              label="Redo (Ctrl+Y)"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            />
          </Group>
        </Group>
      </Box>

      {/* Editor Content */}
      <Box
        style={{
          backgroundColor: dark ? 'var(--mantine-color-dark-7)' : '#fff',
        }}
      >
        <EditorContent
          editor={editor}
          style={{
            minHeight: 200,
          }}
        />
      </Box>

      {/* Editor Styles */}
      <style>{`
        .tiptap {
          padding: 16px;
          min-height: 200px;
          outline: none;
          color: ${dark ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-dark-9)'};
          background-color: ${dark ? 'var(--mantine-color-dark-7)' : '#fff'};
        }
        .tiptap.ProseMirror {
          color: ${dark ? '#c1c2c5' : '#1a1b1e'} !important;
          background-color: ${dark ? '#25262b' : '#fff'} !important;
        }
        .ProseMirror {
          color: ${dark ? '#c1c2c5' : '#1a1b1e'} !important;
          background-color: ${dark ? '#25262b' : '#fff'} !important;
        }
        .tiptap:focus,
        .ProseMirror:focus {
          outline: none;
        }
        .tiptap p {
          margin: 0 0 0.75em 0;
        }
        .tiptap p:last-child {
          margin-bottom: 0;
        }
        .tiptap h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em 0;
          color: ${dark ? 'var(--mantine-color-gray-0)' : GT_COLORS.navy};
        }
        .tiptap h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: ${dark ? 'var(--mantine-color-gray-1)' : GT_COLORS.navy};
        }
        .tiptap h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: ${dark ? 'var(--mantine-color-gray-2)' : GT_COLORS.navy};
        }
        .tiptap h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: ${dark ? 'var(--mantine-color-gray-3)' : GT_COLORS.navy};
        }
        .tiptap a {
          color: ${GT_COLORS.boldBlue};
          text-decoration: underline;
        }
        .tiptap blockquote {
          border-left: 4px solid ${GT_COLORS.techGold};
          padding-left: 16px;
          margin: 1em 0;
          color: ${dark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)'};
          font-style: italic;
        }
        .tiptap code {
          background-color: ${dark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)'};
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Monaco', 'Menlo', monospace;
        }
        .tiptap pre {
          background-color: ${dark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'};
          padding: 16px;
          border-radius: 8px;
          overflow: auto;
          margin: 1em 0;
        }
        .tiptap pre code {
          background-color: transparent;
          padding: 0;
          font-size: 0.875em;
        }
        .tiptap ul,
        .tiptap ol {
          padding-left: 24px;
          margin: 0.5em 0;
        }
        .tiptap li {
          margin: 0.25em 0;
        }
        .tiptap hr {
          border: none;
          border-top: 2px solid ${dark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'};
          margin: 1.5em 0;
        }
        .tiptap mark {
          background-color: ${dark ? '#5c4d1a' : '#fff3b0'};
          padding: 0.125em 0.25em;
          border-radius: 2px;
        }
        .tiptap u {
          text-decoration: underline;
        }
        .tiptap sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        .tiptap sup {
          vertical-align: super;
          font-size: 0.75em;
        }
        /* Task List Styles */
        .tiptap ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 0.5em 0;
        }
        .tiptap ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 0.5em 0;
        }
        .tiptap ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          user-select: none;
        }
        .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
          cursor: pointer;
          accent-color: ${GT_COLORS.techGold};
        }
        .tiptap ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .tiptap ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }
        /* Nested task lists */
        .tiptap ul[data-type="taskList"] ul[data-type="taskList"] {
          margin-left: 24px;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: ${dark ? 'var(--mantine-color-dark-3)' : 'var(--mantine-color-gray-5)'};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        /* Text alignment */
        .tiptap .is-editor-empty:first-child::before {
          text-align: inherit;
        }
        /* Code syntax highlighting */
        .tiptap pre .hljs-comment,
        .tiptap pre .hljs-quote {
          color: ${dark ? '#6a9955' : '#008000'};
        }
        .tiptap pre .hljs-keyword,
        .tiptap pre .hljs-selector-tag,
        .tiptap pre .hljs-addition {
          color: ${dark ? '#569cd6' : '#0000ff'};
        }
        .tiptap pre .hljs-string,
        .tiptap pre .hljs-meta .hljs-string {
          color: ${dark ? '#ce9178' : '#a31515'};
        }
        .tiptap pre .hljs-number,
        .tiptap pre .hljs-literal,
        .tiptap pre .hljs-variable,
        .tiptap pre .hljs-template-variable,
        .tiptap pre .hljs-tag .hljs-attr {
          color: ${dark ? '#b5cea8' : '#098658'};
        }
        .tiptap pre .hljs-title,
        .tiptap pre .hljs-section,
        .tiptap pre .hljs-selector-id {
          color: ${dark ? '#dcdcaa' : '#795e26'};
        }
      `}</style>
    </Paper>
  );
}
