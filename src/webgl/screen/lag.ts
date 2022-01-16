import * as THREE from "three";
// @ts-ignore
import vertexShader from "../shaders/vertex.vert";
// @ts-ignore
import lagFragmentShader from "../shaders/lag.frag";
import { ShaderToScreen } from "./shaderToScreen";
// import { seededRandom } from "three/src/math/MathUtils";

class Lag {
  sceneRTT: any;
  cameraRTT: any;
  outputCopy: ShaderToScreen;
  shaderToScreen1: ShaderToScreen;
  outputTexture: THREE.WebGLRenderTarget;
  needUpdate: boolean;

  //  lagTex: THREE.WebGLRenderTarget;
  lagMat: THREE.ShaderMaterial;
  constructor(buffer: THREE.WebGLRenderTarget, width: number, height: number) {
    this.lagMat = new THREE.ShaderMaterial();

    this.needUpdate = false;
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
    if (this.needUpdate) {
      this.shaderToScreen1.shader.uniforms.uNeedUpdate.value = true;

      this.shaderToScreen1.render(renderer);

      this.needUpdate = false;
      this.shaderToScreen1.shader.uniforms.uNeedUpdate.value = false;
    } else {
      this.shaderToScreen1.render(renderer);
    }

    this.outputCopy.render(renderer);

    // lagTex.dispose()
    // lagTex = rtTexture.clone()
    // lagTex.setTexture(rtTexture.texture.clone())

    // lagMat.uniforms.uLagTex.value = lagTex.texture
  }
}

export { Lag };
