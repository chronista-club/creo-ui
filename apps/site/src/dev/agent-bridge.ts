// dev 専用の agent bridge。Vite HMR ws で届いた op を window.creoEditor に流す。
//
// 手元の Claude が `curl -X POST /_creo/agent/cmd -d '{"op":"...","args":[...]}'` で送信し、
// vite-plugins/creo-agent-bridge.ts が 'creo:agent' event として ws.send する。
// creoEditor は EditorHostProvider マウント時に生えるので、Playground / Component ページで有効。
//
// transport 抽象化ポイント: 今は import.meta.hot ('creo:agent') 直結だが、
// creo wire に載せ替える場合は下記 subscribe を creo-memories app-server の
// subscribe に差し替えるだけで、applyOp から先は不変。

interface AgentOp {
  op: string
  args?: unknown[]
}

function applyOp(op: AgentOp) {
  const editor = (window as unknown as { creoEditor?: Record<string, unknown> }).creoEditor
  if (!editor) {
    console.warn(
      '[creo:agent] window.creoEditor が未マウントです。Playground か Component ページを開いてください。',
      op,
    )
    return
  }
  const fn = editor[op.op]
  if (typeof fn !== 'function') {
    console.warn(`[creo:agent] creoEditor.${op.op} は呼び出せません`, op)
    return
  }
  try {
    const result = (fn as (...a: unknown[]) => unknown).apply(editor, op.args ?? [])
    console.log(`[creo:agent] ✓ creoEditor.${op.op}`, op.args ?? [], '→', result)
  } catch (err) {
    console.error(`[creo:agent] creoEditor.${op.op} が失敗しました:`, err)
  }
}

interface AgentSet {
  var: string
  value: string
  persisted?: { file: string } | null
}

// CSS var を :root に直書きして live 反映する (creoEditor 不要 = 全ページで効く)。
function applySet(msg: AgentSet) {
  document.documentElement.style.setProperty(msg.var, msg.value)
  const tail = msg.persisted ? ` → 永続化 ${msg.persisted.file}` : ' (live のみ)'
  console.log(`[creo:agent] ✓ set ${msg.var} = ${msg.value}${tail}`)
}

if (import.meta.hot) {
  import.meta.hot.on('creo:agent', applyOp)
  import.meta.hot.on('creo:agent:set', applySet)
  console.info('[creo:agent] bridge ready — 手元 Claude からの op を待機中です')
}
