// @ts-ignore
import helpMD from "../text/help.md";
import FileSystemBash from "./fileSystemBash";
// @ts-ignore
import aboutMD from "../text/about.md";

export default function Bash(print: (s: string, md?: boolean) => void) {
  const fileSystem = FileSystemBash();
  let path = fileSystem.goHome();

  const apps = {
    help: (args: string[]) => {
      print(helpMD, true);
    },
    ls: (args: string[]) => {
      let out = "\n";
      const files = fileSystem.getChildren(path);
      for (const f of files) {
        out += `${f.name}\n`;
      }
      print(out);
    },
    cd: (args: string[]) => {
      if (args.length === 0 || args[0] === "") {
        path = fileSystem.goHome();
        return;
      }
      const operation = fileSystem.goto(path, args[0]);
      if (operation) path = operation;
      else print(`\ncd: No such file or directory`);
    },
    show: (args: string[]) => {
      print(aboutMD, true);
    },
    echo: (args: string[]) => {
      const str = args.join(" ");
      print(`\n${str}`);
    },
  };

  function cmdNotFound(cmdName: string) {
    print(`\nedsh:${cmdName}:command not found`);
  }

  function prompt() {
    let out = "";
    for (let i = 0; i < path.length; i++) {
      out += path[i].name;
      if (i !== 0 && i < path.length - 1) out += "/";
    }
    out = out.replace(/^\/home\/user/, "~");
    if (out !== "~") out += " ";
    print(`\nuser:${out}$`);
  }

  function input(cmd: string) {
    cmd = cmd.replace(/^\s+/, "");
    cmd = cmd.replaceAll(/\s+/g, " ");

    const cmdArray = cmd.split("");

    const args: string[] = [];
    let currentArg: string[] = [];

    let inQuoteBlock: undefined | `'` | `"` = undefined;
    while (cmdArray.length > 0) {
      const elm = cmdArray.shift();

      if (inQuoteBlock) {
        if (elm === inQuoteBlock) {
          inQuoteBlock = undefined;
          args.push(currentArg.join(""));
          currentArg = [];
        } else if (elm) {
          currentArg.push(elm);
        }
        continue;
      }

      if (elm === " ") {
        args.push(currentArg.join(""));
        currentArg = [];
      } else if (elm === `'` || elm === `"`) {
        inQuoteBlock = elm;
        args.push(currentArg.join(""));
        currentArg = [];
      } else if (elm) {
        currentArg.push(elm);
      }
    }
    if (currentArg.length > 0) args.push(currentArg.join(""));

    console.log("cmd", args);
    const cmdName = args.shift();

    if (cmdName) {
      const app: undefined | ((args: string[]) => {}) = (apps as any)[cmdName];
      if (app) app(args);
      else cmdNotFound(cmdName);
    }

    prompt();
  }

  return { input };
}
