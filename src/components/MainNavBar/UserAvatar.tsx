import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import { useOktaAuth } from "@okta/okta-react";

const stringToColor = (input: string) => {
  let hash = 0;
  let i;

  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

const stringAvatar = (name: string) => {
  if (name === null || name.trim().length === 0) {
    return {};
  }
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
};

const UserAvatar = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const { oktaAuth, authState } = useOktaAuth();

  useEffect(() => {
    oktaAuth.token
      .getUserInfo()
      .then((info) => {
        setUser(info);
        setUserName(info.name);
      })
      .catch((error) => {});
  }, []);

  return (
    <span>
      <Avatar
        data-testid="main-nav-bar-user-profile"
        {...stringAvatar(userName)}
        sx={{
          height: "32px",
          width: "32px",
          fontSize: "15px",
          backgroundColor: "#E22268",
        }}
      />
    </span>
  );
};

export default UserAvatar;
