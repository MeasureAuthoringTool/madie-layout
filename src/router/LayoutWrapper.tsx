import React from "react";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import PageHeader from "../components/PageHeader/PageHeader";
import RouteChangeHandler from "./RouteChangeHandler";
import Footer from "../components/Footer/Footer";
const LayoutWrapper = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <MainNavBar />
      <PageHeader />
      <RouteChangeHandler />
      <div id="page-content">{children}</div>
      <Footer />
    </div>
  );
};

export default LayoutWrapper;
