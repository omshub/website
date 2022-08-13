import { useAlert } from '@context/AlertContext'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

export const AlertBar = () => {
	const { alert, setAlert } = useAlert()

	return (
		<Box>
			{alert && (
				<Alert
					severity={alert.severity}
					variant={alert.variant}
					onClose={() => {
						setAlert(null)
					}}
				>
					{alert.text}
				</Alert>
			)}
		</Box>
	)
}
