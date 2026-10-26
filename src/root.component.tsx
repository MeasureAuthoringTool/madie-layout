import React from "react";

import GlobalStyles from "./styles/GlobalStyles";
import "./styles/layout-utilities.css";
import "./styles/app.scss";
import OktaSecurity from "./okta/OktaSecurity";
import "./madieDesignStyles.scss";

export default function Root() {
  return (
    <>
      <GlobalStyles />
      <OktaSecurity />
    </>
  );
}
