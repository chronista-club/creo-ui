import type { IconName } from '../core/types'

// File type icons — Bootstrap Icons の `filetype-*` subset (MIT)。
// monochrome text badge スタイル (例: 「.MD」「.TS」が文字で見える)、
// dev tool の dense file picker / project tree に fit。
//
// 注意: bi:filetype-* は限定 set のみ存在 (rs/toml/kdl 等 Rust 系の一部は無い)。
// fallback で codicon / generic file-earmark を使う。
export const FILETYPE = {
  // language source — bi:filetype-* で存在するもの
  ts: 'bi:filetype-ts' as IconName,
  tsx: 'bi:filetype-tsx' as IconName,
  js: 'bi:filetype-js' as IconName,
  jsx: 'bi:filetype-jsx' as IconName,
  py: 'bi:filetype-py' as IconName,
  java: 'bi:filetype-java' as IconName,
  cs: 'bi:filetype-cs' as IconName,
  php: 'bi:filetype-php' as IconName,
  sh: 'bi:filetype-sh' as IconName,
  sql: 'bi:filetype-sql' as IconName,

  // markup / data
  md: 'bi:filetype-md' as IconName,
  mdx: 'bi:filetype-mdx' as IconName,
  json: 'bi:filetype-json' as IconName,
  html: 'bi:filetype-html' as IconName,
  css: 'bi:filetype-css' as IconName,
  scss: 'bi:filetype-scss' as IconName,
  yml: 'bi:filetype-yml' as IconName,
  xml: 'bi:filetype-xml' as IconName,
  csv: 'bi:filetype-csv' as IconName,

  // image
  svg: 'bi:filetype-svg' as IconName,
  png: 'bi:filetype-png' as IconName,
  jpg: 'bi:filetype-jpg' as IconName,
  gif: 'bi:filetype-gif' as IconName,
  bmp: 'bi:filetype-bmp' as IconName,
  tiff: 'bi:filetype-tiff' as IconName,

  // doc / office
  pdf: 'bi:filetype-pdf' as IconName,
  doc: 'bi:filetype-doc' as IconName,
  docx: 'bi:filetype-docx' as IconName,
  xls: 'bi:filetype-xls' as IconName,
  xlsx: 'bi:filetype-xlsx' as IconName,
  ppt: 'bi:filetype-ppt' as IconName,
  pptx: 'bi:filetype-pptx' as IconName,
  txt: 'bi:filetype-txt' as IconName,

  // audio / video
  mp3: 'bi:filetype-mp3' as IconName,
  mp4: 'bi:filetype-mp4' as IconName,
  wav: 'bi:filetype-wav' as IconName,

  // generic file / folder
  file: 'bi:file-earmark' as IconName,
  fileCode: 'bi:file-earmark-code' as IconName,
  fileText: 'bi:file-earmark-text' as IconName,
  folder: 'bi:folder' as IconName,
  folderOpen: 'bi:folder2-open' as IconName,
  folderFill: 'bi:folder-fill' as IconName,

  // bi に無い Rust/dev 系の fallback
  rs: 'bi:file-earmark-code' as IconName, // bi に filetype-rs 無し → generic code
  toml: 'codicon:settings-gear' as IconName, // config 系は cog
  kdl: 'codicon:settings-gear' as IconName,
  lock: 'codicon:lock' as IconName,
  env: 'codicon:settings-gear' as IconName,
  gitignore: 'codicon:source-control' as IconName,
} as const

export type FileTypeIconKey = keyof typeof FILETYPE
