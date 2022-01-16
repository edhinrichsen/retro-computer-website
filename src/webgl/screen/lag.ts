import * as THREE from "three";
// import { seededRandom } from "three/src/math/MathUtils";

let sceneRTT: any;
let cameraRTT: any;
let rtTexture: any;

function initLag(buffer: THREE.WebGLRenderTarget, width: number, height: number) {
  const aspect = width / height;
  sceneRTT = new THREE.Scene();
  cameraRTT = new THREE.OrthographicCamera(
    -0.5 * aspect,
    0.5 * aspect,
    0.5,
    -0.5,
    1,
    3
  );
  cameraRTT.position.set(0, 0, 1);
  sceneRTT.add(cameraRTT);
  cameraRTT.position.set(0, 0, 1);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1 * aspect, 1, 1, 1),
    new THREE.MeshBasicMaterial({map: buffer.texture})
    // new THREE.MeshBasicMaterial({ color: 'red' })
  );
  //   plane.position.set(0,0.5,0)
  //   plane.scale.set(0.1,0.1,1)
  sceneRTT.add(plane);
  //   sceneRTT.add(plane);
  sceneRTT.add(new THREE.AxesHelper(0));


  rtTexture = new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBFormat,
  });

  return rtTexture

  
}

function renderLag(renderer: THREE.WebGLRenderer, tex?: THREE.Texture) {
    renderer.setRenderTarget(rtTexture);
    renderer.clear();
    renderer.render(sceneRTT, cameraRTT);
}

export { initLag, renderLag };
