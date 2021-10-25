import axios from "axios";
import { getOktaConfig } from "./Config";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Config component", () => {
  it("should fetch okta config env variables", async () => {
    const oktaEnvConfig = {
      oktaBaseUrl: "https://dev-Example.okta.com",
      clientId: "0oa1t055g23yx2o5d7",
    };

    mockedAxios.get.mockResolvedValue({ data: { ...oktaEnvConfig } });

    const result = await getOktaConfig();
    expect(result.oktaAuthConfig).toEqual({
      issuer: `https://dev-Example.okta.com/oauth2/default`,
      clientId: `0oa1t055g23yx2o5d7`,
      redirectUri: window.location.origin + "/login/callback",
    });
  });
});
