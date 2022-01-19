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
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let camera: any;
const initWebGL = () => {
  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  /**
   * Camera
   */
  // Base camera
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(0, 0, -1.5);
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
    texture
    // new THREE.MeshBasicMaterial({ map: rtTexture.texture })
  );
  plane.scale.x = 1.33;

  /**
   * Models
   */
  const gltfLoader = new GLTFLoader();

  let screenMesh: THREE.Mesh;
  gltfLoader.load(
    "/models/screen2.glb",
    (gltf) => {
      console.log("success");
      // console.log(gltf);
      // screenMesh = gltf.scene.children[0];

      screenMesh = gltf.scene.children[0] as any;
      screenMesh.material = texture;
      screenMesh.scale.y *= -1;
      screenMesh.rotateY(Math.PI * 0.5);
      console.log(screenMesh);
      scene.add(screenMesh);
    },
    (progress) => {
      console.log("progress");
      console.log(progress);
    },
    (error) => {
      console.log("error");
      console.log(error);
    }
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
  // scene.add(plane);

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

  const tick = () => {
    stats.begin();

    const deltaTime = DeltaTime();
    // Update controls
    controls.update();

    screenTick(deltaTime);

    // plane.material.map = renderLag()

    // renderer.setRenderTarget(XXrtTexture);
    // renderer.render(sceneRTT, cameraRTT);

    // renderer.setRenderTarget(rtTexture);
    // renderer.clear();
    // renderer.render(sceneRTT, cameraRTT);

    // plane.material.map = XXrtTexture.texture

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // composer.render()
    // renderer.render(sceneRTT, cameraRTT);

    stats.end();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  window.onload = tick;
};

export { initWebGL, camera };

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();

// Canvas
