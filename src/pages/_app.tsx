import "../styles/index.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log(
      "Hi there friend. If you'd like, poke around the source code! https://github.com/we-bsite/we-bsite"
    );
  }, []);

  return (
    <>
      <Head>
        <title>҉ .｡⋆° (𝓌𝑒)𝒷𝓈𝒾𝓉𝑒 ˚｡⋆ ◌</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Dialog.Root>
        <Component {...pageProps} />
      </Dialog.Root>
    </>
  );
}
