import inquirer from "inquirer";
import fse from "fs-extra";

import { getProjectInfo, getTemplateInfo, intProjectInfo, resolvePath, resolvePwdPath } from "../utils/base.js";

import createPackage from "./createPackage.js";
import { downloadSource } from "../utils/load.js";

const main = async (projectName) => {
  intProjectInfo(projectName);
  let projectInfo = getProjectInfo();

  let confirmRes = await inquirer.prompt({
    name: "isMain",
    message: "是否生成主项目框架？(Y/N)",
    validate: function (input) {
      var done = this.async();
      if (!/^(y|yes|n|no)$/i.test(input)) {
        done("请输入Y/N");
        return;
      }
      done(null, true);
    },
  });
  let templateName = "";
  let templateInfo = getTemplateInfo();
  // createPackage(projectName, "main");

  // createSource(projectName, "main");

  if (/^(y|yes)$/i.test(confirmRes.isMain)) {
    templateName = "main";
    // fse.copySync(resolvePath(tplMap["main"].path), projectInfo.projectDir);
  } else {
    // clear();
    let promptOpt = { name: "tplName", message: "请选择项目模板", type: "list", choices: Object.keys(tplMap).filter((key) => key != "main") };
    let promptRes = await inquirer.prompt(promptOpt);
    templateName = promptRes.tplName;

    // fse.copySync(resolvePath(tplMap[tepName].path), projectInfo.projectDir);
  }

  downloadSource(templateInfo[templateName].git).then((res) => {
    console.log(res);
  });
};

export default main;
