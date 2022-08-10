import { Grid } from '@mui/material'
import type { NextPage } from 'next'
import { useAuth } from '../../context/AuthContext'
import { useMenu } from '../../context/MenuContext'
import Stack from '@mui/material/Stack'
import SocialButton from './SocialButton'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import { TProviderName } from '@globals/types'

const Login: NextPage = () => {
	const { signInWithProvider, signWithMagic } = useAuth()
	const { handleLoginModalClose } = useMenu()
	const [email, setEmail] = useState()
	const handleEmailChange = (event: any) => {
		setEmail(event?.target?.value)
	}
	const handleKeyPress = (event: any) => {
		if (event?.charCode == 13) {
			signWithMagic(email)
			handleLoginModalClose()
		}
	}

	const providers: TProviderName[] = ['Google', 'Facebook', 'Github']

	return (
		<Grid
			container
			spacing={0}
			direction='column'
			alignItems='center'
			justifyContent='center'
			style={{ padding: '40px 20px' }}
		>
			<Typography
				style={{ marginBottom: '20px' }}
				variant='overline'
				component='div'
				gutterBottom
			>
				Login via preferred method
			</Typography>
			<Grid item xs={3}>
				<Stack spacing={2}>
					<TextField
						onChange={handleEmailChange}
						onKeyPress={handleKeyPress}
						sx={{ textAlign: 'center' }}
						label={`🔮 Enter an email address`}
					></TextField>
					{providers.map((provider: TProviderName, index) => {
						return (
							<>
								<SocialButton
									key={index}
									onClick={() => {
										signInWithProvider(provider)
										handleLoginModalClose()
									}}
									provider={provider}
								></SocialButton>
							</>
						)
					})}
				</Stack>
			</Grid>
		</Grid>
	)
}

export default Login
