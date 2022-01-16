import * as THREE from "three";
// @ts-ignore
import vertexShader from "../shaders/vertex.vert";
// @ts-ignore
import lagFragmentShader from "../shaders/lag.frag";
// import { seededRandom } from "three/src/math/MathUtils";

class ShaderToScreen {
  sceneRTT: any;
  cameraRTT: any;
  outputTexture: THREE.WebGLRenderTarget;
  shader: THREE.ShaderMaterial;
  constructor(
    buffer: THREE.WebGLRenderTarget,
    shader: THREE.ShaderMaterialParameters,
    width: number,
    height: number
  ) {
    const aspect = width / height;
    this.sceneRTT = new THREE.Scene();
    this.cameraRTT = new THREE.OrthographicCamera(
      -0.5 * aspect,
      0.5 * aspect,
      0.5,
      -0.5,
      1,
      3
    );
    this.cameraRTT.position.set(0, 0, 1);
    this.sceneRTT.add(this.cameraRTT);
    this.cameraRTT.position.set(0, 0, 1);

    this.outputTexture = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBFormat,
    });

    this.shader = new THREE.ShaderMaterial(shader);
    this.shader.uniforms.uDiffuse.value = buffer.texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1 * aspect, 1, 1, 1),
      this.shader
    );
    this.sceneRTT.add(plane);
    this.sceneRTT.add(new THREE.AxesHelper(0));

    // return rtTexture;
  }

  render(renderer: THREE.WebGLRenderer, tex?: THREE.Texture) {
    renderer.setRenderTarget(this.outputTexture);
    renderer.clear();
    renderer.render(this.sceneRTT, this.cameraRTT);

    // lagTex.dispose()
    // lagTex = rtTexture.clone()
    // lagTex.setTexture(rtTexture.texture.clone())

    // lagMat.uniforms.uLagTex.value = lagTex.texture
  }
}

export { ShaderToScreen };
