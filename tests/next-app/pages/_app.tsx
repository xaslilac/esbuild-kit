import "@nova/ui/css";
// import "@nova/ui/build/dist/index.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
