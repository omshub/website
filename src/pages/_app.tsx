import { AppProps } from 'next/app';
import '@/styles/global.css';
import 'semantic-ui-css/semantic.min.css';
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
