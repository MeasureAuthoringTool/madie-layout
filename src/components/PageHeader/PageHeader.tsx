import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Fade, Breadcrumbs } from "@mui/material";
import CreateNewMeasureDialog from "../NewMeasure/CreateNewMeasureDialog";
import WafDialog from "../WafDialog/WafDialog";
import MeasureActionCenter from "./MeasureActionCenter/MeasureActionCenter";
import { Button } from "@madie/madie-design-system/dist/react";
import {
  measureStore,
  cqlLibraryStore,
  featureFlagsStore,
  checkUserCanEdit,
  checkUserCanDelete,
  axios,
  useOktaTokens,
  adminUserStore,
} from "@madie/madie-util";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UserDetails } from "@madie/madie-models";
import "twin.macro";
import "styled-components/macro";
import "./pageHeader.scss";
import { useIsOverflow } from "./useIsOverflow";
import CqlLibraryActionCenter from "./CqlLibraryActionCenter/CqlLibraryActionCenter";
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Tooltip from "@mui/material/Tooltip";
import MeasureStatusChips from "./MeasureStatusChip";

const PageHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState<string>();

  const { getUserName } = useOktaTokens();
  const userName = getUserName();

  useEffect(() => {
    window.addEventListener("storage", () =>
      setUserFirstName(window.localStorage.getItem("givenName"))
    );
  }, []);

  useEffect(() => {
    document.addEventListener("wafReject", (e: any) => {
      setWafOpen(true);
      setWafSupportId(e.detail.supportId);
    });
  }, []);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [wafOpen, setWafOpen] = useState<boolean>(false);
  const [wafSupportId, setWafSupportId] = useState<string>("");
  const [libraryState, setLibraryState] = useState<any>(cqlLibraryStore.state);
  useEffect(() => {
    const subscription = cqlLibraryStore.subscribe(setLibraryState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const [measureState, setMeasureState] = useState<any>(measureStore.state);

  useEffect(() => {
    const subscription = measureStore.subscribe(setMeasureState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [adminUserState, setAdminUserState] = useState<UserDetails | null>(
    adminUserStore.state
  );

  useEffect(() => {
    const subscription = adminUserStore.subscribe(setAdminUserState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // create
  const openCreate = () => {
    setCreateOpen(true);
  };

  const handleClose = () => {
    setCreateOpen(false);
  };

  //waf error
  const openWaf = () => {
    setWafOpen(true);
  };

  const handleWafClose = () => {
    setWafOpen(false);
  };
  // dialog utilities just for delete measure
  const measureCanEdit: boolean = checkUserCanEdit(
    measureState?.measureSet?.owner,
    measureState?.measureSet?.acls,
    true // in this context we don't care if it's not a draft; because we still have some actions we can take
  );

  const measureCanDelete: boolean = checkUserCanDelete(
    measureState?.measureSet?.owner,
    measureState?.measureMetadata?.draft
  );

  const measureLockedBy = measureState?.measureLock
    ? "Locked while being edited by " + measureState?.measureLock?.lockedBy
    : undefined;

  const libraryCanEdit: boolean = checkUserCanEdit(
    libraryState?.librarySet?.owner,
    libraryState?.librarySet?.acls,
    true
  );
  const libraryLockedBy = libraryState?.cqlLibraryLock
    ? "Locked while being edited by " + libraryState?.cqlLibraryLock.lockedBy
    : undefined;

  const libraryCanDelete: boolean = checkUserCanDelete(
    libraryState?.librarySet?.owner,
    libraryState?.draft
  );

  const makeUTCDate = (date) => {
    return `${
      date.getUTCMonth() + 1
    }/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  };
  const readablePeriodStart = measureState
    ? makeUTCDate(new Date(measureState.measurementPeriodStart))
    : null;
  const readablePeriodEnd = measureState
    ? makeUTCDate(new Date(measureState.measurementPeriodEnd))
    : null;
  const readableLibraryStartDate = libraryState
    ? new Date(libraryState.createdAt).toLocaleDateString()
    : null;
  const pageHeaderClass = libraryState?.id
    ? "page-header details"
    : "page-header";

  const { updateFeatureFlags } = featureFlagsStore;
  // fetch the feature flags and set into feature flag store
  useEffect(() => {
    axios
      .get("/env-config/serviceConfig.json")
      .then((value) => {
        updateFeatureFlags(value.data?.features);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }, []);

  const overflowingText = useRef<HTMLHeadingElement>(null);
  const isOverflow = useIsOverflow(overflowingText, () => {});

  return (
    <div className={pageHeaderClass} id="page-header">
      {/* edit measures, measure details */}
      {pathname.includes("edit") && pathname.includes("measures") && (
        <Fade in={measureState?.measureName !== undefined}>
          <div className="details">
            <div tw="pr-8" style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0, right: 0 }}>
                <MeasureActionCenter
                  canEdit={measureCanEdit}
                  measure={measureState}
                  canDelete={measureCanDelete}
                  measureLockedBy={measureLockedBy}
                />
              </div>
            </div>
            <div>
              <Breadcrumbs aria-label="measures">
                <Link
                  tw="text-white hover:text-white"
                  to="/measures"
                  id="first-item"
                >
                  Measures
                </Link>
                <Link
                  tw="text-white hover:text-white"
                  to={`/measures/${measureState?.id}/edit/details`}
                >
                  Details
                </Link>
              </Breadcrumbs>
            </div>
            <div>
              <h1
                ref={overflowingText}
                className="truncate-header"
                tw="text-2xl text-white mb-3"
              >{`${measureState?.measureName}`}</h1>
              {/* Currently unable to test ResizeObserver with Jest and RTL due to limitations. Testable with cypress. */}
              {isOverflow && (
                <div
                  className="more-measures-button"
                  data-testId="more-measure-name-button"
                >
                  ...
                  <span className="more-text">{measureState?.measureName}</span>
                </div>
              )}
            </div>
            <div className="header-metadata-info">
              <p tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0">{`Version ${measureState?.version}`}</p>
              {[
                measureState?.model,
                readablePeriodStart + " - " + readablePeriodEnd,
              ].map((val, key) => {
                if (val)
                  return (
                    <p
                      data-testid={`info-${val}-${key}`}
                      key={`info-${val}-${key}`}
                      tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                    >
                      {val}
                    </p>
                  );
              })}
              <MeasureStatusChips measure={measureState} />
              {measureCanEdit &&
                measureState?.measureLock &&
                measureState?.measureLock?.lockedBy?.toLowerCase() !==
                  userName?.toLowerCase() && (
                  <div
                    className="lock-indicator"
                    data-testid={`lock-indicator-${measureState?.id}`}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Tooltip
                      title={`Locked while being edited by ${measureState?.measureLock?.lockedBy}`}
                      aria-describedby="locked-tooltip"
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
                    >
                      <Chip
                        data-testid={`measure-${measureState?.measureName}-inuse-chip`}
                        label="In-Use"
                        icon={
                          <LockOutlinedIcon
                            fontSize="small"
                            data-testid="locked-icon"
                          />
                        }
                        sx={{
                          backgroundColor: "#f5b027",
                          height: "24px",
                          ml: 1,
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
            </div>
          </div>
        </Fade>
      )}
      <WafDialog
        open={wafOpen}
        onClose={handleWafClose}
        supportId={wafSupportId}
      />
      {/* Measures landing */}
      {(pathname === "/measures" || pathname === "/measures/") && (
        <div className="measures">
          <CreateNewMeasureDialog open={createOpen} onClose={handleClose} />
          <div>
            <div className="left-col">
              <h1> Measures </h1>
              <h4>
                {" "}
                Welcome,{" "}
                <Fade in={userFirstName !== ""}>
                  <span>{userFirstName}</span>
                </Fade>
              </h4>
            </div>
            <div className="right-col">
              <Button
                id="first-item"
                variant="outline-filled"
                className="page-header-action-button"
                data-testid="create-new-measure-button"
                onClick={openCreate}
              >
                <AddIcon className="page-header-action-icon" />
                New Measure
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* edit library */}
      {pathname.includes("edit") && pathname.includes("cql-libraries") && (
        <Fade in={libraryState?.cqlLibraryName !== undefined}>
          <div className="details">
            <div tw="pr-8" style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0, right: 0 }}>
                <CqlLibraryActionCenter
                  canEdit={libraryCanEdit}
                  library={libraryState}
                  canDelete={libraryCanDelete}
                  libraryLockedBy={libraryLockedBy}
                />
              </div>
            </div>
            <div>
              <Breadcrumbs aria-label="Libraries">
                <Link
                  tw="text-white hover:text-white"
                  to="/cql-libraries"
                  id="first-item"
                >
                  Libraries
                </Link>
                <Link
                  tw="text-white hover:text-white"
                  to={`/cql-libraries/${libraryState?.id}/edit/details`}
                >
                  Details
                </Link>
              </Breadcrumbs>
            </div>
            <div tw="py-4">
              <h2 tw="text-2xl text-white mb-0">{`${libraryState?.cqlLibraryName}`}</h2>
              {libraryState?.draft && (
                <Chip
                  className="draft-chip"
                  data-testid="draft-chip"
                  label="Draft"
                />
              )}
            </div>
            <div>
              <p tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0">{`Version ${libraryState?.version}`}</p>
              {[libraryState?.model, readableLibraryStartDate].map(
                (val, key) => {
                  if (val)
                    return (
                      <p
                        data-testid={`info-${val}-${key}`}
                        key={`info-${val}-${key}`}
                        tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                      >
                        {val}
                      </p>
                    );
                }
              )}
              {libraryCanEdit && libraryState?.cqlLibraryLock && (
                <div
                  className="lock-indicator"
                  data-testid={`lock-indicator-${libraryState?.id}`}
                >
                  <Chip
                    data-testid={`library-${libraryState?.cqlLibraryName}-inuse-chip`}
                    label="In-Use"
                    icon={
                      <Tooltip
                        title={`Locked while being edited by ${libraryState?.cqlLibraryLock?.lockedBy}`}
                        aria-describedby="locked-tooltip"
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
                      >
                        <LockOutlinedIcon
                          fontSize="small"
                          data-testid="locked-icon"
                        />
                      </Tooltip>
                    }
                    sx={{
                      backgroundColor: "#f5b027",
                      height: "24px",
                      ml: 1,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Fade>
      )}
      {pathname.includes("cql-libraries") && !pathname.includes("edit") && (
        <div className="libraries">
          <div>
            <div className="left-col">
              <h1> Libraries </h1>
            </div>
            <div className="right-col">
              <Button
                id="first-item"
                variant="outline-filled"
                className="page-header-action-button"
                data-testid="create-new-cql-library-button"
                onClick={() => {
                  const event = new Event("openCreateLibraryDialog");
                  window.dispatchEvent(event);
                }}
              >
                <AddIcon className="page-header-action-icon" />
                New Library
              </Button>
            </div>
          </div>
        </div>
      )}
      {pathname.includes("/admin") &&
        (pathname.includes("/admin/userProfile") && adminUserState ? (
          <div className="admin admin-user-profile">
            <button
              type="button"
              className="back-to-users"
              data-testid="back-to-all-users"
              onClick={() => {
                adminUserStore.updateUser(null);
                navigate("/admin");
              }}
            >
              <ArrowBackIcon fontSize="small" />
              <span>Back to All Users</span>
            </button>
            <h1 data-testid="admin-user-profile-name">{`${adminUserState.firstName} ${adminUserState.lastName}`}</h1>
            <div className="admin-user-profile-meta">
              <p>
                <span className="meta-label">HARP ID:</span>
                <span data-testid="admin-user-profile-harpId">
                  {adminUserState.harpId}
                </span>
              </p>
              <p>
                <span className="meta-label">Email Address:</span>
                <span data-testid="admin-user-profile-email">
                  {adminUserState.email}
                </span>
              </p>
              <p>
                <span className="meta-label">Status:</span>
                <Chip
                  label={
                    adminUserState.status === "ACTIVE"
                      ? "Active"
                      : adminUserState.status === "DEACTIVATED"
                      ? "Deactivated"
                      : adminUserState.status === "ERROR_SUSPENDED"
                      ? "Suspended"
                      : adminUserState.status
                  }
                  className={`admin-status-chip admin-status-chip--${(
                    adminUserState.status || ""
                  )
                    .toString()
                    .toLowerCase()}`}
                  size="small"
                  data-testid={`admin-status-chip-${adminUserState.status}`}
                />
              </p>
              <p>
                <span className="meta-label">Last Log In:</span>
                <span data-testid="admin-user-profile-last-login">
                  {(() => {
                    const last = adminUserState.lastLoginAt;
                    if (!last) return "-";
                    const lastDate = new Date(last);
                    const dateStr = lastDate.toLocaleDateString();
                    const startOfLast = new Date(
                      lastDate.getFullYear(),
                      lastDate.getMonth(),
                      lastDate.getDate()
                    );
                    const now = new Date();
                    const startOfToday = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate()
                    );
                    const days = Math.floor(
                      (startOfToday.getTime() - startOfLast.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return days > 0 ? `${dateStr} (${days} days ago)` : dateStr;
                  })()}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="admin">
            <div>
              <div className="left-col">
                <h1> Administration </h1>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default PageHeader;
