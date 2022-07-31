import { Application } from '../../lib/index.esm';
// const App = new Application({
//   name: "aap1",
//   url: "http://localhost:9990/bbb.html",
//   container: "#micro",
// });

const App = new Application({
  name: 'aap1',
  url: 'http://localhost:9990/aaa.html',
  container: '#micro',
});

// const App = new Application({
//   name: "aap1",
//   url: "http://localhost:9900/",
//   container: "#micro",
// });

window.App = App;

App.run();
