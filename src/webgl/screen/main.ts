import * as THREE from "three";
import DeltaTime from "../../DeltaTime";

import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { screenRenderEngine } from "./renderEngine";

const textColor = "#f99021";

export const initScreen = (
  renderer: THREE.WebGLRenderer
): [() => void, THREE.Material] => {
  const sceneRTT = new THREE.Scene();

  // Geometry
  const backGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "red" })
  );
  backGround.position.set(0.5, -0.5, -0.01);

  const caret = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(0.04, 0.06),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  sceneRTT.add(caret);

  /**
   * Fonts
   */
  const fontLoader = new FontLoader();
  let font: Font | undefined = undefined;
  fontLoader.load("/fonts/public-pixel.json", (_font) => {
    console.log("loaded");
    font = _font;
    console.log(font);
    let n: [number, number, any] | [number, number] = [0, 0];
    const ws = `root:~$ curl edwardh.io  Hi there,                I'm Edward                                        root:~$ cd /uni/2019     root:~/uni/2019$ `;
    for (let w of ws) {
      n = placeChar(w, n[0], n[1], true);
    }
    caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
    window.addEventListener("keydown", (ev) => {
      // ev.key
      console.log(ev.key);
      if (ev.key == "Backspace") {
        // caret.position.x -= 0.04;
        const w = chars.pop();
        if (w) {
          if (!w.fixed) {
            sceneRTT.remove(w.char);
            n = [w.char.position.x, -w.char.position.y];
            caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
          } else chars.push(w);
        }
      } else {
        caret.visible = true;
        // caret.position.x += 0.04;
        n = placeChar(ev.key, n[0], n[1],false,true);
        caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
      }
    });
  });

  const wordsToAnm: { word: THREE.Group; width: number }[] = [];

  const chars: { char: THREE.Group; fixed: boolean }[] = [];
  function placeChar(
    char: string,
    x: number = 0,
    y: number = 0,
    fixed: boolean = false,
    highlight: boolean = false
  ): [number, number, THREE.Group] {
    const size = 0.04;
    const height = size;
    const width = size;
    const leading = height * 2;
    const tracking = width * 0.4;

    if (width + x > 1.396) {
      y += leading;
      x = 0;
    }

    const charObj = new THREE.Group();
    // m.scale.y = height;hh
    charObj.position.x = x;
    charObj.position.y = -y;

    const textGeometry = new TextGeometry(char, {
      font: font as any,
      size: size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, -height, -0.01);
    charObj.add(text);

    if (highlight){
      const background = new THREE.Mesh(
        new THREE.PlaneGeometry(width + tracking, height + leading/2, 1, 1),
        new THREE.MeshBasicMaterial({ color: textColor })
      );

      textMaterial.color.set('black')
      // background.position.x = 0.5;
      background.position.set(width / 2, -height / 2, -0.01);
      // background.scale.x = 0.05;
      charObj.add(background);
    }


    chars.push({ char: charObj, fixed: fixed });

    sceneRTT.add(charObj);

    return [width + tracking + x, y, charObj];
  }

  const mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  const clock = new THREE.Clock();
  let time = 0;
  let uProgress = 1.2;

  let newDeltaTime = 0;

  const [screenRender, noiseMat] = screenRenderEngine(renderer, sceneRTT);

  const tick = () => {
    // Update controls

    // console.log(time)
    const elapsedTime = clock.getElapsedTime();

    if (Math.floor(elapsedTime * 2) % 2 == 0) {
      // caret.visible = false;
    } else {
      caret.visible = true;
    }
    // if (caretLastVisible != caret.visible) {
    //   lag.needUpdate = true;
    //   caret.position.y += -0.03
    // }
    // caretLastVisible = caret.visible

    // caret.position.y += -0.5 * deltaTime;

    // newDeltaTime += deltaTime;

    if (wordsToAnm.length > 0) {
      if (wordsToAnm[0].word.scale.x < wordsToAnm[0].width)
        wordsToAnm[0].word.scale.x = 0.05 * Math.floor(time);
      else {
        wordsToAnm.shift();
        time = 0;
      }
    }

    screenRender();
  };

  // composer.readBuffer.texture.magFilter = THREE.NearestFilter;

  return [tick, noiseMat];
};
