import { Application } from '../../lib/index.esm';

class A {
  render() {
    console.log(window);
    const oDiv = document.createElement('div');
    document.body.appendChild(oDiv);
    const App2 = new Application({
      name: 'app2',
      url: 'http://localhost:9990/bbb.html',
      container: oDiv,
      window: window,
      // self:window
    });
    // window.App2 = App2;
    //
    App2.run();
    if (window.__GET_SANDBOX_INSTANCE__) {
      console.log('app run as sub');
    } else {
      console.log('app run as main');
    }

    import('./b.js').then((mod) => {
      const B = new mod.default();
      B.render();
    });
  }
}
new A().render();
