module.exports = {
  roots: ["<rootDir>/src/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(j|t)sx?$": "babel-jest",
    "^.+\\.svg$": "<rootDir>/svgTransform.js",
    "^.+\\.png": "<rootDir>/svgTransform.js",
  },
  transformIgnorePatterns: ["node_modules/(?!formik)/"],
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
    "single-spa-react/parcel": "single-spa-react/lib/cjs/parcel.cjs",
    "^.+\\.(css|less|scss)$": "babel-jest",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom", "./jest.setup.js"],
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react-jsx",
      },
      useEsm: true,
    },
  },
};
