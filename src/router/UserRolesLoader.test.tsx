import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { useUserServiceApi } from "@madie/madie-util";
import UserRolesLoader from "./UserRolesLoader";

jest.mock("@madie/madie-util", () => ({
  useUserServiceApi: jest.fn(),
}));

const fetchUserRoles = jest.fn();

describe("UserRolesLoader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchUserRoles.mockResolvedValue(["MADiE-Reviewer"]);
    (useUserServiceApi as jest.Mock).mockReturnValue({ fetchUserRoles });
  });

  it("refreshes the user roles on mount and renders nothing", async () => {
    const { container } = render(<UserRolesLoader />);

    await waitFor(() => {
      expect(fetchUserRoles).toHaveBeenCalledTimes(1);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("does not refetch when re-rendered", async () => {
    const { rerender } = render(<UserRolesLoader />);

    await waitFor(() => {
      expect(fetchUserRoles).toHaveBeenCalledTimes(1);
    });

    rerender(<UserRolesLoader />);

    expect(fetchUserRoles).toHaveBeenCalledTimes(1);
  });

  it("logs and stays mounted when the roles cannot be fetched", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    fetchUserRoles.mockRejectedValue(new Error("boom"));

    render(<UserRolesLoader />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Error fetching user roles:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });
});
