import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/react-editor'
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
		const md = editorRef?.current
			? editorRef?.current.getInstance().getMarkdown()
			: ''
		onChange(md)
	}

	return (
		<Editor
			height='auto'
			initialValue={initialValue}
			onChange={handleChange}
			previewStyle='vertical'
			ref={editorRef}
			useCommandShortcut={true}
		/>
	)
}
