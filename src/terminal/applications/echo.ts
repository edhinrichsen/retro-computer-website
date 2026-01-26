import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function echo(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const docs = {
    name: "echo",
    short: "display a line of text",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    const str = args.length
      ? args.join(" ")
      : "Every step we take, every risk we embrace, brings us closer to greatness. Fear is just a whisper compared to the roar of our spirit.";

    print(`\n${str}`);
  };
  return { docs, app };
}
