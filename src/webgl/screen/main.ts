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

export type Change = {
  type: "add" | "del" | "none";
  loc: number | "end" | "none";
  str: string;
};

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

  // window.addEventListener("keydown", (ev) => {
  //   // ev.key
  //   userInput(ev.key);
  // });

  const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.focus();
  textarea.onblur = () => {
    textarea.focus();
  };

  let oldText = "";
  textarea.addEventListener(
    "input",
    function () {
      const change = stringEditDistance(oldText, textarea.value);
      oldText = textarea.value;
      if (change) userInput(change, textarea.selectionStart);
    },
    false
  );

  textarea.addEventListener("selectionchange", () => {
    console.log(textarea.selectionStart);
    userInput({ type: "none", loc: "none", str: "" }, textarea.selectionStart);
  });

  function stringEditDistance(oldStr: string, newStr: string) {
    const lenDiff = oldStr.length - newStr.length;

    let change: Change = {
      type: "none",
      loc: "none",
      str: "",
    };
    let op = 0;
    let np = 0;

    if (lenDiff === 0) {
      console.log("same");
    } else if (lenDiff > 0) {
      console.log("del");
      change.type = "del";
      while (op < oldStr.length || np < newStr.length) {
        if (op >= oldStr.length) {
          console.error("add and del");
          return;
        }
        // console.log()
        if (oldStr.charAt(op) !== newStr.charAt(np)) {
          if (change.loc === "none")
            change.loc = np === newStr.length ? "end" : np;
          change.str += oldStr.charAt(op);
          op++;
        } else {
          op++;
          np++;
        }
      }
    } else if (lenDiff < 0) {
      console.log("add");
      change.type = "add";
      while (op < oldStr.length || np < newStr.length) {
        if (np >= newStr.length) {
          console.error("add and del");
          return;
        }
        // console.log()
        if (oldStr.charAt(op) !== newStr.charAt(np)) {
          if (change.loc === "none")
            change.loc = op === oldStr.length ? "end" : op;
          change.str += newStr.charAt(np);
          np++;
        } else {
          op++;
          np++;
        }
      }
    }
    console.log("change: ", change);
    return change;
  }

  stringEditDistance("hello", "hello there");

  const tick = (deltaTime: number, elapsedTime: number) => {
    screenTextEngineTick(deltaTime, elapsedTime);
    screenRenderTick(deltaTime, elapsedTime);
  };

  return [tick, noiseMat];
};
