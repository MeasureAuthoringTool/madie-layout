import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Measure } from "@madie/madie-models/dist/Measure";
import { Model } from "@madie/madie-models/dist/Model";
import { MeasureScoring } from "@madie/madie-models/dist/MeasureScoring";
import { MeasureSchemaValidator } from "../../models/MeasureSchemaValidator";
import {
  Button,
  Select,
  TextField,
  FormControlLabel,
} from "@madie/madie-design-system/dist/react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { getServiceConfig, ServiceConfig } from "@madie/madie-util";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Divider,
  FormGroup,
  FormHelperText,
  Slide,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import classNames from "classnames";
import useOktaTokens from "../../hooks/useOktaTokens";
import Checkbox from "./CheckBox";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import DateAdapter from "@mui/lab/AdapterDateFns";
const useStyles = makeStyles({
  row: {
    display: "flex",
    flexDirection: "row",
  },
  spaced: {
    marginTop: 23,
  },
  end: {
    justifyContent: "flex-end",
    marginBottom: -23,
  },
  gap: {
    columnGap: 24,
    "& > * ": {
      flex: 1,
    },
  },
  dialogTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
  },
  title: {
    fontFamily: "Rubik",
    fontSize: 24,
    padding: 0,
  },
  chevron: {
    fontSize: 22,
    margin: "-9px -14px -7px 4px",
  },
  close: {
    color: "#242424",
  },
  info: {
    fontSize: 14,
    fontWeight: 300,
    fontFamily: "Rubik",
  },
  asterisk: {
    color: "#D92F2F",
    marginRight: 3,
  },
  dividerBottom: {
    marginTop: 10,
  },
  hidden: {
    maxHeight: 0,
  },
  expanded: {
    maxHeight: 1000,
    borderLeft: "2px dashed #CACACA",
    paddingLeft: 16,
    marginTop: 5,
    marginLeft: 15,
  },
  paper: {
    position: "relative",
    overflow: "visible",
    marginTop: -20,
  },
  actionsRoot: {
    padding: 16,
    "& >:not(:first-of-type)": {
      marginLeft: 16,
    },
  },
  alert: {
    position: "absolute",
    bottom: -120,
    width: "85%",
    marginLeft: "10%",
    boxShadow: "0px 0px 13px rgba(0, 21, 44, 0.2)",
    borderRadius: 4,
    backgroundColor: "inherit",
    "& > div": {
      padding: 16,
    },
    "& .icon-cont": {
      display: "flex",
      backgroundColor: "#D92F2F",
      borderRadius: "4px 0 0 4px",
      "& > svg": {
        color: "#fff",
        fontSize: 25,
      },
    },
    "& .alert-text": {
      display: "flex",
      flexDirection: "row",
      flexGrow: 1,
      justifyContent: "space-between",
      "& .MuiButtonBase-root": {
        margin: "-10px 0px -2px 0px",
      },
      "& .MuiTypography-body2": {
        margin: 0,
        padding: 0,
        paddingTop: 2,
        color: "#D92F2F",
        fontFamily: "Rubik",
        fontWeight: 500,
        fontSize: 14,
      },
    },
  },
});

