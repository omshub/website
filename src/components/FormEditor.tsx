import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';

//SSR is currently not supported for toastui

export default function FormEditor({
  initialValue,
  onChange,
  value,
  ref,
}: {
  initialValue:any;
  onChange: any;
  value: any,
  ref: any,
}) {
  const editorRef = useRef<Editor>(ref);
  

  function handleChange() {
    const dirty = editorRef?.current?.getInstance().isMarkdownMode()
      ? editorRef?.current.getInstance().getMarkdown()
      : editorRef?.current.getInstance().getHTML();
    const clean = DOMPurify.sanitize(dirty, { FORBID_TAGS: ['img'] });
    onChange(clean)
  }
  
  
  useEffect(()=>{
    editorRef?.current?.getInstance().isMarkdownMode() ? editorRef?.current?.getInstance().setMarkdown(value) : editorRef?.current?.getInstance().setHTML(value);
  },[value]);

  return (
    <Editor
      height='auto'
      initialValue={initialValue}
      onChange={handleChange}
      initialEditType='wysiwyg'
      previewStyle='vertical'
      ref={editorRef}
      useCommandShortcut={true}
      toolbarItems={[
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'link'],
        ['code', 'codeblock'],
      ]}
      customHTMLSanitizer={DOMPurify.sanitize}
    />
  );
}
