import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Primary favicon (ICO format for maximum compatibility) */}
          <link rel="icon" href="/favicon.ico" />
          
          {/* SVG favicon for modern browsers */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          
          {/* iOS touch icon */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          
          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#2E3A59" />
          
          {/* Microsoft Tiles */}
          <meta name="msapplication-TileColor" content="#2E3A59" />
          <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
          
          {/* Web app manifest for PWA support */}
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 