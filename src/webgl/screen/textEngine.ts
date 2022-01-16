import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export function screenTextEngine() {
  const fontLoader = new FontLoader();
  let font: Font | undefined = undefined;
  fontLoader.load("/fonts/public-pixel.json", (_font) => {
    console.log("loaded");
    font = _font;
  });

  function addString(str: String){
      
  }

}
