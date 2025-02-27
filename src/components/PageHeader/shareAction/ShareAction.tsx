import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import ShareIcon from "./ShareIcon";
import { blue } from "@mui/material/colors";

export enum SharedOptions {
  SHARE_WITH = "Share With",
  UNSHARE = "Unshare",
}

const options = [SharedOptions.SHARE_WITH, SharedOptions.UNSHARE];

interface PropTypes {
  onClick: (option: string) => void;
}

const ShareAction = (props: PropTypes) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (option: string) => {
    handleClose();

    props.onClick(option);
  };

  return (
    <span>
      <IconButton onClick={handleClick} data-testid="share-action-btn">
        <ShareIcon color={blue[500]} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        data-testid="share-menu"
      >
        {options.map((option) => (
          <MenuItem
            data-testid={`${option}-option`}
            key={option}
            onClick={() => handleMenuItemClick(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </span>
  );
};

export default ShareAction;
