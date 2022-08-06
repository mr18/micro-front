const path = require('path');
const dts = require('dts-bundle');

const cwd = process.cwd();

const pkg = require(path.join(cwd, 'package.json'));

dts.bundle({
  main: path.join(cwd, 'lib/index.d.ts'), // 入口地址
  name: pkg.name, // 声明模块
  removeSource: true, // 删除源文件
  out: path.join(cwd, 'lib/types/index.d.ts'), // 合并后输出地址
});
