import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  function handleChange() {
    const dirty = editorRef?.current
      ? editorRef?.current.getInstance().getMarkdown()
      : '';
    const clean = DOMPurify.sanitize(dirty, { FORBID_TAGS: ['img'] });
    onChange(clean);
  }

  useEffect(()=>{
    //Set initial value this way because theres a character limit the other way when doing it via prop
    if(!editorRef?.current?.getInstance().getMarkdown()){
      editorRef?.current?.getInstance().setMarkdown(initialValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[editorRef?.current?.getInstance().getMarkdown(),initialValue]);

  return (
    <Box sx={{
    "& .toastui-editor-dark":{
      borderColor: "#494c56",
      "& .ProseMirror":{
        color:`${theme.palette.secondary.contrastText}`
      },
      "& .toastui-editor-contents p":{
        color: `${theme.palette.secondary.contrastText}`
      },
      "& .toastui-editor-md-splitter":{
        backgroundColor: `${theme.palette.secondary.light}`
      },
      "& .toastui-editor-main":{
        backgroundColor:`${theme.palette.secondary.main}`
      },
      "& .toastui-editor-defaultUI-toolbar":{
        backgroundColor:`${theme.palette.secondary.light}`,
        borderColor: '#494c56',
        "& button":{
          borderColor:"#232428",
          "&:not(:disabled):hover":{
            backgroundColor: "#36383f",
            borderColor: "#36383f"
          }
        }
      },
      "& .toastui-editor-ww-container":{
        backgroundColor:`${theme.palette.secondary.main}`
      },
      "& .toastui-editor-mode-switch":{
        borderTop: '1px solid #393b42',
        backgroundColor:`${theme.palette.secondary.light}`,
        "& .tab-item":{
          backgroundColor: `${theme.palette.secondary.light}`,
          border: 'none',
          borderTopColor: '#393b42',
          "&.active":{
            borderTopColor: `${theme.palette.secondary.main}`,
            backgroundColor: `${theme.palette.secondary.main}`,
          }
        }
      }
    }
    }}
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
        customHTMLSanitizer={DOMPurify.sanitize}
      />
      </Box>
  );
}
