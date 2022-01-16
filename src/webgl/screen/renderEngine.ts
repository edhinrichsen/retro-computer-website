import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// @ts-ignore
import vertexShader from "../shaders/vertex.vert";
// @ts-ignore
import noiseFragmentShader from "../shaders/noise.frag";
import { Lag } from "./lag";
import DeltaTime from "../../DeltaTime";
import { ShaderToScreen } from "./shaderToScreen";

export function screenRenderEngine(
  renderer: THREE.WebGLRenderer,
  sceneRTT: THREE.Scene
): [() => void, THREE.Material] {
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

  const lag = new Lag(composer.readBuffer, 512 * 1.33, 512);
  noiseMat.uniforms.uDiffuse.value = lag.outputTexture.texture;

  let uProgress = 1.2;
  const clock = new THREE.Clock();
  const render = () => {
    const deltaTime = DeltaTime();
    const elapsedTime = clock.getElapsedTime();

    noiseMat.uniforms.uTime.value = elapsedTime;
    noiseMat.uniforms.uProgress.value = uProgress;

    shaderToScreen.shader.uniforms.uTime.value = elapsedTime;
    shaderToScreen.shader.uniforms.uProgress.value = uProgress;

    shaderToScreen.render(renderer);

    uProgress -= deltaTime * 0.2;
    if (uProgress < 0) uProgress = 1.2;

    lag.render(renderer);
    composer.render();
  };

  // **********************************

  const cubeTextureLoader = new THREE.CubeTextureLoader();

  const environmentMapTexture = cubeTextureLoader.load([
    "/textures/environmentMaps/1/px.jpg",
    "/textures/environmentMaps/1/nx.jpg",
    "/textures/environmentMaps/1/py.jpg",
    "/textures/environmentMaps/1/ny.jpg",
    "/textures/environmentMaps/1/pz.jpg",
    "/textures/environmentMaps/1/nz.jpg",
  ]);

  const shaderToScreen = new ShaderToScreen(
    {
      uniforms: {
        uDiffuse: { value: lag.outputTexture.texture },
        uTime: { value: 1 },
        uProgress: { value: 1.2 },
      },
      vertexShader: vertexShader,
      fragmentShader: noiseFragmentShader,
    },
    512 * 1.33,
    512
  );

  const material = new THREE.MeshStandardMaterial();
  material.metalness = 0;
  material.roughness = 0;
  material.envMap = environmentMapTexture;
  material.map = shaderToScreen.outputTexture.texture;
  material.color.set("#fff");

  

  // return [render, noiseMat];
  return [render, material];
}
