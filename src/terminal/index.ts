import Input from "./input";
// @ts-ignore
import notFound from "../text/notFound.md";
// @ts-ignore
import newLine from "../text/newLine.md";
export type Change = {
  type: "add" | "del" | "none";
  loc: number | "end" | "none";
  str: string;
};
export default function Terminal(screenTextEngine: {
  tick: (deltaTime: number, elapsedTime: number) => void;
  userInput: (change: Change, selectionPos: number) => void;
  placeMarkdown: (md: string) => void;
  placeTerminalPrompt: (str: string) => void;
}) {
  // const input = Input()
  const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.focus();
  textarea.onblur = () => {
    textarea.focus();
  };

  let oldText = "";
  textarea.addEventListener(
    "input",
    function () {
      const change = stringEditDistance(oldText, textarea.value);
      oldText = textarea.value;
      if (change) screenTextEngine.userInput(change, textarea.selectionStart);
    },
    false
  );

  window.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      if (textarea.value.match(/^ *$/) === null) {
        screenTextEngine.placeMarkdown(notFound);
      } else {
        screenTextEngine.placeMarkdown(newLine);
      }

      textarea.value = "";
      screenTextEngine.placeTerminalPrompt("root:~$");
      const change = stringEditDistance(oldText, textarea.value);
      oldText = textarea.value;
      if (change) screenTextEngine.userInput(change, textarea.selectionStart);
    }
  });

  let lastSelection = 0;
  document.addEventListener("selectionchange", () => {
    if (textarea.selectionStart !== textarea.selectionEnd)
      textarea.setSelectionRange(lastSelection, lastSelection);
    lastSelection = textarea.selectionStart;
    console.log("tigger", textarea.selectionStart, textarea.selectionEnd);
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
      console.log("same");
    } else if (lenDiff > 0) {
      console.log("del");
      change.type = "del";
      while (op < oldStr.length || np < newStr.length) {
        if (op >= oldStr.length) {
          console.error("add and del");
          return;
        }
        // console.log()
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
      console.log("add");
      change.type = "add";
      while (op < oldStr.length || np < newStr.length) {
        if (np >= newStr.length) {
          console.error("add and del");
          return;
        }
        // console.log()
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
    console.log("change: ", change);
    return change;
  }
}
