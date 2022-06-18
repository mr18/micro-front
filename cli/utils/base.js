import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jsonFormat from "json-format";
import chalk from "chalk";

import { createRequire } from "module";
import { initPackage } from "./packJson.js";
// export const require = createRequire(import.meta.url);

export const log = (content) => console.log(chalk.green(content));

let projectCacheDir = "";
let projectDir = "";
let projectName = "";
export const intProjectInfo = (project) => {
  projectName = project;
  projectCacheDir = resolvePath("../../.micro_" + projectName);
  projectDir = resolvePwdPath("./.micro_" + projectName);
};
export const getProjectInfo = (project) => {
  if (project) {
    intProjectInfo(project);
  }
  return { projectCacheDir, projectDir, projectName };
};
export const resolvePwdPath = (dir) => {
  return path.resolve(process.cwd(), dir);
};

export const resolvePath = (dir) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return path.resolve(__dirname, dir);
};
export const toJson = (obj) => {
  return jsonFormat(obj, { type: "space", size: 2 });
};

export const getTemplateInfo = () => {
  let tplRoot = resolvePath("../../template");
  let res = {};
  let dirList = fse.readdirSync(tplRoot);
  dirList.forEach((name) => {
    let tplDir = path.resolve(tplRoot, "./" + name + "/source.json");
    let source = fse.readJsonSync(tplDir);
    res[name] = source;
  });
  return res;
};
