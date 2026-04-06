import React from "react";
import { IconButton, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Notification = ({
  notification,
  triggerReadOneNotification,
  triggerDeleteNotification,
}) => {
  return (
    <MenuItem
      className={`notification ${notification.isRead ? "read" : "unread"}`}
      onClick={() => triggerReadOneNotification(notification._id)}
      sx={{
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <div className="notification-content">
        <p>{notification.message}</p>
        <p>{notification.createdAt}</p>
        <div className="notification-row">
          <a
            href={notification.additionalLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Details
          </a>
          <IconButton
            onClick={() => triggerDeleteNotification(notification._id)}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    </MenuItem>
  );
};

export default Notification;
