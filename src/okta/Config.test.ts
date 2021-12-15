import axios from "axios";
import { getOktaConfig } from "./Config";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Config component", () => {
  it("should fetch okta config env variables", async () => {
    const oktaEnvConfig = {
      baseUrl: "https://dev-Example.okta.com",
      issuerUrl: "https://dev-Example.okta.com/oauth2/authzServerId",
      clientId: "0oa1t055g23yx2o5d7",
    };

    mockedAxios.get.mockResolvedValue({ data: { ...oktaEnvConfig } });

    const result = await getOktaConfig();
    expect(result).toEqual({
      baseUrl: "https://dev-Example.okta.com",
      issuer: "https://dev-Example.okta.com/oauth2/authzServerId",
      clientId: "0oa1t055g23yx2o5d7",
      redirectUri: window.location.origin + "/login/callback",
    });
  });

  it("should throw invalid oktaEnvConfig Error", async () => {
    const oktaEnvConfig = {
      baseUrl: "https://dev-Example.okta.com",
    };
    mockedAxios.get.mockResolvedValue({ data: { ...oktaEnvConfig } });
    try {
      await getOktaConfig();
    } catch (err) {
      expect(err.message).toEqual("Invalid oktaEnvConfig variables");
    }
  });
});
