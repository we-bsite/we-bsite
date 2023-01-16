import "../styles/index.scss";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>҉ .｡⋆° (𝓌𝑒)𝒷𝓈𝒾𝓉𝑒 ˚｡⋆ ◌</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
