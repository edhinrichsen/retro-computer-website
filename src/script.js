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



const rtTexture = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );

const planelikeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const plane = new THREE.Mesh( planelikeGeometry, new THREE.MeshBasicMaterial( { map: rtTexture.texture } ) );
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
const geometry = new THREE.PlaneGeometry(2, 2, 800, 800);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

// Material
// const material = new THREE.MeshBasicMaterial()
// canvas.getContext();
// WebGLRenderingContext.getSupportedExtensions()
// canvas.getExtension('OES_standard_derivatives');
const gl = canvas.getContext("webgl");
gl.getExtension("OES_standard_derivatives");
// console.log(gl)
const material = new THREE.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uTime: { value: 0 },

    // uWindDirMin: {value: 3.14/4.0},
    // uWindDirMax: {value: 3.14/3.0},

    // uWaveLenMin: {value: 0.1},
    // uWaveLenMax: {value: 0.15},

    // uAmplitudeMin: {value: 0.05},
    // uAmplitudeMax: {value: 0.1},

    // uSlopeMin: {value: 0.05},
    // uSlopeMax: {value: 0.7},

    uWindDirMin: { value: new THREE.Vector4(6.28 * (-0.65) ,6.28 * (0.95),6.28 * 0.7, 6.28 * (0.1)) },
    uWindDirMax: { value: new THREE.Vector4(6.28 * (-0.7)  ,6.28 * 1    ,6.28 * 0.7 , 6.28 * (0.125)) },

    uWaveLenMin: { value: new THREE.Vector4(0.7, 0.25, 1,   0.66) },
    uWaveLenMax: { value: new THREE.Vector4(1,    0.4, 1.5, 0.33) },

    uAmplitudeMin: { value: new THREE.Vector4(0.5, 0.15,0.5, 0.5) },
    uAmplitudeMax: { value: new THREE.Vector4(0.7, 0.3,1, 0.01) },

    uSlopeMin: { value: new THREE.Vector4(0.8, 0.8,0.4, 1) },
    uSlopeMax: { value: new THREE.Vector4(1, 1     ,0.64, 0.3) },

    uSpeed: { value: new THREE.Vector4(0.5*0.6, 1 *0.6    ,1.5*0.6, 2*0.6) },
    uFlutterSpeed: { value: new THREE.Vector4(0.5*0.6, 1*0.6     ,3*0.6, 0.2*0.6) },
  },
});

gui.close()
for (let i = 0; i < 4; i++) {
  const waveGUI = gui.addFolder("Wave " + i);

  let prop;

  switch (i) {
    case 0:
      prop = "x";
      break;

    case 1:
      prop = "y";
      break;
    case 2:
      prop = "z";
      break;
    case 3:
      prop = "w";
      break;
  }

  const WindDir = waveGUI.addFolder("WindDir");
  WindDir.add(material.uniforms.uWindDirMin.value, prop)
    .min(-2 * Math.PI)
    .max(2 * Math.PI)
    .name("Min");
  WindDir.add(material.uniforms.uWindDirMax.value, prop)
    .min(-2 * Math.PI)
    .max(2 * Math.PI)
    .name("Max");

  const WaveLen = waveGUI.addFolder("WaveLen");
  WaveLen.add(material.uniforms.uWaveLenMin.value, prop)
    .min(0.001)
    .max(2)
    .name("Min");
  WaveLen.add(material.uniforms.uWaveLenMax.value, prop)
    .min(0.001)
    .max(2)
    .name("Max");

  const Amplitude = waveGUI.addFolder("Amplitude");
  Amplitude.add(material.uniforms.uAmplitudeMin.value, prop)
    .min(0)
    .max(1)
    .name("Min");
  Amplitude.add(material.uniforms.uAmplitudeMax.value, prop)
    .min(0)
    .max(1)
    .name("Max");

  const Slope = waveGUI.addFolder("Slope");
  Slope.add(material.uniforms.uSlopeMin.value, prop).min(0).max(1).name("Min");
  Slope.add(material.uniforms.uSlopeMax.value, prop).min(0).max(1).name("Max");
}
console.log(new THREE.Vector4(0.7, 0.7));

// Mesh
const mesh = new THREE.Mesh(geometry, material);
sceneRTT.add(mesh);

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

const cameraRTT = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
cameraRTT.position.set(0.25, -0.25, 1);
sceneRTT.add(cameraRTT);

// Controls
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

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // Render
  
  // Render first scene into texture

  renderer.setRenderTarget( rtTexture );
  renderer.clear();
  renderer.render( sceneRTT, cameraRTT );

  // Render full screen quad with generated texture

  
  // renderer.clear();
  // renderer.render( sceneScreen, cameraRTT );

  // Render second scene to screen
  // (using first scene as regular texture)

  renderer.setRenderTarget( null );
  renderer.render( scene, camera );

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
