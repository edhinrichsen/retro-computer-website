import * as THREE from "three";
import DeltaTime from "../../DeltaTime";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// @ts-ignore
import noiseVertexShader from "../shaders/noise/vertex.vert";
// @ts-ignore
import noiseFragmentShader from "../shaders/noise/fragment.frag";
import { Vector3 } from "three";

export const initScreen = (
  renderer: THREE.WebGLRenderer
): [() => void, THREE.ShaderMaterial] => {
  const sceneRTT = new THREE.Scene();

  const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.1, 0.1, -1.1, 1, 3);
  sceneRTT.add(cameraRTT);
  cameraRTT.position.set(0, 0, 1);

  const rtTexture = new THREE.WebGLRenderTarget(256, 256, {
    format: THREE.RGBFormat,
  });

  // const renderer = new THREE.WebGLRenderer();
  const composer = new EffectComposer(renderer, rtTexture);
  composer.renderToScreen = false;

  // renderer.render(sceneRTT, cameraRTT);
  const renderPass = new RenderPass(sceneRTT, cameraRTT);
  composer.addPass(renderPass);

  // const bloomPass = new BloomPass()

  // const dotScreenPass = new DotScreenPass()
  // const rgbShiftShader = new ShaderPass(RGBShiftShader)
  // composer.addPass(rgbShiftShader)

  const textureLoader = new THREE.TextureLoader()
  const matcapTexture = textureLoader.load('/textures/matcaps/screen-reflection.png')

  const noiseMat = new THREE.ShaderMaterial({
    uniforms: {
      uDiffuse: { value: null },
      uMatcap: {value: matcapTexture},
      uTime: { value: 1 },
      uProgress: { value: 1.2 },
    },
    vertexShader: noiseVertexShader,
    fragmentShader: noiseFragmentShader,
  });

  // composer.addPass(noiseShader);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(128, 128),
    1,
    0.4,
    0
  );
  composer.addPass(bloomPass);
  // composer.addPass(bloomPass);

  // Geometry
  const backGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "red" })
  );
  backGround.position.set(0.5, -0.5, -0.01);
  // sceneRTT.add(backGround);

  // const colors = [
  //   "#568ca1",
  //   "#4fc1ff",
  //   "#4ec9b0",
  //   "#d4d4d4",
  //   "#9cdcfe",
  //   "#ce9178",
  //   "#dcdcaa",
  //   "#b5cea8",
  //   "#6a9955",
  //   "#569cd6",
  //   "#c586c0",
  // ];
  // const colors = ["#42db82"];
  const colors = ["#f99021"];
  const words = [];
  const wordsToAnm: { word: THREE.Group; width: number }[] = [];
  function makeWord(props: {
    x?: number;
    y?: number;
    width?: number;
    color?: THREE.ColorRepresentation;
    anm?: boolean;
  }): [number, number, THREE.Group] {
    const height = 0.05;
    const minWidth = 1;
    const maxWidth = 6;
    const margin = 0.05;

    let x = props.x || 0;
    let y = props.y || 0;
    const width =
      props.width || margin * (Math.floor(Math.random() * maxWidth) + minWidth);

    const color =
      props.color || colors[Math.floor(Math.random() * colors.length)];

    if (width + x > 1) {
      y += margin * 2;
      x = 0;
    }
    if (Math.random() > 0.9 && y > 0) {
      y += margin * 4;
      x = 0;
    }

    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 1, 1),
      new THREE.MeshBasicMaterial({ color: color })
    );
    m.position.set(0.5, -height / 2, -0.01);

    const word = new THREE.Group().add(m);
    m.scale.y = height;
    word.position.x = x;
    word.position.y = -y;

    if (props.anm) {
      word.scale.x = 0;
      words.push({ word: word, width: width });
      wordsToAnm.push({ word: word, width: width });
    } else {
      word.scale.x = width;
    }
    sceneRTT.add(word);

    return [width + margin + x, y, word];
  }

  let n: [number, number, any] | [number, number] = [0, 0];
  for (let i = 0; i < 30; i++) {
    n = makeWord({ x: n[0], y: n[1], anm: true });
  }

  // const [_x, _y, bat] = makeWord({ x: 0.4, y: 0.9, width: 0.2, color: "red" });
  // bat.scale.x = 0.2;
  // console.log(bat);

  const mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  const clock = new THREE.Clock();
  let time = 0;
  let uProgress = 1.2;

  let newDeltaTime = 0;

  const tick = () => {
    // Update controls

    const deltaTime = DeltaTime();
    // console.log(time)
    const elapsedTime = clock.getElapsedTime();

    newDeltaTime += deltaTime;

    // @ts-ignore
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
      time += deltaTime * 12;
    }

    // let batPos = mouse.x / window.innerWidth / 0.8 - 0.1 - 0.1;
    // console.log(batPos);
    // if (batPos < 0) batPos = 0;
    // if (batPos > 0.8) batPos = 0.8;
    // bat.position.x = batPos;

    // Render first scene into texture

    // renderer.setRenderTarget(rtTexture);
    // renderer.clear();
    // renderer.render(sceneRTT, cameraRTT);

    composer.render();
    // if (newDeltaTime >= 0.1) {
    //   composer.render();
    //   newDeltaTime = 0;
    // }

    // plane.material =  new THREE.MeshBasicMaterial({ map: composer.readBuffer.texture })

    // Render full screen quad with generated texture

    // renderer.clear();
    // renderer.render( sceneScreen, cameraRTT );

    // Render second scene to screen
    // (using first scene as regular texture)
  };

  // composer.readBuffer.texture.magFilter = THREE.NearestFilter;
  noiseMat.uniforms.uDiffuse.value = composer.readBuffer.texture;

  // const textureLoader = new THREE.TextureLoader()
  // const matcapTexture = textureLoader.load('/textures/matcaps/screen-reflection.png')

  const matcapMaterial = new THREE.MeshMatcapMaterial()
  matcapMaterial.matcap = matcapTexture
  console.log(matcapMaterial)

  const nMaterial = new THREE.MeshNormalMaterial()

  return [tick, nMaterial as any];
};
