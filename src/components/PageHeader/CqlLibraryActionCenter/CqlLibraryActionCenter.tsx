import React, { useState, useEffect, useRef } from "react";
import {
  SpeedDial,
  SpeedDialAction,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { CqlLibrary } from "@madie/madie-models";
import { blue, red } from "@mui/material/colors";
import {
  RouteHandlerState,
  routeHandlerStore,
  useOktaTokens,
  useFeatureFlags,
} from "@madie/madie-util";
import useCqlLibraryServiceApi from "../../../../api/useCqlLibraryServiceApi";
import ShareIcon from "../shareAction/ShareIcon";

interface PropTypes {
  canEdit: boolean;
  library: CqlLibrary;
  canDelete: boolean;
}

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
    setActions(getActionArray(props.library, props.canEdit, props.canDelete));
  }, [props, routeHandlerState, owner]);

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
  const { getUserName } = useOktaTokens();
  const username = getUserName();
  const getActionArray = (
    library: CqlLibrary,
    canEdit: boolean,
    canDelete: boolean
  ): any[] => {
    const actions = new Map<string, any>();

    if (canEdit) {
      if (library?.draft) {
        if (canDelete) {
          actions.set("delete library", {
            icon: (
              <IconButton className="DeleteClass">
                <DeleteOutlinedIcon />
              </IconButton>
            ),
            name: "Delete Library",
            onClick: () => handleActionClick(new Event("delete-library")),
          });
        }
        actions.set("version library", {
          icon: (
            <IconButton>
              <AccountTreeOutlinedIcon />
            </IconButton>
          ),
          name: "Version Library",
          onClick: () => handleActionClick(new Event("version-library")),
        });
      }
      if (!library?.draft) {
        actions.set("draft library", {
          icon: (
            <IconButton>
              <EditCalendarOutlinedIcon />
            </IconButton>
          ),
          name: "Draft Library",
          onClick: () => handleActionClick(new Event("draft-library")),
        });
      }
      if (owner && owner == username && featureFlags.ShareLibrary) {
        actions.set("share library", {
          icon: (
            <IconButton>
              <ShareIcon />
            </IconButton>
          ),
          name: "Share Library",
          onClick: (event: React.MouseEvent<HTMLElement>) => {
            setOpen(false);
            setShareAnchorEl(event.currentTarget);
          },
        });
      }
    }
    // required order to display
    const actionsListOrder = [
      "draft library",
      "version library",
      "share library",
      "delete library",
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
        {actions.map((action) => (
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
          />
        ))}
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
      </Menu>
    </div>
  );
};

export default CqlLibraryActionCenter;
