import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { Popover } from "@madie/madie-design-system/dist/react";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { blue } from "@mui/material/colors";

interface PropTypes {
  onClick: (exportType: string) => void;
}

export default function ExportAction(props: PropTypes) {
  const { onClick } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOptionClick = (option: "Export" | "Export for Publishing") => {
    onClick(option);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        data-testid="export-action-btn"
      >
        <FileUploadOutlinedIcon sx={{ color: blue[500] }} />
      </IconButton>
      <Popover
        optionsOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleClose={() => setAnchorEl(null)}
        additionalSelectOptionProps={[
          {
            label: "Export",
            dataTestId: "export-option",
            toImplementFunction: () => handleOptionClick("Export"),
          },
          {
            label: "Export for Publishing",
            dataTestId: "export-publishing-option",
            toImplementFunction: () =>
              handleOptionClick("Export for Publishing"),
          },
        ]}
      />
    </>
  );
}
