import React, { useState, useEffect } from "react";
import logo from "../../assets/images/Logo.svg";
import { DropDown, DropMenu } from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { NavLink } from "react-router-dom";
import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import UMLSDialog from "./UMLSDialog";
import { Toast } from "@madie/madie-design-system/dist/react";
import { useTerminologyServiceApi } from "@madie/madie-util";

import "./MainNavBar.scss";

const MainNavBar = () => {
  const [dOpen, setDOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
  const terminologyServiceApi = useTerminologyServiceApi();
  const [isLoggedInToUMLS, setIsLoggedInToUMLS] = useState<boolean>(undefined);

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
    setToastType(null);
    setToastMessage("");
    setToastOpen(false);
  };
  const handleToast = (type, message, open) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(open);
  };

  return (
    <nav>
      <div className="inner">
        <div>
          <NavLink to="/measures" className="logo">
            <img src={logo} alt="MADiE Logo" id="logo" />
            <div className="divider" />
            <h2 className="header-info">
              Measure Authoring Development <br /> Integrated Environment
            </h2>
          </NavLink>
        </div>
        <DropDown>
          <DropMenu>
            {authState?.isAuthenticated && (
              <>
                <li data-testid="nav-measures-li" className="nav-item">
                  <NavLink
                    activeClassName="active"
                    className="nav-link"
                    to="/measures"
                    aria-label="Measures"
                    id="measures-main-nav-bar-tab"
                    data-testid="main-nav-bar-measures"
                  >
                    Measures
                  </NavLink>
                </li>
                <li data-testid="nav-libraries-li" className="nav-item">
                  <NavLink
                    className="nav-link"
                    activeClassName="active"
                    to="/cql-libraries"
                    aria-label="CQL Library"
                    id="cql-library-main-nav-bar-tab"
                    data-testid="main-nav-bar-cql-library"
                  >
                    Libraries
                  </NavLink>
                </li>
                <li data-testid="nav-help-li" className="nav-item">
                  <NavLink
                    className="nav-link"
                    activeClassName="active"
                    to="/help"
                    aria-label="Release Notes"
                    data-testid="main-nav-bar-help"
                  >
                    Help
                  </NavLink>
                </li>
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
      </div>
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
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </nav>
  );
};

export default MainNavBar;
