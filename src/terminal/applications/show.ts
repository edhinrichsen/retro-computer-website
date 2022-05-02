import FileSystemBash, { FileSystemType } from "../fileSystemBash";

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
    if (options.find((o) => o === "-h")) {
      print(`\n${docs.name} – ${docs.short}`);
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
