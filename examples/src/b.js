import A from "./a";
const b = "BBB";
class B {
  static xx = 1;
  c = 1;
  render() {
    this.a = 1;
    let x = new A();
    console.log(b);
    import("../chain.js").then((mod) => {
      console.log(mod.default);
    });
    return x;
  }
}
class SSS extends A {
  rendre() {
    console(B);
  }
}
export default B;
