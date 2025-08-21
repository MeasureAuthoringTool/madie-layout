import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import TransferAction from "./TransferAction";

describe("TransferAction", () => {
  it("Should display TransferAction when canTransfer is true", () => {
    const onClick = jest.fn();
    render(<TransferAction onClick={onClick} canTransfer={true} />);

    const transferButton = screen.getByTestId("transfer-action-btn");

    expect(transferButton).not.toBeDisabled();

    fireEvent.click(transferButton);

    expect(onClick).toHaveBeenCalled();
  });

  it("Should display TransferAction when canTransfer is false", () => {
    const onClick = jest.fn();
    render(<TransferAction onClick={onClick} canTransfer={false} />);

    const transferButton = screen.getByTestId("transfer-action-btn");

    expect(transferButton).toBeDisabled();

    fireEvent.click(transferButton);

    expect(onClick).not.toHaveBeenCalled();
  });
});
