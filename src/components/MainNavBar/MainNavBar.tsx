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
} from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";

import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";

const MainNavBar = () => {
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
    </Nav>
  );
};

export default MainNavBar;
