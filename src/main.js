import "./style.css";
import { setThree } from "./demo/setThree.js";
import { loadAssets } from "./demo/loadAssets.js";
import { setInitialState } from "./demo/setInitialState.js";
import { setObjects } from "./demo/setObjects.js";
import { setFloorNavigation } from "./demo/setFloorNavigation.js";

window._three = setThree();
window._three.user = {};

loadAssets((assets) => {
  _three.assets = assets;
  setInitialState();
  setObjects();
  setFloorNavigation();
});
