import * as React from 'react'
import { CacheProvider, EmotionCache } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { NavBar } from '../src/components/NavBar'
import createEmotionCache from '../src/createEmotionCache'
// import Copyright from '../src/Copyright'
import theme from '../src/theme'
import { AuthContextProvider } from '../context/AuthContext'
import { MenuContextProvider } from '../context/MenuContext'
import { AlertContextProvider } from '../context/AlertContext'
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache
}

export default function MyApp(props: MyAppProps) {
	const {
		Component,
		emotionCache = clientSideEmotionCache,
		pageProps: { ...pageProps },
	} = props
	return (
		<CacheProvider value={emotionCache}>
			<AlertContextProvider>
				<AuthContextProvider>
					<Head>
						<meta
							name='viewport'
							content='initial-scale=1, width=device-width'
						/>
						<title>OMSHub</title>
					</Head>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<MenuContextProvider>
							<NavBar />
						</MenuContextProvider>
						<Component {...pageProps} />
					</ThemeProvider>
				</AuthContextProvider>
			</AlertContextProvider>
		</CacheProvider>
	)
}
