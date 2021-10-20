import axios from "axios";

const getOktaConfig = async () => {
  const { data }: any = await axios.get("importmap/oktaConfig.json");
  return {
    oktaAuthConfig: {
      issuer: `${data.oktaBaseUrl}/oauth2/default`,
      clientId: `${data.clientId}`,
      redirectUri: window.location.origin + "/login/callback",
    },
    oktaSignInConfig: {
      baseUrl: `${data.oktaBaseUrl}`,
      clientId: `${data.clientId}`,
      redirectUri: window.location.origin + "/login/callback",
      authParams: {},
    },
  };
};

export default getOktaConfig;
