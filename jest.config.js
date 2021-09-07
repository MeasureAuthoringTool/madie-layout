module.exports = {
  rootDir: "src",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(j|t)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
    "single-spa-react/parcel": "single-spa-react/lib/cjs/parcel.cjs",
    "@madie/madie-editor": "<rootDir>/types/madie-madie-editor.d.ts",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom", "../jest.setup.js"],
};
