declare module "@madie/madie-cql-library" {
  import { FC } from "react";
  import { LifeCycleFn } from "single-spa";

  export const MadieCqlLibrary: FC;
  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
