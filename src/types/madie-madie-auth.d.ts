declare module "@madie/madie-auth" {
  import { FC } from "react";
  import { LifeCycleFn } from "single-spa";

  export const LoginWidget: FC<{ props }>;
  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
