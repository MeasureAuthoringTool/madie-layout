import React, { useState, useEffect, useRef } from "react";
import logo from "../../assets/images/Logo.svg";
import logoFull from "../../assets/images/Logo-Full.svg";
import { DropDown, DropMenu } from "../../styles/styles";
import { useOktaAuth } from "@okta/okta-react";
import { NavLink, useLocation } from "react-router-dom";
import UserProfile from "./UserProfile";
import UserAvatar from "./UserAvatar";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";
import "./MainNavBar.scss";
import UserUMLS from "./UserUMLS";
import Notifications from "./Notifications";
// @ts-ignore
import { UsaBanner } from "@uswds/elements";
import { useNotificationServiceApi, useUserRoles } from "@madie/madie-util";
import AdminNotification from "./AdminNotification";

// Register the web component once (safe in module scope)
if (!window.customElements.get("usa-banner")) {
  UsaBanner.define();
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "usa-banner": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const MainNavBar = () => {
  const userRoles = useUserRoles();
  const isAdmin = userRoles?.isAdmin;
  const [showFullLogo, setShowFullLogo] = useState(true);

  const { authState } = useOktaAuth();

  const resizeWindow = () => {
    const headerWidth =
      document.getElementById("madie-header")?.clientWidth ?? 0;
    setShowFullLogo(headerWidth > 1256);
  };

  useEffect(() => {
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  const { pathname } = useLocation();
  const selected = pathname.includes("/measures")
    ? "/measures"
    : pathname.includes("/cql-libraries")
    ? "/cql-libraries"
    : "";

  const notificationServiceApiRef = useRef(useNotificationServiceApi());
  const [notifications, setNotifications] = useState([]);
  const fetchNotifications = async () => {
    try {
      const notifications =
        await notificationServiceApiRef.current.getAllNotifications();
      console.log("fetched notifications: ", notifications);
      setNotifications(notifications);
      //   return notifications;
      // setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };
  //   fetchNotifications has to happen every 30 seconds.
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <nav>
      <a
        href="#page-header"
        className="skip-nav-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("first-item").focus();
        }}
      >
        Skip to main content
      </a>
      {!authState?.isAuthenticated && <usa-banner></usa-banner>}
      <header
        role="banner"
        aria-label="Site header"
        className="inner"
        id="madie-header"
      >
        <div id="logo_div">
          <NavLink to="/measures" className="logo">
            {!showFullLogo ? (
              <img
                src={logo}
                alt="MADiE Measure Authoring Development Integrated Environment logo"
                id="logo"
              />
            ) : (
              <img
                src={logoFull}
                alt="MADiE Measure Authoring Development Integrated Environment logo"
                id="fulllogo"
              />
            )}
          </NavLink>
        </div>
        <DropDown id="dropdown_div">
          <DropMenu>
            {authState?.isAuthenticated && (
              <>
                <Tabs size="standard" type="B" value={selected}>
                  <Tab
                    type="B"
                    value="/measures"
                    to="/measures"
                    component={NavLink}
                    name="measures"
                    aria-label="Measures"
                    id="measures-main-nav-bar-tab"
                    data-testid="main-nav-bar-measures"
                    label="Measures"
                  />
                  <Tab
                    type="B"
                    name="cql-libraries"
                    component={NavLink}
                    value="/cql-libraries"
                    to="/cql-libraries"
                    aria-label="CQL Library"
                    id="cql-library-main-nav-bar-tab"
                    data-testid="main-nav-bar-cql-library"
                    label="Libraries"
                  />
                  <Tab
                    type="B"
                    aria-label="Help"
                    data-testid="main-nav-bar-help"
                    label="Help"
                    value="help"
                    onClick={() => {
                      window.open(
                        "https://www.emeasuretool.cms.gov/training-resources",
                        "_blank"
                      );
                    }}
                  />
                </Tabs>
                <UserUMLS />
                <li id="main-nav-bar-tab-user-avatar">
                  <UserAvatar />
                </li>
                {isAdmin && (
                  <li id="main-nav-bar-admin-notifications">
                    <AdminNotification />
                  </li>
                )}
                <li id="main-nav-bar-notfications">
                  <Notifications
                    notifications={notifications}
                    setNotifications={setNotifications}
                  />
                </li>
                <li id="main-nav-bar-tab-user-profile">
                  <UserProfile />
                </li>
              </>
            )}
          </DropMenu>
        </DropDown>
      </header>
    </nav>
  );
};

export default MainNavBar;
