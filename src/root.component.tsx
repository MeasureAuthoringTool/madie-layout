import React, { useState } from "react";
import ReactDOM from "react-dom";

import GlobalStyles from "./styles/GlobalStyles";
import { MadieEditor } from "@madie/madie-editor";
import { tsVoidKeyword } from "@babel/types";
import tw, { css, styled, theme } from "twin.macro";
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
} from "./styles/styles";
import logo from "./assets/images/madie_logo.svg";

export default function Root(props) {
  const [editorVal, setEditorVal] = useState("");
  const handleMadieEditorValue = (val) => {
    setEditorVal(val);
  };

  const outputProps = {
    props: {
      handleValueChanges: (val) => handleMadieEditorValue(val),
    },
  };

  return (
    <>
      <GlobalStyles />
      <Nav>
        <InnerNav>
          <InnerMost>
            <Logo href="/">
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
                <InnerItem href="#" aria-label="Release Notes">
                  Release Notes
                </InnerItem>
              </ListItem>
              <ListItem>
                <InnerItem href="#" aria-label="Measure">
                  Measure
                </InnerItem>
              </ListItem>
              <ListItem>
                <InnerItem href="#" aria-label="IDE">
                  IDE
                </InnerItem>
              </ListItem>

              <ExtraButton href="/login">Login</ExtraButton>
            </DropMenu>
          </DropDown>
        </InnerNav>
      </Nav>
      <MadieEditor {...outputProps} />
      <div data-testid="madie-editor-value">{editorVal}</div>
    </>
  );
}
