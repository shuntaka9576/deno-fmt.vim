import { execPipedCmd } from "./shell.ts";

export const execDenoFmt = async (path: string) => {
  const cmd = [
    "deno",
    "fmt",
    path,
  ];

  return await execPipedCmd(cmd.join(" "));
};

export const execDiff = async (pathA: string, pathB: string) => {
  const diffCmd = [
    "diff",
    "-u",
    pathA,
    pathB,
  ];

  return await execPipedCmd(diffCmd.join(" "));
};
