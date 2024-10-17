import React, { useEffect, useState } from "react";

import { SpeedDial, SpeedDialAction } from "@mui/material";
import { DeleteOutlined as DeleteIcon } from "@mui/icons-material";

const MeasureActionCenter = () => {
  const [open, setOpen] = useState(false);

  const actions = [{ icon: <DeleteIcon />, name: "Delete Measure" }];

  return (
    <div
      data-testid="action-center"
      style={{
        display: "flex",
        alignItems: "center",
        height: 40,
        backgroundColor: open ? "white" : "transparent",
        borderRadius: 25,
      }}
    >
      <SpeedDial
        ariaLabel="SpeedDial for actions"
        data-testid="action-center-button"
        sx={{
          "& .MuiSpeedDial-fab": {
            width: 40,
            height: 40,
            backgroundColor: "white",
            color: "grey",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          },
        }}
        icon={
          <div
            data-testid="action-center-actual-icon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.3s",
              transform: open ? "rotate(90deg)" : "none",
            }}
          >
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
          </div>
        }
        direction="left"
        open={open}
        onClick={() => setOpen((prevOpen) => !prevOpen)}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => setOpen(false)}
            sx={{
              boxShadow: "none",
              transition: "opacity 0s, visibility 0s",
              margin: 0,
              marginRight: 1,
              transitionDelay: "0s",
            }}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

export default MeasureActionCenter;
