import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DeltaTime from "../DeltaTime";
import { ExternalsPlugin } from "webpack";
import Screen from "./screen/";
import Stats from "stats.js";
import { loadAssists } from "./loader";

let camera: any;
export default function WebGL() {
  loadAssists((assists) => {
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
    camera.rotation.set(-Math.PI, 0, Math.PI);
    scene.add(camera);

    // Controls
    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;

    const screenMeshTargetRotation = { x: 0, y: Math.PI * 0.5 };
    document.addEventListener("mousemove", (event) => {
      const mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (event.clientY / window.innerHeight - 0.5) * -2;
      // console.log(mouse)
      // console.log(camera.rotation)
      screenMeshTargetRotation.x = mouseY * (Math.PI / 32);
      screenMeshTargetRotation.y = mouseX * (Math.PI / 32) + Math.PI * 0.5;
    });

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

    const screen = Screen(assists, renderer);

    const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const plane = new THREE.Mesh(
      planelikeGeometry,
      // texture
      new THREE.MeshBasicMaterial({ color: "blue" })
    );
    plane.scale.x = 1.33;
    // scene.add(plane);

    /**
     * Models
     */
    assists.screenMesh.material = screen.screenRenderEngine.material;
    assists.screenMesh.scale.y *= -1;
    assists.screenMesh.rotateY(Math.PI * 0.5);
    console.log(assists.screenMesh);
    scene.add(assists.screenMesh);

    /**
     * Animate
     */

    const clock = new THREE.Clock();
    const tick = () => {
      stats.begin();

      const deltaTime = DeltaTime();
      const elapsedTime = clock.getElapsedTime();

      // Update controls
      // controls.update();
      if (assists.screenMesh) {
        assists.screenMesh.rotation.x =
          screenMeshTargetRotation.x * 0.05 +
          assists.screenMesh.rotation.x * 0.95;
        assists.screenMesh.rotation.y =
          screenMeshTargetRotation.y * 0.05 +
          assists.screenMesh.rotation.y * 0.95;
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
