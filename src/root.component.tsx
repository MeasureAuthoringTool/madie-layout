import React from "react";

import GlobalStyles from "./styles/GlobalStyles";
import { BrowserRouter } from "react-router-dom";
import OktaSecurity from "./okta/OktaSecurity";
import MainNavBar from "./components/MainNavBar/MainNavBar";

export default function Root(props) {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <MainNavBar />
        <OktaSecurity />
      </BrowserRouter>
    </>
  );
}
