import * as THREE from "three";
// @ts-ignore
import vertexShader from "../shaders/vertex.vert?raw";
// @ts-ignore
import lagFragmentShader from "../shaders/lag.frag?raw";
import { ShaderToScreen } from "./shaderToScreen";

class Lag {
  outputCopy: ShaderToScreen;
  shaderToScreen1: ShaderToScreen;
  outputTexture: THREE.WebGLRenderTarget;

  lagMat: THREE.ShaderMaterial;
  constructor(buffer: THREE.WebGLRenderTarget, width: number, height: number) {
    this.lagMat = new THREE.ShaderMaterial();
    this.shaderToScreen1 = new ShaderToScreen(
      {
        uniforms: {
          uDiffuse: { value: buffer.texture },
          uLagTex: { value: null },
          uNeedUpdate: { value: false },
        },
        vertexShader: vertexShader,
        fragmentShader: lagFragmentShader,
      },
      width,
      height
    );
    this.outputTexture = this.shaderToScreen1.outputTexture;

    this.outputCopy = new ShaderToScreen(
      {
        uniforms: {
          uDiffuse: { value: this.outputTexture.texture },
        },
        vertexShader: vertexShader,
        fragmentShader: `uniform sampler2D uDiffuse; varying vec2 vUv; void main() {gl_FragColor = texture2D(uDiffuse, vUv);}`,
      },
      width,
      height
    );

    this.shaderToScreen1.shader.uniforms.uLagTex.value =
      this.outputCopy.outputTexture.texture;
  }

  render(renderer: THREE.WebGLRenderer, tex?: THREE.Texture) {
    this.shaderToScreen1.render(renderer);
    this.outputCopy.render(renderer);
  }
}

export { Lag };
