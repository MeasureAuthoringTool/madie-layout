declare module "@madie/madie-measure" {
  import { FC } from "react";
  import { LifeCycleFn } from "single-spa";

  export const Madiemeasure: FC;
  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
