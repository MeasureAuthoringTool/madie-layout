import React, { useState, useEffect, useRef } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  ClickAwayListener,
  Grow,
  Icon,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import Notification from "./Notification";
import { useNotificationServiceApi } from "@madie/madie-util";
import "./Notifications.scss";
const Notifications = ({notifications, setNotifications}) => {
  //   function generateNotifications(count) {
  //     const users = ["rohit_k", "edwin_t", "matt_m"];
  //     const actions = [
  //       "updated the Population Criteria",
  //       "approved the rule",
  //       "deleted the configuration",
  //       "created a new policy",
  //     ];
  //     const cmsIds = ["CMS123", "CMS456", "CMS789"];

  //     const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  //     const randomObjectId = () =>
  //       Array.from({ length: 24 }, () =>
  //         Math.floor(Math.random() * 16).toString(16)
  //       ).join("");

  //     const randomDate = () => {
  //       const now = Date.now();
  //       const past = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
  //       return new Date(past).toISOString();
  //     };

  //     return Array.from({ length: count }, () => ({
  //       _id: randomObjectId(),
  //       userId: randomItem(users),
  //       message: `${randomItem(users)} ${randomItem(actions)} for ${randomItem(
  //         cmsIds
  //       )}`,
  //       additionalLink: `https://example.com/${randomObjectId()}`,
  //       isRead: Math.random() < 0.5,
  //       isSeen: Math.random() < 0.5,
  //       createdAt: randomDate(),
  //     }));

  const anchorRef = useRef<HTMLButtonElement>(null);
  // api
  const notificationServiceApiRef = useRef(useNotificationServiceApi());
  const [open, setOpen] = useState(false);

  function handleListKeyDown(event: React.KeyboardEvent) {
    event.stopPropagation();
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }
  // poll the db

  //   api utilities
  const triggerSeenAllNotifications = (notifications) => {
    const seenNotificationIds = notifications
      .filter((n) => !n.isSeen)
      .map((n) => n._id);
    if (seenNotificationIds.length > 0) {
      // we make an api call
      console.log("read all notifications with ids: ", seenNotificationIds);
    }
  };

  const triggerReadOneNotification = (notificationID) => {
    // we make an api call
    console.log("read notification with id: ", notificationID);
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n._id === notificationID ? { ...n, isRead: true } : n
      )
    );
  };

  const triggerDeleteNotification = (notificationID) => {
    console.log("delete notification with id: ", notificationID);
    // setNotifications((prevNotifications) =>
    //     prevNotifications.filter((n) => n._id !== notificationID)
    // );
  };

  return (
    <button
      id="notifications"
      data-badge={notifications?.length || 0}
      ref={anchorRef}
      onClick={() => {
        triggerSeenAllNotifications(notifications);
        setOpen(true);
      }}
    >
      <NotificationsIcon />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal={false}
        sx={{
          zIndex: 9999,
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "left top",
            }}
          >
            <Paper sx={{ zIndex: 9999 }}>
              <ClickAwayListener
                onClickAway={() => {
                  setOpen(false);
                }}
              >
                <MenuList autoFocusItem={open} onKeyDown={handleListKeyDown}>
                  {notifications.map((notification) => (
                    <Notification
                      triggerReadOneNotification={triggerReadOneNotification}
                      triggerDeleteNotification={triggerDeleteNotification}
                      key={notification._id}
                      notification={notification}
                    />
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </button>
  );
};

export default Notifications;
