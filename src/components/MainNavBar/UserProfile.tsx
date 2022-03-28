import React, { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { logoutLogger } from "../../custom-hooks/customLog";
import tw, { styled } from "twin.macro";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const FormControl = styled.section(() => [tw`mb-3`, `margin: 25px 40px;`]);

function UserProfile() {
  const { oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");

  useEffect(() => {
    oktaAuth.token
      .getUserInfo()
      .then((info) => {
        setUserInfo(info);
        for (const [key, value] of Object.entries(info)) {
          if (key === "given_name") {
            setUserFirstName(value.toString());
          }
        }
      })
      .catch((error) => {});
  }, []);

  const logout = async () => {
    try {
      logoutLogger(userInfo);
      oktaAuth.signOut();
    } catch (err) {}
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
          native
          id="user-profile-select"
          inputProps={{
            "data-testid": "user-profile-select",
          }}
          name="user-profile-select"
          value={userFirstName}
          onChange={handleChange}
        >
          <option
            key={userFirstName}
            value={userFirstName}
            data-testid="user-profile-username-option"
          >
            {userFirstName}
          </option>

          <option
            key="manage-access"
            value="ManageAccess"
            data-testid="user-profile-manage-access-option"
          >
            Manage Access
          </option>

          <option
            key="Logout"
            value="Logout"
            data-testid="user-profile-logout-option"
          >
            Sign Out
          </option>
        </Select>
      </FormControl>
    </div>
  );
}

export default UserProfile;
