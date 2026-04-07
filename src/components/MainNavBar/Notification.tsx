import React from "react";
import { IconButton, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const timeAgo = (dateString: string): string => {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffMs = now - past;

  if (isNaN(past)) return "";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  if (years === 1) return "1 year ago";
  return `${years} years ago`;
};

const Notification = ({
  notification,
  triggerReadOneNotification,
  triggerDeleteNotification,
}) => {
  return (
    <MenuItem
      className={`notification ${notification.isRead ? "read" : "unread"}`}
      onClick={() => triggerReadOneNotification(notification.id)}
      disableRipple
    >
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <p className="notification-date">{timeAgo(notification.createdAt)}</p>
        <div className="notification-row">
          <a
            href={notification.additionalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </a>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              triggerDeleteNotification(notification.id);
            }}
            aria-label="delete"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </MenuItem>
  );
};

export default Notification;
