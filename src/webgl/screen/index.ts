import * as THREE from "three";
import ScreenRenderEngine from "./renderEngine";
import ScreenTextEngine from "./textEngine";

// @ts-ignore
// import titleText from "../../text/about.md";
import titleText from "../../text/title.md";
import { Assists } from "../loader";
import Terminal from "../../terminal";
console.log(titleText);

export default function Screen(
  assists: Assists,
  renderer: THREE.WebGLRenderer
) {
  const sceneRTT = new THREE.Scene();

  // Geometry
  const backGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "red" })
  );
  backGround.position.set(0.5, -0.5, -0.01);

  const screenTextEngine = ScreenTextEngine(
    assists,
    sceneRTT,
    titleText,
    "user:~$"
  );

  const screenRenderEngine = ScreenRenderEngine(assists, renderer, sceneRTT);

  // window.addEventListener("keydown", (ev) => {
  //   // ev.key
  //   userInput(ev.key);
  // });

  Terminal(screenTextEngine);

  const tick = (deltaTime: number, elapsedTime: number) => {
    screenRenderEngine.tick(deltaTime, elapsedTime);
    screenTextEngine.tick(deltaTime, elapsedTime);
  };

  return { tick, screenRenderEngine, screenTextEngine };
}
