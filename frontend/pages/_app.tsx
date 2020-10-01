import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import "mapbox-gl/dist/mapbox-gl.css";
import "../components/Map/map.css";

import { Provider as AppContextProvider } from "../providers/AppContext";

export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>EcoTeka</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
        />
      </Head>
      <CssBaseline />
      <I18nextProvider i18n={i18n}>
        <AppContextProvider>
          <Component {...pageProps} />
        </AppContextProvider>
      </I18nextProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};