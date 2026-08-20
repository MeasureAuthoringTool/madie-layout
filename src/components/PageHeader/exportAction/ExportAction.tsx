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
import { Upload } from "lucide-react";

interface PropTypes {
  onClick: (exportType: string) => void;
}

export default function ExportAction(props: PropTypes) {
  const { onClick } = props;

  const [open, setOpen] = useState(false);
  // move anchorElement to a stable reference that does not change across renders.
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleOptionClick = (
    option: "Executable Export" | "Publishable Export"
  ) => {
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
          <Upload size={20} />
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
              transformOrigin: "left top",
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
                    data-testId="executable-export-option"
                    onClick={(e) => {
                      handleOptionClick("Executable Export");
                    }}
                  >
                    Executable Export
                  </MenuItem>
                  <MenuItem
                    data-testId="publishable-export-option"
                    onClick={(e) => {
                      handleOptionClick("Publishable Export");
                    }}
                  >
                    Publishable Export
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
