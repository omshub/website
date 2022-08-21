import Button from '@mui/material/Button'
import GoogleIcon from '@src/assets/GoogleIcon'
import FacebookIcon from '@mui/icons-material/Facebook'
import GitHubIcon from '@mui/icons-material/GitHub'
import AppleIcon from '@mui/icons-material/Apple'
import { TKeyMap, TProviderName } from '@globals/types'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace'

interface SocialButtonProps {
	key?: number
	provider: TProviderName
	variant?: string
	style?: object
	onClick?: () => void
}

interface Provider {
	style: TKeyMap
	SocialIcon: EmotionJSX.Element
}

type TProviders = {
	// eslint-disable-next-line no-unused-vars
	[provider in TProviderName]: Provider
}

const providers: TProviders = {
	Google: {
		style: {
			background: 'white',
			color: 'black',
			padding: '10px',
		},
		SocialIcon: <GoogleIcon style={{ margin: '0 10px' }} />,
	},
	Facebook: {
		style: {
			background: '#293e69',
			color: 'white',
			padding: '10px',
		},
		SocialIcon: <FacebookIcon style={{ margin: '0 10px' }} />,
	},
	Github: {
		style: {
			background: '#555555',
			color: 'white',
			padding: '10px',
		},
		SocialIcon: <GitHubIcon style={{ margin: '0 10px' }} />,
	},
	Apple: {
		style: {
			background: '#3333331c',
			color: 'black',
			padding: '10px',
		},
		SocialIcon: <AppleIcon style={{ margin: '0 10px' }} />,
	},
}
const SocialButton = ({ ...props }: SocialButtonProps) => {
	const { style, SocialIcon } = providers[`${props.provider}`]
	return (
		<>
			<Button key={props.key} onClick={props.onClick} style={style}>
				{SocialIcon}
				{`Sign in with ${props.provider}`}
			</Button>
		</>
	)
}

export default SocialButton
