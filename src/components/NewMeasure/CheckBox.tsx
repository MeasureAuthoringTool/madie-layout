import React from "react";
import { Checkbox as MUICheckBox } from "@mui/material";
import { styled } from "@mui/material/styles";

const CheckBox = styled(MUICheckBox)(() => ({
  padding: "1px 4px",
}));

export default function StyledCustomization(props) {
  return <CheckBox {...props} disableRipple />;
}
