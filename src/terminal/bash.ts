export default function Bash(print: (s: string, format?: boolean) => void) {
  const apps = {
    help: (cmd: string) => {print('Help!')},
  };

  const cmdNotFound = () => {print('command not found')};

  function input(cmd: string) {
    const app: undefined | ((cmd: string) => {}) = (apps as any)[cmd];
    if (app) app(cmd);
    else cmdNotFound();
    console.log(cmd,app);
    
  }

  return { input };
}
