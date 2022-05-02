import FileSystemBash, { FileSystemType } from "../fileSystemBash";
import cd from "./cd";
import echo from "./echo";
import hello from "./hello";
import ls from "./ls";
import mkdir from "./mkdir";
import pwd from "./pwd";
import show from "./show";
import touch from "./touch";
// @ts-ignore
import helpMD from "../../text/help.md";

export default function Applications(print: (s: string, md?: boolean) => void, path: FileSystemType) {
  const help = (args: string[], options: string[]) => {
    print(helpMD, true);
  };
  const apps = {
    ls: ls(print, path),
    cd: cd(print, path),
    echo: echo(print, path),
    pwd: pwd(print, path),
    mkdir: mkdir(print, path),
    touch: touch(print, path),
    show: show(print, path),
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
    hello: hello(print, path),
  };
  const getApp = (
    appName: string
  ): null | ((args: string[], options: string[]) => any) => {
    const app = (apps as any)[appName];
    if (app) return app.app;

    if (appName === "help") return help;

    return null;
  };

  return getApp;
}
