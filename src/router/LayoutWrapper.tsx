import React from "react";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import PageHeader from "../components/PageHeader/PageHeader";
import RouteChangeHandler from "./RouteChangeHandler";
import Footer from "../components/Footer/Footer";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@madie/madie-design-system/dist/react";

const LayoutWrapper = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <div className="layout-wrapper">
        <MainNavBar />
        <PageHeader />
        <RouteChangeHandler />
        <div id="page-content">{children}</div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default LayoutWrapper;
