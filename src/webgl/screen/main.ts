import * as THREE from "three";
import DeltaTime from "../../DeltaTime";

import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { screenRenderEngine } from "./renderEngine";
import { screenTextEngine } from "./textEngine";

// @ts-ignore
// import titleText from "../../text/projects.md";
import titleText from "../../text/title.md";
console.log(titleText);

export const initScreen = (
  renderer: THREE.WebGLRenderer
): [(deltaTime: number, elapsedTime: number) => void, THREE.Material] => {
  const sceneRTT = new THREE.Scene();

  // Geometry
  const backGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "red" })
  );
  backGround.position.set(0.5, -0.5, -0.01);

  const [screenTextEngineTick, userInput, placeMarkdown] = screenTextEngine(
    sceneRTT,
    titleText
  );

  const [screenRenderTick, noiseMat] = screenRenderEngine(renderer, sceneRTT);

  window.addEventListener("keydown", (ev) => {
    // ev.key
    userInput(ev.key);
  });

  const tick = (deltaTime: number, elapsedTime: number) => {
    screenTextEngineTick(deltaTime, elapsedTime);
    screenRenderTick(deltaTime, elapsedTime);
  };

  return [tick, noiseMat];
};
