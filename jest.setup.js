import MadieEditor from "./src/types/madie-madie-editor.d.ts";

global.System = {
  import: jest.fn(mockImport),
};

function mockImport(importName) {
  if (importName === "@madie/madie-editor") {
    return Promise.resolve(MadieEditor);
  } else {
    console.warn("No mock module found");
    return Promise.resolve({});
  }
}
