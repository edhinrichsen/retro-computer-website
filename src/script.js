import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import testVertexShader from "./shaders/test/vertex.vert";
import testFragmentShader from "./shaders/test/fragment.frag";
import { Uniform } from "three";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const sceneRTT = new THREE.Scene();

const rtTexture = new THREE.WebGLRenderTarget(512, 512, {
  format: THREE.RGBFormat,
});

const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
const plane = new THREE.Mesh(
  planelikeGeometry,
  new THREE.MeshBasicMaterial({ map: rtTexture.texture })
);
// const plane = new THREE.Mesh( planelikeGeometry, new THREE.MeshBasicMaterial( { color: 'red' } ) );

// plane.position.set(0,100,-500);
scene.add(plane);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load("/textures/flag-french.jpg");

/**
 * Test mesh
 */
// Geometry
const backGround = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);
backGround.position.set(0.5, -0.5, -0.01);
// sceneRTT.add(backGround);

const colors = [
  "#568ca1",
  "#4fc1ff",
  "#4ec9b0",
  "#d4d4d4",
  "#9cdcfe",
  "#ce9178",
  "#dcdcaa",
  "#b5cea8",
  "#6a9955",
  "#569cd6",
  "#c586c0",
];
const words = [];
const wordsToAnm = [];
function makeWork(props) {
  const height = 0.05;
  const minWidth = 0.05;
  const maxWidth = 0.3;
  const margin = 0.05;

  let x = props.x || 0;
  let y = props.y || 0;
  const width = props.width || Math.random() * maxWidth + minWidth;

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

let n = [0, 0];
for (let i = 0; i < 30; i++) {
  n = makeWork({ x: n[0], y: n[1], anm: true });
}

const [_x, _y, bat] = makeWork({ x: 0.4, y: 0.9, width: 0.2, color: "red" });
bat.scale.x = 0.2;
console.log(bat);

// sceneRTT.add(new THREE.AxesHelper(1));

// scene.add(backGround)

// Material

// Mesh
// const mesh = new THREE.Mesh(geometry, material);
// sceneRTT.add(mesh);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0.25, -0.25, 1);
scene.add(camera);

const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.1, 0.1, -1.1, 1, 3);
sceneRTT.add(cameraRTT);
cameraRTT.position.set(0, 0, 1);

// Controls
// const controls = new OrbitControls(cameraRTT, canvas);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

let time = Date.now();
const DeltaTime = () => {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;
  return deltaTime / 1000;
};

const mouse = { x: 0, y: 0 };
document.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

const tick = () => {
  // Update controls
  controls.update();
  const deltaTime = DeltaTime();
  // const elapsedTime = clock.getElapsedTime()

  if (wordsToAnm.length > 0) {
    if (wordsToAnm[0].word.scale.x < wordsToAnm[0].width)
      wordsToAnm[0].word.scale.x += 0.5 * deltaTime;
    else wordsToAnm.shift();
  }

  let batPos = mouse.x / window.innerWidth / 0.8 - 0.1 - 0.1;
  console.log(batPos);
  if (batPos < 0) batPos = 0;
  if (batPos > 0.8) batPos = 0.8;
  bat.position.x = batPos;

  // Render first scene into texture

  renderer.setRenderTarget(rtTexture);
  renderer.clear();
  renderer.render(sceneRTT, cameraRTT);

  // Render full screen quad with generated texture

  // renderer.clear();
  // renderer.render( sceneScreen, cameraRTT );

  // Render second scene to screen
  // (using first scene as regular texture)

  renderer.setRenderTarget(null);
  // renderer.render(scene, camera);
  renderer.render(sceneRTT, cameraRTT);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
