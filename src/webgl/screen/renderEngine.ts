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
import { Assists } from "../loader";

export function screenRenderEngine(
  assists: Assists,
  renderer: THREE.WebGLRenderer,
  sceneRTT: THREE.Scene
): [(deltaTime: number, elapsedTime: number) => void, THREE.Material] {
  const resolution = 512 + 64;
  // const resolution = 768
  // const resolution = 512

  const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.496, 0.1, -1.1, 1, 3);
  sceneRTT.add(cameraRTT);
  cameraRTT.position.set(0, 0, 1);

  const rtTexture = new THREE.WebGLRenderTarget(resolution * 1.33, resolution, {
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

  const lag = new Lag(composer.readBuffer, resolution * 1.33, resolution);
  noiseMat.uniforms.uDiffuse.value = lag.outputTexture.texture;

  let uProgress = 1.2;
  const tick = (deltaTime: number, elapsedTime: number) => {
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

  const environmentMapTexture = assists.environmentMapTexture;

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
    resolution * 1.33,
    resolution
  );

  const material = new THREE.MeshStandardMaterial();
  material.metalness = 0;
  material.roughness = 0.1;
  material.envMap = environmentMapTexture;
  material.map = shaderToScreen.outputTexture.texture;
  // material.color.set("#fff");

  // return [render, noiseMat];
  return [tick, material];
}
