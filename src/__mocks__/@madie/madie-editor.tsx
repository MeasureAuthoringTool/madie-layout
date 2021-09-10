import React from "react";

export function MadieEditor({ props }) {
  const returnValue = "Editor is Mounted";
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="madie-editor"
      onClick={() => {
        props.handleValueChanges(returnValue);
      }}
    >
      {returnValue}
    </div>
  );
}
