import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Chip, Tooltip } from "@mui/material";
import "./pageHeader.scss";

const MeasureStatusChips = ({ measure }) => {
  return (
    <div style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {`${measure?.measureMetaData?.draft}` === "true" && (
        <Chip className="draft-chip" data-testid="draft-chip" label="Draft" />
      )}
      {`${measure?.measureMetaData?.composite}` === "true" && (
        <Chip
          className="composite-chip"
          data-testid="composite-chip"
          label="Composite"
        />
      )}
      {measure?.compositeMeasureIds?.length > 0 && (
        <Chip
          className="component-chip"
          data-testid="component-chip"
          label={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              In Composite
              <Tooltip
                title="This measure is a component of a composite measure"
                arrow
              >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </Tooltip>
            </span>
          }
        />
      )}
    </div>
  );
};

export default MeasureStatusChips;
