import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as THREE from "three";
import { Assists } from "../loader";
import { Change } from "../../terminal";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const textColor = "#f99021";
const screenWidth = 1.396;

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
  sceneRTT: THREE.Scene,
  startText: string,
  startTerminalPrompt: string
) {
  h1Font.font = assists.publicPixelFont;
  h2Font.font = assists.chillFont;
  h3Font.font = assists.chillFont;
  paragraphFont.font = assists.chillFont;

  const rootGroup = new THREE.Group();
  sceneRTT.add(rootGroup);
  const textColorMesh = new THREE.Mesh(
    new TextGeometry("", {
      font: h1Font.font as any,
      size: h1Font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    }),
    new THREE.MeshBasicMaterial({ color: textColor })
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

  const bgMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(0,0),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  rootGroup.add(bgMesh);

  const onFontLoad = () => {
    if (h1Font.font && h2Font.font && h3Font.font) {
      // placeHTML(startText, titleFont);
      placeMarkdown(startText);
      placeTerminalPrompt(startTerminalPrompt);
    }
  };

  const caret = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(h2Font.size, h2Font.size * 1.6),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  caret.position.z = -0.1;
  rootGroup.add(caret);

  let charUnderCaret: THREE.Group | undefined = undefined;
  function updateCharUnderCaret(isBlack: boolean) {
    if (charUnderCaret)
      (
        (charUnderCaret.children[0] as THREE.Mesh)
          .material as THREE.MeshBasicMaterial
      ).color = new THREE.Color(isBlack ? "black" : textColor);
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
    console.log(charPos);

    let x = charPos.x + h2Font.size / 2;
    let y = charPos.y - h2Font.size / 1.9;

    if (x > screenWidth) {
      y -= h2Font.leading;
      x = h2Font.size / 2;
    }
    caret.position.x = x;
    caret.position.y = y;
    // caret.position.set(x, y, 0);
    caretTimeSinceUpdate = 0;
  }

  let inputBuffer: THREE.Group[] = [];
  const charNextLoc = {
    x: 0,
    y: 0,
  };

  function placeStr(props: {
    str: string;
    font: FontInfo;
    highlight?: boolean;
    wrap?: boolean;
    isWord?: boolean;
    updateCharNextLoc?: boolean;
  }) {
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

    const charObj = new THREE.Group();
    // m.scale.y = height;hh
    // charObj.position.x = x;
    // charObj.position.y = -y;

    const textGeometry = new TextGeometry(props.str, {
      font: props.font.font as any,
      size: props.font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
    textGeometry.translate(x, -props.font.height - y, -0.001);

    function mergeGeometries(
      baceMesh: THREE.Mesh,
      geometries: THREE.BufferGeometry[]
    ) {
      const baceGeometry = baceMesh.geometry;
      geometries.push(baceGeometry)
      baceMesh.geometry = mergeBufferGeometries(geometries);
      baceGeometry.dispose()
    }

   
    // const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });

    if (props.highlight) {
      const background = 
        new THREE.PlaneBufferGeometry(
          strLen + props.font.tracking * 2,
          props.font.height + props.font.leading / 2,
          1,
          1
        );

        background.translate(
            (strLen / 2 - props.font.tracking / 2) + x,
            (-props.font.height / 2) - y,
            -0.01
          );

      mergeGeometries(textBlackMesh, [textGeometry])
      mergeGeometries(bgMesh, [background])

      // textMaterial.color.set("black");
      // // background.position.x = 0.5;
      // background.position.set(
      //   strLen / 2 - props.font.tracking / 2,
      //   -props.font.height / 2,
      //   -0.01
      // );
      // charObj.add(background);
    } else {
      mergeGeometries(textColorMesh, [textGeometry])
    }

    // chars.push({ char: charObj, fixed: fixed });

    rootGroup.add(charObj);

    if (props.updateCharNextLoc) {
      charNextLoc.x = strLen + x;
      charNextLoc.y = y;
    }

    return charObj;

    // return [width + tracking + x, y, charObj];
  }

  function placeLinebreak(font: FontInfo) {
    charNextLoc.x = 0;
    charNextLoc.y += font.leading;
  }

  function placeWords(
    text: string,
    font: FontInfo,
    highlight: boolean = false
  ) {
    const words = text.split(" ");
    for (let word of words) {
      placeStr({
        str: word + " ",
        font: font,
        highlight: highlight,
        wrap: true,
        isWord: true,
      });
    }
  }

  type MDtoken = {
    type: "h1" | "h2" | "h3" | "p" | "br";
    emphasis: boolean;
    value: string;
  };
  function placeMarkdown(md: string) {
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

        // br
      } else if (md[i] === "\n") {
        if (currentToken !== undefined) {
          tokens.push(currentToken);
          currentToken = undefined;
        }
        tokens.push({
          type: "br",
          emphasis: false,
          value: "",
        });

        // p
      } else if (currentToken === undefined) {
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
    console.log(tokens);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      switch (t.type) {
        case "h1":
          placeStr({ str: t.value, font: h1Font, highlight: t.emphasis });
          break;
        case "h2":
          placeStr({ str: t.value, font: h2Font, highlight: t.emphasis });
          break;
        case "h3":
          placeStr({ str: t.value, font: h3Font, highlight: t.emphasis });
          break;
        case "p":
          placeWords(t.value, paragraphFont);
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
    }
  }

  let terminalPromptOffset = 0;
  function placeTerminalPrompt(str: string) {
    // if (inputBuffer.length > 0)
    //   charNextLoc.y = inputBuffer[inputBuffer.length - 1].position.y;
    inputBuffer = [];
    for (const char of str) {
      inputBuffer.push(
        placeStr({ str: char, font: h2Font, updateCharNextLoc: false })
      );
    }
    terminalPromptOffset = 0;
    updateCharPos();
    inputBuffer = [];
    terminalPromptOffset = str.length + 1;
    updateCaret(0);
  }

  function delChar(charsTODel: THREE.Group[]) {
    for (const c of charsTODel) {
      rootGroup.remove(c);
    }
  }

  function updateCharPos() {
    const charWidth = h2Font.width + h2Font.tracking;
    const charsPerLine = Math.floor(screenWidth / charWidth);
    for (let i = 0; i < inputBuffer.length; i++) {
      inputBuffer[i].position.x =
        charNextLoc.x + charWidth * ((i + terminalPromptOffset) % charsPerLine);
      inputBuffer[i].position.y = -(
        charNextLoc.y +
        h2Font.leading * Math.floor((i + terminalPromptOffset) / charsPerLine)
      );
    }
  }

  function userInput(change: Change, selectionPos: number) {
    if (change.type === "add") {
      if (change.loc === "end") {
        caret.visible = true;
        for (const char of change.str) {
          const textObj = placeStr({
            str: char,
            font: h2Font,
            updateCharNextLoc: false,
          });

          inputBuffer.push(textObj);
          updateCharPos();
        }
      } else if (typeof change.loc === "number") {
        // charNextLoc.x = inputBuffer[change.loc].position.x;
        // charNextLoc.y = inputBuffer[change.loc].position.y;

        const newChars: THREE.Group[] = [];
        for (const char of change.str) {
          newChars.push(
            placeStr({
              str: char,
              font: h2Font,
              updateCharNextLoc: false,
            })
          );
        }
        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...newChars,
          ...inputBuffer.slice(change.loc, inputBuffer.length),
        ];
        updateCharPos();
      }
    } else if (change.type === "del") {
      if (change.loc === "end") {
        const charsTODel = inputBuffer.slice(-change.str.length);
        inputBuffer = inputBuffer.slice(0, -change.str.length);
        updateCharPos();

        delChar(charsTODel);
      } else if (typeof change.loc === "number") {
        // charNextLoc.x = inputBuffer[change.loc].position.x;
        // charNextLoc.y = inputBuffer[change.loc].position.y;

        const charsTODel = inputBuffer.slice(
          change.loc,
          change.loc + change.str.length
        );
        delChar(charsTODel);
        console.log(charsTODel);

        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...inputBuffer.slice(
            change.loc + change.str.length,
            inputBuffer.length
          ),
        ];
        updateCharPos();
      }
    }
    updateCaret(selectionPos);
  }

  function scroll(lines: number) {
    rootGroup.position.y += lines * h2Font.leading;
    if (rootGroup.position.y < 0) rootGroup.position.y = 0;
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

  onFontLoad();

  return { tick, userInput, placeMarkdown, placeTerminalPrompt, scroll };
}
