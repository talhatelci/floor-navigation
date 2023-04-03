# Three.js FloorNavigation

This class allows users to navigate on a mesh in three.js with the help of three.js' OrbitControls and GSAP animation library.

## Usage

Import the class:

```javascript
import FloorNavigation from "path/to/FloorNavigation.js";
```

Set an initial position and rotation for the PerspectiveCamera object

```javascript
let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(x, y, z);
camera.lookAt(new THREE.Vector3(a, b, c));
```

Initiliaze the class with parameters:\
\
"camera": A PerspectiveCamera object,\
"domElement": The DOM element to register events,\
"floorMesh": A Mesh to navigate on, it is important that the camera should be above that mesh initially,\
"obstacles": (Optional) An array that contains obstacle meshes\
"indicator": (Optional) An Object3D that represents the indicator, this object will follow the mouse cursor when it is hovered on the floor mesh

```javascript
let controls = new FloorNavigation({
  camera: camera,
  domElement: containerDom,
  floorMesh: floorMesh,
  obstacles: obstacles,
  indicator: indicator,
});
```

Call "update" method in the animaton loop

```javascript
controls.update();
```

The properties of OrbitControls such as "rotateSpeed", "dampingFactor", "minAzimuthAngle" etc. can be changed manually using "getOrbitControls" method. Changing some properties may cause this class not to work as expected.

```javascript
controls.getOrbitControls().rotateSpeed = -0.25;
controls.getOrbitControls().dampingFactor = 0.1;
```

## Run Demo Locally

Clone the project

```bash
  git clone https://github.com/talhatelci/floor-navigation
```

Go to the project directory

```bash
  cd floor-navigation
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```
