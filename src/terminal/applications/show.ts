import FileSystemBash, {
  FileBash,
  FileSystemType,
  FolderBash,
} from "../fileSystemBash";

export default function show(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "show",
    short: "render markdown (.md) files",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === "-help")) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }
    if (options.find((o) => o === "-a" || o === "-all")) {
      let allStr: string = "";
      const files = fileSystem.goHome().at(-1);
      if (!files) return;

      const showAll = (p: (FolderBash | FileBash)[]) => {
        if (!p) return;
        
        p.forEach((e) => {
          if (e.name === "title") return;

          if (e.name === "projects") {
            allStr += "\n\n\n\n# Projects";
          }

          if (e.name.match(".md")) {
            allStr += (e as any as FileBash).data;
            return;
          }

          showAll((e as any).children);
        });
      };

      showAll(files.children);

      print(allStr, true);

      return;
    }

    if (args.length === 0) {
      print(`\nMissing filename`);
      return;
    }
    const file = fileSystem.goto(path.p, args[0])?.at(-1);
    if (!file) {
      print(`\nNo such file or directory`);
      return;
    }

    if (!("data" in file)) {
      print(`\n${file.name}:not a file`);
      return;
    }

    print(file.data, true);
  };
  return { docs, app };
}
