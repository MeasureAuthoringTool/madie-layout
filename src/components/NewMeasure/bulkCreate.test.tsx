import "@testing-library/jest-dom";
import { describe, expect, test } from "@jest/globals";
import bulkCreate from "./bulkCreate";

describe("Bulk Create", () => {
  test("We can create a list of 10 measures randomly", () => {
    const tenRandomMeasures = bulkCreate(10);
    expect(tenRandomMeasures.length).toEqual(10);
    expect(typeof tenRandomMeasures[0]).toEqual("object");
  });
});
