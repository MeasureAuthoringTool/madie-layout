
global.crypto = require("crypto").webcrypto;

global.System = {
  import: jest.fn(mockImport),
};

function mockImport(importName) {
    console.warn("No mock module found");
    return Promise.resolve({});
}
