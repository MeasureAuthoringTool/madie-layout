import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLocalStorage } from "../../custom-hooks/useLocalStorage";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Fade, Breadcrumbs } from "@mui/material";
import CreateNewMeasureDialog from "../NewMeasure/CreateNewMeasureDialog";
import { Button } from "@madie/madie-design-system/dist/react";
import {
  measureStore,
  cqlLibraryStore,
  checkUserCanEdit,
} from "@madie/madie-util";
import "twin.macro";
import "styled-components/macro";
import "./pageHeader.scss";

const PageHeader = () => {
  const { pathname } = useLocation();
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
  const [userFirstName] = useLocalStorage("givenName", "");
  const handleClose = () => {
    setCreateOpen(false);
  };
  // dialog utilities just for delete measure
  const canEdit = checkUserCanEdit(measureState?.createdBy, measureState?.acls);

  const readablePeriodStart = measureState
    ? new Date(measureState.measurementPeriodStart).toLocaleDateString()
    : null;
  const readablePeriodEnd = measureState
    ? new Date(measureState.measurementPeriodEnd).toLocaleDateString()
    : null;
  const readableLibraryStartDate = libraryState
    ? new Date(libraryState.createdAt).toLocaleDateString()
    : null;
  const pageHeaderClass = libraryState?.id
    ? "page-header details"
    : "page-header";
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
                  // to={`/cql/${libraryState?.id}/edit/details`}
                  to={`/measures/${measureState?.id}/edit/details`}
                >
                  Details
                </Link>
              </Breadcrumbs>
            </div>
            <div style={{ justifyContent: "space-between" }}>
              <h1 tw="text-2xl text-white mb-3">{measureState?.measureName}</h1>
              <div tw="pr-8">
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
              <h2 tw="text-2xl text-white mb-0">{`${libraryState?.cqlLibraryName} v${libraryState?.version}`}</h2>
              {libraryState?.draft && <div className="draft-bubble">Draft</div>}
            </div>
            <div>
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
        <div className="measures">
          <div>
            <div className="left-col">
              <h1> Libraries </h1>
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
