function! s:start_plugin() abort
  augroup deno_fmt
    au! * <buffer>
    autocmd BufWritePre <buffer> call s:deno_fmt()
  augroup end
endfunction

function! s:deno_fmt() abort
  return denops#request('deno-fmt', 'fmt', [])
endfunction

function! s:init() abort
  autocmd BufEnter *.{ts} :call s:start_plugin()
endfunction

call s:init()

function! s:success_callback(args) abort
endfunction

function! s:error_callback(err) abort
  if &verbose
    echoerr a:err
  endif
endfunction
