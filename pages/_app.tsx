import { AlertBar } from '@components/AlertBar'
import { AlertContextProvider } from '@context/AlertContext'
import { AuthContextProvider } from '@context/AuthContext'
import { MenuContextProvider } from '@context/MenuContext'
import { CacheProvider, EmotionCache } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { NavBar } from '@src/components/NavBar'
import createEmotionCache from '@src/createEmotionCache'
import theme from '@src/theme'
import { AppProps } from 'next/app'
import Head from 'next/head'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache
	fallback: object
}

const MyApp = ({
	Component,
	emotionCache = clientSideEmotionCache,
	pageProps,
}: MyAppProps) => (
	<CacheProvider value={emotionCache}>
		<AlertContextProvider>
			<AuthContextProvider>
				<Head>
					<meta name='viewport' content='initial-scale=1, width=device-width' />
					<title>OMSHub</title>
				</Head>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<MenuContextProvider>
						<NavBar />
						<AlertBar />
					</MenuContextProvider>
					<Component {...pageProps} />
				</ThemeProvider>
				{/* <Copyright /> */}
			</AuthContextProvider>
		</AlertContextProvider>
	</CacheProvider>
)

export default MyApp
