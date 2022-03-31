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
      console.log(operation);

      if (!operation) {
        print(`\nNo such file or directory`);
        return;
      }
      if (!("children" in (operation.at(-1) as any))) {
        print(`\n${operation.at(-1)?.name}:not a directory`);
        return;
      }

      path = operation as any;
    },
    echo: (args: string[]) => {
      const str = args.join(" ");
      print(`\n${str}`);
    },
    pwd: (args: string[]) => {
      let out = "";
      for (let i = 0; i < path.length; i++) {
        out += path[i].name;
        if (i !== 0 && i < path.length - 1) out += "/";
      }
      print(`\n${out}`);
    },
    mkdir: (args: string[]) => {
      if (args.length === 0) {
        print(`\nMissing directory name`);
        return;
      }
      const out = fileSystem.make(path, args[0], "folder");
      if (out === "bad_args") {
        print(`\nMissing directory name`);
      } else if (out === "bad_path") {
        print(`\nNo such file or directory`);
      } else if (out === "file_exists") {
        print(`\nFile or directory already exists`);
      }
    },
    touch: (args: string[]) => {
      if (args.length === 0) {
        print(`\nMissing file name`);
        return;
      }
      const out = fileSystem.make(path, args[0], "file");
      if (out === "bad_args") {
        print(`\nMissing file name`);
      } else if (out === "bad_path") {
        print(`\nNo such file or directory`);
      }
    },
    show: (args: string[]) => {
      if (args.length === 0) {
        print(`\nMissing filename`);
        return;
      }
      const file = fileSystem.goto(path, args[0])?.at(-1);
      if (!file) {
        print(`\nNo such file or directory`);
        return;
      }

      if (!("data" in file)) {
        print(`\n${file.name}:not a file`);
        return;
      }

      print(file.data, true);
    },
    // nano: (args: string[]) => {
    //   if (args.length === 0) {
    //     print(`\nMissing filename`);
    //     return;
    //   }
    //   const file = fileSystem.goto(path, args[0])?.at(-1);
    //   if (!file) {
    //     print(`\nNo such file or directory`);
    //     return;
    //   }

    //   if (!("data" in file)) {
    //     print(`\n${file.name}:not a file`);
    //     return;
    //   }

    //   print(file.data);
    // },
  };

  function cmdNotFound(cmdName: string) {
    print(`\n${cmdName}:command not found`);
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
