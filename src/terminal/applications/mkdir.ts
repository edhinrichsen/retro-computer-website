import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function mkdir(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "mkdir",
    short: "make directory",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    if (args.length === 0) {
      print(`\nMissing directory name`);
      return;
    }
    const out = fileSystem.make(path.p, args[0], "folder");
    if (out === "bad_args") {
      print(`\nMissing directory name`);
    } else if (out === "bad_path") {
      print(`\nNo such file or directory`);
    } else if (out === "file_exists") {
      print(`\nFile or directory already exists`);
    }
  };
  return { docs, app };
}
