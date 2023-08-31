import * as Yup from "yup";
import { Model } from "@madie/madie-models";
import { isWithinInterval } from "date-fns";

export const MeasureSchemaValidator = Yup.object().shape({
  measureName: Yup.string()
    .max(500, "Measure Name cannot be more than 500 characters.")
    .required("Measure Name is required.")
    .matches(/[a-zA-Z]/, "Measure Name must contain at least one letter.")
    .matches(/^((?!_).)*$/, "Measure Name must not contain '_' (underscores)."),
  model: Yup.string()
    .oneOf(Object.values(Model))
    .required("A Measure Model is required."),
  cqlLibraryName: Yup.string()
    .required("Measure Library name is required.")
    .matches(
      /^((?!_).)*$/,
      "Measure Library name must not contain '_' (underscores)."
    )
    .matches(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Measure Library name must start with an upper case letter, followed by alpha-numeric character(s) and must not contain spaces or other special characters."
    )
    .max(64, "Measure Library name must be shorter than 64 characters."),
  ecqmTitle: Yup.string()
    .required("eCQM Abbreviated Title is required.")
    .max(32, "eCQM Abbreviated Title cannot be more than 32 characters."),
  measurementPeriodStart: Yup.date()
    .required("Measurement period start date is required")
    .typeError("Invalid date format. (mm/dd/yyyy)")
    .nullable()
    .test(
      "measurementPeriodStart",
      "Start date should be between the years 1900 and 2099.",
      (measurementPeriodStart) => {
        return isWithinInterval(measurementPeriodStart?.getFullYear(), {
          start: 1900,
          end: 2099,
        });
      }
    ),
  measurementPeriodEnd: Yup.date()
    .required("Measurement period end date is required")
    .nullable()
    .typeError("Invalid date format. (mm/dd/yyyy)")
    .test(
      "measurementPeriodStart",
      "End date should be between the years 1900 and 2099.",
      (measurementPeriodEnd) => {
        return isWithinInterval(measurementPeriodEnd?.getFullYear(), {
          start: 1900,
          end: 2099,
        });
      }
    )
    .when("measurementPeriodStart", (measurementPeriodStart, schema) => {
      if (measurementPeriodStart) {
        if (!isNaN(measurementPeriodStart.getTime())) {
          return schema.min(
            new Date(measurementPeriodStart.getTime() + 86400000),
            "Measurement period end date should be greater than measurement period start date."
          );
        }
      }
      return schema;
    }),
});
