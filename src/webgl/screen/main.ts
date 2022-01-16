import * as THREE from "three";
import DeltaTime from "../../DeltaTime";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// @ts-ignore
import vertexShader from "../shaders/vertex.vert";
// @ts-ignore
import noiseFragmentShader from "../shaders/noise.frag";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Lag } from "./lag";

const textColor = "#f99021";

export const initScreen = (
  renderer: THREE.WebGLRenderer
): [() => void, THREE.ShaderMaterial] => {
  const sceneRTT = new THREE.Scene();

  const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.496, 0.1, -1.1, 1, 3);
  sceneRTT.add(cameraRTT);
  cameraRTT.position.set(0, 0, 1);

  const rtTexture = new THREE.WebGLRenderTarget(512 * 1.33, 512, {
    format: THREE.RGBFormat,
  });

  const composer = new EffectComposer(renderer, rtTexture);
  composer.renderToScreen = false;

  const renderPass = new RenderPass(sceneRTT, cameraRTT);
  composer.addPass(renderPass);


  const noiseMat = new THREE.ShaderMaterial({
    uniforms: {
      uDiffuse: { value: null },
      uTime: { value: 1 },
      uProgress: { value: 1.2 },
    },
    vertexShader: vertexShader,
    fragmentShader: noiseFragmentShader,
  });

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(128, 128), 1, 0.4, 0);
  composer.addPass(bloomPass);

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
    let n: [number, number, any] | [number, number] = [0, 0];
    const ws = "ed:~$ cd home/uni/2019";
    for (let w of ws) {
      n = makeWord({ char: w, x: n[0], y: n[1], anm: true });
    }
    caret.position.set(n[0] + 0.02, n[1] - 0.015, 0);
  });

  const wordsToAnm: { word: THREE.Group; width: number }[] = [];
  function makeWord(props: {
    char: string;
    x?: number;
    y?: number;
    width?: number;
    color?: THREE.ColorRepresentation;
    anm?: boolean;
  }): [number, number, THREE.Group] {
    const size = 0.04;
    const height = size;
    const width = size;
    const leading = height * 2;
    const tracking = width * 0.4;

    let x = props.x || 0;
    let y = props.y || 0;

    if (width + x > 1.396) {
      y += leading;
      x = 0;
    }
    // if (Math.random() > 0.9 && y > 0) {
    //   y += margin * 4;
    //   x = 0;
    // }

    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 1, 1),
      new THREE.MeshBasicMaterial({ color: textColor })
    );
    m.position.set(0.5, -height / 2, -0.01);
    m.scale.x = 0.05;

    const textGeometry = new TextGeometry(props.char, {
      font: font as any,
      size: size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, -height, -0.01);
    sceneRTT.add(text);

    const word = new THREE.Group().add(text);
    m.scale.y = height;
    word.position.x = x;
    word.position.y = -y;

    // if (props.anm) {
    //   word.scale.x = 1;
    //   words.push({ word: word, width: width });
    //   wordsToAnm.push({ word: word, width: width });
    // } else {
    //   word.scale.x = width;
    // }
    sceneRTT.add(word);

    return [width + tracking + x, y, word];
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

  const lag = new Lag(composer.readBuffer, 512 * 1.33, 512);

  const tick = () => {
    // Update controls

    const deltaTime = DeltaTime();
    // console.log(time)
    const elapsedTime = clock.getElapsedTime();

    // if (Math.floor(elapsedTime * 2) % 2 == 0) {
      
    //   caret.visible = false;
    // } else {
    //   caret.visible = true;
    //   // lag.needUpdate = true;
    // }
    // if (caretLastVisible != caret.visible) {
    //   lag.needUpdate = true;
    //   caret.position.y += -0.03
    // }
    // caretLastVisible = caret.visible

    caret.position.y += -0.5 * deltaTime;

    newDeltaTime += deltaTime;

    noiseMat.uniforms.uTime.value = elapsedTime;
    noiseMat.uniforms.uProgress.value = uProgress;

    uProgress -= deltaTime * 0.2;
    if (uProgress < 0) uProgress = 1.2;

    if (wordsToAnm.length > 0) {
      if (wordsToAnm[0].word.scale.x < wordsToAnm[0].width)
        wordsToAnm[0].word.scale.x = 0.05 * Math.floor(time);
      else {
        wordsToAnm.shift();
        time = 0;
      }
    }

    lag.render(renderer);
    composer.render();
  };

  // composer.readBuffer.texture.magFilter = THREE.NearestFilter;

  noiseMat.uniforms.uDiffuse.value = lag.outputTexture.texture;

  return [tick, noiseMat];
};
