import React, { useState, useEffect, useRef } from "react";
import {
  SpeedDial,
  SpeedDialAction,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { CqlLibrary } from "@madie/madie-models";
import {
  RouteHandlerState,
  routeHandlerStore,
  useCqlLibraryServiceApi,
  checkUserCanEdit,
  useUserRoles,
  useFeatureFlags,
} from "@madie/madie-util";
import ShareIcon from "../shareAction/ShareIcon";
import ReviewIcon from "../../../icons/ReviewIcon";
import {
  ArrowRightLeft,
  ClipboardPen,
  History,
  Network,
  Trash2,
} from "lucide-react";

interface PropTypes {
  canEdit: boolean;
  library: CqlLibrary;
  canDelete: boolean;
  libraryLockedBy?: string | undefined;
  reviewStatus?: string | null;
}

const TRANSFER_LIBRARY = "Transfer";

const CqlLibraryActionCenter = (props: PropTypes) => {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<Array<any>>([]);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  const [eventToTrigger, setEventToTrigger] = useState<Event | null>(null);
  const [owner, setOwner] = useState<string>();
  const cqlLibraryServiceApi = useRef(useCqlLibraryServiceApi()).current;
  const { updateRouteHandlerState } = routeHandlerStore;
  const [routeHandlerState, setRouteHandlerState] = useState<RouteHandlerState>(
    routeHandlerStore.state
  );
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const shareMenuOpen = Boolean(shareAnchorEl);
  const userRoles = useUserRoles();
  const featureFlags = useFeatureFlags();

  useEffect(() => {
    const subscription = routeHandlerStore.subscribe(setRouteHandlerState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getAllOwners = async () => {
      const getOwners = async () => {
        if (props.library) {
          return await cqlLibraryServiceApi.fetchAllOwners([
            props.library.librarySetId,
          ]);
        }
      };

      const owners = await getOwners();
      setOwner(owners?.length > 0 ? owners[0] : null);
    };

    getAllOwners();
  }, [props.library]);

  useEffect(() => {
    setActions(
      getActionArray(
        props.library,
        props.canEdit,
        props.canDelete,
        props.reviewStatus
      )
    );
  }, [props, routeHandlerState, owner, userRoles, featureFlags]);

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
  const isOwnerOfLibrary = (library: CqlLibrary) => {
    return library && checkUserCanEdit(library?.librarySet?.owner, []);
  };

  const isSharedWithUser = (library: CqlLibrary) => {
    return library && checkUserCanEdit(null, library?.librarySet?.acls);
  };

  const getActionArray = (
    library: CqlLibrary,
    canEdit: boolean,
    canDelete: boolean,
    reviewStatus?: string | null
  ): any[] => {
    const actions = new Map<string, any>();
    const ownerOfLibrary = isOwnerOfLibrary(library);
    const sharedWithUser = isSharedWithUser(library);
    const hasEditAccessToLibrary = checkUserCanEdit(
      library?.librarySet?.owner,
      library?.librarySet?.acls
    );

    actions.set("history library", {
      icon: (
        <IconButton>
          <History size={20} />
        </IconButton>
      ),
      name: "History",
      onClick: () => handleActionClick(new Event("history-library")),
    });

    if (canEdit) {
      if (library?.draft) {
        if (canDelete) {
          if (props.libraryLockedBy) {
            actions.set("delete library", {
              icon: (
                <IconButton
                  className="DeleteClass"
                  disabled
                  data-testid="deleteDisabled"
                >
                  <Trash2 size={20} />
                </IconButton>
              ),
              name: props.libraryLockedBy,
            });
          } else {
            actions.set("delete library", {
              icon: (
                <IconButton className="DeleteClass">
                  <Trash2 size={20} />
                </IconButton>
              ),
              name: "Delete Library",
              onClick: () => handleActionClick(new Event("delete-library")),
            });
          }
        }
        if (props.libraryLockedBy) {
          actions.set("version library", {
            icon: (
              <IconButton disabled data-testid="versionDisabled">
                <Network size={20} style={{ transform: "rotate(270deg)" }} />
              </IconButton>
            ),
            name: props.libraryLockedBy,
          });
        } else {
          actions.set("version library", {
            icon: (
              <IconButton>
                <Network size={20} style={{ transform: "rotate(270deg)" }} />
              </IconButton>
            ),
            name: "Version Library",
            onClick: () => handleActionClick(new Event("version-library")),
          });
        }
      }
      if (!library?.draft) {
        actions.set("draft library", {
          icon: (
            <IconButton>
              <ClipboardPen size={20} />
            </IconButton>
          ),
          name: "Draft Library",
          onClick: () => handleActionClick(new Event("draft-library")),
        });
      }
    }
    if (userRoles?.isAdmin || isOwnerOfLibrary(library)) {
      actions.set("transfer library", {
        icon: (
          <IconButton>
            <ArrowRightLeft size={20} />
          </IconButton>
        ),
        name: TRANSFER_LIBRARY,
        onClick: () => {
          handleActionClick(new Event("transfer-library"));
        },
      });
    }

    if ((canEdit && ownerOfLibrary) || userRoles?.isAdmin) {
      actions.set("share library", {
        icon: (
          <IconButton>
            <ShareIcon />
          </IconButton>
        ),
        name: `${userRoles?.isAdmin ? "Share/Unshare" : "Share Library"}`,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          setOpen(false);
          setShareAnchorEl(event.currentTarget);
        },
      });
    } else if ((canEdit && sharedWithUser) || userRoles?.isAdmin) {
      actions.set("unshare library from me", {
        icon: (
          <IconButton>
            <ShareIcon />
          </IconButton>
        ),
        name: "UnShare Library From Me",
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          setOpen(false);
          setShareAnchorEl(event.currentTarget);
        },
      });
    }

    const isReviewer = !!userRoles?.isReviewer;
    if (
      featureFlags?.LibraryReviewStatus &&
      (hasEditAccessToLibrary || isReviewer)
    ) {
      const reviewEnabled =
        hasEditAccessToLibrary || (isReviewer && !!reviewStatus);
      actions.set("review library", {
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
        onClick: () => {
          reviewEnabled
            ? handleActionClick(new Event("review-library"))
            : undefined;
        },
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
    // Delete, Share/Unshare, Transfer | Version/Draft | History | Review
    appendGroup([
      actions.get("delete library"),
      actions.get("share library") || actions.get("unshare library from me"),
      actions.get("transfer library"),
    ]);

    appendGroup([actions.get("version library"), actions.get("draft library")]);

    appendGroup([actions.get("history library")]);

    appendGroup([actions.get("review library")]);

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
        ariaLabel="Library action center"
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
              data-testid={action.name.replace(/\s/g, "")}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                setOpen(false);
                action.onClick(event);
              }}
              sx={{
                boxShadow: "none",
                transition: "opacity 0s, visibility 0s",
                margin: 0,
                marginRight: 1,
                transitionDelay: "0s",
              }}
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
            />
          )
        )}
      </SpeedDial>
      <MadieDiscardDialog
        open={discardDialogOpen}
        onContinue={onContinue}
        onClose={onClose}
      />
      <Menu
        anchorEl={shareAnchorEl}
        open={shareMenuOpen}
        onClose={() => setShareAnchorEl(null)}
        data-testid="share-menu"
      >
        {actions.some((action) => action.name === "UnShare Library From Me") ? (
          <MenuItem
            data-testid="Unshare-library-from-me-option"
            onClick={() => {
              setShareAnchorEl(null);
              handleActionClick(new Event("unshare-library-from-me"));
            }}
          >
            Unshare
          </MenuItem>
        ) : (
          <>
            <MenuItem
              data-testid="Share With-option"
              onClick={() => {
                setShareAnchorEl(null);
                handleActionClick(new Event("share-library"));
              }}
            >
              Share With
            </MenuItem>
            <MenuItem
              data-testid="Unshare-option"
              onClick={() => {
                setShareAnchorEl(null);
                handleActionClick(new Event("unshare-library"));
              }}
            >
              Unshare
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
};

export default CqlLibraryActionCenter;
