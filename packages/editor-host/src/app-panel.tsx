/** Application-wide navigation. DOM discovery remains an optional input to this panel. */
import { createEffect, createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { FieldEditor } from './fields'
import { useT } from './i18n'
import { useClassOverrides, useEditorHost, useEditorPicking } from './provider'
import type { EditorField } from './types'

/** A consumer-owned collection. fieldIds reference bind() IDs; they do not register fields. */
export interface EditorSection {
  id: string
  label: string
  fieldIds: readonly string[]
  /** Describe the real write target, e.g. "All repository names in the sidebar". */
  scopeLabel: string
}
export interface EditorLayerProps {
  appName?: string
  sections?: readonly EditorSection[]
}
const copy = {
  app: { ja: 'アプリ全体', en: 'Application' },
  parts: { ja: '画面の各部', en: 'App sections' },
  changes: { ja: '変更した項目', en: 'Changes' },
  pick: { ja: '画面から選ぶ', en: 'Pick from screen' },
  cancel: { ja: '選択をキャンセル', en: 'Cancel picking' },
  picking: {
    ja: '調整したい場所をクリックしてください。Esc でキャンセル。',
    en: 'Click a target to adjust. Escape cancels picking.',
  },
  scope: { ja: '反映範囲', en: 'Applies to' },
  registered: { ja: '各項目の登録先', en: 'Each field’s registered target' },
  component: {
    ja: 'このアプリ内の同じ種類の部品すべて',
    en: 'All components of this type in this app',
  },
  back: { ja: 'アプリ全体へ戻る', en: 'Back to application' },
  typography: { ja: '文字', en: 'Typography' },
  color: { ja: '色', en: 'Color' },
  spacing: { ja: '余白', en: 'Spacing' },
  other: { ja: 'その他の調整', en: 'Other adjustments' },
  empty: { ja: '変更はありません', en: 'No changes' },
  hint: {
    ja: '既定値と異なる項目を表示しています。',
    en: 'Showing values that differ from their defaults.',
  },
  reset: { ja: '既定値に戻す', en: 'Reset to default' },
  remove: { ja: '上書きを解除', en: 'Remove override' },
  noFields: { ja: '調整項目はまだ登録されていません。', en: 'No adjustments registered yet.' },
}
const stack: JSX.CSSProperties = { display: 'flex', 'flex-direction': 'column', gap: '12px' }
const muted: JSX.CSSProperties = {
  margin: 0,
  'font-size': '12px',
  color: 'var(--color-text-secondary)',
  'line-height': '1.6',
}
const action: JSX.CSSProperties = {
  padding: '8px 10px',
  background: 'transparent',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '8px',
  cursor: 'pointer',
  'font-family': 'inherit',
  'font-size': '12px',
  'text-align': 'left',
}
const card: JSX.CSSProperties = {
  ...stack,
  padding: '12px',
  background: 'var(--color-surface-bg-subtle)',
  'border-radius': '10px',
}
const title: JSX.CSSProperties = {
  margin: 0,
  'font-size': '13px',
  color: 'var(--color-text-primary)',
}

export function AppEditorPanel(
  props: EditorLayerProps & { children: JSX.Element; onBrowse: () => void },
): JSX.Element {
  const host = useEditorHost()
  const picking = useEditorPicking()
  const overrides = useClassOverrides()
  const t = useT()
  const [view, setView] = createSignal<'app' | 'parts' | 'changes'>('app')
  const [sectionId, setSectionId] = createSignal<string | null>(null)
  const fields = createMemo(() =>
    [...host.fields()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )
  const sections = createMemo(() => {
    const declared = props.sections ?? []
    const claimed = new Set(declared.flatMap((section) => [...section.fieldIds]))
    const grouped = new Map<string, EditorField[]>()
    for (const field of fields()) {
      if (claimed.has(field.id) || field.semantic === 'global') continue
      const label = field.group ?? t(copy.other)
      grouped.set(label, [...(grouped.get(label) ?? []), field])
    }
    return [
      ...declared.map((section) => ({
        ...section,
        fields: fields().filter((field) => section.fieldIds.includes(field.id)),
      })),
      ...[...grouped].map(([label, fields]) => ({
        id: `auto:${label}`,
        label,
        scopeLabel: fields.every((field) => field.scope === 'component')
          ? t(copy.component)
          : fields.every((field) => field.scope === 'token')
            ? t(copy.app)
            : t(copy.registered),
        fields,
      })),
    ].filter((section) => section.fields.length > 0)
  })
  const selectedSection = () => sections().find((section) => section.id === sectionId())
  const globals = createMemo(() => {
    const claimed = new Set((props.sections ?? []).flatMap((section) => [...section.fieldIds]))
    const groups = new Map<string, EditorField[]>()
    for (const field of fields()) {
      if (field.semantic !== 'global' || claimed.has(field.id)) continue
      const label = field.id.startsWith('typography.')
        ? t(copy.typography)
        : field.id.startsWith('color.')
          ? t(copy.color)
          : field.id.startsWith('layout.') || field.id.startsWith('spacing.')
            ? t(copy.spacing)
            : (field.group ?? t(copy.other))
      groups.set(label, [...(groups.get(label) ?? []), field])
    }
    return [...groups].map(([label, fields]) => ({ label, fields }))
  })
  const changes = () =>
    fields().filter(
      (field) =>
        field.type !== 'readonly-text' && !Object.is(host.getValue(field.id), field.initial),
    )
  const cssChanges = () =>
    Object.entries(overrides?.overrides() ?? {}).flatMap(([component, values]) =>
      Object.entries(values).map(([property, value]) => ({ component, property, value })),
    )
  const count = () => changes().length + cssChanges().length
  const navigate = (next: 'app' | 'parts' | 'changes') => {
    picking.cancel()
    host.clearSelection()
    setSectionId(null)
    setView(next)
    if (next === 'parts') props.onBrowse()
  }
  createEffect(() => {
    if (host.selection()) {
      setView('app')
      setSectionId(null)
    }
  })
  createEffect(() => {
    if (host.mode() === 'off') {
      setView('app')
      setSectionId(null)
    }
  })
  const scopeFor = (field: EditorField) =>
    (props.sections ?? []).find((section) => section.fieldIds.includes(field.id))?.scopeLabel ??
    (field.scope === 'component'
      ? t(copy.component)
      : field.scope === 'token'
        ? t(copy.app)
        : t(copy.registered))

  const selectionScope = (): string => {
    const selected = fields().filter((field) => host.selection()?.fieldIds.includes(field.id))
    if (selected.length > 0) return [...new Set(selected.map(scopeFor))].join(' / ')
    return host.selection()?.componentId ? t(copy.component) : t(copy.registered)
  }

  return (
    <div style={stack}>
      <nav aria-label="Editor" style={{ display: 'flex', gap: '4px' }}>
        <For each={['app', 'parts', 'changes'] as const}>
          {(item) => (
            <button
              type="button"
              aria-current={
                view() === item && !host.selection() && !sectionId() ? 'page' : undefined
              }
              style={{
                ...action,
                flex: 1,
                padding: '8px 4px',
                'text-align': 'center',
                background: view() === item ? 'var(--color-surface-bg-subtle)' : 'transparent',
              }}
              onClick={() => navigate(item)}
            >
              {t(copy[item])}
              {item === 'changes' ? ` (${count()})` : ''}
            </button>
          )}
        </For>
      </nav>
      <button
        type="button"
        style={{ ...action, color: 'var(--color-brand-primary)' }}
        aria-pressed={picking.active()}
        onClick={picking.toggle}
      >
        {picking.active() ? t(copy.cancel) : `↗ ${t(copy.pick)}`}
      </button>
      <Show when={picking.active()}>
        <p role="status" style={muted}>
          {t(copy.picking)}
        </p>
      </Show>
      <Show
        when={host.selection()}
        fallback={
          <Show
            when={selectedSection()}
            fallback={
              <>
                <Show when={view() === 'app'}>
                  <p style={muted}>
                    {t(copy.scope)} · {t(copy.app)}
                  </p>
                  <For each={globals()} fallback={<p style={muted}>{t(copy.noFields)}</p>}>
                    {(group) => (
                      <details style={card}>
                        <summary style={{ ...title, cursor: 'pointer' }}>
                          {group.label} <span style={muted}> · {group.fields.length}</span>
                        </summary>
                        <div style={{ ...stack, 'margin-top': '12px' }}>
                          <For each={group.fields}>{(field) => <FieldEditor field={field} />}</For>
                        </div>
                      </details>
                    )}
                  </For>
                </Show>
                <Show when={view() === 'parts'}>
                  <For each={sections()}>
                    {(section) => (
                      <button
                        type="button"
                        style={{ ...action, ...stack, gap: '4px' }}
                        onClick={() => setSectionId(section.id)}
                      >
                        <strong>
                          {section.label} · {section.fields.length}
                        </strong>
                        <span style={muted}>{section.scopeLabel}</span>
                      </button>
                    )}
                  </For>
                  {props.children}
                </Show>
                <Show when={view() === 'changes'}>
                  <p style={muted}>{t(copy.hint)}</p>
                  <Show when={count() > 0} fallback={<p style={muted}>{t(copy.empty)}</p>}>
                    <For each={changes()}>
                      {(field) => (
                        <section style={card}>
                          <h3 style={title}>{field.label}</h3>
                          <p style={muted}>
                            {t(copy.scope)} · {scopeFor(field)}
                          </p>
                          <div style={{ ...muted, 'overflow-wrap': 'anywhere' }}>
                            {String(field.initial)} → {String(host.getValue(field.id))}
                          </div>
                          <button
                            type="button"
                            style={action}
                            onClick={() => host.setValue(field.id, field.initial)}
                          >
                            {t(copy.reset)}
                          </button>
                        </section>
                      )}
                    </For>
                    <For each={cssChanges()}>
                      {(change) => (
                        <section style={card}>
                          <h3 style={title}>
                            {change.component} · {change.property}
                          </h3>
                          <p style={muted}>{t(copy.component)}</p>
                          <code style={muted}>{change.value}</code>
                          <button
                            type="button"
                            style={action}
                            onClick={() => overrides?.remove(change.component, change.property)}
                          >
                            {t(copy.remove)}
                          </button>
                        </section>
                      )}
                    </For>
                  </Show>
                </Show>
              </>
            }
          >
            {(section) => (
              <section style={stack}>
                <button type="button" style={action} onClick={() => navigate('app')}>
                  ← {t(copy.back)}
                </button>
                <h2 style={title}>{section().label}</h2>
                <p style={muted}>
                  {t(copy.scope)} · {section().scopeLabel}
                </p>
                <For each={section().fields}>{(field) => <FieldEditor field={field} />}</For>
              </section>
            )}
          </Show>
        }
      >
        <p style={muted}>
          {t(copy.scope)} · {selectionScope()}
        </p>
        {props.children}
      </Show>
    </div>
  )
}
