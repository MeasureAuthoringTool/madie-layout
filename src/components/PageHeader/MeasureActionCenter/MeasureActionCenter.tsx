import React, { useState, useEffect } from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { Measure } from "@madie/madie-models";
import { blue, red } from "@mui/material/colors";
import {
  RouteHandlerState,
  routeHandlerStore,
  useFeatureFlags,
} from "@madie/madie-util";
import FeedOutlinedIcon from "@mui/icons-material/FeedOutlined";

interface PropTypes {
  canEdit: boolean;
  measure: Measure;
}

const MeasureActionCenter = (props: PropTypes) => {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<Array<any>>([]);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  const [eventToTrigger, setEventToTrigger] = useState<Event | null>(null);
  const featureFlags = useFeatureFlags();

  const { updateRouteHandlerState } = routeHandlerStore;
  const [routeHandlerState, setRouteHandlerState] = useState<RouteHandlerState>(
    routeHandlerStore.state
  );

  const CustomShareIcon = (
    <div style={{ color: "#0073C8" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="#0073C8"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11.1021 0.0414415C11.3637 -0.0553504 11.658 0.0210169 11.8395 0.232836L19.8395 9.56612C20.0535 9.81577 20.0535 10.1842 19.8395 10.4338L11.8395 19.7671C11.658 19.9789 11.3637 20.0553 11.1021 19.9585C10.8404 19.8617 10.6667 19.6122 10.6667 19.3333L10.6667 13.3454C8.97742 13.4083 7.3773 13.7271 5.89523 14.5324C4.22509 15.4399 2.64408 16.9984 1.25709 19.6429C1.10854 19.9261 0.779777 20.064 0.473652 19.9714C0.167527 19.8787 -0.0296969 19.5818 0.0036683 19.2637C0.253401 16.8829 1.2318 13.7691 3.05345 11.2332C4.77275 8.83982 7.28405 6.91364 10.6667 6.68863L10.6667 0.666695C10.6667 0.387712 10.8404 0.138233 11.1021 0.0414415ZM12 2.46886L12 7.33332C12 7.70151 11.7015 7.99999 11.3333 7.99999C8.1625 7.99999 5.79655 9.69998 4.13634 12.0111C3.26411 13.2254 2.59951 14.5933 2.13108 15.9342C3.10155 14.8008 4.1487 13.9639 5.25866 13.3608C7.19832 12.3069 9.26912 12 11.3333 12C11.7015 12 12 12.2984 12 12.6666L12 17.5311L18.4553 9.99997L12 2.46886Z"
          fill="#0073C8"
        />
      </svg>
    </div>
  );

  useEffect(() => {
    const subscription = routeHandlerStore.subscribe(setRouteHandlerState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setActions(getActionArray(props.measure, props.canEdit));
  }, [props, routeHandlerState]);

  const onContinue = () => {
    // we need every formik instance to use useFormikResetOnEvent on init
    window.dispatchEvent(new Event("resetAllForms"));
    setDiscardDialogOpen(false);
    if (eventToTrigger) {
      window.dispatchEvent(eventToTrigger);
    }
    updateRouteHandlerState({
      canTravel: true,
      pendingRoute: "",
    });
    setEventToTrigger(null);
  };

  const onClose = () => {
    setDiscardDialogOpen(false);
    setEventToTrigger(null);
  };

  const handleActionClick = (event: Event) => {
    if (routeHandlerState?.canTravel) {
      window.dispatchEvent(event);
    } else {
      setEventToTrigger(event);
      setDiscardDialogOpen(true);
    }
  };

  const getActionArray = (measure: Measure, canEdit: boolean): any[] => {
    const actions = new Map<string, any>();

    actions.set("human readable", {
      icon: <FeedOutlinedIcon sx={{ color: blue[500] }} />,
      name: routeHandlerState?.canTravel
        ? `View human readable`
        : `Save measure to view human readable`,
      onClick: () => handleActionClick(new Event("view-humanreadable")),
    });
    actions.set("export measure", {
      icon: <FileUploadOutlinedIcon sx={{ color: blue[500] }} />,
      name: "Export Measure",
      onClick: () => handleActionClick(new Event("export-measure")),
    });

    if (canEdit) {
      if (!measure?.measureMetaData?.draft) {
        actions.set("draft measure", {
          icon: <EditCalendarOutlinedIcon sx={{ color: blue[500] }} />,
          name: "Draft Measure",
          onClick: () => handleActionClick(new Event("draft-measure")),
        });
      }
      if (measure?.measureMetaData?.draft) {
        actions.set("delete measure", {
          icon: <DeleteOutlinedIcon sx={{ color: red[500] }} />,
          name: "Delete Measure",
          onClick: () => handleActionClick(new Event("delete-measure")),
        });
        actions.set("version measure", {
          icon: <AccountTreeOutlinedIcon sx={{ color: blue[500] }} />,
          name: "Version Measure",
          onClick: () => handleActionClick(new Event("version-measure")),
        });
      }

      if (featureFlags?.ShareMeasure) {
        actions.set("share measure", {
          icon: CustomShareIcon,
          name: "Share Measure",
          onClick: () => handleActionClick(new Event("share-measure")),
        });
      }
    }
    // required order to display
    const actionsListOrder = [
      "human readable",
      "draft measure",
      "version measure",
      "share measure",
      "export measure",
      "delete measure",
    ];
    return actionsListOrder.map((key) => actions.get(key)).filter(Boolean);
  };

  return (
    <div
      data-testid="action-center"
      style={{
        display: "flex",
        alignItems: "center",
        height: 40,
        backgroundColor: open ? "white" : "transparent",
        borderRadius: 25,
      }}
    >
      <SpeedDial
        ariaLabel="Measure action center"
        data-testid="action-center-button"
        sx={{
          "& .MuiSpeedDial-fab": {
            width: 40,
            height: 40,
            backgroundColor: "white",
            color: "grey",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          },
        }}
        icon={
          <div
            data-testid="action-center-actual-icon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.3s",
              transform: open ? "rotate(90deg)" : "none",
            }}
          >
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
            <div style={{ margin: "0 2px", color: "black" }}>•</div>
          </div>
        }
        direction="left"
        open={open}
        onClick={() => setOpen((prevOpen) => !prevOpen)}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            data-testid={action.name.replace(/\s/g, "")}
            onClick={() => {
              setOpen(false);
              action.onClick();
            }}
            sx={{
              boxShadow: "none",
              transition: "opacity 0s, visibility 0s",
              margin: 0,
              marginRight: 1,
              transitionDelay: "0s",
            }}
          />
        ))}
      </SpeedDial>
      <MadieDiscardDialog
        open={discardDialogOpen}
        onContinue={onContinue}
        onClose={onClose}
      />
    </div>
  );
};

export default MeasureActionCenter;
