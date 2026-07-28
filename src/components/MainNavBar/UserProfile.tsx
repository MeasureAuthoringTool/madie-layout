import React, { useEffect, useState, useRef } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { logoutLogger } from "../../custom-hooks/customLog";
import tw, { styled } from "twin.macro";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MenuItem } from "@mui/material";
import {
  useMeasureServiceApi,
  useCqlLibraryServiceApi,
  useServiceConfig,
  ServiceConfig,
} from "@madie/madie-util";
import { performLogoutCleanup } from "../../services/logoutCleanup";
import { clearTimeoutReturnUrl } from "../../services/timeoutReturnUrl";
const FormControl = styled.section(() => ({
  marginLeft: "10px",
}));

function UserProfile() {
  const { oktaAuth } = useOktaAuth();
  const config: ServiceConfig = useServiceConfig();
  const [userInfo, setUserInfo] = useState(null);
  const [userFirstName, setUserFirstName] = useState<string>("");
  const measureServiceApiRef = useRef(useMeasureServiceApi());
  const cqlLibraryServiceApiRef = useRef(useCqlLibraryServiceApi());
  useEffect(() => {
    window.localStorage.removeItem("givenName");
    oktaAuth.token
      .getUserInfo()
      .then((info) => {
        setUserInfo(info);
        setUserFirstName(info.given_name);
        window.localStorage.setItem("givenName", info.given_name);
        window.dispatchEvent(new Event("storage"));
      })
      .catch((error) => {});
  }, [oktaAuth.token]);

  const logout = async () => {
    clearTimeoutReturnUrl();
    //breaks because logoutLogger is using a hook
    logoutLogger(userInfo, config);
    // Release any measures/CQL libraries locked by this user before signing out
    // so other team members aren't blocked. Failures are logged but never block
    // logout (handled inside performLogoutCleanup).
    await performLogoutCleanup(
      measureServiceApiRef.current,
      cqlLibraryServiceApiRef.current
    );
    oktaAuth.signOut();
  };

  const handleChange = (event: SelectChangeEvent) => {
    if (event.target.value === "Logout") {
      logout();
    }
  };

  return (
    <div>
      <FormControl data-testid="user-profile-form">
        <Select
          id="user-profile-select"
          data-testid="user-profile-select"
          inputProps={{ "data-testid": "user-profile-input" }}
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
              borderRadius: "3px",
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
          name="user-profile-select"
          value={userFirstName}
          onChange={handleChange}
        >
          <MenuItem
            key={userFirstName}
            value={userFirstName}
            data-testid="user-profile-username-option"
          >
            {userFirstName}
          </MenuItem>

          <MenuItem
            key={`${userFirstName}-"Logout"`}
            value="Logout"
            data-testid="user-profile-logout-option"
          >
            Sign Out
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

export default UserProfile;
