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
sceneRTT.add(backGround);

function makeWork(){

  const height = 0.05

  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "blue" })
  );
  m.position.set(0.5, -height/2, -0.01);
  
  const word = new THREE.Group().add(m);
  m.scale.y = height
  word.scale.x = 0.5
  // word.position.y -= 0.1
  
  sceneRTT.add(word);
}
makeWork()


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

const cameraRTT = new THREE.OrthographicCamera(-0.5, 1.5, 0.5, -1.5, 1, 3);
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
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();
  // const elapsedTime = clock.getElapsedTime()

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
  // renderer.render( scene, camera );
  renderer.render(sceneRTT, cameraRTT);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
