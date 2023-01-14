import { Html, Main, Head, NextScript } from "next/document";
export default function Document() {
  return (
    <Html data-theme="cmyk">
      <Head lang="en">
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="./tk.svg" />
        <link rel="apple-touch-icon" href="./tk.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://unpkg.com/cursor-chat/dist/style.css"
        />
      </Head>
      <body>
        <div id="cursor-chat-layer">
          <input type="text" id="cursor-chat-box" />
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
