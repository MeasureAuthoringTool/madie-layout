import React from "react";
import * as ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  renderType: "createRoot",
  errorBoundary(err, info, props) {
    console.error("madie-layout-error", err);
    return <div>The app has fallen, and cannot get up. Please contact the help desk.</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
export default lifecycles;
