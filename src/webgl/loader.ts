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
    // (loadingDOM as any).style.display = "none";
    //   canvas.style.display = "block";
    callback(assists as Assists);
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // const node = document.createElement("li");
    // node.append("Loading file: " + url);
    // loadingListDOM?.append(node);
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

  // Mesh
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.load("/models/screen2.glb", (gltf) => {
    assists.screenMesh = gltf.scene.children[0] as any;
  });

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
}

export { loadAssists };
export type { Assists };
