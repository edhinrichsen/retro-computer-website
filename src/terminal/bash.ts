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
      const operation = fileSystem.goto(path, args[0].split("/"));
      console.log(operation);

      if (operation) path = operation;
      else print(`\ncd: No such file or directory`);
    },
    show: (args: string[]) => {
      if (args.length === 0) {
        print(`\nshow: Missing filename`);
        return;
      }
      const file = fileSystem.get(path, args[0].split("/"));
      if (file && "data" in file) print(file.data, true);
      else print(`\nshow: No such file or directory`);
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
