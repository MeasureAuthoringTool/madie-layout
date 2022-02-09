import React from "react";

import GlobalStyles from "./styles/GlobalStyles";
import { BrowserRouter } from "react-router-dom";
import OktaSecurity from "./okta/OktaSecurity";

export default function Root() {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <OktaSecurity />
      </BrowserRouter>
    </>
  );
}
