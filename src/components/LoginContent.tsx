import { useAuth } from '@context/AuthContext'
import { useMenu } from '@context/MenuContext'
import { TSignInAction } from '@context/types'
import { TProviderName } from '@globals/types'
import { Grid } from '@mui/material'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import { useState } from 'react'
import SocialButton from '@components/SocialButton'

const Login: NextPage = () => {
	const authContext = useAuth()

	/* eslint-disable no-unused-vars */
	let signInWithProvider: TSignInAction = (email: string) => {}
	let signWithMagic: TSignInAction = (email: string) => {}
	/* eslint-enable no-unused-vars */

	if (authContext) {
		;({ signInWithProvider, signWithMagic } = authContext)
	}
	const { handleLoginModalClose } = useMenu()
	const [email, setEmail] = useState<string>('')
	const handleEmailChange = (event: any) => {
		setEmail(event?.target?.value)
	}
	const handleKeyPress = (event: any) => {
		if (event?.charCode === 13) {
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
					{providers.map((provider: TProviderName, index) => (
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
					))}
				</Stack>
			</Grid>
		</Grid>
	)
}

export default Login
