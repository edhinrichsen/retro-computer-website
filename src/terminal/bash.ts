// @ts-ignore
import helpMD from "../text/help.md";
import FileSystemBash from "./fileSystemBash";


export default function Bash(print: (s: string, format?: boolean) => void) {
  
  const fileSystem = FileSystemBash()

  const apps = {
    help: (cmd: string) => {
      print(helpMD, true);
    },
    ls :(cmd: string) => {
      const files = fileSystem.ls();
      print(``);
      for (const f of files) {
        print(`## ${f.name}    `, true);
      }
      print(``);
      
    }
  };


  const cmdNotFound = () => {
    print("command not found");
  };

  function input(cmd: string) {
    cmd = cmd.toLowerCase()
    const app: undefined | ((cmd: string) => {}) = (apps as any)[cmd];
    if (app) app(cmd);
    else cmdNotFound();
    console.log(cmd, app);
  }

  return { input };
}
