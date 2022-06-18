import simpleGit from "simple-git";
import { resolvePwdPath } from "../utils/base.js";
import * as packageJson from "../utils/packJson.js";

const git = simpleGit();

const createPackage = async (projectName, type) => {
  let targetDir = resolvePwdPath("./" + projectName);
  packageJson.initPackage();
  try {
    let gitInfos = await git.getRemotes(true);
    let gitInfo = gitInfos.filter((item) => item.name == "origin")[0];
    if (gitInfo) {
      packageJson.setValue("repository", { type: "git", url: gitInfo.refs.fetch || gitInfo.refs.push });
    }
  } catch (e) {
    console.error(e);
  }
  packageJson.setValue("name", projectName);
  packageJson.toJsonFile(targetDir);
};

export default createPackage;
