const getField = (storageKey, field) => {
  const storageStr = window.localStorage.getItem(storageKey);
  if (storageStr) {
    try {
      const storage = JSON.parse(storageStr);
      if (storage && storage[field]) {
        return storage[field];
      }
    } catch (error) {
      console.error(
        "An error occurred while trying to read the okta-token-storage object",
        error
      );
    }
  }
  return null;
};

const getAccessTokenObj = (storageKey) => {
  return getField(storageKey, "accessToken");
};

const getIdTokenObj = (storageKey) => {
  return getField(storageKey, "idToken");
};

const useOktaTokens = (storageKey = "okta-token-storage") => {
  return {
    getAccessToken: () => getAccessTokenObj(storageKey)?.accessToken,
    getAccessTokenObj: () => getAccessTokenObj(storageKey),
    getIdToken: () => getIdTokenObj(storageKey)?.idToken,
    getIdTokenObj: () => getIdTokenObj(storageKey),
  };
};

export default useOktaTokens;
