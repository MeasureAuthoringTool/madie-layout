import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Fade, Breadcrumbs } from "@mui/material";
import CreateNewMeasureDialog from "../NewMeasure/CreateNewMeasureDialog";
import { Button } from "@madie/madie-design-system/dist/react";
import {
  measureStore,
  cqlLibraryStore,
  featureFlagsStore,
  checkUserCanEdit,
} from "@madie/madie-util";
import "twin.macro";
import "styled-components/macro";
import "./pageHeader.scss";
import axios from "axios";
import { useIsOverflow } from "./useIsOverflow";

const PageHeader = () => {
  const { pathname } = useLocation();

  const [userFirstName, setUserFirstName] = useState<string>();
  useEffect(() => {
    window.addEventListener("storage", () =>
      setUserFirstName(window.localStorage.getItem("givenName"))
    );
  }, []);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
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

  // create
  const openCreate = () => {
    setCreateOpen(true);
  };

  const handleClose = () => {
    setCreateOpen(false);
  };
  // dialog utilities just for delete measure
  const canEdit = checkUserCanEdit(
    measureState?.measureSet?.owner,
    measureState?.measureSet?.acls,
    measureState?.measureMetaData?.draft
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
            <div>
              <Breadcrumbs aria-label="measures">
                <Link tw="text-white hover:text-white" to="/measures">
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

              <div tw="pr-8" style={{ marginLeft: "auto" }}>
                <Button
                  disabled={!canEdit}
                  className="page-header-action-button"
                  variant="outline-filled"
                  data-testid="delete-measure-button"
                  onClick={() => {
                    const event = new Event("delete-measure");
                    window.dispatchEvent(event);
                  }}
                >
                  <DeleteOutlineOutlinedIcon className="page-header-action-icon" />
                  Delete Measure
                </Button>
              </div>
            </div>
            <div>
              <p tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(221,221,221, 0.5)] leading-none first:pl-0 first:ml-0 first:border-0">{`Version ${measureState?.version}`}</p>
              {[
                measureState?.model,
                // measureState?.version, // not yet implemented
                readablePeriodStart + " - " + readablePeriodEnd,
              ].map((val, key) => {
                if (val)
                  return (
                    <p
                      data-testid={`info-${val}-${key}`}
                      key={`info-${val}-${key}`}
                      tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(221,221,221, 0.5)] leading-none first:pl-0 first:ml-0 first:border-0"
                    >
                      {val}
                    </p>
                  );
              })}
              {measureState?.measureMetaData?.draft && (
                <div className="draft-bubble" data-testid="draft-bubble">
                  Draft
                </div>
              )}
            </div>
          </div>
        </Fade>
      )}
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
            <div>
              <Breadcrumbs aria-label="Libraries">
                <Link tw="text-white hover:text-white" to="/cql-libraries">
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
                <div className="draft-bubble" data-testid="draft-bubble">
                  Draft
                </div>
              )}
            </div>
            <div>
              <p tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(221,221,221, 0.5)] leading-none first:pl-0 first:ml-0 first:border-0">{`Version ${libraryState?.version}`}</p>
              {[libraryState?.model, readableLibraryStartDate].map(
                (val, key) => {
                  if (val)
                    return (
                      <p
                        data-testid={`info-${val}-${key}`}
                        key={`info-${val}-${key}`}
                        tw="pl-4 ml-4 mb-0 border-l-2 border-[rgba(221,221,221, 0.5)] leading-none first:pl-0 first:ml-0 first:border-0"
                      >
                        {val}
                      </p>
                    );
                }
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
    </div>
  );
};

export default PageHeader;
