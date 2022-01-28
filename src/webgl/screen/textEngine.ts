import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as THREE from "three";
import { Change } from "./main";

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
  let size = 0.04;
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

export function screenTextEngine(
  sceneRTT: THREE.Scene,
  startText: string
): [
  (deltaTime: number, elapsedTime: number) => void,
  (change: Change, selectionPos: number) => void,
  (md: string) => void
] {
  const onFontLoad = () => {
    if (h1Font.font && h2Font.font && h3Font.font) {
      // placeHTML(startText, titleFont);
      placeMarkdown(startText);
    }
  };
  const fontLoader = new FontLoader();
  fontLoader.load("/fonts/public-pixel.json", (font) => {
    h1Font.font = font;
    onFontLoad();
  });
  fontLoader.load("/fonts/chill.json", (font) => {
    h2Font.font = font;
    h3Font.font = font;
    paragraphFont.font = font;
    onFontLoad();
  });

  const caret = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(h2Font.size, h2Font.size * 1.6),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  caret.position.z = -0.1
  sceneRTT.add(caret);

  let charUnderCaret: THREE.Group | undefined = undefined;
  function updateCharUnderCaret (isBlack: boolean){
    if (charUnderCaret)
      (
        (charUnderCaret.children[0] as THREE.Mesh)
          .material as THREE.MeshBasicMaterial
      ).color = new THREE.Color(isBlack ? 'black' : textColor);
  }

  let caretTimeSinceUpdate = 1;
  function updateCaret(pos?: number) {
    const charPos = {
      x: charNextLoc.x,
      y: -charNextLoc.y,
    };
    updateCharUnderCaret(false)
    charUnderCaret = undefined;
    if (pos && pos < inputBuffer.length) {
      charPos.x = inputBuffer[pos].position.x;
      charPos.y = inputBuffer[pos].position.y;

      updateCharUnderCaret(false)
      charUnderCaret = inputBuffer[pos];
    }
    console.log(charPos);

    let x = charPos.x + h2Font.size / 2;
    let y = charPos.y - h2Font.size / 1.9;
    if (x > 1.396) {
      y -= h2Font.leading;
      x = h2Font.size / 2;
    }
    caret.position.x = x
    caret.position.y = y
    // caret.position.set(x, y, 0);
    caretTimeSinceUpdate = 0;
  }

  let inputBuffer: THREE.Group[] = [];
  const charNextLoc = {
    x: 0,
    y: 0,
  };

  function placeStr(
    char: string,
    font: FontInfo,
    fixed: boolean,
    highlight: boolean,
    wrap: boolean,
    isWord: boolean
  ) {
    const strLen = (font.width + font.tracking) * char.length;
    const strWrapLen = isWord
      ? (font.width + font.tracking) * (char.length - 1)
      : font.width * char.length;

    let x = charNextLoc.x;
    let y = charNextLoc.y;

    if (wrap && strWrapLen + x > 1.396) {
      y += font.leading;
      x = 0;
    }

    const charObj = new THREE.Group();
    // m.scale.y = height;hh
    charObj.position.x = x;
    charObj.position.y = -y;

    const textGeometry = new TextGeometry(char, {
      font: font.font as any,
      size: font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, -font.height, -0.001);
    charObj.add(text);

    if (highlight) {
      const background = new THREE.Mesh(
        new THREE.PlaneGeometry(
          strLen + font.tracking * 2,
          font.height + font.leading / 2,
          1,
          1
        ),
        new THREE.MeshBasicMaterial({ color: textColor })
      );

      textMaterial.color.set("black");
      // background.position.x = 0.5;
      background.position.set(
        strLen / 2 - font.tracking / 2,
        -font.height / 2,
        -0.01
      );
      // background.scale.x = 0.05;
      charObj.add(background);
    }

    // chars.push({ char: charObj, fixed: fixed });

    sceneRTT.add(charObj);

    charNextLoc.x = strLen + x;
    charNextLoc.y = y;

    updateCaret();

    return charObj;

    // return [width + tracking + x, y, charObj];
  }

  function placeLinebreak(font: FontInfo) {
    charNextLoc.x = 0;
    charNextLoc.y += font.leading;
    updateCaret();
  }

  function placeWords(
    text: string,
    font: FontInfo,
    highlight: boolean = false
  ) {
    const words = text.split(" ");
    for (let word of words) {
      placeStr(word + " ", font, true, highlight, true, true);
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
          placeStr(t.value, h1Font, true, t.emphasis, false, false);
          break;
        case "h2":
          placeStr(t.value, h2Font, true, t.emphasis, false, false);
          break;
        case "h3":
          placeStr(t.value, h3Font, true, t.emphasis, false, false);
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

  function delChar(charsTODel: THREE.Group[]) {
    charNextLoc.x = charsTODel[0].position.x;
    charNextLoc.y = -charsTODel[0].position.y;
    for (const c of charsTODel) {
      sceneRTT.remove(c);
    }
  }

  function pushChar(index: number, pushDist: number) {
    for (let i = index; i < inputBuffer.length; i++) {
      inputBuffer[i].position.x += (h2Font.width + h2Font.tracking) * pushDist;
    }
  }

  function userInput(change: Change, selectionPos: number) {
    if (change.type === "add") {
      if (change.loc === "end") {
        caret.visible = true;
        for (const char of change.str) {
          const textObj = placeStr(char, h2Font, false, false, true, false);
          inputBuffer.push(textObj);
        }
      } else if (typeof change.loc === "number") {
        // charNextLoc.x = inputBuffer[change.loc].position.x;
        // charNextLoc.y = inputBuffer[change.loc].position.y;
        pushChar(change.loc, change.str.length);

        const newChars: THREE.Group[] = [];
        for (const char of change.str) {
          newChars.push(placeStr(char, h2Font, false, false, true, false));
        }
        inputBuffer = [
          ...inputBuffer.slice(0, change.loc),
          ...newChars,
          ...inputBuffer.slice(change.loc, inputBuffer.length),
        ];
      }
    } else if (change.type === "del") {
      if (change.loc === "end") {
        const charsTODel = inputBuffer.slice(-change.str.length);
        inputBuffer = inputBuffer.slice(0, -change.str.length);

        delChar(charsTODel);
      } else if (typeof change.loc === "number") {
        // charNextLoc.x = inputBuffer[change.loc].position.x;
        // charNextLoc.y = inputBuffer[change.loc].position.y;
        pushChar(change.loc, -change.str.length);

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
      }
    }
    updateCaret(selectionPos);

    // delChar();
    // caret.visible = true;
    // const char = placeStr(key, h2Font, false, false, true, false);
    // chars.push(char);
    // if (key == "Backspace") {
    //   delChar();
    // } else if (key == "Enter") {
    //   placeLinebreak(h2Font);
    //   placeStr("command not found\n", h2Font, true, false, true, false);
    //   placeLinebreak(h2Font);
    //   placeLinebreak(h2Font);
    //   placeStr("root:~/uni/2019$ ", h2Font, false, false, true, false);
    // } else {
    //   caret.visible = true;
    //   // caret.position.x += 0.04;
    //   placeStr(key, h2Font, false, false, true, false);
    //   // caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
    // }
  }

  function tick(deltaTime: number, elapsedTime: number) {
    if (caretTimeSinceUpdate > 1 && Math.floor(elapsedTime * 2) % 2 == 0) {
      caret.visible = false;
      updateCharUnderCaret(false)      
       
    } else {
      caret.visible = true;
      updateCharUnderCaret(true)    
    }

    caretTimeSinceUpdate += deltaTime;
  }

  return [tick, userInput, placeMarkdown];
}
