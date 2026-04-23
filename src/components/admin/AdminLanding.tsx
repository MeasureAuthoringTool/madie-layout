import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";
import { useDocumentTitle, useUserRoles } from "@madie/madie-util";
import "./AdminLanding.scss";

const AdminLanding = () => {
  useDocumentTitle("MADiE Admin");
  const userRoles = useUserRoles();

  if (!userRoles?.isAdmin) {
    return null;
  }

  return (
    <div data-testid="admin-landing">
      <div id="admin-nav" style={{ marginTop: "-48px", marginLeft: "32px" }}>
        <Tabs value="user-management" type="A" size="standard">
          <Tab
            type="A"
            size="standard"
            value="user-management"
            label="User Management"
            data-testid="user-management-tab"
          />
        </Tabs>
      </div>
    </div>
  );
};

export default AdminLanding;
