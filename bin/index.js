#! /usr/bin/env node  // 指定解析环境为node

import { program } from "commander";
import fs from "fs";
import path from "path";

program
  .command("create <project-name>") // 定义init命令
  .description("初始化项目")
  .action((name) => {
    import("../cli/create/index.js").then((main) => {
      main.default(name);
    });
  });
program
  .command("list") // 定义init命令
  .description("模板列表")
  .action(() => {
    import("../cli/list/index.js")();
  });
program.parse(process.argv);
