import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function pwd(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "pwd",
    short: "print name of current directory",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    let out = "";
    for (let i = 0; i < path.p.length; i++) {
      out += path.p[i].name;
      if (i !== 0 && i < path.p.length - 1) out += "/";
    }
    print(`\n${out}`);
  };
  return { docs, app };
}
