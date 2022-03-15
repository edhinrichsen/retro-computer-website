// @ts-ignore
import helpMD from "../text/help.md";
import FileSystemBash from "./fileSystemBash";

export default function Bash(print: (s: string, md?: boolean) => void) {
  const fileSystem = FileSystemBash();

  const apps = {
    help: (args: string[]) => {
      print(helpMD, true);
    },
    ls: (args: string[]) => {
      let out = "\n";
      const files = fileSystem.ls();
      for (const f of files) {
        out += `${f.name}\n`;
      }
      print(out);
    },
    cd: (args: string[]) => {
      if (args.length === 0 || args[0] === "") {
        fileSystem.goHome();
      } else {
        switch (args[0]) {
          case "..":
            fileSystem.goUp();
            break;

          default:
            break;
        }
      }
    },
  };

  function cmdNotFound(cmdName: string) {
    print(`\nedsh:${cmdName}:command not found`);
  }

  function prompt() {
    const path = fileSystem.getPath();
    let out = "";
    for (let i = 0; i < path.length; i++) {
      out += path[i].name;
      if (i !== 0 && i < path.length - 1) out += "/";
    }
    if (out === "/home/user") print(`\nuser:~$`);
    else print(`\nuser:${out} $`);
  }

  function input(cmd: string) {
    cmd = cmd.replaceAll(/\s+/g, " ");
    const cmdSplit = cmd.split(" ");
    const cmdName = cmdSplit[0];
    const cmdArgs: string[] = cmdSplit.slice(1);
    console.log("cmd", cmdName, cmdArgs);

    if (cmd) {
      const app: undefined | ((args: string[]) => {}) = (apps as any)[cmdName];
      if (app) app(cmdArgs);
      else cmdNotFound(cmdName);
    }

    prompt();
  }

  return { input };
}
