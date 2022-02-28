import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DeltaTime from "../DeltaTime";
import { ExternalsPlugin } from "webpack";
import Screen from "./screen/";
import Stats from "stats.js";
import { loadAssists } from "./loader";
import { Vector3 } from "three";

function valMap(x: number, from: [number, number], to: [number, number]) {
  const y = ((x - from[0]) / (from[1] - from[0])) * (to[1] - to[0]) + to[0];

  if (to[0] < to[1]) {
    if (y < to[0]) return to[0];
    if (y > to[1]) return to[1];
  } else {
    if (y > to[0]) return to[0];
    if (y < to[1]) return to[1];
  }

  return y;
}

let scroll = 0;
window.addEventListener("scroll", (ev) => {
  scroll = window.scrollY / document.documentElement.clientHeight;
  // console.log(window.scrollY / document.documentElement.clientHeight);
});

export default function WebGL() {
  loadAssists((assists) => {
    const stats = new Stats();
    const hash = window.location.hash;
    if (hash) {
      switch (hash.toLowerCase()) {
        case "#fps":
          stats.showPanel(0);
          document.body.appendChild(stats.dom);

          const textarea = document.getElementById(
            "textarea"
          ) as HTMLTextAreaElement;
          textarea.style.zIndex = "3";
          break;

        case "#ms":
          stats.showPanel(1);
          document.body.appendChild(stats.dom);
          break;

        default:
          break;
      }
    }

    // Canvas
    const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
    if (!canvas) console.error("no canvas");
    /**
     * Sizes
     */
    const widthOffset = 0.5;
    const sizes = {
      width: document.documentElement.clientWidth,
      // width: window.innerWidth / (widthOffset + 1),
      height: window.innerHeight,
      portraitOffset: valMap(
        window.innerHeight / document.documentElement.clientWidth,
        [0.75, 1.75],
        [0, 2]
      ),
    };

    // const sideBar = {
    //   left: document.querySelector("div#left") as HTMLDivElement,
    //   right: document.querySelector("div#right") as HTMLDivElement,
    // };

    // Scene
    const scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);
    scene.background = new THREE.Color(0xf6d4b1);

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      50,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 0, -2.5);
    // camera.position.set(0, -1, -5.5);
    camera.rotation.set(-Math.PI, 0, Math.PI);
    scene.add(camera);

    // Controls
    // const controls = new OrbitControls(camera, canvas);

    const controlProps = {
      computerHeight: 1.5,
      computerAngle: Math.PI * 0.2,
      computerHorizontal: 0.5,

      minAzimuthAngleOffest: -Math.PI * 0.3,
      maxAzimuthAngleOffest: Math.PI * 0.3,

      minPolarAngleOffest: -Math.PI * 0.3,
      maxPolarAngleOffest: 0,
    };

    let mousedown = false;
    const computerParallax = { x: 0, y: 0 };
    canvas.addEventListener("mousemove", (event) => {
      if (mousedown) {
        computerParallax.x = (event.clientX / window.innerWidth - 0.5) * 2;
        computerParallax.y = (event.clientY / window.innerHeight - 0.5) * 2;
      }
    });

    canvas.addEventListener("mousedown", (event) => {
      mousedown = true;
    });

    document.addEventListener("mouseup", (event) => {
      mousedown = false;
    });

    document.addEventListener("touchstart", (event) => {
      mousedown = false;
      computerParallax.x = 0;
      computerParallax.y = 0;
    });

    /**
     * Renderer
     */

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.render(sceneRTT, cameraRTT);

    function updateCanvasSize(width: number, height: number) {
      // Update camera
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener("resize", () => {
      // Update sizes

      sizes.width = document.documentElement.clientWidth;
      // sizes.width = window.innerWidth / (widthOffset + 1);
      sizes.height = window.innerHeight;
      updateCanvasSize(sizes.width, sizes.height);
      sizes.portraitOffset = valMap(
        sizes.height / sizes.width,
        [0.75, 1.75],
        [0, 2]
      );
      console.log(sizes.portraitOffset);
    });

    const screen = Screen(assists, renderer);

    const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const plane = new THREE.Mesh(
      planelikeGeometry,
      // texture
      new THREE.MeshBasicMaterial({ color: "blue" })
    );
    plane.scale.x = 1.33;
    // scene.add(plane);

    // Materials
    // const computerMaterial = new THREE.MeshStandardMaterial({ map: assists.bakeTexture});
    // computerMaterial.envMap = assists.environmentMapTexture
    // computerMaterial.roughnessMap = assists.glossMap
    const computerMaterial = new THREE.MeshBasicMaterial({
      map: assists.bakeTexture,
    });

    /**
     * Models
     */
    const computerGroup = new THREE.Group();

    assists.screenMesh.material = screen.screenRenderEngine.material;
    computerGroup.add(assists.screenMesh);

    assists.computerMesh.material = computerMaterial;
    computerGroup.add(assists.computerMesh);

    assists.crtMesh.material = computerMaterial;
    computerGroup.add(assists.crtMesh);

    assists.keyboardMesh.material = computerMaterial;
    computerGroup.add(assists.keyboardMesh);

    assists.shadowPlaneMesh.material = new THREE.MeshBasicMaterial({
      map: assists.bakeFloorTexture,
    });
    computerGroup.add(assists.shadowPlaneMesh);

    computerGroup.position.x = controlProps.computerHorizontal;
    computerGroup.position.y = controlProps.computerHeight;
    computerGroup.rotation.y = controlProps.computerAngle;
    scene.add(computerGroup);

    /**
     * Animate
     */

    const clock = new THREE.Clock();
    const tick = () => {
      stats.begin();

      const deltaTime = DeltaTime();
      const elapsedTime = clock.getElapsedTime();

      const zoomFac = valMap(scroll, [0, 1], [0, 1]);

      camera.position.z = valMap(
        scroll,
        [0, 1],
        [-2.5 - sizes.portraitOffset, -10 - sizes.portraitOffset]
      );

      computerGroup.position.x = controlProps.computerHorizontal * zoomFac;
      computerGroup.position.y = valMap(
        scroll,
        [0, 1],
        [0, controlProps.computerHeight]
      );

      computerGroup.rotation.y = controlProps.computerAngle * zoomFac;

      const parallaxFac = valMap(scroll, [0, 1], [0.2, 1.5]);
      camera.position.x =
        computerParallax.x * parallaxFac * 0.1 + camera.position.x * 0.9;
      camera.position.y =
        computerParallax.y * parallaxFac * 0.1 + camera.position.y * 0.9;

      // -Math.PI, 0, Math.PI
      camera.lookAt(new Vector3(0, 0, 0));

      canvas.style.opacity = `${valMap(scroll, [1.25, 1.75], [1, 0])}`;

      if (sizes.portraitOffset > 0)
        computerGroup.rotation.z = valMap(scroll, [0, 1], [-Math.PI / 2, 0]);
      else computerGroup.rotation.z = 0;

      if (assists.crtMesh.morphTargetInfluences) {
        assists.crtMesh.morphTargetInfluences[0] = valMap(
          zoomFac,
          [0, 0.1],
          [0.5, 0]
        );
      }

      screen.tick(deltaTime, elapsedTime);

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      stats.end();
      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  });
}
