export type FileBash = { name: string; data: string };
export type FolderBash = { name: string; children: (FolderBash | FileBash)[] };
// @ts-ignore
import titleMD from "../text/title.md";
// @ts-ignore
import aboutMD from "../text/about.md";
// @ts-ignore
import writingBuddyMD from "../text/writing-buddy.md";
// @ts-ignore
import myOwnProgrammingLanguageMD from "../text/my-own-programming-language.md";
// @ts-ignore
import glowbalMD from "../text/glowbal.md";
// @ts-ignore
import cyberHeist from "../text/cyber-heist.md";
// @ts-ignore
import pavilionMD from "../text/pavilion.md";
// @ts-ignore
import brickBreakerMD from "../text/brick-breaker.md";
// @ts-ignore
import jackalopeMD from "../text/jackalope.md";
// @ts-ignore
import projectLMD from "../text/project-l.md";
// @ts-ignore
import greatBallsOfFireMD from "../text/great-balls-of-fire.md";
// @ts-ignore
import theGoldenPackMD from "../text/the-golden-pack.md";
// @ts-ignore
import edsitesMD from "../text/edsites.md";
// @ts-ignore
import contactMD from "../text/contact.md";

const disk: FolderBash = {
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
            { name: "title", children: [{ name: "title.md", data: titleMD }] },
            { name: "about", children: [{ name: "about.md", data: aboutMD }] },
            {
              name: "projects",
              children: [
                { name: "writing-buddy.md", data: writingBuddyMD },
                { name: "my-own-programming-language.md", data: myOwnProgrammingLanguageMD },
                { name: "glowbal.md", data: glowbalMD },
                { name: "cyber-heist.md", data: cyberHeist },
                { name: "pavilion.md", data: pavilionMD },
                { name: "brick-breaker.md", data: brickBreakerMD },
                { name: "jackalope.md", data: jackalopeMD },
                { name: "project-l.md", data: projectLMD },
                { name: "great-balls-of-fire.md", data: greatBallsOfFireMD },
                { name: "the-golden-pack.md", data: theGoldenPackMD },
                { name: "edsites.md", data: edsitesMD },
              ],
            },
            {
              name: "contact",
              children: [{ name: "contact.md", data: contactMD }],
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
  function getChildren(path: FolderBash[]) {
    return (path[path.length - 1] as any).children;
  }

  function goHome() {
    const home = disk.children.find((m) => m.name === "home") as FolderBash;
    const user = home.children.find((m) => m.name === "user") as FolderBash;
    return [disk, home, user];
  }

  function goto(path: (FolderBash | FileBash)[], newPath: string) {
    path = [...path];

    const newPathArray = newPath.split("/");
    // remove trailling slash
    if (newPathArray.length > 0 && newPathArray.at(-1) === "")
      newPathArray.pop();

    console.log("path", newPathArray);

    for (const p of newPathArray) {
      switch (p) {
        case "":
          // go to root
          path = [disk];
          break;
        case "..":
          // go up a folder
          if (path.length > 1) path.pop();
          break;
        case ".":
          // current folder
          break;
        default:
          // goto next location
          const currentFolder = path.at(-1);
          if (!currentFolder || !("children" in currentFolder))
            return undefined;

          const next = currentFolder.children.find((m) => m.name === p);
          if (!next) return undefined;

          path.push(next);
          break;
      }
    }
    return path;
  }

  return { getChildren, goHome, goto };
}
