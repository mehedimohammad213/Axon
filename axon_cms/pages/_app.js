// pages/_app.js

import React from "react";
import Site from "../components/SiteContent"; // Adjust the import path if necessary
import "../styles/globals.css";
// Import React Quill CSS here
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.core.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Head from "next/head";
import { AuthProvider } from "../src/context/AuthContext";
import { MenuRefreshProvider } from "../src/context/MenuRefreshContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { Provider } from "react-redux";
import store from "../store";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/images/headless_favicon.svg" />
      </Head>
      <AuthProvider>
        <MenuRefreshProvider>
          <ThemeProvider>
            {" "}
            {/* Wrap with ThemeProvider */}
            <Site>
              <Component {...pageProps} />
            </Site>
          </ThemeProvider>
        </MenuRefreshProvider>
      </AuthProvider>
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 leading-none text-gray-600">
              <div className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-dark"></div>
              <span className="truncate text-xs leading-none sm:text-sm">
                © {new Date().getFullYear()}{" "}
                <span className="bg-gradient-to-r from-brand via-blue-400 to-blue-500 bg-clip-text font-semibold text-transparent">
                  HEADLESS CMS
                </span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs leading-none text-gray-600 sm:text-sm">
              <div className="hidden h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-dark sm:block"></div>
              <span className="font-light">Powered by</span>
              <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text font-semibold text-transparent">
                MEHEDI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </Provider>
  );
}

export default MyApp;
