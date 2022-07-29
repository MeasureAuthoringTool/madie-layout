import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLocalStorage } from "../../custom-hooks/useLocalStorage";
import AddIcon from "@mui/icons-material/Add";
import { Fade, Breadcrumbs } from "@mui/material";
import CreateNewMeasureDialog from "../NewMeasure/CreateNewMeasureDialog";
import { measureStore } from "@madie/madie-util";
import "twin.macro";
import "styled-components/macro";
import "./pageHeader.scss";

const PageHeader = () => {
  const { pathname } = useLocation();
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const [measureState, setMeasureState] = useState<any>(measureStore.state);
  useEffect(() => {
    const subscription = measureStore.subscribe(setMeasureState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const openCreate = () => {
    setCreateOpen(true);
  };
  const [userFirstName] = useLocalStorage("givenName", "");
  const handleClose = () => {
    setCreateOpen(false);
  };
  const readablePeriodStart = measureState
    ? new Date(measureState.measurementPeriodStart).toLocaleDateString()
    : null;
  const readablePeriodEnd = measureState
    ? new Date(measureState.measurementPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="page-header">
      {/* state 1 */}
      {pathname.includes("edit") && pathname.includes("measures") && (
        <Fade in={measureState?.measureName !== undefined}>
          <div className="measure-details">
            <div>
              <Breadcrumbs aria-label="measures">
                <Link tw="text-white hover:text-white" to="/measures">
                  Measures
                </Link>
              </Breadcrumbs>
              <span className="division">/</span>
            </div>
            <div>
              <p className="measure-name" tw="text-3xl py-0 mb-4">
                {measureState?.measureName}
              </p>
            </div>
            <div>
              {[
                "Active",
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
                      {val === "Active" && <div className="active">&nbsp;</div>}
                      {val}
                    </p>
                  );
              })}
            </div>
          </div>
        </Fade>
      )}
      {/* state 2 */}
      {pathname === "/measures" && (
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
              <button
                className="create-button"
                data-testid="create-new-measure-button"
                onClick={openCreate}
              >
                <AddIcon className="add-icon" fontSize="small" />
                <div>New Measure</div>
              </button>
            </div>
          </div>
        </div>
      )}
      {pathname.includes("cql-libraries") && (
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
              <button
                className="create-button"
                data-testid="create-new-cql-library-button"
                onClick={() => {
                  const event = new Event("openCreateLibraryDialog");
                  window.dispatchEvent(event);
                }}
              >
                <AddIcon className="add-icon" fontSize="small" />
                <div>New Library</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
