import React, { SetStateAction, Dispatch } from "react";
import { MadieEditor } from "@madie/madie-editor";
import { useLocalStorage } from "../../custom-hooks/useLocalStorage";

const Editor = () => {
  const [editorVal, setEditorVal]: [string, Dispatch<SetStateAction<string>>] =
    useLocalStorage("editorVal", "");
  const handleMadieEditorValue = (val: string) => {
    setEditorVal(val);
  };

  const editorProps = {
    props: {
      handleValueChanges: (val: string) => handleMadieEditorValue(val),
      defaultValue: editorVal,
    },
  };

  return (
    <>
      <MadieEditor {...editorProps} />
      <div data-testid="madie-editor-value">{editorVal}</div>
    </>
  );
};

export default Editor;
