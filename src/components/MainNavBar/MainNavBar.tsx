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

const MainNavBar = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const logout = async () => oktaAuth.signOut();
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
                  <InnerItem to="/measures" aria-label="Measures">
                    Measures
                  </InnerItem>
                </ListItem>
                <ListItem>
                  <InnerItem to="/cql-libraries" aria-label="CQL Libraries">
                    CQL Libraries
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
