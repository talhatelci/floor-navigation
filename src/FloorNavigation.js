import { Vector2, Vector3, Raycaster } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

class FloorNavigation {
  constructor({ camera, domElement, floorMesh, obstacles = [], indicator }) {
    if (camera == null || !Object.keys(camera).includes("isPerspectiveCamera")) {
      console.error("Error: Missing or incorrect 'camera' parameter.");
      return;
    }

    if (!(domElement instanceof HTMLElement)) {
      console.error("Error: Missing or incorrect 'domElement' parameter.");
      return;
    }

    if (floorMesh == null || !Object.keys(floorMesh).includes("isMesh")) {
      console.error("Error: Missing or incorrect 'floorMesh' parameter.");
      return;
    }

    if (!(obstacles instanceof Array)) {
      console.error("Error: 'obstacles' parameter should be an array.");
      return;
    } else {
      for (let i = 0; i < obstacles.length; i++) {
        if (!obstacles[i].isMesh) {
          console.error("Error: 'obstacles' array should only contain meshes.");
          return;
        }
      }
    }

    if (indicator != null && !Object.keys(indicator).includes("isObject3D")) {
      console.error("Error: 'indicator' parameter should be an Object3D.");
      return;
    }

    this.camera = camera;
    this.domElement = domElement;
    this.floorMesh = floorMesh;
    this.obstacles = obstacles;
    this.indicator = indicator;

    this.#initialize();
  }

  /*
    Private Fields
  */

  #sizes;
  #isTouchDevice;
  #orbitControls;
  #raycaster;
  #rayCheck;
  #pointer;
  #indicatorEnabled;
  #tlShowIndicator;
  #tlMoveIndicator;
  #dragCheck;

  /*
    Private methods
  */

