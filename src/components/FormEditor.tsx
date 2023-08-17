import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';

//SSR is currently not supported for toastui

export default function FormEditor({
  initialValue,
  onChange,
}: {
  initialValue:any;
  onChange: any;
}) {
  
const editorRef = useRef<Editor>(null);
    
    
function handleChange() {
    // Ensure to store as markdown
    const dirty = editorRef?.current?.getInstance().getMarkdown()
    const clean = DOMPurify.sanitize(dirty!, { FORBID_TAGS: ['img'] });
    onChange(clean)
  }
  

  useEffect(()=>{
    //Set initial value this way because theres a character limit the other way when doing it via prop
    if(!editorRef?.current?.getInstance().getMarkdown()){
      editorRef?.current?.getInstance().setMarkdown(initialValue)
    }
  },[editorRef?.current?.getInstance().getMarkdown(),initialValue]);

  return (
    <Editor
      height='auto'
      initialValue={' '}
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
