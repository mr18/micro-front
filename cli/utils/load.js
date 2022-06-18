import fse from "fs-extra";
import path from "path";
import childProcess from "child_process";

import { getProjectInfo, resolvePath } from "./base.js";

export const downloadSource = (source) => {
  let projectInfo = getProjectInfo();

  return new Promise((res, rej) => {
    fse.removeSync(projectInfo.projectCacheDir);

    let git = childProcess.spawn("git", ["clone", source, projectInfo.projectCacheDir]);
    // childProcess.execSync("git clone " + source + " " + projectInfo.projectCacheDir);

    git.on("error", (err) => {
      rej(code);
    });

    git.on("close", (code) => {
      if (code == 0) {
        res(code);
      } else {
        rej(code);
      }
    });
  });
};
