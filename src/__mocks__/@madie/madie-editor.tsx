import React from "react";

export function MadieEditor({ props }) {
  const returnValue = "library testCql version '1.0.000'";
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
