import React, { useState, useEffect } from "react";
import { SpeedDial, SpeedDialAction, IconButton } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import HistoryIcon from "@mui/icons-material/History";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { Measure } from "@madie/madie-models";
import {
  RouteHandlerState,
  routeHandlerStore,
  useFeatureFlags,
  checkUserCanEdit,
} from "@madie/madie-util";
import FeedOutlinedIcon from "@mui/icons-material/FeedOutlined";
import ShareAction, { SharedOptions } from "../shareAction/ShareAction";
import ExportAction from "../exportAction/ExportAction";
import TransferAction from "../transferAction/TransferAction";

interface PropTypes {
  canEdit: boolean;
  measure: Measure;
  canDelete: boolean;
}

const isOwnerOfMeasure = (measure) => {
  return measure && checkUserCanEdit(measure?.measureSet?.owner, []);
};

const isSharedWithUser = (measure) => {
  return measure && checkUserCanEdit(null, measure?.measureSet?.acls);
};

const TRANSFER_MEASURE = "Transfer";
const CANNOT_TRANSFER = "You cannot transfer a measure you do not own.";

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

  useEffect(() => {
    const subscription = routeHandlerStore.subscribe(setRouteHandlerState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setActions(getActionArray(props.measure, props.canEdit, props.canDelete));
  }, [props, routeHandlerState]);

  const onContinue = async () => {
    // we need every formik instance to use useFormikResetOnEvent on init
    setDiscardDialogOpen(false);
    window.dispatchEvent(new Event("resetAllForms"));
    await new Promise((resolve) => setTimeout(resolve, 350)); // Add a delay
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

  const getActionArray = (
    measure: Measure,
    canEdit: boolean,
    canDelete: boolean
  ): any[] => {
    const ownerOfMeasure = isOwnerOfMeasure(measure);
    const sharedWithUser = isSharedWithUser(measure);

    const actions = new Map<string, any>();

    actions.set("human readable", {
      icon: (
        <IconButton>
          <FeedOutlinedIcon />
        </IconButton>
      ),
      name: routeHandlerState?.canTravel
        ? `View human readable`
        : `Save measure to view human readable`,
      onClick: () => handleActionClick(new Event("view-humanreadable")),
    });

    if (featureFlags?.MeasureHistory) {
      actions.set("history", {
        icon: (
          <IconButton>
            <HistoryIcon />
          </IconButton>
        ),
        name: "View History",
        onClick: () => {
          handleActionClick(new Event("view-measure-history"));
        },
      });
    }

    actions.set("export measure", {
      icon: (
        <ExportAction
          onClick={(exportType: string) => {
            const elmErrorSeverity = exportType === "Export" ? "Info" : "Error";
            const event = new CustomEvent("export-measure", {
              detail: { elmErrorSeverity },
            });
            handleActionClick(event);
          }}
        />
      ),
      name: "Export Measure",
    });

    if (canEdit) {
      if (!measure?.measureMetaData?.draft) {
        actions.set("draft measure", {
          icon: (
            <IconButton>
              <EditCalendarOutlinedIcon />
            </IconButton>
          ),
          name: "Draft Measure",
          onClick: () => handleActionClick(new Event("draft-measure")),
        });
      }
      if (measure?.measureMetaData?.draft) {
        actions.set("version measure", {
          icon: (
            <IconButton>
              <AccountTreeOutlinedIcon />
            </IconButton>
          ),
          name: "Version Measure",
          onClick: () => handleActionClick(new Event("version-measure")),
        });

        if (canDelete) {
          actions.set("delete measure", {
            icon: (
              <IconButton className="DeleteClass">
                <DeleteOutlinedIcon />
              </IconButton>
            ),
            name: "Delete Measure",
            onClick: () => handleActionClick(new Event("delete-measure")),
          });
        }
      }
    }

    if (ownerOfMeasure) {
      actions.set("share/unshare measure", {
        icon: (
          <ShareAction
            options={[SharedOptions.SHARE_WITH, SharedOptions.UNSHARE]}
            onClick={(option: string) =>
              handleActionClick(
                new Event(
                  option === SharedOptions.SHARE_WITH
                    ? "share-measure"
                    : "unshare-measure" // SharedOptions.UNSHARE
                )
              )
            }
          />
        ),
        name: "Share/Unshare",
      });
    } else if (sharedWithUser) {
      actions.set("unshare measure from me", {
        icon: (
          <ShareAction
            options={[SharedOptions.UNSHARE]}
            onClick={() =>
              handleActionClick(new Event("unshare-measure-from-me"))
            }
          />
        ),
        name: "Unshare",
      });
    }

    if (featureFlags?.TransferMeasure) {
      actions.set("transfer measure", {
        icon: (
          <TransferAction
            canTransfer={ownerOfMeasure}
            onClick={() => {
              handleActionClick(new Event("transfer-measure"));
            }}
          />
        ),
        name: ownerOfMeasure ? TRANSFER_MEASURE : CANNOT_TRANSFER,
      });
    }
    // required order to display
    const actionsListOrder = [
      "transfer measure",
      "human readable",
      "history",
      "draft measure",
      "version measure",
      "share/unshare measure",
      "unshare measure from me",
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
              if (action.onClick) {
                action.onClick();
              }
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
