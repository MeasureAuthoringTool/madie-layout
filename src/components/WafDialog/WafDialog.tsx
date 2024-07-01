import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@madie/madie-design-system/dist/react";
import {
  Dialog,
  IconButton,
  DialogActions,
  Divider,
  DialogContent,
} from "@mui/material";

export interface wafDialogProps {
  open: boolean;
  onClose: any;
  supportId: string;
}

const WafDialog = (props: wafDialogProps) => {
  const { open, onClose, supportId } = props;
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      sx={{
        display: "flex",
        flexDirection: "column",
        ".top-row": {
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          justifyContent: "space-between",
          px: 4,
          py: 3,
          h3: {
            color: "#222222",
            mb: 0,
            mt: 1,
          },
          ".MuiButtonBase-root": {
            ".MuiSvgIcon-root": {
              color: "#242424",
            },
          },
        },
        ".message": {
          mt: 4.5,
          mx: 3.75,
          mb: 12.5,
          fontSize: 16,
        },
        ".MuiDialogActions-root": {
          py: 2,
          px: 4.25,
          ".qpp-c-button": {
            ml: 2.375,
          },
        },
      }}
    >
      <div className="top-row">
        <h3>WAF Issue Encountered</h3>
        <IconButton onClick={onClose} data-testid="waf-dialog-button">
          <CloseIcon />
        </IconButton>
      </div>
      <Divider sx={{ borderColor: "#8c8c8c" }} />
      <DialogContent>
        The system has encountered a Web Application Firewall (WAF) issue.
        Please submit a ticket to the help desk
        {supportId.length > 0
          ? ` and include the following SOC #${supportId}`
          : ""}
        .{" "}
      </DialogContent>
      <DialogActions>
        <Button
          variant="secondary"
          onClick={onClose}
          data-testid="close-waf-dialog-button"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WafDialog;
