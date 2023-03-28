import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";

function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ModalsProvider>
        <Component {...pageProps} />;
      </ModalsProvider>
    </MantineProvider>
  );
}

export default appWithTranslation(App);
