import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { MadieDiscardDialog } from "@madie/madie-design-system/dist/react";
import { routeHandlerStore } from "@madie/madie-util";
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
      <MadieDiscardDialog
        open={dialogOpen}
        onContinue={onContinue}
        onClose={onClose}
      />
    </div>
  );
};
export default RouteChangePrompt;
