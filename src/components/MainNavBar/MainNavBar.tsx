import React, { useState, useEffect } from "react";
import logo from "../../assets/images/Logo.svg";
import logoFull from "../../assets/images/Logo-Full.svg";
import { DropDown, DropMenu } from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import UMLSDialog from "./UMLSDialog";
import { Tabs, Tab, Toast } from "@madie/madie-design-system/dist/react";
import { useTerminologyServiceApi } from "@madie/madie-util";
import "./MainNavBar.scss";

const MainNavBar = () => {
  const [dOpen, setDOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
  const terminologyServiceApi = useTerminologyServiceApi();
  const [isLoggedInToUMLS, setIsLoggedInToUMLS] = useState<boolean>(undefined);
  const [headerText, setHeaderText] = useState(true);

  const { authState } = useOktaAuth();
  useEffect(() => {
    if (authState?.isAuthenticated && !isLoggedInToUMLS) {
      terminologyServiceApi
        .checkLogin()
        .then((value) => {
          setIsLoggedInToUMLS(true);
        })
        .catch((err) => {
          handleToast("danger", "Please sign in to UMLS.", true);
        });
    }
  }, [authState?.isAuthenticated]);

  const onToastClose = () => {
    setToastType("danger");
    setToastMessage("");
    setToastOpen(false);
  };
  const handleToast = (type, message, open) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(open);
  };

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
  const history = useHistory();
  // need either /measures/ we will never hit /help
  const [selected, setSelected] = useState("");
  useEffect(() => {
    if (pathname.includes("/measures")) {
      setSelected("/measures");
    } else if (pathname.includes("/cql-libraries")) {
      setSelected("/cql-libraries");
    }
  }, [pathname, setSelected]);

  const handleChange = (e, v) => {
    if (v === "help") {
      window.open("https://www.emeasuretool.cms.gov/madie-mvp", "_blank");
    } else {
      setSelected(v);
      history.push(v);
    }
  };

  return (
    <nav>
      <a href="#page-header" className="skip-nav-link">
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
                <li className="activity-button">
                  <button
                    onClick={() => setDOpen(!isLoggedInToUMLS)}
                    data-testid="UMLS-connect-button"
                  >
                    <div className={isLoggedInToUMLS ? "active" : "inactive"} />
                    {isLoggedInToUMLS ? "UMLS Active" : "Connect to UMLS"}
                  </button>
                </li>
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
      <UMLSDialog
        open={dOpen}
        handleClose={() => setDOpen(false)}
        handleToast={handleToast}
        setIsLoggedInToUMLS={setIsLoggedInToUMLS}
      />
      <Toast
        toastKey="UMLS-login-toast"
        toastType={toastType}
        testId={
          toastType === "danger"
            ? "UMLS-login-generic-error-text"
            : "UMLS-login-success-text"
        }
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        closeButtonProps={{
          "data-testid": "close-error-button",
        }}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </nav>
  );
};

export default MainNavBar;
