import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/react-editor'
import DOMPurify from 'isomorphic-dompurify'
import { useRef } from 'react'

//SSR is currently not supported for toastui

export default function FormEditor({
	initialValue,
	onChange,
}: {
	initialValue: string
	onChange: any
}) {
	const editorRef = useRef<Editor>(null)

	function handleChange() {
		const dirty = editorRef?.current
			? editorRef?.current.getInstance().getMarkdown()
			: ''
		const clean = DOMPurify.sanitize(dirty, { FORBID_TAGS: ['img'] })
		onChange(clean)
		console.log(clean)
	}

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
	)
}
