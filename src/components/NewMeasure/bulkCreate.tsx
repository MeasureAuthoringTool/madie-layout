import { MeasureScoring } from "@madie/madie-models/dist/MeasureScoring";
import { Measure } from "@madie/madie-models/dist/Measure";
import { Model } from "@madie/madie-models/dist/Model";
// This is some frontend logic for adding a bunch of measures
// use Bulk create in createNewMeasure as a button press for a quick load and db crash

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateLetter = () =>
  alphabet.charAt(Math.floor(Math.random() * alphabet.length));
const generateNumber = () => Math.floor(Math.random() * (500 - 0 + 1)) + 0;

export const mockLibraryName = () => {
  let string = "";
  string += generateLetter();
  string += generateNumber();
  return string;
};
export const mockMeasureName = () => {
  let string = "";
  for (let i = 0; i < 10; i++) {
    string += generateLetter();
  }
  return string;
};

const bulkCreate = (count: number) => {
  const randomMeasure = () =>
    MeasureScoring[
      Object.keys(MeasureScoring)[
        Math.floor(Math.random() * Object.keys(MeasureScoring).length)
      ]
    ];
  const mockModel: Model = Model[Object.keys(Model)[0]];

  const measureInput = {
    measureName: "",
    model: "",
    cqlLibraryName: "",
    measureScoring: "",
  } as Measure;

  const measures = [];
  for (let i = 0; i < count; i++) {
    const newMeasure = Object.assign({}, measureInput);
    // build it
    const mockMeasureScoring: MeasureScoring = randomMeasure();

    newMeasure.measureName = mockMeasureName();
    newMeasure.model = mockModel;
    newMeasure.cqlLibraryName = mockLibraryName();
    newMeasure.measureScoring = mockMeasureScoring;
    measures.push(newMeasure);
  }
  return measures;
};

// stub to add a button for the frontend to populate
// const insertAll = async (measureList: Measure[]) => {
//   for (const measure of measureList) {
//     const insert = await createMeasure(measure);
//   }
// };
// const bulkLoad = () => {
//   insertAll(bulkCreate());
// };

export default bulkCreate;
