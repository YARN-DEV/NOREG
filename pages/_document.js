import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content="Premium eBook store - Discover amazing digital books" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}