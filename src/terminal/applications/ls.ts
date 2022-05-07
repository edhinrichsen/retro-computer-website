import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function ls(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "ls",
    short: "list directory contents",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    let out = "\n";
    const files = fileSystem.getChildren(path.p);
    for (const f of files) {
      out += `${f.name}\n`;
    }
    print(out);
  };
  return { docs, app };
}
