# deno-fmt.vim

When utilizing coc.nvim, this extension automatically executes `deno fmt` if the Deno language server is active.✨

## Requirements

Install Deno.

[denops.vim](https://github.com/vim-denops/denops.vim) requires the latest version of Deno. See [Deno's official manual](https://deno.land/manual/getting_started/installation) for details.

## Installation

```lua
-- lazy.nvim
{
  "shuntaka9576/deno-fmt.vim",
  dependencies = {
    "vim-denops/denops.vim",
  }
}
```

## Project Settings

Setting `.vim/coc-settings.json` in Project. Please set `tsserver.enable` and `prettier.enable` to `false`.

```
{
  "deno.enable": true,
  "deno.lint": false,
  "deno.unstable": true,
  "deno.config": "deno.json",
  "tsserver.enable": false,
  "prettier.enable": false 
}
```

