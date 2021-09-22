import React from "react";
import GlobalStyles from "./styles/GlobalStyles";
import { MadieEditor } from "@madie/madie-editor";
import { useLocalStorage } from "./custom-hooks/useLocalStorage";
import MainNavBar from "./components/MainNavBar/MainNavBar";

export default function Root(props) {
  const [editorVal, setEditorVal] = useLocalStorage("editorVal", "");

  const handleMadieEditorValue = (val) => {
    setEditorVal(val);
  };

  const editorProps = {
    props: {
      handleValueChanges: (val) => handleMadieEditorValue(val),
      defaultValue: editorVal,
    },
  };

  return (
    <>
      <GlobalStyles />
      <MainNavBar />
      <MadieEditor {...editorProps} />
      <div data-testid="madie-editor-value">{editorVal}</div>
    </>
  );
}
