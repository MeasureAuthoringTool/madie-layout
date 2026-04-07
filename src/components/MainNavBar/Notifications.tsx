import React, { useState, useRef } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  ClickAwayListener,
  Grow,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import Notification from "./Notification";
import { useNotificationServiceApi } from "@madie/madie-util";
import "./Notifications.scss";

const Notifications = ({ notifications, setNotifications }) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
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

  const triggerSeenAllNotifications = async (notifications) => {
    const unseenIds = notifications.filter((n) => !n.isSeen).map((n) => n.id);
    if (unseenIds.length > 0) {
      try {
        await notificationServiceApiRef.current.markNotificationsSeen(
          unseenIds
        );
        // optimistically flip isSeen locally so badge drops to 0 immediately
        setNotifications((prev) =>
          prev.map((n) =>
            unseenIds.includes(n.id) ? { ...n, isSeen: true } : n
          )
        );
      } catch (err) {
        // silently fail — non-critical
      }
    }
  };

  const triggerReadOneNotification = async (notificationID) => {
    try {
      await notificationServiceApiRef.current.readOneNotification(
        notificationID
      );
      // setNotifications((prev) =>
      //   prev.map((n) => (n.id === notificationID ? { ...n, isRead: true } : n))
      // );
    } catch (err) {
      // silently fail — non-critical
    }
  };

  const triggerDeleteNotification = async (notificationID) => {
    try {
      await notificationServiceApiRef.current.deleteNotification(
        notificationID
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationID));
    } catch (err) {
      // silently fail — non-critical
    }
  };

  const triggerClearAll = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    try {
      await notificationServiceApiRef.current.deleteAllNotifications(ids);
      setNotifications([]);
    } catch (err) {
      // silently fail — non-critical
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unseenCount = notifications.filter((n) => !n.isSeen).length;

  return (
    <button
      id="notifications"
      className="notifications"
      data-badge={unseenCount}
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
        sx={{ zIndex: 9999 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
            <Paper className="notifications-panel" sx={{ zIndex: 9999 }}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div className="notifications-panel-inner">
                  <div className="notifications-header">
                    <span className="notifications-title">Notifications</span>
                    <div className="notifications-header-actions">
                      {unreadCount > 0 && (
                        <span className="notifications-unread-badge">
                          {unreadCount} unread
                        </span>
                      )}
                      {notifications.length > 0 && (
                        <button
                          className="notifications-clear-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerClearAll();
                          }}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notifications-scroll-area">
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">
                        <span className="notifications-empty-icon">✓</span>
                        <p className="notifications-empty-title">
                          You're all caught up!
                        </p>
                        <p className="notifications-empty-sub">
                          No new notifications at this time.
                        </p>
                      </div>
                    ) : (
                      <MenuList
                        autoFocusItem={open}
                        onKeyDown={handleListKeyDown}
                      >
                        {notifications.map((notification) => (
                          <Notification
                            triggerReadOneNotification={
                              triggerReadOneNotification
                            }
                            triggerDeleteNotification={
                              triggerDeleteNotification
                            }
                            key={notification.id}
                            notification={notification}
                          />
                        ))}
                      </MenuList>
                    )}
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </button>
  );
};

export default Notifications;
