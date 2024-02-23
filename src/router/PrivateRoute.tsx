import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// router-dom 6 does not allow secureRoute to be child of Routes. so instead we wrap the routes and nest them in a secure path.

const PrivateRoute = ({ auth }) => {
  return auth ? <Outlet /> : <Navigate to="login/callback" />;
};

export default PrivateRoute;
