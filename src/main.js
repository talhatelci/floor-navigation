import "./style.css";
import Demo from "./Demo.js";

let demo;

window.addEventListener("load", () => {
  demo = new Demo(document.querySelector(".canvas-container"));
});
