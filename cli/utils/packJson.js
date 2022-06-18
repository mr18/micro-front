import fse from "fs-extra";
import path from "path";
import { resolvePath, toJson } from "./base.js";

let packageData = {};

export const initPackage = (filePath) => {
  if (typeof filePath == "string") {
    filePath = path.resolve(filePath, "./package.json");
    try {
      packageData = fse.readJsonSync(filePath);
    } catch (e) {
      console.error(e);
    }
  } else if (typeof filePath == "object") {
    packageData = filePath;
  }
};
export const setValue = (key, value) => {
  let keySp = key.split(".");
  const addValue = (obj, keySp, value) => {
    if (!keySp.length) return;
    let sk = keySp.shift();
    if (!keySp.length) {
      obj[sk] = value;
    } else {
      !obj[sk] && (obj[sk] = {});
      addValue(obj[sk], keySp, value);
    }
  };
  addValue(packageData, keySp, value);
  return packageData;
};

export const toJsonFile = (dir) => {
  fse.writeFileSync(path.resolve(dir, "./package.json"), toJson(packageData));
};
