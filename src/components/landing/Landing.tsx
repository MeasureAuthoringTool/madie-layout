import React from "react";
import tw from "twin.macro";
import { Button } from "@madie/madie-components";

export interface LandingProps {
  text: string;
  children?: never;
  hasError?: boolean;
  hasButton?: boolean;
  buttonText?: string;
}

export default function Landing(props: LandingProps) {
  const { children, hasError, text, hasButton, buttonText, ...args } = props;

  return (
    <div tw="bg-gray-300">
      <div tw="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 tw="text-2xl  text-gray-600">
          <span tw="block">{text}</span>
        </h2>
        <div className="ml-3 inline-flex">
          {hasButton ? (
            <Button buttonTitle={buttonText} buttonSize="xl" />
          ) : undefined}
        </div>
      </div>
    </div>
  );
}
