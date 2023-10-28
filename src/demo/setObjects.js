import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
} from "three";

const setObjects = () => {
  // FLoor
  let floor = new Mesh(
    new PlaneGeometry(6, 6),
    new MeshStandardMaterial({
      color: 0xfffffc,
    })
  );
  floor.rotation.x = -Math.PI * 0.5;
  _three.scene.add(floor);
  _three.user.floorMesh = floor;

  // Obstacles
  let obstacle = new Mesh(
    new BoxGeometry(0.3, 3, 0.3),
    new MeshStandardMaterial({
      color: 0x963232,
      roughness: 0.2,
      envMapIntensity: 1.5,
      metalness: 0.2,
    })
  );
  obstacle.position.y = 1.5;

  let obstacle1 = obstacle.clone();
  obstacle1.position.x = 2;
  let obstacle2 = obstacle.clone();
  obstacle2.position.x = -2;

  _three.scene.add(obstacle1, obstacle2);
  _three.user.obstacles = [obstacle1, obstacle2];

  // Indicator
  let indicator = new Mesh(
    new RingGeometry(0.24, 0.3, 24, 1),
    new MeshBasicMaterial({ color: 0x963232 })
  );
  indicator.rotation.x = -Math.PI * 0.5;

  _three.scene.add(indicator);
  _three.user.indicator = indicator;
};

export { setObjects };
