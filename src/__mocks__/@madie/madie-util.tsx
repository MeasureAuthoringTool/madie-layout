export const getServiceConfig = () => ({
  measureService: {
    baseUrl: "example-service-url",
  },
});

// this doesn't appear to do anything, but if there is no file named made-util.tsx present tests fail, even if fully commented out.
export const measureStore = {
  initialState: null,
  state: null,
  subscribe: () => null, // needs to return an object with key subscribe
  unsubscribe: () => null,
};
