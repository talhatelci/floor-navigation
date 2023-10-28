import { Vector3 } from "three";

const setInitialState = () => {
  // Scene
  _three.scene.environment = _three.assets.envmap;
  _three.scene.background = _three.assets.envmap;
  _three.scene.backgroundBlurriness = 0.75;

  // Camera
  _three.camera.fov = 60;
  _three.camera.updateProjectionMatrix();
  _three.camera.position.set(0, 1.7, 2.8);
  _three.camera.lookAt(new Vector3(0, 0.5, 0));

  // Controls
  _three.controls.enabled = false;
};

export { setInitialState };
