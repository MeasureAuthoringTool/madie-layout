import useOktaTokens from "./useOktaTokens";

const idTokenObj = {
  authorizeUrl: "authorize.url",
  claims: {
    sub: "testuser@test.com",
    name: "Test User",
  },
  idToken: "test.id.jwt",
};

const accessTokenObj = {
  authorizeUrl: "authorize.url",
  claims: {
    sub: "testuser@test.com",
  },
  accessToken: "test.access.jwt",
};

const okta_token_storage = {
  idToken: idTokenObj,
  accessToken: accessTokenObj,
};

describe("useOktaTokens", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify(okta_token_storage)
    );
  });

  it("should return four functions", () => {
    const oktaTokens = useOktaTokens();
    expect(oktaTokens.getIdTokenObj).toBeTruthy();
    expect(oktaTokens.getIdToken).toBeTruthy();
    expect(oktaTokens.getAccessTokenObj).toBeTruthy();
    expect(oktaTokens.getAccessToken).toBeTruthy();
  });

  it("should return an idToken object", () => {
    const { getIdTokenObj } = useOktaTokens();
    expect(getIdTokenObj()).toEqual(idTokenObj);
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "okta-token-storage"
    );
  });

  it("should return an idToken", () => {
    const { getIdToken } = useOktaTokens();
    expect(getIdToken()).toEqual("test.id.jwt");
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "okta-token-storage"
    );
  });

  it("should return an accessToken object", () => {
    const { getAccessTokenObj } = useOktaTokens();
    expect(getAccessTokenObj()).toEqual(accessTokenObj);
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "okta-token-storage"
    );
  });

  it("should return an accessToken", () => {
    const { getAccessToken } = useOktaTokens();
    expect(getAccessToken()).toEqual("test.access.jwt");
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "okta-token-storage"
    );
  });

  it("should gracefully handle a malformed item", () => {
    jest.resetAllMocks();
    global.Storage.prototype.getItem = jest.fn(() => "THIS IS NOT JSON!");
    const { getAccessTokenObj } = useOktaTokens();
    expect(getAccessTokenObj()).toBeFalsy();
  });

  it("should gracefully handle a null storage item", () => {
    jest.resetAllMocks();
    global.Storage.prototype.getItem = jest.fn(() => null);
    const { getAccessTokenObj } = useOktaTokens();
    expect(getAccessTokenObj()).toBeFalsy();
  });

  it("should gracefully handle an undefined storage item", () => {
    jest.resetAllMocks();
    global.Storage.prototype.getItem = jest.fn(() => undefined);
    const { getAccessTokenObj } = useOktaTokens();
    expect(getAccessTokenObj()).toBeFalsy();
  });

  it("should gracefully handle an missing item field", () => {
    jest.resetAllMocks();
    global.Storage.prototype.getItem = jest.fn(() => JSON.stringify({}));
    const { getAccessTokenObj } = useOktaTokens();
    expect(getAccessTokenObj()).toBeFalsy();
  });

  it("should use a provided storage key instead of the default", () => {
    const { getAccessTokenObj } = useOktaTokens("some-storage-key");
    expect(getAccessTokenObj()).toBeTruthy();
    expect(global.Storage.prototype.getItem).toHaveBeenCalledWith(
      "some-storage-key"
    );
  });
});
