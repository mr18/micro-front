/*
 * Created on Thu Aug 04 2022
 *
 * Copyright (c) 2022 mr18
 */

// https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/type

enum RuleType {
  selector = 1,
  comment = 2,
  cssrule = 3,
}
type TokenType = {
  rule: string;
  type: RuleType;
  content: string;
  tail: string;
  children: TokenType[];
};
export default class CssParser {
  tokenize: Array<TokenType> = [];
  // 递归回溯,使用pTokenize找回父集
  pTokenize: Array<TokenType>[] = [];
  pos = 0;
  code = '';
  length = 0;
  result = '';
  parsed = false;
  // 用于替换资源路径
  location: Record<PropertyKey, any> = {};
  parse(code: string, location?: Record<PropertyKey, any>) {
    this.reset();
    // 剔除开头的空格和换行字符
    this.code = code.replace(/^[\s\n]*/, '');
    this.length = this.code.length;
    this.location = location || global.location;
    this.parseCssRule();
    this.parsed = true;
    return this;
  }
  scope(scope = '', replaceSelector: string[] = ['body', 'html']) {
    // replaceSelector 将被替换成 scope, 默认是 body，html
    const replaceRe = new RegExp('^' + replaceSelector.join('|'), 'i');

    if (this.parsed) {
      return this.result || (this.result = this._toString(scope, replaceRe));
    }
    throw new Error('please execlute parse to parse css code first');
  }
  private _toString(scope = '', replaceRe: RegExp, tokenize?: TokenType[]) {
    tokenize = tokenize || this.tokenize;
    const ruleRe = new RegExp('^' + scope);
    tokenize.forEach((token) => {
      let rule = token.rule;
      if (token.type === RuleType.selector) {
        if (replaceRe.test(rule)) {
          rule = rule.replace(replaceRe, scope);
        } else if (!/^@/.test(rule) && !ruleRe.test(rule)) {
          const rules = rule
            .split(',')
            .filter((seletor) => !!seletor)
            .map((seletor: string) => {
              return scope + ' ' + seletor;
            });
          rule = rules.join(',');
        }
      }
      this.result += rule + token.content;
      if (token.children.length > 0) {
        this._toString(scope, replaceRe, token.children);
      }
      this.result += token.tail;
    });
    return this.result;
  }
  // 解析css rule
  private parseCssRule(tokenize: TokenType[] = this.tokenize) {
    const token = { type: RuleType.selector, content: '', rule: '', tail: '', children: [] };
    tokenize.push(token);

    while (this.pos < this.length) {
      const char = this.code[this.pos];
      if (char === '/') {
        this.parseComment(tokenize);
        break;
      } else if (char === '{') {
        this.parseContent(tokenize);
        break;
      }
      token.rule += char;
      this.pos++;
    }
  }
  // 解析注释
  private parseComment(tokenize: TokenType[]) {
    const token: TokenType = tokenize[tokenize.length - 1];
    const nextStr = this.code[this.pos + 1];
    token.type = RuleType.comment;
    token.content += this.code[this.pos];
    if (!(nextStr === '*' || nextStr === '/')) {
      throw new Error(`Illegal syntax`);
    }
    while (this.pos < this.length) {
      this.pos++;
      const char = this.code[this.pos];
      token.content += char;
      // 注释结尾
      if ((nextStr === '*' && char === '*' && this.code[this.pos + 1] === '/') || (nextStr === '/' && char === '\n')) {
        if (nextStr === '*') {
          token.content += this.code[++this.pos];
        }
        this.reParseCssRule(token);
        break;
      }
    }
  }
  // 解析css内容
  private parseContent(tokenize: TokenType[], backTracking?: boolean) {
    const token: TokenType = tokenize[tokenize.length - 1];
    const char = this.code[this.pos];
    // 嵌套回溯
    if (backTracking) {
      token.tail += char;
      if (char === '}') {
        return this.reParseCssRule(token, tokenize);
      }
    } else {
      token.content += char;
      const cssrule = (token.rule.match(/^@[a-z]+/i) || [])[0];
      // https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
      // 嵌套css规则
      if (cssrule) {
        token.type = RuleType.cssrule;
        if (cssrule === '@media' || cssrule === '@supports') {
          this.pTokenize.push(tokenize);
          return this.reParseCssRule(token, token.children);
        } else if (cssrule === '@import') {
          this.parseSource(token);
        }
      }
    }
    // 处理一般情况下的 css 内容
    let scopeCount = 0;
    while (this.pos < this.length) {
      this.pos++;
      const char = this.code[this.pos];
      if (backTracking) {
        token.tail += char;
      } else {
        token.content += char;
      }
      if (char === '{') {
        scopeCount++;
      } else if (char === '}') {
        // css 内容块结束
        if (--scopeCount < 0) {
          return this.reParseCssRule(token, tokenize);
        }
      }
    }
  }
  private reParseCssRule(token: TokenType, tokenize?: TokenType[]) {
    this.pos++;
    let char = this.code[this.pos];
    while (char === ' ' || char === '\n') {
      token.tail += char;
      this.pos++;
      char = this.code[this.pos];
    }
    // 回溯嵌套的父层 token
    if (char === '}' && this.pTokenize.length > 0) {
      const preTokenize = this.pTokenize.pop() as TokenType[];
      this.parseContent(preTokenize, true);
    } else {
      if (this.pos + 1 < this.length) {
        this.parseCssRule(tokenize);
      }
    }
  }

  private parseSource(token: TokenType) {
    // url资源设置为当前域
    console.log(token);
  }

  private reset() {
    this.tokenize = [];
    this.pTokenize = [];
    this.location = {};
    this.pos = this.length = 0;
    this.code = this.result = '';
    this.parsed = false;
  }
}

let parser: CssParser;
export const cssScope = (code: string, scope: string, location?: Record<PropertyKey, any>, replaceSelector?: string[]) => {
  parser = parser || new CssParser();
  parser.parse(code, location);
  return parser.scope(scope, replaceSelector);
};
