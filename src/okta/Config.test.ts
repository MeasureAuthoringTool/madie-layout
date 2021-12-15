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
    expect(result).toEqual({
      baseUrl: "https://dev.idp.idm.cms.gov",
      issuer: "https://dev.idp.idm.cms.gov/oauth2/ausb10u24pv908noS297",
      clientId: "0oaaozdfrhUJZPTNk297",
      redirectUri: window.location.origin + "/login/callback",
    });
  });

  it("should throw invalid oktaEnvConfig Error", async () => {
    const oktaEnvConfig = {};
    mockedAxios.get.mockResolvedValue({ data: { ...oktaEnvConfig } });
    try {
      await getOktaConfig();
    } catch (err) {
      expect(err.message).toEqual("Invalid oktaEnvConfig variables");
    }
  });
});
