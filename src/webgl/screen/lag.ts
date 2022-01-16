import * as THREE from "three";
// import { seededRandom } from "three/src/math/MathUtils";

let sceneRTT: any;
let cameraRTT: any;
let renderer: any;
let rtTexture: any;

function initLag(width: number, height: number, canvas: any) {
  const aspect = width / height;
  sceneRTT = new THREE.Scene();
  //   cameraRTT  = new THREE.PerspectiveCamera(
  //     75,
  //     1,
  //     0.1,
  //     100
  //   );
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
    new THREE.PlaneGeometry(0.9 * aspect, 0.9, 1, 1),
    new THREE.MeshBasicMaterial({color: 'red'})
    // new THREE.MeshBasicMaterial({ color: 'red' })
  );
  //   plane.position.set(0,0.5,0)
  //   plane.scale.set(0.1,0.1,1)
  sceneRTT.add(plane);
  //   sceneRTT.add(plane);
  sceneRTT.add(new THREE.AxesHelper(0));

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  //   renderer.setSize(width, height);

  rtTexture = new THREE.WebGLRenderTarget(512, 512, {
    format: THREE.RGBFormat,
  });

  return [sceneRTT, cameraRTT, rtTexture]

  
}

function renderLag(tex?: THREE.Texture) {
    renderer.setRenderTarget(rtTexture);
  (renderer as THREE.Renderer) .render(sceneRTT, cameraRTT);


//   renderer.setRenderTarget(rtTexture);
    renderer.clear();
    renderer.render(sceneRTT, cameraRTT);

    console.log(rtTexture.texture)
//   return (rtTexture as THREE.WebGLRenderTarget);
return rtTexture.texture
}

export { initLag, renderLag };
