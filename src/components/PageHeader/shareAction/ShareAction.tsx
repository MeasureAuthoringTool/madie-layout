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
import ShareIcon from "./ShareIcon";

export enum SharedOptions {
  SHARE_WITH = "Share With",
  UNSHARE = "Unshare",
}

const options = [SharedOptions.SHARE_WITH, SharedOptions.UNSHARE];

interface PropTypes {
  onClick: (option: string) => void;
}

const ShareAction = (props: PropTypes) => {
  const [open, setOpen] = useState(false);
  // move anchorElement to a stable reference that does not change across renders.
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (option: string) => {
    handleClose();
    props.onClick(option);
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
      <span>
        <IconButton
          onClick={handleClick}
          data-testid="share-action-btn"
          ref={anchorRef}
        >
          <ShareIcon />
        </IconButton>
      </span>
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
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="share-menu"
                  onKeyDown={handleListKeyDown}
                >
                  {options.map((option, i) => (
                    <MenuItem
                      data-testid={`${option}-option`}
                      key={option}
                      onClick={() => handleMenuItemClick(option)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default ShareAction;
