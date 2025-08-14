import React, { useRef, useState } from "react";
import {
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

interface PropTypes {
  onClick: (exportType: string) => void;
}

export default function ExportAction(props: PropTypes) {
  const { onClick } = props;

  const [open, setOpen] = useState(false);
  // move anchorElement to a stable reference that does not change across renders.
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleOptionClick = (option: "Export" | "Export for Publishing") => {
    onClick(option);
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    // it's inside of another key trap. If we allow the event to bubble up, the action center speed dial will take the command instead of the child element here.
    event.stopPropagation();
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
        data-testid="export-action-btn"
        ref={anchorRef}
        style={{ height: "40px" }}
      >
        <span>
          <FileUploadOutlinedIcon />
        </span>
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={() => {
                  setOpen(false);
                }}
              >
                <MenuList
                  autoFocusItem={open}
                  id="share-menu"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem
                    data-testId="export-option"
                    onClick={(e) => {
                      handleOptionClick("Export");
                    }}
                  >
                    Export
                  </MenuItem>
                  <MenuItem
                    data-testId="export-publishing-option"
                    onClick={(e) => {
                      handleOptionClick("Export for Publishing");
                    }}
                  >
                    Export for Publishing
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
