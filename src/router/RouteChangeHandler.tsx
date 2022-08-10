import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import { routeHandlerStore } from "@madie/madie-util";
import ErrorIcon from "@mui/icons-material/Error";
// import { RouteHandlerState } from "../types/madie-madie-util";
import "./RouteChangeHandler.scss";
// We have to listen at the top level for navigational changes to block them.
// Navigation must be aware of dirty form state.
export interface RouteHandlerState {
  canTravel: boolean;
  pendingRoute: string;
}

const RouteChangePrompt = () => {
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

  const history = useHistory();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const unblock = history.block(({ pathname }) => {
      if (!routeHandlerState.canTravel) {
        updateRouteHandlerState({ canTravel: true, pendingRoute: pathname });
        return false;
      }
      unblock();
    });
    return unblock;
  }, [
    setDialogOpen,
    history.block,
    routeHandlerState.canTravel,
    routeHandlerState.pendingRoute,
  ]);

  useEffect(() => {
    if (routeHandlerState.pendingRoute) {
      setDialogOpen(true);
      setRouteHandlerState({
        canTravel: true,
        pendingRoute: routeHandlerState.pendingRoute,
      });
    }
  }, [routeHandlerState.pendingRoute, setDialogOpen]);

  const onContinue = () => {
    setDialogOpen(false);
    const currentRoute = routeHandlerState.pendingRoute;
    updateRouteHandlerState({
      canTravel: true,
      pendingRoute: currentRoute,
    });
    history.push(routeHandlerState.pendingRoute);
  };
  const onClose = () => {
    updateRouteHandlerState({ canTravel: false, pendingRoute: "" });
    setDialogOpen(false);
  };

  return (
    <div>
      <MadieDialog
        title="Discard Changes?"
        dialogProps={{
          open: dialogOpen,
          onClose,
          "data-testid": "discard-dialog",
        }}
        cancelButtonProps={{
          variant: "secondary",
          onClick: onClose,
          cancelText: "No, Keep Working",
          "data-testid": "discard-dialog-cancel-button",
        }}
        continueButtonProps={{
          variant: "primary",
          type: "submit",
          "data-testid": "discard-dialog-continue-button",
          continueText: "Yes, Discard All Changes",
          onClick: onContinue,
        }}
      >
        <div className="route-change-dialog-body">
          <section className="dialog-warning-body">
            <p>You have unsaved changes.</p>
            <p className="strong">
              Are you sure you want to discard your changes?
            </p>
          </section>
          <section className="dialog-warning-action">
            <ErrorIcon />
            <p>This Action cannot be undone.</p>
          </section>
        </div>
      </MadieDialog>
    </div>
  );
};
export default RouteChangePrompt;
