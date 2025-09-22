import React, { useState, useEffect, useRef, useCallback } from "react";
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
  useMeasureServiceApi,
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

const isOwnerOfSelectedMeasure = (measures) => {
  return (
    measures &&
    measures.every((measure) => {
      return checkUserCanEdit(measure?.measureSet?.owner, []);
    })
  );
};

export const DEL_MEASURE = "Delete measure";
export const UNABLE_DELETE = "Unable to delete measure.";
export const UNABLE_DELETE_LOCKED =
  UNABLE_DELETE + " Locked while being edited by <harpID>";

const TRANSFER_MEASURE = "Transfer";
const CANNOT_TRANSFER = "You cannot transfer a measure you do not own.";

const MeasureActionCenter = (props: PropTypes) => {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<Array<any>>([]);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  const [eventToTrigger, setEventToTrigger] = useState<Event | null>(null);
  const featureFlags = useFeatureFlags();
  const measureServiceApi = useRef(useMeasureServiceApi());
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockMessage, setLockMessage] = useState<string>(DEL_MEASURE);

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

  const validateDeleteActionState = useCallback(async () => {
    if (props.measure?.id) {
      const lockMsg: string =
        await measureServiceApi.current.checkMeasureLocked(props.measure?.id);

      // no locks on measure and test cases when returned message is "OK to proceed"
      if (lockMsg !== "OK to proceed") {
        setIsLocked(true);
        // measure lock message is the harpId
        if (!lockMsg.includes("test cases")) {
          setLockMessage(
            UNABLE_DELETE_LOCKED.replace("<harpID>", `${lockMsg}`)
          );
        } else {
          // test case lock message is "One or more test cases are locked by another user."
          setLockMessage(UNABLE_DELETE + " " + lockMsg);
        }
      } else {
        setIsLocked(false);
        setLockMessage(DEL_MEASURE);
      }
    }
  }, [props.measure, props.canEdit, props.canDelete, featureFlags?.Locking]);

  useEffect(() => {
    if (featureFlags?.Locking) {
      validateDeleteActionState();
    }
  }, [props.measure, validateDeleteActionState]);

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
              <IconButton className="DeleteClass" disabled={isLocked}>
                <DeleteOutlinedIcon />
              </IconButton>
            ),
            name: `${lockMessage}`,
            onClick: () => handleActionClick(new Event("delete-measure")),
            disabled: isLocked,
          });
        }
      }
    }

    if (isOwnerOfSelectedMeasure([measure])) {
      actions.set("share/unshare measure", {
        icon: (
          <ShareAction
            onClick={(option: string) => {
              if (option === SharedOptions.SHARE_WITH) {
                handleActionClick(new Event("share-measure"));
              } else if (option === SharedOptions.UNSHARE) {
                handleActionClick(new Event("unshare-measure"));
              }
            }}
          />
        ),
        name: "Share/Unshare",
      });
    }

    if (featureFlags?.TransferMeasure) {
      actions.set("transfer measure", {
        icon: (
          <TransferAction
            canTransfer={isOwnerOfSelectedMeasure([measure])}
            onClick={() => {
              handleActionClick(new Event("transfer-measure"));
            }}
          />
        ),
        name: isOwnerOfSelectedMeasure([measure])
          ? TRANSFER_MEASURE
          : CANNOT_TRANSFER,
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
            onClick={
              action.disabled //prevent opening when it's disabled
                ? undefined
                : () => {
                    setOpen(false);
                    if (action.onClick) {
                      action.onClick();
                    }
                  }
            }
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
