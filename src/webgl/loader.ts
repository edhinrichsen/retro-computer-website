import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Assists = {
  screenMesh: THREE.Mesh;
  computerMesh: THREE.Mesh;
  crtMesh: THREE.Mesh;
  keyboardMesh: THREE.Mesh;
  shadowPlaneMesh: THREE.Mesh;
  bakeTexture: THREE.Texture;
  bakeFloorTexture: THREE.Texture;
  // glossMap: THREE.Texture;
  publicPixelFont: Font;
  chillFont: Font;
  environmentMapTexture: THREE.CubeTexture;
};

function loadAssists(callback: (assists: Assists) => any) {
  const assists: any = {};

  const loadingDOM = document.querySelector("#loading");
  const loadingItemsDOM = document.querySelector("#loading-items");
  const loadingBarDOM = document.querySelector("#loading-bar-progress");

  const manager = new THREE.LoadingManager();

  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log(
      "Started loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onLoad = function () {
    if (!loadingItemsDOM) return;
    loadingItemsDOM.textContent = `Nearly There...`;

    console.log("Loading complete!");
    window.setTimeout(() => {
      (loadingDOM as any).style.opacity = "0";
      callback(assists as Assists);
    }, 200);
    window.setTimeout(() => {
      (loadingDOM as any).style.display = "none";
    }, 500);
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    if (!loadingItemsDOM || !loadingBarDOM) return;
    (loadingBarDOM as HTMLElement).style.transform = `scaleX(${
      itemsLoaded / itemsTotal
    })`;
    loadingItemsDOM.textContent = `${itemsLoaded} of ${itemsTotal} File Loaded: ${url}`;
    console.log(
      "Loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  // Fonts
  const fontLoader = new FontLoader(manager);
  fontLoader.load("/fonts/public-pixel.json", (font) => {
    assists.publicPixelFont = font;
  });
  fontLoader.load("/fonts/chill.json", (font) => {
    assists.chillFont = font;
  });

  // Texture

  // Texture
  const textureLoader = new THREE.TextureLoader(manager);
  textureLoader.load("/textures/bake_4096_hc.jpg", (tex) => {
    tex.flipY = false;
    tex.encoding = THREE.sRGBEncoding;
    assists.bakeTexture = tex;
  });

  textureLoader.load("/textures/bake_floor.jpg", (tex) => {
    tex.flipY = false;
    tex.encoding = THREE.sRGBEncoding;
    assists.bakeFloorTexture = tex;
  });

  // textureLoader.load("/textures/HandleRubberSmooth001_GLOSS_3K.jpg", (tex) => {
  //   tex.
  //   assists.glossMap = tex;

  // })

  const cubeTextureLoader = new THREE.CubeTextureLoader(manager);

  const num = 7;
  cubeTextureLoader.load(
    // [
    //   "/textures/environmentMaps/2/px.jpg",
    //   "/textures/environmentMaps/2/nx.jpg",
    //   "/textures/environmentMaps/2/py.jpg",
    //   "/textures/environmentMaps/2/ny.jpg",
    //   "/textures/environmentMaps/2/pz.jpg",
    //   "/textures/environmentMaps/2/nz.jpg",
    // ],
    [
      `/textures/environmentMaps/${num}/px.png`,
      `/textures/environmentMaps/${num}/nx.png`,
      `/textures/environmentMaps/${num}/py.png`,
      `/textures/environmentMaps/${num}/ny.png`,
      `/textures/environmentMaps/${num}/pz.png`,
      `/textures/environmentMaps/${num}/nz.png`,
    ],
    (tex) => {
      assists.environmentMapTexture = tex;
    }
  );

  // Mesh
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.load("/models/Commodore710_36.glb", (gltf) => {
    // gltfLoader.load("/models/screen2.glb", (gltf) => {
    // assists.screenMesh = gltf.scene.children[0] as any;
    const computer = new THREE.Group();
    assists.screenMesh = gltf.scene.children.find((m) => m.name === "Screen");
    assists.computerMesh = gltf.scene.children.find(
      (m) => m.name === "Computer"
    );
    assists.crtMesh = gltf.scene.children.find((m) => m.name === "CRT");
    assists.keyboardMesh = gltf.scene.children.find(
      (m) => m.name === "Keyboard"
    );
    assists.shadowPlaneMesh = gltf.scene.children.find(
      (m) => m.name === "ShadowPlane"
    );
    // assists.crtMesh.morphTargetInfluences[ 0 ] = 1;
    // console.log(assists.crtMesh.geometry.morphAttributes);


    // assists.computerMesh.geometry.translate(0.5,0.5,0.5)
    // assists.keyboardMesh.geometry = mergeBufferGeometries([
    //   assists.computerMesh.geometry,
    //   assists.keyboardMesh.geometry,
    // ]);
 
  });
}

export { loadAssists };
export type { Assists };
