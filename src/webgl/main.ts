import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "lil-gui";
// import testVertexShader from "./shaders/test/vertex.vert";
// import testFragmentShader from "./shaders/test/fragment.frag";
import { Uniform } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import DeltaTime from "../DeltaTime";
import { ExternalsPlugin } from "webpack";
import { initScreen } from "./screen/main";

export const initWebGL = () => {
  /**
   * Sizes
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Canvas
  const canvas: any = document.querySelector("canvas.webgl");
  if (!canvas) console.error("no canvas");

  // Scene
  const scene = new THREE.Scene();

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
  // renderer.render(sceneRTT, cameraRTT);

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

  const [screenTick, texture] = initScreen(renderer);

  const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const plane = new THREE.Mesh(
    planelikeGeometry,
    new THREE.MeshBasicMaterial({ map: texture }),
    // new THREE.MeshBasicMaterial({ color: 'red' })
  );

  // console.log(screenMap)
  // const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
  // const plane = new THREE.Mesh(
  //   planelikeGeometry,
  //   new THREE.MeshBasicMaterial({ map: screenMap }),
  //   // new THREE.MeshBasicMaterial({ color: 'red' })
  // );

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

  // sceneRTT.add(new THREE.AxesHelper(1));

  // scene.add(backGround)

  // Material

  // Mesh
  // const mesh = new THREE.Mesh(geometry, material);
  // sceneRTT.add(mesh);

  /**
   * Animate
   */

  const mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  const tick = () => {
    // Update controls
    controls.update();

    screenTick();

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // composer.render()
    // renderer.render(sceneRTT, cameraRTT);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  window.onload = tick;
};

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();

// Canvas
