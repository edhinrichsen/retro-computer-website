export type FileBash = { name: string; data: string };
export type FolderBash = { name: string; children: (FolderBash | FileBash)[] };

const drive: FolderBash = {
  name: "/",
  children: [
    { name: "bin", children: [] },
    { name: "dev", children: [] },
    {
      name: "home",
      children: [
        {
          name: "user",
          children: [
            { name: "Home", children: [{ name: "home.md", data: "text" }] },
            { name: "About", children: [{ name: "about.md", data: "text" }] },
            {
              name: "Projects",
              children: [
                { name: "writing-buddy.md", data: "text" },
                { name: "my-own-programming-language.md", data: "text" },
                { name: "glowbal.md", data: "text" },
                { name: "cyber-heist.md", data: "text" },
                { name: "pavilion.md", data: "text" },
              ],
            },
            {
              name: "Contact",
              children: [{ name: "contact.md", data: "text" }],
            },
          ],
        },
      ],
    },
    { name: "lib64", children: [] },
    { name: "media", children: [] },
    { name: "home", children: [] },
  ],
};

export default function FileSystemBash() {
  let path = [drive];
  goHome();

  function ls() {
    return (path[path.length - 1] as any).children;
  }
  function goRoot() {
    path = [drive];
  }

  function goHome() {
    const home = drive.children.find((m) => m.name === "home") as FolderBash;
    const user = home.children.find((m) => m.name === "user") as FolderBash;
    path = [drive, home, user];
  }

  function goUp() {
    if (path.length > 1) path.pop();
  }

  function goTo(file: string) {
    const next = (path[path.length - 1] as any as FolderBash).children.find(
      (m) => m.name === file
    ) as FolderBash;
    if (next && next.children !== undefined) {
      path.push(next);
    }
  }

  function getPath() {
    return path;
  }

  return { ls, goHome, getPath, goUp, goRoot, goTo };
}
