import React, { useCallback, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { Measure, Model } from "@madie/madie-models";
import { Popover } from "@madie/madie-design-system/dist/react";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { grey, blue } from "@mui/material/colors";

interface PropTypes {
  measures: Measure[];
  onClick: (exportType: string) => void;
}

export const NOTHING_SELECTED = "Select measure to export";
export const EXPORT_MEASURE = "Export measure";

export default function ExportAction(props: PropTypes) {
  const { measures, onClick } = props;

  const [disableExportBtn, setDisableExportBtn] = useState(true);
  const [tooltipMessage, setTooltipMessage] = useState(NOTHING_SELECTED);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const validateExportActionState = useCallback(() => {
    // set button state to disabled by default
    setDisableExportBtn(true);
    setTooltipMessage(NOTHING_SELECTED);
    if (measures?.length === 1) {
      setDisableExportBtn(false);
      setTooltipMessage(EXPORT_MEASURE);
    }
  }, [measures]);

  useEffect(() => {
    validateExportActionState();
  }, [measures, validateExportActionState]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disableExportBtn) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (option: "Export" | "Export for Publishing") => {
    onClick(option);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip
        data-testid="export-action-tooltip"
        title={tooltipMessage}
        onMouseOver={validateExportActionState}
        arrow
      >
        <span>
          <IconButton
            onClick={handleClick}
            disabled={disableExportBtn}
            data-testid="export-action-btn"
          >
            <FileUploadOutlinedIcon
              sx={
                disableExportBtn ? { color: grey[500] } : { color: blue[500] }
              }
            />
          </IconButton>
        </span>
      </Tooltip>
      <Popover
        optionsOpen={open}
        anchorEl={anchorEl}
        handleClose={handleClose}
        canEdit={!disableExportBtn}
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
