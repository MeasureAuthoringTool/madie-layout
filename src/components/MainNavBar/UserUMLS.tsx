import React, { useState, useEffect } from "react";
import tw, { styled } from "twin.macro";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const FormControl = styled.section(() => [tw`ml-2`]);
import { MenuItem } from "@mui/material";
import UMLSDialog from "./UMLSDialog";
import {
  Toast,
  MadieConfirmDialog,
} from "@madie/madie-design-system";
import { useOktaAuth } from "@okta/okta-react";
import { useTerminologyServiceApi } from "@madie/madie-util";
import "./MainNavBar.scss";

const UserUMLS = () => {
  const { authState } = useOktaAuth();
  const [isLoggedInToUMLS, setIsLoggedInToUMLS] = useState<boolean>(undefined);
  const terminologyServiceApi = useTerminologyServiceApi();
  const [umlsDialogOpen, setUmlsDialogOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

  const handleToast = (type, message, open) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(open);
  };
  const onToastClose = () => {
    setToastType("danger");
    setToastMessage("");
    setToastOpen(false);
  };
  useEffect(() => {
    if (authState?.isAuthenticated && !isLoggedInToUMLS) {
      terminologyServiceApi
        .checkLogin()
        .then((value) => {
          setIsLoggedInToUMLS(true);
        })
        .catch((err) => {
          handleToast("danger", "Please sign in to UMLS.", true);
        });
    }
  }, [authState?.isAuthenticated]);

  const logoutUMLS = async () => {
    if (authState?.isAuthenticated && isLoggedInToUMLS) {
      terminologyServiceApi
        .logoutUMLS()
        .then((value) => {
          setIsLoggedInToUMLS(false);
        })
        .catch((err) => {
          handleToast("danger", "Error log out UMLS.", true);
        });
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    if (event.target.value === "LogoutUMLS") {
      setConfirmDialogOpen(true);
    }
  };

  return (
    <div>
      <FormControl data-testid="user-umls-form">
        <Select
          id="user-umls-select"
          data-testid="user-umls-select"
          inputProps={{ "data-testid": "user-umls-input" }}
          sx={{
            height: "32px",
            borderColor: "transparent",
            "& .Mui-focused": {
              borderColor: "transparent",
            },
            "& .Mui-icon": {
              fontSize: "3px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
              "& legend": {
                width: 0,
              },
            },
            "& .MuiInputBase-input": {
              fontFamily: "Rubik",
              fontSize: 16,
              fontWeight: 400,
              color: "#515151",
              borderColor: "transparent",
              //   borderRadius: "3px",
              padding: "9px 14px",
              "&::placeholder": {
                opacity: 0.6,
              },
            },
            "& .MuiSelect-icon": {
              color: "#515151",
              fontSize: "large",
            },
          }}
          IconComponent={ExpandMoreIcon}
          name="user-umls-select"
          value={isLoggedInToUMLS ? "UMLS Active" : "Connect to UMLS"}
          onChange={handleChange}
        >
          <MenuItem
            key="userUmlsStatus"
            value={isLoggedInToUMLS ? "UMLS Active" : "Connect to UMLS"}
            data-testid="user-umls-status"
          >
            <li className="activity-button">
              <button
                onClick={() => setUmlsDialogOpen(!isLoggedInToUMLS)}
                data-testid="UMLS-connect-button"
              >
                <div className={isLoggedInToUMLS ? "active" : "inactive"} />
                {isLoggedInToUMLS ? "UMLS Active" : "Connect to UMLS"}
              </button>
            </li>
          </MenuItem>
          {isLoggedInToUMLS && (
            <MenuItem
              key={`user-"Logout"`}
              value="LogoutUMLS"
              data-testid="user-umls-logout-option"
            >
              Sign Out
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <UMLSDialog
        open={umlsDialogOpen}
        handleClose={() => setUmlsDialogOpen(false)}
        handleToast={handleToast}
        setIsLoggedInToUMLS={setIsLoggedInToUMLS}
      />
      <Toast
        toastKey="UMLS-login-toast"
        toastType={toastType}
        testId={
          toastType === "danger"
            ? "UMLS-login-generic-error-text"
            : "UMLS-login-success-text"
        }
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        closeButtonProps={{
          "data-testid": "close-error-button",
        }}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />

      <MadieConfirmDialog
        open={confirmDialogOpen}
        onContinue={() => {
          logoutUMLS();
          setConfirmDialogOpen(false);
        }}
        onClose={() => setConfirmDialogOpen(false)}
        warning="You are about to Sign Out from UMLS. You will need to enter your UMLS API key to log back in."
        dialogTitle="Are you sure?"
        name="log out of UMLS"
        action="confirm"
      />
    </div>
  );
};

export default UserUMLS;
