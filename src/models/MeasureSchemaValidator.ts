import * as Yup from "yup";
import { Model } from "@madie/madie-models/dist/Model";
import { MeasureScoring } from "@madie/madie-models/dist/MeasureScoring";
import { isWithinInterval } from "date-fns";

export const MeasureSchemaValidator = Yup.object().shape({
  measureName: Yup.string()
    .max(500, "A Measure Name cannot be more than 500 characters.")
    .required("A Measure Name is required.")
    .matches(/[a-zA-Z]/, "A Measure Name must contain at least one letter.")
    .matches(/^((?!_).)*$/, "Measure Name must not contain '_' (underscores)."),
  model: Yup.string()
    .oneOf(Object.values(Model))
    .required("A Measure Model is required."),
  cqlLibraryName: Yup.string()
    .required("Measure Lbrary name is required.")
    .matches(
      /^((?!_).)*$/,
      "Measure Library name must not contain '_' (underscores)."
    )
    .matches(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Measure Library name must start with an upper case letter, followed by alpha-numeric character(s) and must not contain spaces or other special characters."
    ),
  measureScoring: Yup.string()
    .oneOf(Object.values(MeasureScoring))
    .required("Measure Scoring is required."),

  measurementPeriodStart: Yup.date()
    .required("Measurement period start date is required")
    .typeError("Invalid date format. (mm/dd/yyyy)")
    .nullable()
    .test(
      "measurementPeriodStart",
      "Start date should be between the years 1900 and 2099.",
      (measurementPeriodStart) => {
        return isWithinInterval(measurementPeriodStart, {
          start: new Date(1899, 12, 31),
          end: new Date(2100, 1, 1),
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
        return isWithinInterval(measurementPeriodEnd, {
          start: new Date(1899, 12, 31),
          end: new Date(2100, 1, 1),
        });
      }
    )
    .when("measurementPeriodStart", (measurementPeriodStart, schema) => {
      if (measurementPeriodStart !== null) {
        if (!isNaN(measurementPeriodStart.getTime())) {
          const dayAfter = new Date(measurementPeriodStart.getTime());
          return schema.min(
            dayAfter,
            "Measurement period end date should be greater than or equal to measurement period start date."
          );
        }
      }
      return schema;
    }),
});
