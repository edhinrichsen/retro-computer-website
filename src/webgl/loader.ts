import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

type Assists = {
  screenMesh: THREE.Mesh;
  publicPixelFont: Font;
  chillFont: Font;
  environmentMapTexture: THREE.CubeTexture;
};

function loadAssists(callback: (assists: Assists) => any) {
  const assists: any = {};

  const loadingDOM = document.querySelector("#loading");
  const loadingListDOM = document.querySelector("#loading-list");
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
    console.log("Loading complete!");
    window.setTimeout(() => {
      (loadingDOM as any).style.opacity = "0";
      callback(assists as Assists);
    }, 500);
    window.setTimeout(() => {
      (loadingDOM as any).style.display = "none";
    }, 1000);
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const node = document.createElement("li");
    node.append(`${itemsLoaded} of ${itemsTotal} File Loaded: ${url}`);
    loadingListDOM?.append(node);
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
  const cubeTextureLoader = new THREE.CubeTextureLoader(manager);

  cubeTextureLoader.load(
    [
      "/textures/environmentMaps/2/px.jpg",
      "/textures/environmentMaps/2/nx.jpg",
      "/textures/environmentMaps/2/py.jpg",
      "/textures/environmentMaps/2/ny.jpg",
      "/textures/environmentMaps/2/pz.jpg",
      "/textures/environmentMaps/2/nz.jpg",
    ],
    (tex) => {
      assists.environmentMapTexture = tex;
    }
  );

  // Mesh
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.load("/models/screen2.glb", (gltf) => {
    assists.screenMesh = gltf.scene.children[0] as any;
  });
}

export { loadAssists };
export type { Assists };
