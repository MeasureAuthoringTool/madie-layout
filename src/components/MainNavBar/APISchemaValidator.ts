import * as Yup from "yup";

export const APISchemaValidator = Yup.object().shape({
  apiKey: Yup.string()
    .max(36, "An API key cannot exceed more than 36 charactars.")
    .min(36, "An API key must be at least 36 charactars.")
    .required("An API key is required."),
});
