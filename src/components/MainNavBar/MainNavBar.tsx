import React from "react";
import logo from "../../assets/images/madie_logo.svg";
import {
  Nav,
  InnerNav,
  InnerMost,
  DropDown,
  Logo,
  NavButton,
  DropMenu,
  ListItem,
  InnerItem,
  ExtraButton,
  Bars,
  Bar,
} from "../../styles/styles";

const MainNavBar = () => {
  return (
    <Nav>
      <InnerNav>
        <InnerMost>
          <Logo to="/">
            <img src={logo} alt="MADiE Logo" />
          </Logo>
          <NavButton type="button">
            <Bars>
              <Bar />
              <Bar />
              <Bar />
            </Bars>
          </NavButton>
        </InnerMost>
        <DropDown>
          <DropMenu>
            <ListItem>
              <InnerItem to="#" aria-label="Release Notes">
                Release Notes
              </InnerItem>
            </ListItem>
            <ListItem>
              <InnerItem to="/measure" aria-label="Measure">
                Measure
              </InnerItem>
            </ListItem>
            <ListItem>
              <InnerItem to="#" aria-label="IDE">
                IDE
              </InnerItem>
            </ListItem>
            <ExtraButton href="/login">Login</ExtraButton>
          </DropMenu>
        </DropDown>
      </InnerNav>
    </Nav>
  );
};

export default MainNavBar;
