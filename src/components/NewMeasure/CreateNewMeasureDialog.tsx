import React, { useEffect, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import { Measure } from "@madie/madie-models/dist/Measure";
import { Model } from "@madie/madie-models/dist/Model";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { MeasureSchemaValidator } from "../../models/MeasureSchemaValidator";
import {
  MadieDialog,
  Select,
  TextField,
  Toast,
  MadieAlert,
} from "@madie/madie-design-system/dist/react";
import { Box } from "@mui/system";

import {
  wafIntercept,
  getServiceConfig,
  ServiceConfig,
  useOktaTokens,
} from "@madie/madie-util";
import axios from "../../../api/axios-instance";
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { v4 as uuidv4 } from "uuid";

interface Toast {
  toastOpen: boolean;
  toastType: string;
  toastMessage: string;
}

const CreateNewMeasureDialog = ({ open, onClose }) => {
  const { getAccessToken } = useOktaTokens();
  const [toast, setToast] = useState<Toast>({
    toastOpen: false,
    toastType: "danger",
    toastMessage: "",
  });
  const { toastOpen, toastType, toastMessage } = toast;
  const formik = useFormik({
    initialValues: {
      measureName: "",
      model: "",
      cqlLibraryName: "",
      ecqmTitle: "",
      active: true,
      measurementPeriodStart: null,
      measurementPeriodEnd: null,
      measureMetaData: {
        experimental: false,
      },
      // TO DO: validation, models for new entries
    } as Measure,
    validationSchema: MeasureSchemaValidator,
    onSubmit: async (values: Measure) => {
      await createMeasure(values);
    },
  });

  const modelOptions = Object.keys(Model);

  async function createMeasure(measure: Measure) {
    const config: ServiceConfig = await getServiceConfig();

    measure.measureSetId = uuidv4();
    measure.versionId = uuidv4();
    if (measure.model === Model.QDM_5_6) {
      measure.measureMetaData.experimental = false;
    }
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
          setToast({
            toastOpen: false,
            toastType: "danger",
            toastMessage: "",
          });
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
        setToast({
          toastOpen: true,
          toastType: "danger",
          toastMessage: msg,
        });
      });
  }

  function formikErrorHandler(name: string, isError: boolean) {
    if (formik.touched[name] && formik.errors[name]) {
      return `${formik.errors[name]}`;
    }
  }
  // style utilities
  const row = {
    display: "flex",
    flexDirection: "row",
  };
  const spaced = {
    marginTop: "23px",
  };
  const formRow = Object.assign({}, row, spaced);
  const gap = {
    columnGap: "24px",
    "& > * ": {
      flex: 1,
    },
  };
  const formRowGapped = Object.assign({}, formRow, gap);
  // we create a state to track current focus. We only display helper text on focus and remove current focus on blur
  const [focusedField, setFocusedField] = useState("");
  const onBlur = (field) => {
    setFocusedField("");
    formik.setFieldTouched(field);
  };
  const onFocus = (field) => {
    setFocusedField(field);
  };

  return (
    <MadieDialog
      form
      title="Create Measure"
      dialogProps={{
        open,
        onClose,
        onSubmit: formik.handleSubmit,
      }}
      cancelButtonProps={{
        variant: "secondary",
        onClick: onClose,
        cancelText: "Cancel",
        "data-testid": "create-new-measure-cancel-button",
        "aria-label": "create-new-measure-cancel-button",
      }}
      continueButtonProps={{
        variant: "cyan",
        type: "submit",
        "data-testid": "continue-button",
        "aria-label": "continue button",
        disabled: !(formik.isValid && formik.dirty),
        continueText: "Continue",
        continueIcon: (
          <ChevronRightIcon
            sx={{
              fontSize: 22,
              margin: "-9px -14px -7px 4px",
            }}
          />
        ),
      }}
    >
      <Toast
        toastKey="measure-create-toast"
        toastType={toastType}
        testId={
          toastType === "danger"
            ? "server-error-alerts"
            : "measure-create-success-text"
        }
        open={toastOpen}
        message={toastMessage}
        onClose={() => {
          setToast({
            toastOpen: false,
            toastType: "danger",
            toastMessage: "",
          });
        }}
        closeButtonProps={{
          "data-testid": "close-error-button",
        }}
        autoHideDuration={6000}
      />
      <div style={{ marginBottom: 4 }}>
        <Typography
          style={{ fontSize: 14, fontWeight: 300, fontFamily: "Rubik" }}
        >
          <span
            style={{
              color: "rgb(174, 28, 28)",
              marginRight: 3,
              fontWeight: 400,
            }}
          >
            *
          </span>
          Indicates required field
        </Typography>
      </div>

      <Box sx={formRow}>
        <TextField
          onFocus={() => onFocus("measureName")}
          placeholder="Measure Name"
          required
          label="Measure Name"
          id="measureName"
          inputProps={{
            "data-testid": "measure-name-input",
            "aria-describedby": "measureName-helper-text",
            required: true,
            "aria-required": true,
          }}
          helperText={
            (formik.touched["measureName"] || focusedField === "measureName") &&
            (formikErrorHandler("measureName", true) ||
              "Measure Name must contain at least one letter and must not contain '_' (underscores).")
          }
          data-testid="measure-name-text-field"
          size="small"
          error={
            formik.touched.measureName && Boolean(formik.errors.measureName)
          }
          {...formik.getFieldProps("measureName")}
          onBlur={() => {
            onBlur("measureName");
          }}
        />
      </Box>

      <Box sx={formRow}>
        <TextField
          onFocus={() => onFocus("cqlLibraryName")}
          placeholder="Enter CQL Library Name"
          required
          label="Measure CQL Library Name"
          id="cqlLibraryName"
          data-testid="cql-library-name"
          inputProps={{
            "data-testid": "cql-library-name-input",
            "aria-describedby": "cqlLibraryName-helper-text",
            required: true,
            "aria-required": true,
          }}
          helperText={
            (formik.touched["cqlLibraryName"] ||
              focusedField === "cqlLibraryName") &&
            (formikErrorHandler("cqlLibraryName", true) ||
            formik.values.model === Model.QICORE
              ? "Measure Library name must start with an upper case letter, followed by alpha-numeric character(s) and must not contain spaces or other special characters."
              : "Measure Library name must start with an upper case letter, followed by alpha-numeric character(s) and must not contain spaces or other special characters except of underscore for QDM.")
          }
          size="small"
          error={
            formik.touched.cqlLibraryName &&
            Boolean(formik.errors.cqlLibraryName)
          }
          {...formik.getFieldProps("cqlLibraryName")}
          onBlur={() => {
            onBlur("cqlLibraryName");
          }}
        />
      </Box>

      <Box sx={formRowGapped}>
        <TextField
          placeholder="eCQM Name"
          required
          label="eCQM Abbreviated Title"
          id="ecqmTitle"
          data-testid="ecqm-text-field"
          inputProps={{
            "data-testid": "ecqm-input",
            "aria-describedby": "ecqmTitle-helper-text",
            required: true,
            "aria-required": true,
          }}
          helperText={formikErrorHandler("ecqmTitle", true)}
          size="small"
          error={formik.touched.ecqmTitle && Boolean(formik.errors.ecqmTitle)}
          {...formik.getFieldProps("ecqmTitle")}
        />
      </Box>

      <Box sx={formRowGapped}>
        <Select
          placeHolder={{ name: "Model", value: "" }}
          required
          label="Model"
          id="model-select"
          inputProps={{
            "data-testid": "measure-model-input",
            id: "model-select",
            "aria-describedby": "model-select-helper-text",
            required: true,
          }}
          SelectDisplayProps={{
            "aria-required": "true",
          }}
          data-testid="measure-model-select"
          {...formik.getFieldProps("model")}
          error={formik.touched.model && Boolean(formik.errors.model)}
          helperText={formik.touched.model && formik.errors.model}
          size="small"
          options={modelOptions.map((modelKey) => {
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
      </Box>

      {formik.values.model !== Model.QDM_5_6 && (
        <Box sx={formRowGapped}>
          <FormControlLabel
            control={
              <Checkbox
                onChange={formik.handleChange}
                sx={{
                  color: "#333333",
                }}
                name="measureMetaData.experimental"
                id="experimental"
                data-testid="experimental"
              />
            }
            label="Experimental"
            sx={{
              color: "#333333",
              textTransform: "none",
            }}
          />
        </Box>
      )}

      <Box sx={formRowGapped} data-testid="measurement-period-div">
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DesktopDatePicker
            disableOpenPicker={true}
            label="Measurement Period - Start Date"
            inputFormat="MM/dd/yyyy"
            value={formik.values.measurementPeriodStart}
            onChange={(startDate) => {
              formik.setFieldValue("measurementPeriodStart", startDate);
            }}
            renderInput={(params) => {
              const { inputProps } = params;
              inputProps["aria-required"] = true;
              const { onChange, ...formikFieldProps } = formik.getFieldProps(
                "measurementPeriodStart"
              );
              return (
                <TextField
                  onFocus={() => onFocus("measurementPeriodStart")}
                  id="create-measure-period-start"
                  {...formikFieldProps}
                  {...params}
                  required
                  data-testid="measurement-period-start"
                  error={
                    formik.touched.measurementPeriodStart &&
                    Boolean(formik.errors.measurementPeriodStart)
                  }
                  helperText={
                    (formik.touched["measurementPeriodStart"] ||
                      focusedField === "measurementPeriodStart") &&
                    (formikErrorHandler("measurementPeriodStart", true) ||
                      "Start date should be between the years 1900 and 2099.")
                  }
                  InputProps={{
                    "data-testid": "measurement-period-start-input",
                    "aria-describedby":
                      "create-measure-period-start-helper-text",
                    "aria-required": true,
                  }}
                  onBlur={() => onBlur("measurementPeriodStart")}
                />
              );
            }}
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
            renderInput={(params) => {
              const { inputProps } = params;
              inputProps["aria-required"] = true;
              const { onChange, ...formikFieldProps } = formik.getFieldProps(
                "measurementPeriodEnd"
              );
              return (
                <TextField
                  id="create-measure-period-end"
                  onFocus={() => onFocus("measurementPeriodEnd")}
                  {...formikFieldProps}
                  {...params}
                  required
                  data-testid="measurement-period-end"
                  error={
                    formik.touched.measurementPeriodEnd &&
                    Boolean(formik.errors.measurementPeriodEnd)
                  }
                  helperText={
                    (formik.touched["measurementPeriodEnd"] ||
                      focusedField === "measurementPeriodEnd") &&
                    (formikErrorHandler("measurementPeriodEnd", true) ||
                      "End date should be between the years 1900 and 2099.")
                  }
                  InputProps={{
                    "data-testid": "measurement-period-end-input",
                    "aria-describedby": "create-measure-period-end-helper-text",
                    required: true,
                    "aria-required": true,
                  }}
                  onBlur={() => onBlur("measurementPeriodEnd")}
                />
              );
            }}
          />
        </LocalizationProvider>
      </Box>
    </MadieDialog>
  );
};

export default CreateNewMeasureDialog;
