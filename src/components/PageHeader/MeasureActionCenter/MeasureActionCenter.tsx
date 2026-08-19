import React, { useState, useEffect } from "react";
import { SpeedDial, SpeedDialAction, IconButton } from "@mui/material";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { Measure } from "@madie/madie-models";
import {
  RouteHandlerState,
  routeHandlerStore,
  checkUserCanEdit,
  useUserRoles,
  useFeatureFlags,
} from "@madie/madie-util";
import ShareAction, { SharedOptions } from "../shareAction/ShareAction";
import ExportAction from "../exportAction/ExportAction";
import TransferAction from "../transferAction/TransferAction";
import ReviewIcon from "../../../icons/ReviewIcon";
import { ClipboardPen, FileText, History, Network, Trash2 } from "lucide-react";

interface PropTypes {
  canEdit: boolean;
  measure: Measure;
  canDelete: boolean;
  measureLockedBy?: string;
  reviewStatus?: string | null;
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
  const userRoles = useUserRoles();
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
    setActions(
      getActionArray(
        props.measure,
        props.canEdit,
        props.canDelete,
        props.measureLockedBy,
        props.reviewStatus
      )
    );
  }, [props, routeHandlerState, userRoles]);

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
    canDelete: boolean,
    measureLockedBy: string | undefined,
    reviewStatus?: string | null
  ): any[] => {
    const ownerOfMeasure = isOwnerOfMeasure(measure);
    const sharedWithUser = isSharedWithUser(measure);
    const hasEditAccessToMeasure = checkUserCanEdit(
      measure?.measureSet?.owner,
      measure?.measureSet?.acls
    );

    const actions = new Map<string, any>();

    actions.set("human readable", {
      icon: (
        <IconButton>
          <FileText size={20} />
        </IconButton>
      ),
      name: routeHandlerState?.canTravel
        ? `View human readable`
        : `Save measure to view human readable`,
      onClick: () => handleActionClick(new Event("view-humanreadable")),
    });

    actions.set("history", {
      icon: (
        <IconButton>
          <History size={20} />
        </IconButton>
      ),
      name: "View History",
      onClick: () => {
        handleActionClick(new Event("view-measure-history"));
      },
    });

    actions.set("export measure", {
      icon: (
        <ExportAction
          onClick={(exportType: string) => {
            const elmErrorSeverity = exportType === "Export" ? "Info" : "Error";
            const bundleType = exportType === "Export" ? "export" : "publish";
            const event = new CustomEvent("export-measure", {
              detail: { elmErrorSeverity, bundleType },
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
              <ClipboardPen size={20} />
            </IconButton>
          ),
          name: "Draft Measure",
          onClick: () => handleActionClick(new Event("draft-measure")),
        });
      }
      if (measure?.measureMetaData?.draft) {
        if (measureLockedBy) {
          actions.set("version measure", {
            icon: (
              <IconButton disabled data-testid="versionDisabled">
                <Network size={20} style={{ transform: "rotate(270deg)" }} />
              </IconButton>
            ),
            name: measureLockedBy,
          });
        } else {
          actions.set("version measure", {
            icon: (
              <IconButton>
                <Network size={20} style={{ transform: "rotate(270deg)" }} />
              </IconButton>
            ),
            name: "Version Measure",
            onClick: () => handleActionClick(new Event("version-measure")),
          });
        }

        if (canDelete) {
          if (measureLockedBy) {
            actions.set("delete measure", {
              icon: (
                <IconButton
                  className="DeleteClass"
                  disabled
                  data-testid="deleteDisabled"
                >
                  <Trash2 size={20} />
                </IconButton>
              ),
              name: measureLockedBy,
            });
          } else {
            actions.set("delete measure", {
              icon: (
                <IconButton className="DeleteClass">
                  <Trash2 size={20} />
                </IconButton>
              ),
              name: "Delete Measure",
              onClick: () => handleActionClick(new Event("delete-measure")),
            });
          }
        }
      }
    }

    if (ownerOfMeasure || userRoles?.isAdmin) {
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

    if (ownerOfMeasure) {
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
    } else if (userRoles?.isAdmin) {
      // Admin users can transfer any measure
      actions.set("transfer measure", {
        icon: (
          <TransferAction
            canTransfer={true}
            onClick={() => {
              handleActionClick(new Event("transfer-measure"));
            }}
          />
        ),
        name: TRANSFER_MEASURE,
      });
    }

    const isReviewer = !!userRoles?.isReviewer;
    if (
      featureFlags?.MeasureReviewStatus &&
      (hasEditAccessToMeasure || isReviewer)
    ) {
      const reviewEnabled =
        hasEditAccessToMeasure || (isReviewer && !!reviewStatus);
      actions.set("review measure", {
        icon: reviewEnabled ? (
          <IconButton>
            <ReviewIcon />
          </IconButton>
        ) : (
          <IconButton disabled data-testid="reviewDisabled">
            <ReviewIcon />
          </IconButton>
        ),
        name: "Review",
        ...(reviewEnabled && {
          onClick: () => handleActionClick(new Event("review-measure")),
        }),
      });
    }

    const groupedActions: any[] = [];

    const appendGroup = (group: any[]) => {
      const visibleGroup = group.filter(Boolean);
      if (!visibleGroup.length) {
        return;
      }

      if (groupedActions.length) {
        groupedActions.push({
          isSeparator: true,
          key: `separator-${groupedActions.length}`,
          testId: `action-separator-${groupedActions.length}`,
        });
      }

      groupedActions.push(...visibleGroup);
    };

    // Rendered left-to-right (farthest to nearest):
    // Delete, Export, Share/Unshare, Transfer | Version/Draft | View HR, History | Review
    appendGroup([
      actions.get("delete measure"),
      actions.get("export measure"),
      actions.get("share/unshare measure") ||
        actions.get("unshare measure from me"),
      actions.get("transfer measure"),
    ]);

    appendGroup([actions.get("version measure"), actions.get("draft measure")]);

    appendGroup([actions.get("human readable"), actions.get("history")]);

    appendGroup([actions.get("review measure")]);

    return groupedActions.reverse();
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
        {actions.map((action) =>
          action.isSeparator ? (
            open ? (
              <div
                key={action.key}
                data-testid={action.testId}
                aria-hidden="true"
                style={{
                  color: "#8C8C8C",
                  display: "flex",
                  alignItems: "center",
                  margin: "0 6px",
                  fontSize: 18,
                }}
              >
                |
              </div>
            ) : null
          ) : (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    zIndex: 99,
                    backgroundColor: "#333",
                    "& .MuiTooltip-arrow": {
                      color: "#333",
                    },
                  },
                },
              }}
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
          )
        )}
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
