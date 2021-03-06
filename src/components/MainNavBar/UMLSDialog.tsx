import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button, TextField } from "@madie/madie-design-system/dist/react";
import {
  Dialog,
  IconButton,
  DialogActions,
  Divider,
  FormHelperText,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useFormik } from "formik";
import { APISchemaValidator } from "./APISchemaValidator";
import { useTerminologyServiceApi } from "@madie/madie-util";

export interface UMLSDialogProps {
  open: boolean;
  handleClose: Function;
  handleToast: Function;
  setIsLoggedInToUMLS: Function;
}

export interface KeyConfig {
  apiKey: String;
}

const UMLSDialog = (props: UMLSDialogProps) => {
  const { open, handleClose, handleToast, setIsLoggedInToUMLS } = props;
  const terminologyServiceApi = useTerminologyServiceApi();
  // blank, close.
  const onClose = () => {
    handleClose();
    formik.resetForm();
  };
  /* 
    /cas/v1/api-key    Retrieves a Ticket Granting Ticket (TGT)
    /cas/v1/tickets/{TGT}	Retrieves a single-use Service Ticket
*/
  const login = async (values: KeyConfig) => {
    terminologyServiceApi
      .loginUMLS(values.apiKey.valueOf())
      .then(() => {
        handleToast("success", "UMLS successfully authenticated", true);
        setIsLoggedInToUMLS(true);
        onClose();
      })
      .catch((err) => {
        if (err?.message?.includes("401") || err?.status === 401) {
          handleToast(
            "danger",
            "Invalid UMLS Key. Please re-enter a valid UMLS Key.",
            true
          );
        } else {
          handleToast("danger", "An unexpected error has occurred", true);
        }
        setIsLoggedInToUMLS(false);
      });
  };
  function formikErrorHandler(name: string, isError: boolean) {
    if (formik.touched[name] && formik.errors[name]) {
      return (
        <FormHelperText
          data-testid={`${name}-helper-text`}
          children={formik.errors[name]}
          error={isError}
        />
      );
    }
  }
  const formik = useFormik({
    initialValues: {
      apiKey: "",
    } as KeyConfig,
    validationSchema: APISchemaValidator,
    onSubmit: async (values: KeyConfig) => {
      await login(values);
    },
  });
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
        ".dialog-body": {
          margin: "0 32px 32px 32px",
        },
        ".row-aligned": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
          ".info": {
            marginTop: 2.375,
            fontFamily: "Rubik",
            fontWeight: 300,
            fontSize: 14,
            marginBottom: 0,
          },
          ".asterisk": {
            color: "#D92F2F",
            marginRight: 1,
          },
        },
        ".body": {
          marginTop: 3,
          marginLeft: 4,
          h3: {
            marginLeft: -4,
            color: "#333333",
            marginBottom: 2,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "Rubik",
          },
          ol: {
            listStyleType: "decimal",
            li: {
              color: "#333",
              paddingLeft: 1.5,
              fontSize: 14,
              fontWeight: 400,
              display: "list-item",
              a: {
                color: "#0073C8",
                "&::after": {
                  display: "none !important",
                },
              },
            },
          },
        },
        ".MuiDialogActions-root": {
          py: 2,
          px: 4.25,
          ".qpp-c-button": {
            ml: 2.375,
            ".chevron": {
              fontSize: 22,
              margin: "-9px -14px -7px 4px",
            },
          },
        },
      }}
    >
      <form onSubmit={formik.handleSubmit} data-testid="UMLS-connect-form">
        <div className="top-row">
          <h3>Please sign in to UMLS</h3>
          <IconButton onClick={onClose} data-testid="close-UMLS-dialog-button">
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        <div className="dialog-body">
          <div className="row-aligned">
            <p className="info">
              <span className="asterisk">*</span>
              Indicates a required field
            </p>
          </div>
          <TextField
            placeholder="Enter UMLS API key"
            required
            type="password"
            label="API key"
            id="api-Key"
            data-testid="UMLS-key-text-field"
            inputProps={{ "data-testid": "UMLS-key-input" }}
            helperText={formikErrorHandler("apiKey", true)}
            size="small"
            error={formik.touched.apiKey && Boolean(formik.errors.apiKey)}
            {...formik.getFieldProps("apiKey")}
          />
          <div className="body">
            <h3>WHERE'S MY KEY?</h3>
            <ol type="1" data-testid="instruction-list">
              <li style={{ marginLeft: -1 }}>
                Sign in to your &nbsp;
                <a
                  href="https://uts.nlm.nih.gov/uts/"
                  target="_blank"
                  rel="noreferrer"
                >
                  UMLS account.
                </a>
              </li>
              <li>Click on "My Profile".</li>
              <li>
                Copy your API key, and paste in the field above if you don't
                have a key in your UTS profile.
              </li>
              <li>Click "Edit Profile".</li>
              <li>Check the box labeled:"Generate new API key".</li>
              <li>Click "Save Profile", and return to step 3.</li>
            </ol>
          </div>
        </div>
        <Divider />
        <DialogActions>
          <Button
            variant="secondary"
            onClick={onClose}
            data-testid="cancel-UMLS-button"
          >
            Cancel
          </Button>
          <Button
            variant="cyan"
            type="submit"
            disabled={!(formik.isValid && formik.dirty)}
            data-testid="submit-UMLS-key"
            style={{ marginTop: 0 }}
          >
            <span>
              Connect to UMLS
              <ChevronRightIcon className="chevron" />
            </span>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UMLSDialog;
