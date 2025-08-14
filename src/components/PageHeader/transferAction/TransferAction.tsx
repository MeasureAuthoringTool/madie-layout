import React from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";

import _ from "lodash";

interface PropTypes {
  canTransfer: boolean;
  onClick: () => void;
}

export default function TransferAction(props: PropTypes) {
  const { canTransfer, onClick } = props;

  return (
    <Tooltip data-testid="transfer-action-tooltip" title="">
      <span>
        <IconButton
          onClick={onClick}
          disabled={!canTransfer}
          data-testid="transfer-action-btn"
        >
          <SwapVertOutlinedIcon style={{ transform: "rotate(90deg)" }} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
