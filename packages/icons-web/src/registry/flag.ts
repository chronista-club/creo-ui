import type { IconName } from '../core/types'

// Flag icons — flagpack (MIT、 size-aware hand-tuned)。
// ISO 3166-1 alpha-2 国コード を key に、 主要国を網羅。
// 必要に応じて consumer 側で direct 名 (e.g. 'flagpack:nz') 利用可。
export const FLAG = {
  // Asia-Pacific
  jp: 'flagpack:jp' as IconName,
  cn: 'flagpack:cn' as IconName,
  kr: 'flagpack:kr' as IconName,
  tw: 'flagpack:tw' as IconName,
  hk: 'flagpack:hk' as IconName,
  sg: 'flagpack:sg' as IconName,
  th: 'flagpack:th' as IconName,
  vn: 'flagpack:vn' as IconName,
  id: 'flagpack:id' as IconName,
  ph: 'flagpack:ph' as IconName,
  in: 'flagpack:in' as IconName,
  au: 'flagpack:au' as IconName,
  nz: 'flagpack:nz' as IconName,

  // Americas
  us: 'flagpack:us' as IconName,
  ca: 'flagpack:ca' as IconName,
  mx: 'flagpack:mx' as IconName,
  br: 'flagpack:br' as IconName,
  ar: 'flagpack:ar' as IconName,

  // Europe
  gb: 'flagpack:gb' as IconName,
  fr: 'flagpack:fr' as IconName,
  de: 'flagpack:de' as IconName,
  it: 'flagpack:it' as IconName,
  es: 'flagpack:es' as IconName,
  nl: 'flagpack:nl' as IconName,
  se: 'flagpack:se' as IconName,
  no: 'flagpack:no' as IconName,
  fi: 'flagpack:fi' as IconName,
  dk: 'flagpack:dk' as IconName,
  pl: 'flagpack:pl' as IconName,
  ch: 'flagpack:ch' as IconName,

  // Middle East / Africa
  ae: 'flagpack:ae' as IconName,
  sa: 'flagpack:sa' as IconName,
  il: 'flagpack:il' as IconName,
  za: 'flagpack:za' as IconName,
} as const

export type FlagIconKey = keyof typeof FLAG
