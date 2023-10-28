import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import * as lil from "three/examples/jsm/libs/lil-gui.module.min.js";

const setThree = () => {
  // Dom elements
  let containerDom = document.querySelector(".canvas-container");
  let canvasDom = containerDom.querySelector(".canvas");

  // Sizes
  let sizes = {
    width: containerDom.offsetWidth,
    height: containerDom.offsetHeight,
  };

  // Scene
  let scene = new Scene();

  // Camera
  let camera = new PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 1000);

  // Controls
  let controls = new OrbitControls(camera, containerDom);

  // Renderer
  let renderer = new WebGLRenderer({
    canvas: canvasDom,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

  // Clock
  let previous = 0;
  let current = 0;
  let delta = 0;
  let clock = new Clock();
  let stats;
  if (window.location.hash == "#panel") {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
  }

  // State
  let callbacks = [];
  let animationId;

  // Methods
  let tick = () => {
    if (stats) {
      stats.begin();
    }

    current = clock.getElapsedTime();
    delta = current - previous;
    previous = current;

    callbacks.forEach((callback) => {
      callback(current, delta);
    });

    renderer.render(scene, camera);

    if (stats) {
      stats.end();
    }

    window.requestAnimationFrame(tick);
  };

  let animate = (callback) => {
    callbacks.push(callback);
  };

  let resize = () => {
    sizes.width = containerDom.offsetWidth;
    sizes.height = containerDom.offsetHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
  };

  let dispose = () => {
    window.cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
  };

  // Events
  animationId = window.requestAnimationFrame(() => {
    tick();
  });

  window.addEventListener("resize", resize);

  // Control panel
  let panel;
  if (window.location.hash == "#panel") {
    panel = new lil.GUI();
  }

  return { containerDom, scene, camera, controls, renderer, animate, dispose, panel };
};

export { setThree };
