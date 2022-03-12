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
  const path = [drive];
  function ls() {
    return path[path.length - 1].children;
  }
  function cd() {}

  return { ls, cd };
}
