/**
 * Type declaration for CSS modules
 *
 * Phase B (CREO-84) で導入した shell primitives は CSS modules を使用、
 * `*.module.css` を import して scoped class names を取得する。
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
