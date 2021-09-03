import React from "react";
import tw from "twin.macro";
import GlobalStyles from "./styles/GlobalStyles";

const Notice = tw.span`text-blue-900`;
export default function Root(props) {
  return (
    <>
      <GlobalStyles />
      <Notice>{props.name} is mounted!</Notice>
    </>
  );
}
