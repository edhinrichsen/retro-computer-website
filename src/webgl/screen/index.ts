import * as THREE from "three";
import ScreenRenderEngine from "./renderEngine";
import ScreenTextEngine from "./textEngine";

// @ts-ignore
// import titleText from "../../text/projects.md";
import titleText from "../../text/title.md";
import { Assists } from "../loader";
console.log(titleText);

export type Change = {
  type: "add" | "del" | "none";
  loc: number | "end" | "none";
  str: string;
};

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
    "root:~$"
  );

  const screenRenderEngine = ScreenRenderEngine(assists, renderer, sceneRTT);

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
      if (change) screenTextEngine.userInput(change, textarea.selectionStart);
    },
    false
  );

  let lastSelection = 0;
  document.addEventListener("selectionchange", () => {
    if (textarea.selectionStart !== textarea.selectionEnd)
      textarea.setSelectionRange(lastSelection, lastSelection);
    lastSelection = textarea.selectionStart;
    console.log("tigger", textarea.selectionStart, textarea.selectionEnd);
    screenTextEngine.userInput({ type: "none", loc: "none", str: "" }, textarea.selectionStart);
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

  const tick = (deltaTime: number, elapsedTime: number) => {
    screenRenderEngine.tick(deltaTime, elapsedTime);
    screenTextEngine.tick(deltaTime, elapsedTime);
  };

  return { tick, screenRenderEngine, screenTextEngine };
}
