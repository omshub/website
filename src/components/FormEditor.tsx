import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Editor } from '@toast-ui/react-editor';
import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
//SSR is currently not supported for toastui

export default function FormEditor({
  initialValue,
  onChange,
}: {
  initialValue: any;
  onChange: any;
}) {
  const editorRef = useRef<Editor>(null);
  const theme = useTheme();

  function handleChange() {
    const dirty = editorRef?.current
      ? editorRef?.current.getInstance().getMarkdown()
      : '';
    const clean = DOMPurify.sanitize(dirty, { FORBID_TAGS: ['img'] });
    onChange(clean);
  }

  useEffect(() => {
    //Set initial value this way because theres a character limit the other way when doing it via prop
    if (!editorRef?.current?.getInstance().getMarkdown()) {
      editorRef?.current?.getInstance().setMarkdown(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef?.current?.getInstance().getMarkdown(), initialValue]);

  return (
    <Box
      className={`${theme.palette.mode == 'dark' ? 'toastui-editor-dark' : ''}`}
    >
      <Editor
        height='auto'
        initialValue={initialValue}
        onChange={handleChange}
        initialEditType='wysiwyg'
        previewStyle='vertical'
        ref={editorRef}
        theme={`${theme.palette.mode}`}
        useCommandShortcut={true}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'link'],
          ['code', 'codeblock'],
        ]}
        plugins={[[codeSyntaxHighlight, { highlighter: Prism }]]}
        customHTMLSanitizer={DOMPurify.sanitize}
      />
    </Box>
  );
}
