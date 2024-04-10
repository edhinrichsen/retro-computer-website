// @ts-ignore
import titleText from "../file-system/home/user/title/title.md?raw";
import Bash from "./bash";
export type Change = {
  type: "add" | "del" | "none";
  loc: number | "end" | "none";
  str: string;
};
export default function Terminal(screenTextEngine: {
  tick: (deltaTime: number, elapsedTime: number) => void;
  userInput: (change: Change, selectionPos: number) => void;
  placeMarkdown: (md: string) => number;
  placeText: (str: string) => number;
  scroll(
    val: number,
    units: "lines" | "px",
    options?: {
      updateMaxScroll: boolean;
      moveView: boolean;
    }
  ): void;
  scrollToEnd: () => void;
  freezeInput: () => void;
}) {
  const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.readOnly = true;
  textarea.blur();
  screenTextEngine.placeMarkdown(titleText);
  screenTextEngine.placeText("user:~$");

  const bash = Bash((s, md = false) => {
    if (md) {
      const numOfpx = screenTextEngine.placeMarkdown(s);
      screenTextEngine.scroll(numOfpx, "px", {
        updateMaxScroll: true,
        moveView: false,
      });
      screenTextEngine.scroll(12, "lines", {
        updateMaxScroll: false,
        moveView: true,
      });
    } else {
      const numOfLines = screenTextEngine.placeText(s);
      screenTextEngine.scroll(numOfLines, "lines");
    }
  });

  let oldText = "";
  function onInput() {
    const change = stringEditDistance(oldText, textarea.value);
    oldText = textarea.value;
    if (change) screenTextEngine.userInput(change, textarea.selectionStart);
    screenTextEngine.scrollToEnd();
  }
  textarea.addEventListener("input", onInput, false);

  canvas.addEventListener("pointerup", (ev) => {
    if (ev.pointerType === "mouse") {
      textarea.readOnly = false;
      textarea.focus();
      textarea.setSelectionRange(lastSelection, lastSelection);
    } else {
      textarea.readOnly = true;
      textarea.blur();
    }
  });
  window.addEventListener("keypress", (e) => {
    if (
      textarea.readOnly === true ||
      document.activeElement?.id !== "textarea"
    ) {
      textarea.readOnly = false;
      textarea.focus();

      if (e.key.length === 1) {
        textarea.value =
          textarea.value.slice(0, lastSelection) +
          e.key +
          textarea.value.slice(lastSelection);
        lastSelection += 1;
        onInput();
      }
      textarea.setSelectionRange(lastSelection, lastSelection);
    }
    // textarea
    if (e.key === "Enter") {
      screenTextEngine.freezeInput();
      bash.input(textarea.value);

      textarea.value = "";
      const change = stringEditDistance(oldText, textarea.value);
      oldText = textarea.value;
      if (change) screenTextEngine.userInput(change, textarea.selectionStart);
    }
  });

  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        screenTextEngine.scroll(-1, "lines", {
          moveView: true,
          updateMaxScroll: false,
        });
        break;
      case "ArrowDown":
        e.preventDefault();
        screenTextEngine.scroll(1, "lines", {
          moveView: true,
          updateMaxScroll: false,
        });
        break;
    }
  });

  let lastSelection = 0;
  document.addEventListener("selectionchange", () => {
    if (textarea.selectionStart !== textarea.selectionEnd)
      textarea.setSelectionRange(lastSelection, lastSelection);
    lastSelection = textarea.selectionStart;
    screenTextEngine.userInput(
      { type: "none", loc: "none", str: "" },
      textarea.selectionStart
    );
  });

  function stringEditDistance(oldStr: string, newStr: string) {
    const lenDiff = oldStr.length - newStr.length;

    let change: Change = {
      type: "none",
      loc: "none",
      str: "",
    };
    let op = 0;
    let np = 0;

    if (lenDiff === 0) {
    } else if (lenDiff > 0) {
      change.type = "del";
      while (op < oldStr.length || np < newStr.length) {
        if (op >= oldStr.length) {
          console.error("add and del");
          return;
        }
        if (oldStr.charAt(op) !== newStr.charAt(np)) {
          if (change.loc === "none")
            change.loc = np === newStr.length ? "end" : np;
          change.str += oldStr.charAt(op);
          op++;
        } else {
          op++;
          np++;
        }
      }
    } else if (lenDiff < 0) {
      change.type = "add";
      while (op < oldStr.length || np < newStr.length) {
        if (np >= newStr.length) {
          console.error("add and del");
          return;
        }
        if (oldStr.charAt(op) !== newStr.charAt(np)) {
          if (change.loc === "none")
            change.loc = op === oldStr.length ? "end" : op;
          change.str += newStr.charAt(np);
          np++;
        } else {
          op++;
          np++;
        }
      }
    }
    return change;
  }
}
