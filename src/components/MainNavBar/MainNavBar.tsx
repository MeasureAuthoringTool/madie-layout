import React, { useState, useEffect } from "react";
import logo from "../../assets/images/Logo.svg";
import logoFull from "../../assets/images/Logo-Full.svg";
import { DropDown, DropMenu } from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { NavLink, useLocation } from "react-router-dom";
import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import { Tabs, Tab } from "@madie/madie-design-system";
import "./MainNavBar.scss";
import UserUMLS from "./UserUMLS";

const MainNavBar = () => {
  const [headerText, setHeaderText] = useState(true);

  const { authState } = useOktaAuth();

  let resizeWindow = () => {
    const headerWidth = document.getElementById("madie-header").clientWidth;
    if (headerWidth > 1256) {
      setHeaderText(true);
    } else {
      setHeaderText(false);
    }
  };
  useEffect(() => {
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  const { pathname } = useLocation();
  // need either /measures/ we will never hit /help
  const [selected, setSelected] = useState("");
  useEffect(() => {
    if (pathname.includes("/measures")) {
      setSelected("/measures");
    } else if (pathname.includes("/cql-libraries")) {
      setSelected("/cql-libraries");
    }
  }, [pathname, setSelected]);

  return (
    <nav>
      <a
        href="#page-header"
        className="skip-nav-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("first-item").focus();
        }}
      >
        Skip to main content
      </a>
      <header
        role="banner"
        aria-label="Site header"
        className="inner"
        id="madie-header"
      >
        <div id="logo_div">
          <NavLink to="/measures" className="logo">
            {!headerText && (
              <>
                <img
                  src={logo}
                  alt="MADiE Measure Authoring Development Integrated Environment logo"
                  id="logo"
                />
              </>
            )}
            {headerText && (
              <>
                <img
                  src={logoFull}
                  alt="MADiE Measure Authoring Development Integrated Environment logo"
                  id="fulllogo"
                />
              </>
            )}
          </NavLink>
        </div>
        <DropDown id="dropdown_div">
          <DropMenu>
            {authState?.isAuthenticated && (
              <>
                <Tabs size="standard" type="B" value={selected}>
                  <Tab
                    type="B"
                    value="/measures"
                    to="/measures"
                    component={NavLink}
                    name="measures"
                    aria-label="Measures"
                    id="measures-main-nav-bar-tab"
                    data-testid="main-nav-bar-measures"
                    label="Measures"
                  />
                  <Tab
                    type="B"
                    name="cql-libraries"
                    component={NavLink}
                    value="/cql-libraries"
                    to="/cql-libraries"
                    aria-label="CQL Library"
                    id="cql-library-main-nav-bar-tab"
                    data-testid="main-nav-bar-cql-library"
                    label="Libraries"
                  />
                  <Tab
                    type="B"
                    aria-label="Help"
                    data-testid="main-nav-bar-help"
                    label="Help"
                    value="help"
                    onClick={() => {
                      window.open(
                        "https://www.emeasuretool.cms.gov/madie-mvp",
                        "_blank"
                      );
                    }}
                  />
                </Tabs>
                <UserUMLS />
                <li id="main-nav-bar-tab-user-avatar">
                  <UserAvatar />
                </li>
                <li id="main-nav-bar-tab-user-profile">
                  <UserProfile />
                </li>
              </>
            )}
          </DropMenu>
        </DropDown>
      </header>
    </nav>
  );
};

export default MainNavBar;
