import React, { useState } from "react";
import logo from "../../assets/images/madie_logo.svg";
import {
  Nav,
  InnerNav,
  InnerMost,
  DropDown,
  Logo,
  DropMenu,
  ListItem,
  InnerItem,
} from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";

import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import UMLSDialog from "./ULMSDialog";
import { Toast } from "@madie/madie-design-system/dist/react";

import "./MainNavBar.scss";

const MainNavBar = () => {
  // dialog and toast utilities
  const [TGT, setTGT] = useState<string>(""); //logged in url used to make requests
  const [dOpen, setDOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
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
    <Nav>
      <InnerNav>
        <InnerMost>
          <Logo to="/measures">
            <img src={logo} alt="MADiE Logo" />
          </Logo>
        </InnerMost>
        <DropDown>
          <DropMenu>
            <ListItem>
              <InnerItem
                to="#"
                aria-label="Release Notes"
                data-testid="main-nav-bar-release-notes"
              >
                Release Notes
              </InnerItem>
            </ListItem>
            {authState?.isAuthenticated && (
              <>
                <ListItem data-testid="authenticated-links">
                  <InnerItem
                    to="/measures"
                    aria-label="Measures"
                    id="measures-main-nav-bar-tab"
                    data-testid="main-nav-bar-measures"
                  >
                    Measures
                  </InnerItem>
                </ListItem>
                <ListItem>
                  <InnerItem
                    to="/cql-libraries"
                    aria-label="CQL Library"
                    id="cql-library-main-nav-bar-tab"
                    data-testid="main-nav-bar-cql-library"
                  >
                    CQL Library
                  </InnerItem>
                </ListItem>
                <ListItem className="activity-button">
                  <button
                    onClick={() => setDOpen(true)}
                    data-testid="UMLS-connect-button"
                  >
                    <div className={TGT ? "active" : "inactive"} />
                    {TGT ? "UMLS Active" : "Connect to UMLMS"}
                  </button>
                </ListItem>
                <ListItem id="main-nav-bar-tab-user-avatar">
                  <UserAvatar />
                </ListItem>
                <ListItem id="main-nav-bar-tab-user-profile">
                  <UserProfile />
                </ListItem>
              </>
            )}
          </DropMenu>
        </DropDown>
      </InnerNav>
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
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </Nav>
  );
};

export default MainNavBar;
