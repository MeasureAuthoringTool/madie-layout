declare module "@madie/madie-components" {
  import { FC } from "react";
  import { LifeCycleFn } from "single-spa";

  export const hello: string;

  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;

  export const ButtonSizeDefs: {
    readonly xs: "xs";
    readonly sm: "sm";
    readonly md: "md";
    readonly lg: "lg";
    readonly xl: "xl";
  };
  export type ButtonSize = typeof ButtonSizeDefs[keyof typeof ButtonSizeDefs];

  export const ButtonShapeDefs: {
    readonly normal: "normal";
    readonly round: "round";
    readonly circular: "circular";
  };
  export type ButtonShape =
    typeof ButtonShapeDefs[keyof typeof ButtonShapeDefs];

  export const ButtonVariantDefs: {
    readonly primary: "primary";
    readonly secondary: "secondary";
    readonly white: "white";
  };
  export type ButtonVariant =
    typeof ButtonVariantDefs[keyof typeof ButtonVariantDefs];

  export type IconType = (props: React.ComponentProps<"svg">) => JSX.Element;
  export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: never;
    buttonTitle?: string;
    buttonSize?: ButtonSize;
    icon?: IconType;
    trailingIcon?: boolean;
    disabled?: boolean;
    variant?: ButtonVariant;
    shape?: ButtonShape;
    loading?: boolean;
    loadingText?: string;
  }
  export function Button(props: ButtonProps): JSX.Element;
}
