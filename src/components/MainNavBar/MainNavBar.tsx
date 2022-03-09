import React, { useState, useEffect } from "react";
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
//MAT-3804
import { customLog } from "../../custom-hooks/customLog";

const MainNavBar = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const [logged, setLogged] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const logout = async () => {
    if (
      !logged &&
      oktaAuth.token != null &&
      oktaAuth.token.getUserInfo() != null
    ) {
      oktaAuth.token
        .getUserInfo()
        .then((info) => {
          setUserInfo(info);
          setLogged(true);
          customLog(info, "info", "http://localhost:8081/api/log/logout");
        })
        .catch((error) => {
          //console.log(error);
        });
    }
    if (logged) {
      await oktaAuth.signOut();
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
                  <InnerItem to="/measures" aria-label="Measures">
                    Measures
                  </InnerItem>
                </ListItem>
                <ListItem>
                  <InnerItem to="/cql-libraries" aria-label="CQL Library">
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
