import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import FloorNavigation from "./FloorNavigation.js";

class Demo {
  constructor(containerDom) {
    this.containerDom = containerDom;

    this.#initialize();
  }

  #canvasDom;
  #sizes;
  #stats;
  #scene;
  #camera;
  #controls;
  #renderer;
  #clock;

  #initialize() {
    // Canvas element
    this.#canvasDom = document.createElement("canvas");
    this.#canvasDom.classList.add("canvas");
    this.containerDom.appendChild(this.#canvasDom);

    // Dom element sizes
    this.#sizes = {
      width: this.containerDom.offsetWidth,
      height: this.containerDom.offsetHeight,
    };

    // Stats
    this.#stats = new Stats();
    this.#stats.showPanel(0);
    document.body.appendChild(this.#stats.dom);

    // Scene
    this.#scene = new THREE.Scene();

    // Camera
    this.#camera = new THREE.PerspectiveCamera(
      40,
      this.#sizes.width / this.#sizes.height,
      0.01,
      1000
    );

    // Renderer
    this.#renderer = new THREE.WebGLRenderer({
      canvas: this.#canvasDom,
      antialias: true,
      alpha: true,
    });
    this.#renderer.setSize(this.#sizes.width, this.#sizes.height);
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clock
    this.#clock = new THREE.Clock();

    this.#setControls();
    this.#addEventListeners();
    this.#animate();
  }

  #setControls() {
    // Initial camera position and rotation
    this.#camera.position.set(0, 1.75, 5.75);
    this.#camera.lookAt(new THREE.Vector3(0, 1.75, 0));

    // FloorNavigation parameters
    let floorMesh;
    let obstacles;
    let indicator;

    // Floor mesh
    floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x2e2c2f,
      })
    );
    floorMesh.rotation.x = -Math.PI * 0.5;

    // Ceiling mesh
    let ceilingMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x475b63,
      })
    );
    ceilingMesh.position.y = 3;
    ceilingMesh.rotation.x = Math.PI * 0.5;

    // Wall mesh
    let wallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(12, 24, 12),
      new THREE.MeshBasicMaterial({
        color: 0xbacdb0,
        side: THREE.BackSide,
      })
    );

    // Obstacles
    let obstacleGroup = new THREE.Group();

    let columnGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    let columnMaterial = new THREE.MeshBasicMaterial({
      color: 0x729b79,
    });

    let column1 = new THREE.Mesh(columnGeometry, columnMaterial);
    let column2 = new THREE.Mesh(columnGeometry, columnMaterial);
    let column3 = new THREE.Mesh(columnGeometry, columnMaterial);
    let column4 = new THREE.Mesh(columnGeometry, columnMaterial);

    column1.position.set(3, 1.5, 3);
    column2.position.set(3, 1.5, -3);
    column3.position.set(-3, 1.5, 3);
    column4.position.set(-3, 1.5, -3);

    obstacleGroup.add(column1, column2, column3, column4);

    obstacles = [];
    obstacles.push(column1, column2, column3, column4);

    // Indicator
    indicator = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.24, 8),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
      })
    );
    indicator.rotation.x = -Math.PI * 0.5;

    // Adding meshes to the scene
    this.#scene.add(floorMesh, ceilingMesh, wallMesh, obstacleGroup, indicator);

    // Setting controls
    this.#controls = new FloorNavigation({
      camera: this.#camera,
      domElement: this.containerDom,
      floorMesh: floorMesh,
      obstacles: obstacles,
      indicator: indicator,
    });

    this.#controls.getOrbitControls().rotateSpeed = -0.25;
    this.#controls.getOrbitControls().dampingFactor = 0.1;
  }

  #addEventListeners() {
    window.addEventListener("resize", () => this.#onResize());
  }

  #onResize() {
    this.#sizes.width = this.containerDom.offsetWidth;
    this.#sizes.height = this.containerDom.offsetHeight;

    this.#camera.aspect = this.#sizes.width / this.#sizes.height;
    this.#camera.updateProjectionMatrix();

    this.#renderer.setSize(this.#sizes.width, this.#sizes.height);
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  #animate() {
    this.#stats.begin();

    this.#controls.update();

    this.#renderer.render(this.#scene, this.#camera);

    this.#stats.end();

    window.requestAnimationFrame(() => {
      this.#animate();
    });
  }
}

export default Demo;
