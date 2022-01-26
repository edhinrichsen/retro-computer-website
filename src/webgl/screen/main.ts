import * as THREE from "three";
import DeltaTime from "../../DeltaTime";

import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { screenRenderEngine } from "./renderEngine";
import { screenTextEngine } from "./textEngine";

// @ts-ignore
import noiseFragmentShader from "../../text/title.md";
console.log(noiseFragmentShader);

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

  // fontLoader.load("/fonts/public-pixel.json", (font) => {
  //   titleFont.font = font;
  //   fontLoader.load("/fonts/chill.json", (font) => {
  //     // fontLoader.load("/fonts/basis33.json", (font) => {
  //     console.log("loaded");
  //     terminalFont.font = font;
  //     paragraphFont.font = font;
  //     // font = _font;
  //     console.log(font);
  //     let n: [number, number, any] | [number, number] = [0, 0];

  //     const ws = `root:~$ curl edwardh.io  Hi there,                I'm Edward                                        root:~$ cd /uni/2019     root:~/uni/2019$ `;

  //     // placeHTML(
  //     //   `
  //     //   root:~$ curl edwardh.io
  //     //   <br>
  //     //   Hi there,
  //     //   <br>
  //     //   I'm Edward
  //     //   <br>
  //     //   -Computer Scientist
  //     //   <br>
  //     //   -Designer
  //     //   <br>
  //     //   <br>
  //     //   root:~$ cd /uni/2019
  //     //   `
  //     // );
  //     placeStr("root:~$ curl edwardh.io", terminalFont, true, false, false,false);
  //     placeLinebreak(terminalFont);
  //     placeLinebreak(terminalFont);
  //     // setSize(0.04);
  //     placeStr(" Hi there,", titleFont, true, false, false,false);
  //     placeLinebreak(titleFont);
  //     placeStr(" ", titleFont, true, false, false,false);
  //     placeStr("I'm Edward", titleFont, true, true, false,false);
  //     placeLinebreak(titleFont);
  //     placeStr(" -Computer Scientist", titleFont, true, false, false,false); // •
  //     placeLinebreak(titleFont);
  //     placeStr(" -Designer", titleFont, true, false, true,false);
  //     // placeLinebreak(titleFont);
  //     placeLinebreak(titleFont);
  //     placeStr(" ", titleFont, true, false, true,false);
  //     placeStr(
  //       "Type Help or scroll to get started",
  //       paragraphFont,
  //       true,
  //       false,
  //       true,
  //       false
  //     );
  //     placeLinebreak(terminalFont);
  //     placeLinebreak(terminalFont);
  //     placeStr("root:~$ ", terminalFont, true, false, true, false);
  //     // placeLinebreak(terminalFont);
  //     // placeHTML(
  //     //   `My name is Edward Hinrichsen and I have recently completed a Bachelor of Science, majoring in Computing and Software Systems at the University of Melbourne. I have a passion for all things technology and design, from software engineering & machine learning to UI/UX & 3D graphics.`,
  //     //   paragraphFont
  //     // );
  //     // placeStr("root:~/uni/2019$ ", terminalFont, true, false, true, false);

  //     window.addEventListener("keydown", (ev) => {
  //       // ev.key
  //       console.log(ev.key);
  //       if (ev.key == "Backspace") {
  //         delChar();
  //       } else if (ev.key == "Enter") {
  //         placeLinebreak(terminalFont);
  //         placeStr("command not found\n", terminalFont, true, false, true, false);
  //         placeLinebreak(terminalFont);
  //         placeLinebreak(terminalFont);
  //         placeStr(
  //           "root:~/uni/2019$ ",
  //           terminalFont,
  //           false,
  //           false,
  //           true,
  //           false
  //         );
  //       } else {
  //         caret.visible = true;
  //         // caret.position.x += 0.04;
  //         placeStr(ev.key, terminalFont, false, false, true, false);
  //         // caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
  //       }
  //     });
  //   });
  // });

  // const mouse = { x: 0, y: 0 };
  // document.addEventListener("mousemove", (event) => {
  //   mouse.x = event.clientX;
  //   mouse.y = event.clientY;
  // });

  const [screenTextEngineTick, userInput] = screenTextEngine(
    sceneRTT,
    noiseFragmentShader
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
