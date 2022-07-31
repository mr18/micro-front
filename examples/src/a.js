import { Application } from '../../lib/index.esm';

class A {
  render() {
    const oDiv = document.createElement('div');
    document.body.appendChild(oDiv);
    const App2 = new Application({
      name: 'aap2',
      url: 'http://localhost:9990/bbb.html',
      container: oDiv,
      // window: window,
      // self:window
    });
    // window.App2 = App2;
    //
    App2.run();
  }
}

new A().render();