  #initialize() {
    // Dom element's sizes
    this.#sizes = {
      width: this.domElement.offsetWidth,
      height: this.domElement.offsetHeight,
    };

    // Checking if it is a touch device to determine if the indicator will be shown
    this.#isTouchDevice = Boolean("ontouchstart" in window || navigator.msMaxTouchPoints);

    // Three.js' OrbitControl to rotate camera
    let initialDirection = new Vector3(0, 0, -1);
    initialDirection.applyQuaternion(this.camera.quaternion);
    initialDirection.normalize().multiplyScalar(0.00001);

    let initialTarget = this.camera.position.clone();
    initialTarget.add(initialDirection);

    this.#orbitControls = new OrbitControls(this.camera, this.domElement);
    this.#orbitControls.target = initialTarget;
    this.#orbitControls.minPolarAngle = Math.PI * 0.05;
    this.#orbitControls.maxPolarAngle = Math.PI * 0.95;
    this.#orbitControls.rotateSpeed = -0.25;
    this.#orbitControls.dampingFactor = 0.1;
    this.#orbitControls.enableZoom = false;
    this.#orbitControls.enablePan = false;
    this.#orbitControls.enableDamping = true;

    // Raycaster to determine clicked point's position or update the indicator position
    this.#raycaster = new Raycaster();

    // An array to check if a floor or an obstacle clicked or hovered
    this.#rayCheck = [this.floorMesh, ...this.obstacles];
    this.floorMesh.userData.name = "floorMesh";
    this.obstacles.forEach((obstacle) => {
      obstacle.userData.name = "obstacle";
    });

    // Normalized pointer coordinates
    this.#pointer = new Vector2();

    // Setting indicator and timelines
    this.#indicatorEnabled = Boolean(this.indicator != null && this.indicator.isObject3D);

    if (this.#indicatorEnabled) {
      this.indicator.position.set(0, this.floorMesh.position.y + 0.01, 0);
      this.indicator.material.transparent = true;
      this.indicator.material.opacity = 0;
      this.indicator.material.visible = !this.#isTouchDevice;

      // Timeline to animate the indicator's opacity smoothly
      this.#tlShowIndicator = gsap.timeline().pause().reverse();

      this.#tlShowIndicator.to(this.indicator.material, {
        opacity: 1,
        duration: 0.2,
      });

      // Timeline to animate the movement of the indicator
      this.#tlMoveIndicator = gsap.timeline();
    }

    // A field to differentiate click and drag event
    this.#dragCheck = false;

    this.#addEventListeners();
  }

  #addEventListeners() {
    this.domElement.addEventListener("touchstart", (event) => this.#onPointerDown(event));
    this.domElement.addEventListener("touchmove", (event) => this.#onPointerMove(event));
    this.domElement.addEventListener("touchend", (event) => this.#onPointerUp(event));

    this.domElement.addEventListener("mousedown", (event) => this.#onPointerDown(event));
    this.domElement.addEventListener("mousemove", (event) => this.#onPointerMove(event));
    this.domElement.addEventListener("mouseup", (event) => this.#onPointerUp(event));

    window.addEventListener("resize", () => this.#onResize());
  }

  #onPointerDown(event) {
    event.preventDefault();

    this.#dragCheck = false;
  }

  #onPointerMove(event) {
    event.preventDefault();

    let { x, y } = this.#getNormalizedEventCoordinates(event);
    this.#pointer.set(x, y);

    this.#dragCheck = true;
  }

  #onPointerUp(event) {
    if (!this.#dragCheck) {
      let { x, y } = this.#getNormalizedEventCoordinates(event);
      this.#pointer.set(x, y);

      let intersects = this.#castRay();

      if (!intersects[0]) {
        return;
      }

      let clickedMesh = intersects[0].object;
      let clickedPosition = intersects[0].point;
      let cameraDirection = new Vector3(0, 0, -1)
        .applyQuaternion(this.camera.quaternion)
        .normalize()
        .multiplyScalar(0.00001);

      if (clickedMesh.userData.name == "floorMesh") {
        gsap.to(this.camera.position, {
          x: clickedPosition.x,
          z: clickedPosition.z,
          onStart: () => {
            this.#orbitControls.enabled = false;
          },
          onUpdate: () => {
            let target = this.camera.position.clone().add(cameraDirection);
            this.#orbitControls.target = target;
          },
          onComplete: () => {
            this.#orbitControls.enabled = true;
          },
        });
      }
    }
  }

  #onResize() {
    this.#sizes.width = this.domElement.offsetWidth;
    this.#sizes.height = this.domElement.offsetHeight;

    this.#isTouchDevice = Boolean("ontouchstart" in window || navigator.msMaxTouchPoints);
    this.indicator.material.visible = !this.#isTouchDevice;
  }

  #getNormalizedEventCoordinates(event) {
    let isTouch = event.type.startsWith("touch");
    let touch = null;
    if (isTouch) {
      touch = event.type === "touchend" ? event.changedTouches[0] : event.touches[0];
    }

    let eventX = isTouch ? touch.clientX : event.clientX;
    let eventY = isTouch ? touch.clientY : event.clientY;

    return {
      x: (eventX / this.#sizes.width) * 2 - 1,
      y: -(eventY / this.#sizes.height) * 2 + 1,
    };
  }

  #castRay() {
    this.#raycaster.setFromCamera(this.#pointer, this.camera);
    let intersects = this.#raycaster.intersectObjects(this.#rayCheck);
    return intersects;
  }

  #updateIndicator() {
    let intersects = this.#castRay();

    if (intersects[0] && intersects[0].object.userData.name == "floorMesh") {
      this.#tlShowIndicator.play();

      this.#tlMoveIndicator.clear();
      this.#tlMoveIndicator.to(this.indicator.position, {
        x: intersects[0].point.x,
        z: intersects[0].point.z,
        duration: 0.1,
      });
    } else {
      this.#tlShowIndicator.reverse();
    }
  }

  /*
    Public methods
  */

  getOrbitControls() {
    return this.#orbitControls;
  }

  update() {
    if (!this.#isTouchDevice && this.#indicatorEnabled) {
      this.#updateIndicator();
    }

    this.#orbitControls.update();
  }
}

export default FloorNavigation;
