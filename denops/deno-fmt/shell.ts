export const getDefaultShell = (): string => {
  let shell = "bash";
  const envShell = Deno.env.get("SHELL");

  if (envShell != null) {
    shell = envShell;
  }

  return shell;
};

export const execPipedCmd = async (
  cmd: string,
): Promise<{ stdout: string; stderr: string }> => {
  const shell = getDefaultShell();
  const p = Deno.run({
    cmd: [shell],
    stdout: "piped",
    stderr: "piped",
    stdin: "piped",
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  await p.stdin.write(encoder.encode(cmd));
  p.stdin.close();

  const [output, errOutput] = await Promise.all([
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();

  const stdout = decoder.decode(output);
  const stderr = decoder.decode(errOutput);

  return { stdout, stderr };
};
