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
      console.error("Error: 'indicator' should be an Object3D.");
      return;
    }

    this.camera = camera;
    this.domElement = domElement;
    this.floorMesh = floorMesh;
    this.obstacles = obstacles;
    this.indicator = indicator;

    this._start();
  }

  _start() {
    this._sizes = {
      width: this.domElement.offsetWidth,
      height: this.domElement.offsetHeight,
    };

    this._isTouchDevice = Boolean("ontouchstart" in window || navigator.msMaxTouchPoints);

    let initialDirection = new Vector3(0, 0, -1);
    initialDirection.applyQuaternion(this.camera.quaternion);
    initialDirection.normalize().multiplyScalar(0.00001);

    let initialTarget = this.camera.position.clone();
    initialTarget.add(initialDirection);

    this._orbitControls = new OrbitControls(this.camera, this.domElement);
    this._orbitControls.target = initialTarget;
    this._orbitControls.minPolarAngle = Math.PI * 0.05;
    this._orbitControls.maxPolarAngle = Math.PI * 0.95;
    this._orbitControls.rotateSpeed = -0.25;
    this._orbitControls.dampingFactor = 0.1;
    this._orbitControls.enableZoom = false;
    this._orbitControls.enablePan = false;
    this._orbitControls.enableDamping = true;

    this._raycaster = new Raycaster();
    this._rayCheck = [this.floorMesh, ...this.obstacles];
    this.floorMesh.userData.name = "floorMesh";
    this.obstacles.forEach((obstacle) => {
      obstacle.userData.name = "obstacle";
    });

    this._moving = false;

    this._pointer = new Vector2(-1000, -1000);

    this._indicatorEnabled = Boolean(this.indicator != null && this.indicator.isObject3D);

    if (this._indicatorEnabled) {
      this.indicator.position.set(0, this.floorMesh.position.y + 0.01, 0);
      this.indicator.material.transparent = true;
      this.indicator.material.opacity = 0;
      this.indicator.material.visible = !this._isTouchDevice;

      this._indicatorVisible = false;
      this._tlShowIndicator = gsap.timeline().pause().reverse();
      this._tlShowIndicator.to(this.indicator.material, {
        opacity: 1,
        duration: 0.4,
        ease: "none",
      });

      this._tlMoveIndicator = gsap.timeline();

      this._tlClickIndicator = gsap.timeline().pause();
      this._tlClickIndicator.to(this.indicator.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.2,
      });
      this._tlClickIndicator.to(this.indicator.scale, {
        x: 1,
        y: 1,
        duration: 0.6,
      });
    }

    this._dragCheck = false;

    this._addEventListeners();
  }

  _addEventListeners() {
    this.domElement.addEventListener("touchstart", (event) => this._onPointerDown(event));
    this.domElement.addEventListener("touchmove", (event) => this._onPointerMove(event));
    this.domElement.addEventListener("touchend", (event) => this._onPointerUp(event));

    this.domElement.addEventListener("mousedown", (event) => this._onPointerDown(event));
    this.domElement.addEventListener("mousemove", (event) => this._onPointerMove(event));
    this.domElement.addEventListener("mouseup", (event) => this._onPointerUp(event));

    window.addEventListener("resize", () => this._onResize());
  }

  _onPointerDown(event) {
    event.preventDefault();

    this._dragCheck = false;
  }

  _onPointerMove(event) {
    event.preventDefault();

    let { x, y } = this._getNormalizedEventCoordinates(event);
    this._pointer.set(x, y);

    this._dragCheck = true;
  }

  _onPointerUp(event) {
    if (!this._dragCheck) {
      let { x, y } = this._getNormalizedEventCoordinates(event);
      this._pointer.set(x, y);

      let intersects = this._castRay();

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
          duration: 0.8,
          ease: "power4.in",
          onStart: () => {
            this._moving = true;

            this._tlClickIndicator.restart();
            this._orbitControls.enabled = false;
          },
          onUpdate: () => {
            let target = this.camera.position.clone().add(cameraDirection);
            this._orbitControls.target = target;
          },
          onComplete: () => {
            this._moving = false;
            this._orbitControls.enabled = true;
          },
        });
      }
    }
  }

  _onResize() {
    this._sizes.width = this.domElement.offsetWidth;
    this._sizes.height = this.domElement.offsetHeight;

    this._isTouchDevice = Boolean("ontouchstart" in window || navigator.msMaxTouchPoints);
    this.indicator.material.visible = !this._isTouchDevice;
  }

  _getNormalizedEventCoordinates(event) {
    let isTouch = event.type.startsWith("touch");
    let touch = null;
    if (isTouch) {
      touch = event.type === "touchend" ? event.changedTouches[0] : event.touches[0];
    }

    let eventX = isTouch ? touch.clientX : event.clientX;
    let eventY = isTouch ? touch.clientY : event.clientY;

    return {
      x: (eventX / this._sizes.width) * 2 - 1,
      y: -(eventY / this._sizes.height) * 2 + 1,
    };
  }

  _castRay() {
    this._raycaster.setFromCamera(this._pointer, this.camera);
    let intersects = this._raycaster.intersectObjects(this._rayCheck);
    return intersects;
  }

  _updateIndicator() {
    if (this._moving) {
      return;
    }

    let intersects = this._castRay();

    if (intersects[0] && intersects[0].object.userData.name == "floorMesh") {
      if (!this._indicatorVisible) {
        this._indicatorVisible = true;
        this._tlShowIndicator.play();
      }

      this._tlMoveIndicator.clear();
      this._tlMoveIndicator.to(this.indicator.position, {
        x: intersects[0].point.x,
        z: intersects[0].point.z,
        duration: 0.1,
      });
    } else {
      if (this._indicatorVisible) {
        this._indicatorVisible = false;
        this._tlShowIndicator.reverse();
      }
    }
  }

  getOrbitControls() {
    return this._orbitControls;
  }

  update() {
    if (!this._isTouchDevice && this._indicatorEnabled) {
      this._updateIndicator();
    }

    this._orbitControls.update();
  }
}

export default FloorNavigation;
