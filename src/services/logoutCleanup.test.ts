import { performLogoutCleanup } from "./logoutCleanup";

describe("performLogoutCleanup", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("unlocks measures and then CQL libraries", async () => {
    const unlockMeasures = jest.fn().mockResolvedValue("ok");
    const unlockLibraries = jest.fn().mockResolvedValue("ok");

    await performLogoutCleanup(
      { unlockMeasures } as any,
      { unlockLibraries } as any
    );

    expect(unlockMeasures).toHaveBeenCalledTimes(1);
    expect(unlockLibraries).toHaveBeenCalledTimes(1);
    expect(unlockMeasures.mock.invocationCallOrder[0]).toBeLessThan(
      unlockLibraries.mock.invocationCallOrder[0]
    );
  });

  it("logs and swallows errors so logout can still proceed", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    const error = new Error("network down");
    const unlockMeasures = jest.fn().mockRejectedValue(error);
    const unlockLibraries = jest.fn().mockResolvedValue("ok");

    await expect(
      performLogoutCleanup(
        { unlockMeasures } as any,
        { unlockLibraries } as any
      )
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      "Error unlocking measures for user",
      error
    );
    // Library unlock is skipped because the measure unlock threw first.
    expect(unlockLibraries).not.toHaveBeenCalled();
  });
});
