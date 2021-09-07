import React, { useState } from "react";
import tw from "twin.macro";
import GlobalStyles from "./styles/GlobalStyles";
import { MadieEditor } from "@madie/madie-editor";

const Notice = tw.span`text-blue-900`;
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
      <Notice>{props.name} is mounted!</Notice>
      {MadieEditor ? <MadieEditor {...outputProps} /> : ""}
      <div>{editorVal}</div>
    </>
  );
}
