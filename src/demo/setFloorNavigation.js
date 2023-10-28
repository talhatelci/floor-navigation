import FloorNavigation from "../FloorNavigation.js";

const setFloorNavigation = () => {
  _three.user.floorNav = new FloorNavigation({
    camera: _three.camera,
    domElement: _three.containerDom,
    floorMesh: _three.user.floorMesh,
    obstacles: _three.user.obstacles,
    indicator: _three.user.indicator,
  });

  _three.animate(() => {
    _three.user.floorNav.update();
  });
};

export { setFloorNavigation };
