import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as THREE from "three";
import { Assists } from "../loader";
import { Change } from "../../terminal";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const textColor = "#f99021";

type FontInfo = {
  font: undefined | Font;
  size: number;
  height: number;
  width: number;
  leading: number;
  tracking: number;
};

const h1Font: FontInfo = (function () {
  let size = 0.05;
  let height = size;
  let width = size;
  let leading = height * 2;
  let tracking = width * 0.4;
  return { font: undefined, size, height, width, leading, tracking };
})();

const h2Font: FontInfo = (function () {
  const size = 0.04;
  const height = size;
  const width = size * 0.8;
  const leading = height * 2;
  const tracking = width * 0.22;
  return { font: undefined, size, height, width, leading, tracking };
})();

const h3Font: FontInfo = (function () {
  const size = 0.03;
  const height = size;
  const width = size * 0.8;
  const leading = height * 2.5;
  const tracking = width * 0.22;
  return { font: undefined, size, height, width, leading, tracking };
})();

declare const screenWidth: number;

const paragraphFont: FontInfo = (function () {
  const size = 0.0275;
  const height = size;
  const width = size * 0.8;
  const leading = height * 2.5;
  const tracking = width * 0.22;
  return { font: undefined, size, height, width, leading, tracking };
})();

const breakFont: FontInfo = (function () {
  const size = 0.025;
  const height = size;
  const width = size * 0.8;
  const leading = height * 1.6;
  const tracking = width;
  return { font: undefined, size, height, width, leading, tracking };
})();

