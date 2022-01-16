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
  shaderToScreen: ShaderToScreen;
  outputTexture: THREE.WebGLRenderTarget;

  //  lagTex: THREE.WebGLRenderTarget;
  lagMat: THREE.ShaderMaterial;
  constructor(buffer: THREE.WebGLRenderTarget, width: number, height: number) {
    this.lagMat = new THREE.ShaderMaterial();

    this.shaderToScreen = new ShaderToScreen(
      buffer,
      {
        uniforms: {
          uDiffuse: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: lagFragmentShader,
      },
      width,
      height
    );
    this.outputTexture = this.shaderToScreen.outputTexture
  }


  render(renderer: THREE.WebGLRenderer, tex?: THREE.Texture) {
    
    this.shaderToScreen.render(renderer)

    // lagTex.dispose()
    // lagTex = rtTexture.clone()
    // lagTex.setTexture(rtTexture.texture.clone())

    // lagMat.uniforms.uLagTex.value = lagTex.texture
  }
}

export { Lag };
