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
  useUserServiceApi,
  useMeasureReviewServiceApi,
  useCqlLibraryReviewServiceApi,
  useUserRoles,
} from "@madie/madie-util";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  UserDetails,
  MeasureReview,
  CqlLibraryReview,
} from "@madie/madie-models";
import "twin.macro";
import "styled-components/macro";
import "./pageHeader.scss";
import { useIsOverflow } from "./useIsOverflow";
import CqlLibraryActionCenter from "./CqlLibraryActionCenter/CqlLibraryActionCenter";
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Tooltip from "@mui/material/Tooltip";
import MeasureStatusChips from "./MeasureStatusChip";

const REVIEW_STATUS_LABEL: Record<string, string> = {
  READY_FOR_REVIEW: "Ready",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
};

const REVIEW_TOOLTIP_STATUSES = new Set([
  "READY_FOR_REVIEW",
  "IN_PROGRESS",
  "COMPLETE",
]);

const getReviewStatusLabel = (status?: string | null): string =>
  status ? REVIEW_STATUS_LABEL[status] ?? "" : "";

type ReviewWithOptionalReviewers = {
  status?: string;
  reviewers?: string[];
};

const shouldShowReviewTooltip = (review?: ReviewWithOptionalReviewers) => {
  return (
    !!review?.status &&
    REVIEW_TOOLTIP_STATUSES.has(review.status) &&
    !!review?.reviewers?.length
  );
};

const formatReviewerDisplayName = (
  details: UserDetails | undefined,
  harpId: string
): string => {
  const name = [details?.firstName, details?.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return name || harpId;
};

const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  DEACTIVATED: "Deactivated",
  ERROR_SUSPENDED: "Suspended",
};

const getUserStatusLabel = (status?: string): string =>
  status ? USER_STATUS_LABEL[status] ?? status : "";

const formatLockedByDisplayName = (
  details: UserDetails | undefined | null,
  harpId: string | undefined
): string => {
  const name = [details?.firstName, details?.lastName]
    .map((n) => n?.trim())
    .filter(Boolean)
    .join(" ");
  return name ? `${name} (${harpId})` : harpId ?? "";
};

const pad2 = (n: number): string => String(n).padStart(2, "0");

const formatUserLastLogin = (lastLoginAt?: string | null): string => {
  if (!lastLoginAt) return "-";
  const lastDate = new Date(lastLoginAt);
  const dateStr = `${pad2(lastDate.getMonth() + 1)}/${pad2(
    lastDate.getDate()
  )}/${lastDate.getFullYear()}`;
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
    (startOfToday.getTime() - startOfLast.getTime()) / (1000 * 60 * 60 * 24)
  );
  return days > 0 ? `${dateStr} (${days} days ago)` : dateStr;
};

const PageHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState<string>();

  const { getUserName } = useOktaTokens();
  const userName = getUserName();

  const userRoles = useUserRoles();
  const isReviewer = !!userRoles?.isReviewer;

  const userServiceApiRef = useRef(useUserServiceApi());
  const measureReviewServiceApiRef = useRef(useMeasureReviewServiceApi());
  const cqlLibraryReviewServiceApiRef = useRef(useCqlLibraryReviewServiceApi());
  const [measureLockOwner, setMeasureLockOwner] = useState<UserDetails | null>(
    null
  );
  const [libraryLockOwner, setLibraryLockOwner] = useState<UserDetails | null>(
    null
  );
  const [measureReview, setMeasureReview] = useState<MeasureReview | null>(
    null
  );
  const [libraryReview, setLibraryReview] = useState<CqlLibraryReview | null>(
    null
  );

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

  const measureLockedByHarpId = measureState?.measureLock?.lockedBy;
  useEffect(() => {
    if (measureLockedByHarpId) {
      userServiceApiRef.current
        .getOwnerDetails(measureLockedByHarpId)
        .then(setMeasureLockOwner)
        .catch(() => setMeasureLockOwner(null));
    } else {
      setMeasureLockOwner(null);
    }
  }, [measureLockedByHarpId]);

  useEffect(() => {
    let isMounted = true;
    const measureId = measureState?.id;
    if (measureId) {
      measureReviewServiceApiRef.current
        .getMeasureReview(measureId)
        .then((review) => {
          if (isMounted) {
            setMeasureReview(review);
          }
        })
        .catch(() => {
          if (isMounted) {
            setMeasureReview(null);
          }
        });
    } else {
      setMeasureReview(null);
    }
    return () => {
      isMounted = false;
    };
  }, [measureState?.id]);

  // An event to listen if the Review Status has changed, if so use that info or reFetch the reviewStatus from backend
  useEffect(() => {
    const handleReviewSaved = (event: Event) => {
      const savedReview = (event as CustomEvent<MeasureReview | undefined>)
        .detail;
      if (savedReview) {
        setMeasureReview(savedReview);
      } else if (measureState?.id) {
        measureReviewServiceApiRef.current
          .getMeasureReview(measureState.id)
          .then(setMeasureReview)
          .catch(() => setMeasureReview(null));
      }
    };
    window.addEventListener("review-measure-saved", handleReviewSaved);
    return () => {
      window.removeEventListener("review-measure-saved", handleReviewSaved);
    };
  }, [measureState?.id]);

  // An event to listen if the Review Status has changed, if so use that info or reFetch the reviewStatus from backend
  useEffect(() => {
    const handleReviewSaved = (event: Event) => {
      const savedReview = (event as CustomEvent<CqlLibraryReview | undefined>)
        .detail;
      if (savedReview) {
        setLibraryReview(savedReview);
      } else if (libraryState?.id) {
        cqlLibraryReviewServiceApiRef.current
          .getCqlLibraryReview(libraryState.id)
          .then(setLibraryReview)
          .catch(() => setLibraryReview(null));
      }
    };
    window.addEventListener("review-library-saved", handleReviewSaved);
    return () => {
      window.removeEventListener("review-library-saved", handleReviewSaved);
    };
  }, [libraryState?.id]);

  const [libraryReviewerDisplayNames, setLibraryReviewerDisplayNames] =
    useState<Record<string, string>>({});

  const libraryReviewWithReviewers = libraryReview as CqlLibraryReview & {
    reviewers?: string[];
  };

  const libraryLockedByHarpId = libraryState?.cqlLibraryLock?.lockedBy;
  useEffect(() => {
    let isMounted = true;
    const libraryId = libraryState?.id;
    if (libraryId) {
      cqlLibraryReviewServiceApiRef.current
        .getCqlLibraryReview(libraryId)
        .then((review) => {
          if (isMounted) {
            setLibraryReview(review);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLibraryReview(null);
          }
        });
    } else {
      setLibraryReview(null);
    }
    return () => {
      isMounted = false;
    };
  }, [libraryState?.id]);

  useEffect(() => {
    const reviewerIds = Array.from(
      new Set(libraryReviewWithReviewers?.reviewers ?? [])
    ).filter((harpId): harpId is string => !!harpId);

    if (!shouldShowReviewTooltip(libraryReviewWithReviewers)) {
      setLibraryReviewerDisplayNames({});
      return;
    }

    if (reviewerIds.length === 0) {
      setLibraryReviewerDisplayNames({});
      return;
    }

    let isMounted = true;

    userServiceApiRef.current
      .getBulkUserDetails(reviewerIds)
      .then((userDetails) => {
        if (!isMounted) {
          return;
        }

        const nextDisplayNames: Record<string, string> = {};
        reviewerIds.forEach((harpId) => {
          nextDisplayNames[harpId] = formatReviewerDisplayName(
            userDetails?.[harpId],
            harpId
          );
        });
        setLibraryReviewerDisplayNames(nextDisplayNames);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        const fallbackDisplayNames: Record<string, string> = {};
        reviewerIds.forEach((harpId) => {
          fallbackDisplayNames[harpId] = harpId;
        });
        setLibraryReviewerDisplayNames(fallbackDisplayNames);
      });

    return () => {
      isMounted = false;
    };
  }, [libraryReviewWithReviewers]);

  useEffect(() => {
    if (libraryLockedByHarpId) {
      userServiceApiRef.current
        .getOwnerDetails(libraryLockedByHarpId)
        .then(setLibraryLockOwner)
        .catch(() => setLibraryLockOwner(null));
    } else {
      setLibraryLockOwner(null);
    }
  }, [libraryLockedByHarpId]);

  const [selectedUserProfileInfo, setSelectedUserProfileInfo] =
    useState<UserDetails | null>(adminUserStore.state);

  useEffect(() => {
    const subscription = adminUserStore.subscribe(setSelectedUserProfileInfo);
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
    ? "Locked while being edited by " +
      formatLockedByDisplayName(measureLockOwner, measureLockedByHarpId)
    : undefined;

  const libraryCanEdit: boolean = checkUserCanEdit(
    libraryState?.librarySet?.owner,
    libraryState?.librarySet?.acls,
    true
  );
  const libraryLockedBy = libraryState?.cqlLibraryLock
    ? "Locked while being edited by " +
      formatLockedByDisplayName(libraryLockOwner, libraryLockedByHarpId)
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
  }, [updateFeatureFlags]);

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
                  reviewStatus={measureReview?.status}
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
              {measureState?.model && (
                <p
                  data-testid={`info-${measureState?.model}-0`}
                  tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                >
                  {measureState?.model}
                </p>
              )}
              {(measureCanEdit || isReviewer) &&
                getReviewStatusLabel(measureReview?.status) && (
                  <p
                    data-testid="measure-review-status"
                    tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                  >
                    {`Review Status: ${getReviewStatusLabel(
                      measureReview?.status
                    )}`}
                  </p>
                )}
              {[readablePeriodStart + " - " + readablePeriodEnd].map(
                (val, key) => {
                  if (val)
                    return (
                      <p
                        data-testid={`info-${val}-${key + 1}`}
                        key={`info-${val}-${key + 1}`}
                        tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                      >
                        {val}
                      </p>
                    );
                }
              )}
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
                      title={`Locked while being edited by ${formatLockedByDisplayName(
                        measureLockOwner,
                        measureLockedByHarpId
                      )}`}
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
                  reviewStatus={libraryReview?.status}
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
              {(libraryCanEdit || isReviewer) &&
                getReviewStatusLabel(libraryReview?.status) && (
                  <Tooltip
                    title={
                      shouldShowReviewTooltip(libraryReviewWithReviewers) ? (
                        <div>
                          {libraryReviewWithReviewers.reviewers?.map(
                            (reviewerId, index) => (
                              <div
                                key={`${libraryState?.id}-reviewer-${index}`}
                              >
                                {libraryReviewerDisplayNames[reviewerId] ??
                                  reviewerId}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        ""
                      )
                    }
                    disableHoverListener={
                      !shouldShowReviewTooltip(libraryReviewWithReviewers)
                    }
                    arrow
                  >
                    <p
                      data-testid="cql-library-status"
                      tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(225,225,225, 1)] leading-none first:pl-0 first:ml-0 first:border-0"
                    >
                      {`Review Status: ${getReviewStatusLabel(
                        libraryReview?.status
                      )}`}
                    </p>
                  </Tooltip>
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
                        title={`Locked while being edited by ${formatLockedByDisplayName(
                          libraryLockOwner,
                          libraryLockedByHarpId
                        )}`}
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
        (pathname.includes("/admin/userProfile") && selectedUserProfileInfo ? (
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
            <h1 data-testid="admin-user-profile-name">{`${selectedUserProfileInfo?.firstName} ${selectedUserProfileInfo?.lastName}`}</h1>
            <div className="admin-user-profile-meta">
              <p className="meta-item">
                <span className="meta-label">HARP ID:</span>
                <span data-testid="admin-user-profile-harpId">
                  {selectedUserProfileInfo?.harpId}
                </span>
              </p>
              <p className="meta-item">
                <span className="meta-label">Email Address:</span>
                <span data-testid="admin-user-profile-email">
                  {selectedUserProfileInfo?.email}
                </span>
              </p>
              <p className="meta-item">
                <span className="meta-label">Status:</span>
                <Chip
                  label={getUserStatusLabel(selectedUserProfileInfo?.status)}
                  className={`admin-status-chip admin-status-chip--${(
                    selectedUserProfileInfo?.status || ""
                  ).toLowerCase()}`}
                  size="small"
                  data-testid={`admin-status-chip-${selectedUserProfileInfo?.status}`}
                />
              </p>
              <p className="meta-item">
                <span className="meta-label">Last Log In:</span>
                <span data-testid="admin-user-profile-last-login">
                  {formatUserLastLogin(selectedUserProfileInfo?.lastLoginAt)}
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
