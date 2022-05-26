import * as Yup from "yup";
import { MeasureScoring } from "@madie/madie-models/dist/MeasureScoring";

export const MeasureGroupSchemaValidator = Yup.object().shape({
  scoring: Yup.string()
    .oneOf(Object.values(MeasureScoring))
    .required("Group Scoring is required."),
  population: Yup.object().when("scoring", (scoring) => {
    switch (scoring) {
      case MeasureScoring.COHORT:
        return Yup.object().shape({
          initialPopulation: Yup.string().required(
            "Initial Population is required"
          ),
        });
      case MeasureScoring.CONTINUOUS_VARIABLE:
        return Yup.object().shape({
          initialPopulation: Yup.string().required(
            "Initial Population is required"
          ),
          measurePopulation: Yup.string().required(
            "Measure Population is required"
          ),
          measurePopulationExclusion: Yup.string(),
        });
      case MeasureScoring.PROPORTION:
        return Yup.object().shape({
          initialPopulation: Yup.string().required(
            "Initial Population is required"
          ),
          numerator: Yup.string().required("Numerator is required"),
          numeratorExclusion: Yup.string(),
          denominator: Yup.string().required("Denominator is required"),
          denominatorExclusion: Yup.string(),
          denominatorException: Yup.string(),
        });
      case MeasureScoring.RATIO:
        return Yup.object().shape({
          initialPopulation: Yup.string().required(
            "Initial Population is required"
          ),
          numerator: Yup.string().required("Numerator is required"),
          numeratorExclusion: Yup.string(),
          denominator: Yup.string().required("Denominator is required"),
          denominatorExclusion: Yup.string(),
        });
      default:
        // blind object if not known scoring type
        return Yup.object();
    }
  }),
});