const CreateNewMeasureDialog = ({ open, onClose }) => {
  const { getAccessToken } = useOktaTokens();
  const [serverError, setServerError] = useState<string>("");
  const [manualId, setManualId] = useState<boolean>(false);
  const [autoGenerate, setAutoGenerate] = useState<boolean>(false);
  const formik = useFormik({
    initialValues: {
      measureName: "",
      model: "",
      cqlLibraryName: "",
      measureScoring: "",
      active: true,
      measurementPeriodStart: null,
      measurementPeriodEnd: null,
      // TO DO: validation, models for new entries
    } as Measure,
    validationSchema: MeasureSchemaValidator,
    onSubmit: async (values: Measure) => {
      await createMeasure(values);
    },
  });
  async function createMeasure(measure: Measure) {
    const config: ServiceConfig = await getServiceConfig();

    await axios
      .post<Measure>(config?.measureService?.baseUrl + "/measure", measure, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
      .then(({ status }) => {
        if (status === 201) {
          onClose(true);
          formik.resetForm();
          setManualId(false);
          setAutoGenerate(false);
          setServerError("");
          const event = new Event("create");
          window.dispatchEvent(event);
        }
      })
      .catch((error) => {
        let msg: string = error.response.data.message;
        if (!!error.response.data.validationErrors) {
          for (const erroredField in error.response.data.validationErrors) {
            msg = msg.concat(
              ` ${erroredField} : ${error.response.data.validationErrors[erroredField]}`
            );
          }
        }
        setServerError(msg);
      });
  }

  function formikErrorHandler(name: string, isError: boolean) {
    if (formik.touched[name] && formik.errors[name]) {
      return (
        <FormHelperText
          data-testid={`${name}-helper-text`}
          children={formik.errors[name]}
          error={isError}
        />
      );
    }
  }
  // style utilities
  const classes = useStyles();
  const flexEnd = classNames(classes.row, classes.end);
  const formRow = classNames(classes.row, classes.spaced);
  const formRowGapped = classNames(formRow, classes.gap);
  const alertClass = classNames(classes.row, classes.alert);
  const hiddenField = classNames({
    [classes.expanded]: manualId,
    [classes.hidden]: !manualId,
  });
  return (
    <Dialog
      open={open}
      data-testid="create-dialog"
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      classes={{
        paper: classes.paper,
      }}
    >
      {serverError && (
        <div
          className={alertClass}
          data-testid="server-error-alerts"
          role="alert"
        >
          <div className="icon-cont">
            <ErrorOutlineIcon />
          </div>
          <div className="alert-text">
            <Typography variant="body2" data-testid="server-error-msg">
              {serverError}
            </Typography>
            <div>
              <IconButton onClick={() => setServerError("")}>
                <CloseIcon className={classes.close} />
              </IconButton>
            </div>
          </div>
        </div>
      )}
      <form
        data-testid="create-new-measure-form"
        onSubmit={formik.handleSubmit}
        style={{ overflow: "scroll" }}
      >
        <div className={classes.dialogTitle}>
          <DialogTitle className={classes.title}>Create Measure</DialogTitle>
          <div>
            <IconButton onClick={onClose}>
              <CloseIcon className={classes.close} />
            </IconButton>
          </div>
        </div>
        <Divider />
        <DialogContent>
          <div className={flexEnd}>
            <Typography className={classes.info}>
              <span className={classes.asterisk}>*</span>
              Indicates required field
            </Typography>
          </div>
          <div className={formRow}>
            <TextField
              placeholder="Measure Name"
              required
              label="Measure Name"
              id="measureName"
              inputProps={{ "data-testid": "measure-name-input" }}
              helperText={formikErrorHandler("measureName", true)}
              data-testid="measure-name-text-field"
              size="small"
              error={
                formik.touched.measureName && Boolean(formik.errors.measureName)
              }
              {...formik.getFieldProps("measureName")}
            />
          </div>
          <div className={formRowGapped}>
            <Select
              placeHolder={{ name: "Model", value: "" }}
              required
              label="Model"
              id="model-select"
              inputProps={{ "data-testid": "measure-model-input" }}
              data-testid="measure-model-select"
              {...formik.getFieldProps("model")}
              error={formik.touched.model && Boolean(formik.errors.model)}
              helperText={formik.touched.model && formik.errors.model}
              size="small"
              options={Object.keys(Model).map((modelKey) => {
                return (
                  <MenuItem
                    key={modelKey}
                    value={Model[modelKey]}
                    data-testid={`measure-model-option-${Model[modelKey]}`}
                  >
                    {Model[modelKey]}
                  </MenuItem>
                );
              })}
            />
            <Select
              placeHolder={{ name: "Model Version", value: "" }}
              disabled
              value=""
              required
              id="modelVersion"
              data-testid="model-version-select"
              label="Model Version"
              size="small"
            />
          </div>
          <div className={formRow}>
            <TextField
              placeholder="Enter CQL Library Name"
              required
              label="Measure CQL Library Name"
              id="cqlLibraryName"
              data-testid="cql-library-name"
              inputProps={{ "data-testid": "cql-library-name-input" }}
              helperText={formikErrorHandler("cqlLibraryName", true)}
              size="small"
              error={
                formik.touched.cqlLibraryName &&
                Boolean(formik.errors.cqlLibraryName)
              }
              {...formik.getFieldProps("cqlLibraryName")}
            />
          </div>

          <div className={formRowGapped}>
            <TextField
              required
              disabled
              placeholder="Title"
              id="eqcmTitle"
              data-testid="eqcm-text-field"
              label="ECQM Abbreviated Title"
              size="small"
            />
            <div>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      checked={autoGenerate}
                      id="auto-generate"
                      data-testid="auto-generate-checkbox"
                      onChange={(e) => {
                        const val = e.target.checked;
                        if (val && manualId) {
                          setManualId(false);
                        }
                        setAutoGenerate(e.target.checked);
                      }}
                    />
                  }
                  label="Automatically Generate A CMS ID"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      checked={manualId}
                      id="manual-generate"
                      data-testid="manual-generate-checkbox"
                      onChange={(e) => {
                        const val = e.target.checked;
                        if (val && autoGenerate) {
                          setAutoGenerate(false);
                        }
                        setManualId(e.target.checked);
                      }}
                    />
                  }
                  label="Manually Generate A CMS ID"
                />
              </FormGroup>
              {/* avoid slide over rest of screen */}
              <div style={{ overflow: "hidden" }}>
                <Slide in={manualId}>
                  <div className={hiddenField}>
                    <TextField
                      disabled
                      id="CMSID"
                      data-testid="CMSID-text-field"
                      required
                      placeholder="CMS ID"
                      label="CMS ID"
                      size="small"
                    />
                  </div>
                </Slide>
              </div>
            </div>
          </div>

          <div className={formRowGapped}>
            <Select
              required
              placeHolder={{ name: "Select", value: "" }}
              label="Scoring"
              inputProps={{ "data-testid": "measure-scoring-input" }}
              size="small"
              id="measureScoring"
              data-testid="measure-scoring-select-field"
              {...formik.getFieldProps("measureScoring")}
              error={
                formik.touched.measureScoring &&
                Boolean(formik.errors.measureScoring)
              }
              helperText={
                formik.touched.measureScoring && formik.errors.measureScoring
              }
              options={Object.keys(MeasureScoring).map((scoringKey) => {
                return (
                  <MenuItem
                    key={scoringKey}
                    value={MeasureScoring[scoringKey]}
                    data-testid={`measure-scoring-option-${MeasureScoring[scoringKey]}`}
                  >
                    {MeasureScoring[scoringKey]}
                  </MenuItem>
                );
              })}
            />
            <Select
              required
              disabled
              placeHolder={{ name: "Select", value: "" }}
              value=""
              label="Subject"
              data-testid="subject-select"
              id="subject-select"
              size="small"
            />
          </div>

          <div className={formRowGapped} data-testid="measurement-period-div">
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DesktopDatePicker
                disableOpenPicker={true}
                label="Measurement Period - Start Date"
                inputFormat="MM/dd/yyyy"
                value={formik.values.measurementPeriodStart}
                onChange={(startDate) => {
                  formik.setFieldValue("measurementPeriodStart", startDate);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    helperText={formikErrorHandler(
                      "measurementPeriodStart",
                      true
                    )}
                    error={
                      formik.touched.measurementPeriodStart &&
                      Boolean(formik.errors.measurementPeriodStart)
                    }
                    {...formik.getFieldProps("measurementPeriodStart")}
                    data-testid="measurement-period-start"
                  />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DesktopDatePicker
                disableOpenPicker={true}
                label="Measurement Period - End Date"
                inputFormat="MM/dd/yyyy"
                value={formik.values.measurementPeriodEnd}
                onChange={(endDate) => {
                  formik.setFieldValue("measurementPeriodEnd", endDate);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    data-testid="measurement-period-end"
                    helperText={formikErrorHandler(
                      "measurementPeriodEnd",
                      true
                    )}
                    error={
                      formik.touched.measurementPeriodEnd &&
                      Boolean(formik.errors.measurementPeriodEnd)
                    }
                    {...formik.getFieldProps("measurementPeriodEnd")}
                  />
                )}
              />
            </LocalizationProvider>
          </div>
        </DialogContent>
        <Divider className={classes.dividerBottom} />
        <DialogActions classes={{ root: classes.actionsRoot }}>
          <Button
            variant="secondary"
            onClick={onClose}
            data-testid="create-new-measure-cancel-button"
          >
            Cancel
          </Button>
          <Button
            className="qpp-c-button--cyan"
            type="submit"
            data-testid="create-new-measure-save-button"
            disabled={!(formik.isValid && formik.dirty)}
            style={{ marginTop: 0 }}
          >
            <span>
              Continue
              <ChevronRightIcon className={classes.chevron} />
            </span>
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateNewMeasureDialog;
