import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AdminLanding from "./AdminLanding";

jest.mock("@madie/madie-util", () => ({
  useDocumentTitle: jest.fn(),
  useUserRoles: jest
    .fn()
    .mockReturnValue({ roles: ["MADiE-Admin"], isAdmin: true }),
}));

import { useUserRoles } from "@madie/madie-util";

describe("AdminLanding Component", () => {
  test("renders the User Management tab for admin users", () => {
    render(<AdminLanding />);

    expect(screen.getByTestId("admin-landing")).toBeInTheDocument();
    expect(screen.getByTestId("user-management-tab")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  test("User Management tab is selected by default", () => {
    render(<AdminLanding />);

    const tab = screen.getByTestId("user-management-tab");
    expect(tab).toHaveAttribute("aria-selected", "true");
  });

  test("renders nothing for non-admin users", () => {
    (useUserRoles as jest.Mock).mockReturnValueOnce({
      roles: [],
      isAdmin: false,
    });

    const { container } = render(<AdminLanding />);

    expect(container).toBeEmptyDOMElement();
  });
});
