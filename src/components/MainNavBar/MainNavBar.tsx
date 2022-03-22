import React from "react";
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
  ExtraButton,
} from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { logoutLogger } from "../../custom-hooks/customLog";

const MainNavBar = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const logout = async () => {
    if (
      oktaAuth.token != null &&
      (await oktaAuth.token.getUserInfo()) != null
    ) {
      oktaAuth.token
        .getUserInfo()
        .then((info) => {
          logoutLogger(info);
        })
        .catch((error) => {})
        .finally(() => {
          oktaAuth.signOut();
        });
    }
  };
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
              <InnerItem to="#" aria-label="Release Notes">
                Release Notes
              </InnerItem>
            </ListItem>
            {authState?.isAuthenticated && (
              <>
                <ListItem>
                  <InnerItem
                    to="/measures"
                    aria-label="Measures"
                    id="measures-main-nav-bar-tab"
                  >
                    Measures
                  </InnerItem>
                </ListItem>
                <ListItem>
                  <InnerItem
                    to="/cql-libraries"
                    aria-label="CQL Library"
                    id="cql-library-main-nav-bar-tab"
                  >
                    CQL Library
                  </InnerItem>
                </ListItem>
                <ExtraButton onClick={logout}>Logout</ExtraButton>
              </>
            )}
          </DropMenu>
        </DropDown>
      </InnerNav>
    </Nav>
  );
};

export default MainNavBar;