export default function ScreenTextEngine(
  assists: Assists,
  sceneRTT: THREE.Scene
) {
  h1Font.font = assists.publicPixelFont;
  h2Font.font = assists.chillFont;
  h3Font.font = assists.chillFont;
  paragraphFont.font = assists.chillFont;

  const rootGroup = new THREE.Group();
  sceneRTT.add(rootGroup);

  const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });

  const textColorMesh = new THREE.Mesh(
    new TextGeometry("", {
      font: h1Font.font as any,
      size: h1Font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    }),
    textMaterial
  );
  rootGroup.add(textColorMesh);

  const textBlackMesh = new THREE.Mesh(
    new TextGeometry("", {
      font: h1Font.font as any,
      size: h1Font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  rootGroup.add(textBlackMesh);

  const textBgMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(0, 0),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  rootGroup.add(textBgMesh);

  const caret = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(h2Font.size, h2Font.size * 1.6),
    textMaterial
  );
  caret.position.z = -0.1;
  rootGroup.add(caret);

  let charUnderCaret: THREE.Mesh | undefined = undefined;
  function updateCharUnderCaret(isBlack: boolean) {
    if (charUnderCaret)
      (charUnderCaret.material as THREE.MeshBasicMaterial).color =
        new THREE.Color(isBlack ? "black" : textColor);
  }

  let caretTimeSinceUpdate = 1;
  function updateCaret(pos?: number) {
    const charPos = {
      x: charNextLoc.x,
      y: -charNextLoc.y,
    };
    updateCharUnderCaret(false);
    charUnderCaret = undefined;

    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(screenWidth / charWidth);

    if (pos !== undefined) {
      charPos.x =
        charNextLoc.x +
        charWidth * ((pos + terminalPromptOffset) % charsPerLine);
      charPos.y = -(
        charNextLoc.y +
        h2Font.leading * Math.floor((pos + terminalPromptOffset) / charsPerLine)
      );

      if (pos < inputBuffer.length) {
        charPos.y = inputBuffer[pos].position.y;

        updateCharUnderCaret(false);
        charUnderCaret = inputBuffer[pos];
      }
    }

    let x = charPos.x + h2Font.size / 2;
    let y = charPos.y - h2Font.size / 1.9;

    if (x > screenWidth) {
      y -= h2Font.leading;
      x = h2Font.size / 2;
    }
    caret.position.x = x;
    caret.position.y = y;
    caretTimeSinceUpdate = 0;
  }

  let inputBuffer: THREE.Mesh[] = [];
  const charNextLoc = {
    x: 0,
    y: 0,
  };

  function generateGeometry(props: {
    str: string;
    font: FontInfo;
    highlight?: boolean;
    wrap?: boolean;
    isWord?: boolean;
    updateCharNextLoc?: boolean;
  }): {
    colorText: undefined | TextGeometry;
    blackText: undefined | TextGeometry;
    bg: undefined | THREE.PlaneBufferGeometry;
  } {
    props.wrap = props.wrap !== undefined ? props.wrap : false;
    props.isWord = props.isWord !== undefined ? props.isWord : false;
    props.updateCharNextLoc =
      props.updateCharNextLoc !== undefined ? props.updateCharNextLoc : true;

    const strLen = (props.font.width + props.font.tracking) * props.str.length;
    const strWrapLen = props.isWord
      ? (props.font.width + props.font.tracking) * (props.str.length - 1)
      : props.font.width * props.str.length;

    let x = charNextLoc.x;
    let y = charNextLoc.y;

    if (props.wrap && strWrapLen + x > screenWidth) {
      y += props.font.leading;
      x = 0;
    }

    const returnObj: {
      colorText: undefined | TextGeometry;
      blackText: undefined | TextGeometry;
      bg: undefined | THREE.PlaneBufferGeometry;
    } = {
      colorText: undefined,
      blackText: undefined,
      bg: undefined,
    };

    const textGeometry = new TextGeometry(props.str, {
      font: props.font.font as any,
      size: props.font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });

    if (props.updateCharNextLoc)
      textGeometry.translate(x, -props.font.height - y, -0.001);
    else textGeometry.translate(0, -props.font.height, -0.001);

    if (props.highlight) {
      const background = new THREE.PlaneBufferGeometry(
        strLen + props.font.tracking * 2,
        props.font.height + props.font.leading / 2,
        1,
        1
      );

      background.translate(
        strLen / 2 - props.font.tracking / 2 + x,
        -props.font.height / 2 - y,
        -0.01
      );

      returnObj.blackText = textGeometry;
      returnObj.bg = background;
    } else {
      returnObj.colorText = textGeometry;
    }

    if (props.updateCharNextLoc) {
      charNextLoc.x = strLen + x;
      charNextLoc.y = y;
    }

    return returnObj;
  }

  function mergeGeometriesWithMesh(
    baceMesh: THREE.Mesh,
    geometries: THREE.BufferGeometry[]
  ) {
    const baceGeometry = baceMesh.geometry;
    geometries.push(baceGeometry);
    baceMesh.geometry = mergeBufferGeometries(geometries);
    baceGeometry.dispose();
  }

  function placeLinebreak(font: FontInfo) {
    charNextLoc.x = 0;
    charNextLoc.y += font.leading;
  }

  type MDtoken = {
    type: "h1" | "h2" | "h3" | "p" | "br" | "img";
    emphasis: boolean;
    value: string;
  };
  function placeMarkdown(md: string) {
    const yBefore = charNextLoc.y;

    const tokens: MDtoken[] = [];

    let currentToken: undefined | MDtoken = undefined;
    for (let i = 0; i < md.length; i++) {
      // fix error with CRLF
      if (md[i] === "\r") continue;

      // h1, h2, h3
      if (currentToken === undefined && md[i] === "#") {
        let type: "h1" | "h2" | "h3" = "h1";
        if (i + 1 < md.length && md[i + 1] === "#") {
          type = "h2";
          i++;
          if (i + 1 < md.length && md[i + 1] === "#") {
            type = "h3";
            i++;
          }
        }
        if (i + 1 < md.length && md[i + 1] === " ") {
          i++;
        }
        currentToken = {
          type: type,
          emphasis: false,
          value: "",
        };
      }
      // br
      else if (md[i] === "\n") {
        if (currentToken !== undefined) {
          tokens.push(currentToken);
          currentToken = undefined;
        }
        tokens.push({
          type: "br",
          emphasis: false,
          value: "",
        });
      }
      // img
      else if (currentToken === undefined && md[i] === "!") {
        currentToken = {
          type: "img",
          emphasis: false,
          value: "",
        };
      }
      // p
      else if (currentToken === undefined) {
        currentToken = {
          type: "p",
          emphasis: false,
          value: md[i],
        };
      } else if (md[i] === "*") {
        if (currentToken === undefined) {
          currentToken = { type: "p", emphasis: true, value: "" };
        } else {
          tokens.push(currentToken);
          currentToken = {
            type: currentToken.type,
            emphasis: !currentToken.emphasis,
            value: "",
          };
        }

        // add char to token
      } else {
        currentToken.value += md[i];
      }
    }
    if (currentToken !== undefined) {
      tokens.push(currentToken);
    }

    const textColorGeometry: TextGeometry[] = [];
    const textBlackGeometry: TextGeometry[] = [];
    const textBgGeometry: THREE.PlaneBufferGeometry[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const geometry = [];
      switch (t.type) {
        case "h1":
          geometry.push(
            generateGeometry({
              str: t.value,
              font: h1Font,
              highlight: t.emphasis,
            })
          );
          break;
        case "h2":
          geometry.push(
            generateGeometry({
              str: t.value,
              font: h2Font,
              highlight: t.emphasis,
            })
          );
          break;
        case "h3":
          geometry.push(
            generateGeometry({
              str: t.value,
              font: h3Font,
              highlight: t.emphasis,
            })
          );
          break;
        case "img":
          placeImage(t.value);
          break;
        case "p":
          const words = t.value.split(" ");
          for (let word of words) {
            geometry.push(
              generateGeometry({
                str: word + " ",
                font: paragraphFont,
                highlight: t.emphasis,
                wrap: true,
                isWord: true,
              })
            );
          }
          break;
        case "br":
          let font = breakFont;
          if (i > 0) {
            const type = tokens[i - 1].type;
            switch (type) {
              case "h1":
                font = h1Font;
                break;
              case "h2":
                font = h2Font;
                break;
              case "h3":
                font = h3Font;
                break;
              case "p":
                font = paragraphFont;
                break;
              default:
                break;
            }
          }
          placeLinebreak(font);
          break;
      }
      for (const g of geometry) {
        if (g.colorText) textColorGeometry.push(g.colorText);
        if (g.blackText) textBlackGeometry.push(g.blackText);
        if (g.bg) textBgGeometry.push(g.bg);
      }
    }

    mergeGeometriesWithMesh(textColorMesh, textColorGeometry);
    mergeGeometriesWithMesh(textBlackMesh, textBlackGeometry);
    mergeGeometriesWithMesh(textBgMesh, textBgGeometry);

    const yAfter = charNextLoc.y - yBefore;
    return yAfter;
  }

  let terminalPromptOffset = 0;
  function placeText(str: string) {
    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(screenWidth / charWidth);

    let numOfLines = 0;

    const strWithNewline = str.split("\n");

    for (let i = 0; i < strWithNewline.length; i++) {
      const inputBuffer = [];
      for (const char of strWithNewline[i]) {
        const colorText = generateGeometry({
          str: char,
          font: h2Font,
          updateCharNextLoc: false,
        }).colorText;
        if (colorText) inputBuffer.push(colorText);
      }
      terminalPromptOffset = 0;
      oldNumberOfInputLines = 0;
      updateCharPos(
        inputBuffer,
        (obj, x, y) => {
          (obj as TextGeometry).translate(x, y, 0);
        },
        false
      );

      mergeGeometriesWithMesh(textColorMesh, inputBuffer);

      const overFlow = Math.floor(inputBuffer.length / charsPerLine);

      for (let i = 0; i < overFlow; i++) {
        numOfLines += 1;
        placeLinebreak(h2Font);
      }

      if (i < strWithNewline.length - 1) {
        placeLinebreak(h2Font);
        numOfLines += 1;
      } else {
        terminalPromptOffset = strWithNewline[i].length + 1;
        updateCaret(0);
      }
    }
    return numOfLines;
  }

  function delChar(charsTODel: THREE.Mesh[]) {
    for (const c of charsTODel) {
      rootGroup.remove(c);
      c.geometry.dispose();
      (c.material as THREE.Material).dispose();
    }
  }

  let oldNumberOfInputLines = 0;
  function updateCharPos(
    inputBuffer: THREE.Mesh[] | TextGeometry[],
    helper: (obj: THREE.Mesh | TextGeometry, x: number, y: number) => void,
    shouldScroll: boolean
  ) {
    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(screenWidth / charWidth);

    for (let i = 0; i < inputBuffer.length; i++) {
      const x =
        charNextLoc.x + charWidth * ((i + terminalPromptOffset) % charsPerLine);
      const y = -(
        charNextLoc.y +
        h2Font.leading * Math.floor((i + terminalPromptOffset) / charsPerLine)
      );
      helper(inputBuffer[i], x, y);
    }

    // Scroll if more then one line
    if (shouldScroll) {
      const newNumberOfInputLines = Math.floor(
        (inputBuffer.length + terminalPromptOffset) / charsPerLine
      );
      if (newNumberOfInputLines > oldNumberOfInputLines)
        scroll(newNumberOfInputLines - oldNumberOfInputLines, "lines");
      else scroll(newNumberOfInputLines - oldNumberOfInputLines, "lines");
      oldNumberOfInputLines = newNumberOfInputLines;
    }
  }

  function userInput(change: Change, selectionPos: number) {
    if (change.type === "add") {
      if (change.loc === "end") {
        caret.visible = true;
        for (const char of change.str) {
          const textObj = new THREE.Mesh(
            generateGeometry({
              str: char,
              font: h2Font,
              updateCharNextLoc: false,
            }).colorText,
            textMaterial.clone()
          );

          inputBuffer.push(textObj);
          updateCharPos(
            inputBuffer,
            (obj, x, y) => {
              obj = obj as THREE.Mesh;
              obj.position.set(x, y, 0);
              rootGroup.add(obj);
            },
            true
          );
        }
      } else if (typeof change.loc === "number") {
        const newChars: THREE.Mesh[] = [];
        for (const char of change.str) {
          newChars.push(
            new THREE.Mesh(
              generateGeometry({
                str: char,
                font: h2Font,
                updateCharNextLoc: false,
              }).colorText,
              textMaterial.clone()
            )
          );
        }
        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...newChars,
          ...inputBuffer.slice(change.loc, inputBuffer.length),
        ];
        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj = obj as THREE.Mesh;
            obj.position.set(x, y, 0);
            rootGroup.add(obj);
          },
          true
        );
      }
    } else if (change.type === "del") {
      if (change.loc === "end") {
        const charsTODel = inputBuffer.slice(-change.str.length);
        inputBuffer = inputBuffer.slice(0, -change.str.length);
        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj = obj as THREE.Mesh;
            obj.position.set(x, y, 0);
          },
          true
        );
        delChar(charsTODel);
      } else if (typeof change.loc === "number") {
        const charsTODel = inputBuffer.slice(
          change.loc,
          change.loc + change.str.length
        );
        delChar(charsTODel);

        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...inputBuffer.slice(
            change.loc + change.str.length,
            inputBuffer.length
          ),
        ];
        updateCharPos(
          inputBuffer,
          (obj, x, y) => {
            obj = obj as THREE.Mesh;
            obj.position.set(x, y, 0);
          },
          true
        );
      }
    }
    updateCaret(selectionPos);
  }

  function freezeInput() {
    const textGeometry = [];
    for (const c of inputBuffer) {
      c.geometry.translate(c.position.x, c.position.y, 0);
      textGeometry.push(c.geometry);
      (c.material as THREE.Material).dispose();
    }
    mergeGeometriesWithMesh(textColorMesh, textGeometry);

    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(screenWidth / charWidth);
    const newNumberOfInputLines = Math.floor(
      (inputBuffer.length + terminalPromptOffset) / charsPerLine
    );
    charNextLoc.y += h2Font.leading * newNumberOfInputLines;
  }

  let maxScroll = rootGroup.position.y;
  function scroll(
    val: number,
    units: "lines" | "px",
    options = {
      updateMaxScroll: true,
      moveView: true,
    }
  ) {
    let amount = val;
    if (units === "lines") amount *= h2Font.leading;
    if (options.moveView) rootGroup.position.y += amount;
    if (options.updateMaxScroll) maxScroll += amount;

    if (rootGroup.position.y < 0) rootGroup.position.y = 0;
    if (rootGroup.position.y > maxScroll) rootGroup.position.y = maxScroll;
  }
  function scrollToEnd() {
    if (rootGroup.position.y !== maxScroll) rootGroup.position.y = maxScroll;
  }

  function placeImage(val: string) {
    const urlMatch = val.match(/\(.+\)/);
    if (!urlMatch || urlMatch.length === 0) return;
    const [url, rawParams] = urlMatch[0].slice(1, -1).split("?");
    const params = new URLSearchParams(rawParams);

    const aspectRatio = parseFloat(params.get("aspect") ?? "");
    if (Number.isNaN(aspectRatio))
      throw new Error(
        `Error for image at: '${url}'. Image must have aspect ratio like this: '/path/to/image?aspect=1.5'`
      );
    const widthParam = parseFloat(params.get("width") ?? "");
    const width = Number.isNaN(widthParam) ? 1 : widthParam;

    const height = width / aspectRatio;

    const imageFrame = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(width, height, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    imageFrame.position.set(1.4 / 2, -height * 0.5 - charNextLoc.y, -0.02);
    if (!params.get("noflow")) charNextLoc.y += height;
    rootGroup.add(imageFrame);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (tex) => {
      tex.magFilter = THREE.NearestFilter;
      imageFrame.material = new THREE.MeshBasicMaterial({ map: tex });
    });
  }

  function tick(deltaTime: number, elapsedTime: number) {
    if (caretTimeSinceUpdate > 1 && Math.floor(elapsedTime * 2) % 2 == 0) {
      caret.visible = false;
      updateCharUnderCaret(false);
    } else {
      caret.visible = true;
      updateCharUnderCaret(true);
    }

    caretTimeSinceUpdate += deltaTime;
  }

  return {
    tick,
    userInput,
    placeMarkdown,
    placeText,
    scroll,
    scrollToEnd,
    freezeInput,
  };
}
