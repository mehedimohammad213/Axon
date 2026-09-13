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
import PromoPopup from "../components/promotional/PromoPopup";
import { Provider } from "react-redux";
import store from "../store";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>Headless CMS</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/images/headless_favicon.svg" />
      </Head>
      <AuthProvider>
        <MenuRefreshProvider>
          <ThemeProvider>
            {" "}
            {/* Wrap with ThemeProvider */}
            <Site>
              <PromoPopup />
              <Component {...pageProps} />
            </Site>
          </ThemeProvider>
        </MenuRefreshProvider>
      </AuthProvider>
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            {/* Left Section - Copyright */}
            <div className="flex items-center gap-2 text-gray-600 leading-none">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-brand to-brand-dark shrink-0"></div>
              <span className="text-sm leading-none">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold bg-gradient-to-r from-brand via-blue-400 to-blue-500 bg-clip-text text-transparent">
                  HEADLESS CMS
                </span>
              </span>
            </div>

            {/* Right Section - Powered By */}
            <div className="flex items-center gap-2 text-gray-600 text-sm leading-none">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-brand to-brand-dark shrink-0"></div>
              <span className="font-light">Powered by</span>
              <span className="font-semibold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
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
