'use client';

import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
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
} from '@mantine/core';
import { useState } from 'react';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconCode,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconLinkOff,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconSeparator,
  IconSourceCode,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

const lowlight = createLowlight(common);

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
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

  if (!editor) {
    return null;
  }

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
              label="Bold"
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              icon={<IconItalic size={16} />}
              label="Italic"
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
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

          {/* Headings */}
          <Group gap={2}>
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
                    label="Add Link"
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

          {/* Undo/Redo */}
          <Group gap={2}>
            <ToolbarButton
              icon={<IconArrowBackUp size={16} />}
              label="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              icon={<IconArrowForwardUp size={16} />}
              label="Redo"
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
        .tiptap p.is-editor-empty:first-child::before {
          color: ${dark ? 'var(--mantine-color-dark-3)' : 'var(--mantine-color-gray-5)'};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
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
