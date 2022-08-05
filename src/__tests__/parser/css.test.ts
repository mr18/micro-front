/* eslint-disable @typescript-eslint/no-explicit-any */

import { cssScope } from 'src/parser/css';

// const comment1 = '// this is comment \n';
// const comment2 = '/* this is comment */';
describe('css parser', () => {
  test('test style rule', async () => {
    const cssCode = `@media only screen and (max-width: 600px) {body {background-color: lightblue;} div{ssad:112}/*sdasdsd*/ @media{div{font-size:12px}}p{ass:1}}div{ssad:112} @media{div{font-size:12px}}`;

    console.log(cssScope(cssCode, '#id', {}));
  });

  //   test('test style rule selector', async () => {
  //     const cssCode = `.target .list {font-size:10px}`;
  //     const newCssCode = comment1 + cssCode + comment2;
  //     const result = CssParser.parse(cssCode);
  //     console.log(result.stringify('#id'));
  //     // expect(result.stringify('#id')).toBe('#id ' + cssCode);

  //     const result2 = CssParser.parse(newCssCode);
  //     console.log(result2.stringify('#id'));
  //     // expect(result2.stringify('#id')).toBe(comment1 + '#id ' + cssCode + comment2);
  //   });
});
