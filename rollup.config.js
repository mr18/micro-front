import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fse from 'fs-extra';
import * as path from 'path';
import { terser } from 'rollup-plugin-terser';
const pkg = require('./package.json');
const cwd = process.cwd();
const production = process.env.NODE_ENV === 'production';
fse.emptyDirSync(path.join(cwd, 'lib'));
const entry = path.join(__dirname, 'src/index.ts');
const baseConfig = [
  {
    input: entry,
    external: [/@babel\/runtime/].filter(Boolean),
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'runtime',
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
            },
          ],
        ],
        plugins: ['@babel/plugin-transform-runtime'],
      }),

      typescript({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
      }),
      production &&
        terser({
          ecma: 5,
        }),
    ],
    output: [
      {
        file: path.join(__dirname, pkg.module),
        format: 'es',
        sourcemap: true,
      },
      {
        file: path.join(__dirname, pkg.main),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: path.join(__dirname, 'lib/index.umd.js'),
        format: 'umd',
        sourcemap: true,
        exports: 'named',
        name: 'MicroFront',
      },
    ],
  },
];

export default baseConfig;
