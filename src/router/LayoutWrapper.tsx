import React from "react";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import PageHeader from "../components/PageHeader/PageHeader";
import RouteChangeHandler from "./RouteChangeHandler";
const LayoutWrapper = ({ children, authenticated }) => {
  return (
    <div>
      <MainNavBar />
      <PageHeader />
      <RouteChangeHandler />
      <div id="page-content">{children}</div>
    </div>
  );
};

export default LayoutWrapper;
