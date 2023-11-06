import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { execDenoFmt, execDiff } from "./exec.ts";
import { parse } from "https://deno.land/x/diff_parser@v0.2.0/mod.ts";

type CocActionResult = {
  id: string;
  state: "init" | "starting" | "runnnig";
}[];

type DiffItem = {
  beforeFileName: string;
  afterFileName: string;
  hunks: {
    header: {
      beforeStartLine: number;
      beforeLines: number;
      afterStartLine: number;
      afterLines: number;
    };
    lines: {
      text: string;
      mark: "nomodified" | "add" | "delete";
    }[];
  }[];
};

type DiffType = DiffItem[];

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    fmt: () => {
      return bufDenoFmt();
    },
  };

  const bufDenoFmt = async () => {
    const lspList =
      (await fn.call(denops, "CocAction", ["services"])) as CocActionResult;
    const isRunningDenoLs = lspList.some((lsp) => lsp.id === "deno");
    if (!isRunningDenoLs) {
      return;
    }

    const curpos = await fn.getcurpos(denops);
    const bufnr = await fn.bufnr(denops, "%");

    const bufLines = (await denops.call(
      "getbufline",
      bufnr,
      1,
      "$",
    )) as string[];

    let buf = bufLines.join("\n");
    if (bufLines[bufLines.length - 1] === "") {
      buf += "\n";
    }
    const beforeFilePath = Deno.makeTempFileSync({
      prefix: "df_vim_temp",
      suffix: ".ts",
    });
    const afterFilePath = Deno.makeTempFileSync({
      prefix: "df_vim_temp",
      suffix: ".ts",
    });

    [beforeFilePath, afterFilePath].map((path) => {
      Deno.writeTextFileSync(path, buf);
    });

    await execDenoFmt(afterFilePath);
    const diff = await execDiff(beforeFilePath, afterFilePath);

    const pDiff = parse(diff.stdout) as DiffType;
    if (pDiff == null || pDiff.length == 0) {
      return;
    }

    let promises: Promise<unknown>[] = [];

    const edited = {
      deleted: 0,
      added: 0,
    };

    for (const hunk of pDiff[0].hunks) {
      let lpos = hunk.header.beforeStartLine - edited.deleted + edited.added;

      for (let i = 0; i < hunk.lines.length; i++) {
        if (hunk.lines[i].mark === "delete") {
          promises = [...promises, fn.deletebufline(denops, bufnr, lpos)];
          edited.deleted += 1;
        } else if (hunk.lines[i].mark === "nomodified") {
          lpos += 1;
        } else if (hunk.lines[i].mark === "add") {
          promises = [
            ...promises,
            fn.appendbufline(denops, bufnr, lpos - 1, hunk.lines[i].text),
          ];
          edited.added += 1;
          lpos += 1;
        }
      }
    }

    await batch.collect(denops, () => promises);
    await fn.setpos(denops, ".", curpos);
  };
};
