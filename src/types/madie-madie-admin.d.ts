declare module "@madie/madie-admin" {
  import { FC } from "react";
  import { LifeCycleFn } from "single-spa";

  export const MadieAdmin: FC;
  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
