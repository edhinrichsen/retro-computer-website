import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function mkdir(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "touch",
    short: "create file",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    if (args.length === 0) {
      print(`\nMissing file name`);
      return;
    }
    const out = fileSystem.make(path.p, args[0], "file");
    if (out === "bad_args") {
      print(`\nMissing file name`);
    } else if (out === "bad_path") {
      print(`\nNo such file or directory`);
    }
  };
  return { docs, app };
}
