import React, { useRef, useState } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import {
  MadieDialog,
  Select,
  TextField,
  TextArea,
  Toast,
} from "@madie/madie-design-system/dist/react";
import { useFormik } from "formik";
import "./AdminNotification.scss";
import { useNotificationServiceApi } from "@madie/madie-util";

const AdminNotification = () => {
  const notificationServiceApiRef = useRef(useNotificationServiceApi());
  const handleSubmit = async (values: any) => {
    try {
      const res = await notificationServiceApiRef.current.createNotifications(
        values
      );
      if (res) {
        setOpen(false);
        handleToast(
          "success",
          "Global notification sent to active users",
          true
        );
      }
    } catch (e) {
      console.error("Error creating notification: ", e);
      handleToast(
        "danger",
        "An error occurred while sending the global notification. Please try again.",
        true
      );
    }
  };
  const formik = useFormik({
    // initial Notification values
    initialValues: {
      message: "",
      additionalLink: "",
    },
    enableReinitialize: true,
    onSubmit: async (values: any) => await handleSubmit(values),
  });

  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
    formik.resetForm();
  };
  // Toast utilities
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<string>("danger");
  const onToastClose = () => {
    setToastType("danger");
    setToastMessage("");
    setToastOpen(false);
  };
  const handleToast = (type, message, open) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(open);
  };
  return (
    <>
      <button
        id="admin-notification"
        className="notifications"
        onClick={() => {
          setOpen(true);
        }}
      >
        <CampaignIcon />
      </button>
      <MadieDialog
        form={true}
        title={"Global Admin Notification"}
        dialogProps={{
          open,
          onClose,
          maxWidth: "md",
          onSubmit: formik.handleSubmit,
        }}
        cancelButtonProps={{
          cancelText: "Discard Changes",
          "data-testid": "cancel-button",
        }}
        continueButtonProps={{
          continueText: "Save",
          "data-testid": "save-button",
          disabled: !(formik.isValid && formik.dirty),
        }}
        children={
          <div id="add-notification-form">
            <TextArea
              id="message-input"
              required
              label="Message"
              placeHolder="Enter the message to be sent to all users"
              {...formik.getFieldProps("message")}
            />

            <TextField
              id={`additional-links-input`}
              label="Additional Link"
              inputProps={{
                "data-testid": `additional-link-input`,
              }}
              placeholder="Enter additional link"
              data-testid={`additional-link`}
              {...formik.getFieldProps("additionalLink")}
            />
          </div>
        }
      />
      <Toast
        toastKey="measure-information-toast"
        aria-live="polite"
        toastType={toastType}
        testId={
          toastType === "danger"
            ? "edit-measure-information-generic-error-text"
            : "edit-measure-information-success-text"
        }
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        autoHideDuration={10000}
        closeButtonProps={{
          "data-testid": "close-error-button",
        }}
      />
    </>
  );
};

export default AdminNotification;
