import React, { useEffect, useState } from "react";
import logo from "../../assets/images/Logo.svg";
import { DropDown, DropMenu } from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { NavLink, useHistory } from "react-router-dom";
import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import UMLSDialog from "./UMLSDialog";
import { Toast } from "@madie/madie-design-system/dist/react";
import { useLocalStorage } from "../../custom-hooks/useLocalStorage";

import "./MainNavBar.scss";

const MainNavBar = () => {
  // dialog and toast utilities
  const [TGT, setTGT] = useState<string>(""); //logged in url used to make requests
  const [dOpen, setDOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
  const tgtTimeStamp = "tgtTimeStamp";

  //check if TGT exists or expired, if expired remove it
  const [tgtValueFromStorage, setTgtValueFromStorage] = useLocalStorage(
    "TGT",
    ""
  );

  if (tgtValueFromStorage && tgtValueFromStorage !== "null") {
    let tgtObjFromLocalStorage = JSON.parse(tgtValueFromStorage);
    let timeStamp = null;
    for (const [key, value] of Object.entries(tgtObjFromLocalStorage)) {
      if (key === tgtTimeStamp) {
        timeStamp = value;
      }
    }
    const currentTime = new Date().getTime();
    const expirationDuration = 1000 * 60 * 60 * 8;

    if (currentTime - timeStamp > expirationDuration) {
      window.localStorage.removeItem("TGT");
      setTgtValueFromStorage(null);
    }
  }

  const { location } = useHistory();
  const { pathname } = location;
  const [currentLocation, setCurrentLocation] = useState<string>("/measures");
  useEffect(() => {
    setCurrentLocation(pathname);
  }, []);
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

  const { authState } = useOktaAuth();
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
                <li
                  data-testid="nav-measures-li"
                  className={
                    currentLocation === "/measures"
                      ? "nav-item selected"
                      : "nav-item"
                  }
                >
                  <NavLink
                    onClick={() => setCurrentLocation("/measures")}
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
                <li
                  data-testid="nav-libraries-li"
                  className={
                    currentLocation === "/cql-libraries"
                      ? "nav-item selected"
                      : "nav-item"
                  }
                >
                  <NavLink
                    onClick={() => setCurrentLocation("/cql-libraries")}
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
                <li
                  data-testid="nav-help-li"
                  className={
                    currentLocation === "/help"
                      ? "nav-item selected"
                      : "nav-item"
                  }
                >
                  <NavLink
                    onClick={() => setCurrentLocation("/help")}
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
                    onClick={() =>
                      setDOpen(!tgtValueFromStorage ? true : false)
                    }
                    data-testid="UMLS-connect-button"
                  >
                    <div
                      className={
                        TGT || tgtValueFromStorage ? "active" : "inactive"
                      }
                    />
                    {TGT || tgtValueFromStorage
                      ? "UMLS Active"
                      : "Connect to UMLS"}
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
        saveTGT={(tgt) => setTGT(tgt)}
        handleClose={() => setDOpen(false)}
        handleToast={handleToast}
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
