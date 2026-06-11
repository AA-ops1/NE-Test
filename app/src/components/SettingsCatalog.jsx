/* ============================================================
   Settings — catalogue manager building blocks
   • field schema per tab (products / types / variables)
   • CatalogTable  — dense data-table rows (Table direction)
   • CatalogCards  — spacious list-row cards (Cards direction)
   • CatalogEditor — shared form, rendered in a drawer or a dialog
   • CatalogDelete — confirm dialog
   • drag-to-reorder + usage counts
   Built entirely from Aljazira design-system classes (.ajb-*).
   ============================================================ */
import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import TPL from '../data/tpl';
import { L, cx, DropSelect } from './TemplateParts';

/* ---------- usage counts (read-only, from the template store) ---------- */
export function catalogUsage(tab, item) {
  const list = (TPL && TPL.LIST) || [];
  if (tab === 'products') return list.filter(r => r.product === item.id).length;
  if (tab === 'types') return list.filter(r => r.type === item.id).length;
  // variables: scan saved sample content for the token
  if (tab === 'variables') {
    let n = 0;
    const re = new RegExp('\\{\\{\\s*' + item.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\}\\}');
    (TPL && TPL.SAMPLE ? [TPL.SAMPLE.content.en, TPL.SAMPLE.content.ar] : []).forEach(c => { if (re.test(c)) n++; });
    return n;
  }
  return 0;
}

/* ---------- field schema ---------- */
export function fieldsFor(tab, s, groups) {
  if (tab === 'variables') return [
    { key: 'token', lbl: s.fToken, hint: s.tokenHint, dir: 'ltr', mono: true, span: 2 },
    { key: 'group', lbl: s.fGroup, kind: 'select', options: groups },
    { key: 'len', lbl: s.fLen, hint: s.lenHint, kind: 'number' },
    { key: 'lbl_en', lbl: s.colLabelEn, dir: 'ltr' },
    { key: 'lbl_ar', lbl: s.colLabelAr, dir: 'rtl' },
    { key: 'en', lbl: s.colSampleEn, dir: 'ltr' },
    { key: 'ar', lbl: s.colSampleAr, dir: 'rtl' },
  ];
  return [
    { key: 'en', lbl: s.colNameEn, dir: 'ltr', span: 2 },
    { key: 'ar', lbl: s.colNameAr, dir: 'rtl', span: 2 },
    { key: 'id', lbl: s.fCode, hint: s.codeHint, dir: 'ltr', mono: true, span: 2 },
  ];
}

/* a blank row for the active tab */
export function blankItem(tab, groups) {
  if (tab === 'variables') return { token: '', group: (groups[0] && groups[0].id) || 'general', len: 8, en: '', ar: '', lbl_en: '', lbl_ar: '' };
  return { id: '', en: '', ar: '' };
}

/* ---------- drag-to-reorder (only when unfiltered) ---------- */
export function useReorder(setItems) {
  const from = useRef(null);
  return {
    start: (i) => (e) => { from.current = i; e.dataTransfer.effectAllowed = 'move'; },
    over: (i) => (e) => {
      e.preventDefault();
      const f = from.current;
      if (f == null || f === i) return;
      setItems((arr) => { const a = arr.slice(); const [m] = a.splice(f, 1); a.splice(i, 0, m); from.current = i; return a; });
    },
    end: () => { from.current = null; },
  };
}

/* ---------- group chip (variables) ---------- */
export function GroupChip({ gid, groups, lang }) {
  const g = groups.find((x) => x.id === gid);
  if (!g) return null;
  return <span className="set-gchip"><Icon name={g.icon || 'tag'} />{L(g, lang)}</span>;
}

/* ---------- TABLE direction ---------- */
export function CatalogTable({ tab, items, groups, s, lang, canReorder, onEdit, onDelete }) {
  const ro = useReorder(onEdit.reorder);
  const isVar = tab === 'variables';
  return (
    <div className="ajb-card set-tablecard">
      <table className="ajb-table set-table">
        <thead>
          <tr>
            <th className="set-th-grab" />
            {isVar ? (
              <React.Fragment>
                <th>{s.colToken}</th><th>{s.colLabel}</th><th>{s.colGroup}</th>
                <th className="ajb-num">{s.colLen}</th><th>{s.colSample}</th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <th>{s.colNameEn}</th><th>{s.colNameAr}</th><th>{s.colCode}</th><th>{s.colUsage}</th>
              </React.Fragment>
            )}
            <th className="set-th-act" />
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const used = catalogUsage(tab, it);
            return (
              <tr key={(isVar ? it.token : it.id) + i}
                draggable={canReorder}
                onDragStart={canReorder ? ro.start(i) : undefined}
                onDragOver={canReorder ? ro.over(i) : undefined}
                onDragEnd={canReorder ? ro.end : undefined}
                onDoubleClick={() => onEdit.open(it, i)}>
                <td className="set-td-grab" title={canReorder ? s.reorderHint : undefined}>
                  <span className={cx('set-grab', !canReorder && 'is-off')}><Icon name="grip-vertical" /></span>
                </td>
                {isVar ? (
                  <React.Fragment>
                    <td><code className="set-token ajb-ltr">{'{{' + (it.token || '…') + '}}'}</code></td>
                    <td className="set-cell-strong">{lang === 'ar' ? (it.lbl_ar || it.lbl_en) : (it.lbl_en || it.lbl_ar)}</td>
                    <td><GroupChip gid={it.group} groups={groups} lang={lang} /></td>
                    <td className="ajb-num set-cell-dim">{it.len}</td>
                    <td className="set-cell-dim"><span className={lang === 'ar' ? '' : 'ajb-ltr'}>{lang === 'ar' ? (it.ar || it.en) : (it.en || it.ar)}</span></td>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <td className="set-cell-strong">{it.en}</td>
                    <td dir="rtl" className="set-cell-ar">{it.ar}</td>
                    <td><code className="set-code ajb-ltr">{it.id || '…'}</code></td>
                    <td>{used > 0
                      ? <span className="set-usage">{used}</span>
                      : <span className="set-usage is-zero">0</span>}</td>
                  </React.Fragment>
                )}
                <td className="set-td-act">
                  <div className="set-rowacts">
                    <button type="button" className="set-iconbtn" title={s.edit} onClick={() => onEdit.open(it, i)}><Icon name="pencil" /></button>
                    <button type="button" className="set-iconbtn set-iconbtn--danger" title={s.remove} onClick={() => onDelete(it, i)}><Icon name="trash-2" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- CARDS direction ---------- */
export function CatalogCards({ tab, items, groups, s, lang, canReorder, onEdit, onDelete }) {
  const ro = useReorder(onEdit.reorder);
  const isVar = tab === 'variables';
  return (
    <div className="set-cards">
      {items.map((it, i) => {
        const used = catalogUsage(tab, it);
        const title = isVar
          ? (lang === 'ar' ? (it.lbl_ar || it.lbl_en) : (it.lbl_en || it.lbl_ar))
          : (lang === 'ar' ? (it.ar || it.en) : (it.en || it.ar));
        const sub = isVar
          ? (lang === 'ar' ? (it.ar || it.en) : (it.en || it.ar))
          : (lang === 'ar' ? it.en : it.ar);
        return (
          <div key={(isVar ? it.token : it.id) + i} className="ajb-card set-card"
            draggable={canReorder}
            onDragStart={canReorder ? ro.start(i) : undefined}
            onDragOver={canReorder ? ro.over(i) : undefined}
            onDragEnd={canReorder ? ro.end : undefined}
            onDoubleClick={() => onEdit.open(it, i)}>
            <span className={cx('set-grab set-card-grab', !canReorder && 'is-off')} title={canReorder ? s.reorderHint : undefined}><Icon name="grip-vertical" /></span>
            <div className="set-card-body">
              <div className="set-card-top">
                <span className="set-card-title">{title || '…'}</span>
                {isVar
                  ? <GroupChip gid={it.group} groups={groups} lang={lang} />
                  : (used > 0 && <span className="set-usage set-usage--inline">{used} · {s.colUsage}</span>)}
              </div>
              <div className="set-card-meta">
                {isVar
                  ? <code className="set-token ajb-ltr">{'{{' + (it.token || '…') + '}}'}</code>
                  : <code className="set-code ajb-ltr">{it.id || '…'}</code>}
                <span className={cx('set-card-sub', !isVar && 'set-cell-ar')} dir={isVar ? undefined : 'rtl'}>{sub}</span>
                {isVar && <span className="set-card-len">{it.len} {s.colLen.toLowerCase()}</span>}
              </div>
            </div>
            <div className="set-rowacts">
              <button type="button" className="set-iconbtn" title={s.edit} onClick={() => onEdit.open(it, i)}><Icon name="pencil" /></button>
              <button type="button" className="set-iconbtn set-iconbtn--danger" title={s.remove} onClick={() => onDelete(it, i)}><Icon name="trash-2" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- shared editor form ---------- */
function EditorFields({ tab, draft, setDraft, groups, s, lang }) {
  const fields = fieldsFor(tab, s, groups);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <div className="set-form">
      {fields.map((f) => (
        <div key={f.key} className={cx('ajb-field set-formfield', f.span === 2 && 'set-formfield--full')}>
          <label className="ajb-field__label">{f.lbl}</label>
          {f.kind === 'select' ? (
            <DropSelect value={draft[f.key]} onChange={(v) => set(f.key, v)} options={f.options} lang={lang} />
          ) : f.kind === 'number' ? (
            <input className="ajb-input ajb-input--boxed set-input ajb-ltr" type="number" min="0" max="120"
              value={draft[f.key]} onChange={(e) => set(f.key, parseInt(e.target.value || '0', 10))} />
          ) : (
            <input className={cx('ajb-input ajb-input--boxed set-input', f.mono && 'set-input--mono', f.dir === 'ltr' && 'ajb-ltr')}
              dir={f.dir} value={draft[f.key] || ''} placeholder={f.mono && f.key === 'token' ? 'group.name' : ''}
              onChange={(e) => set(f.key, e.target.value)} />
          )}
          {f.hint && <span className="ajb-helper set-helper">{f.hint}</span>}
        </div>
      ))}
    </div>
  );
}

export function CatalogEditor({ surface, tab, item, isNew, groups, s, lang, onSave, onCancel }) {
  const [draft, setDraft] = useState(item);
  useEffect(() => { setDraft(item); }, [item]);
  const heading = (isNew ? s.newItem : s.editItem) + ' · ' + (tab === 'products' ? s.tabProducts : tab === 'types' ? s.tabTypes : s.tabVars);
  const valid = tab === 'variables'
    ? (draft.token || '').trim() && (draft.lbl_en || '').trim()
    : (draft.en || '').trim() && (draft.id || '').trim();

  const body = (
    <React.Fragment>
      <EditorFields tab={tab} draft={draft} setDraft={setDraft} groups={groups} s={s} lang={lang} />
    </React.Fragment>
  );
  const actions = (
    <React.Fragment>
      <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onCancel}>{s.cancel}</button>
      <button type="button" className={cx('ajb-btn ajb-btn--sand', !valid && 'is-disabled')} onClick={() => valid && onSave(draft)}>
        <Icon name="check" />{s.save}
      </button>
    </React.Fragment>
  );

  if (surface === 'dialog') {
    return (
      <div className="set-overlay" onClick={onCancel}>
        <div className="ajb-scrim" />
        <div className="ajb-dialog set-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="set-editor-head">
            <h3 className="set-editor-title">{heading}</h3>
            <button type="button" className="set-iconbtn" onClick={onCancel} aria-label={s.cancel}><Icon name="x" /></button>
          </div>
          {body}
          <div className="ajb-dialog__actions set-editor-actions">{actions}</div>
        </div>
      </div>
    );
  }
  // drawer
  return (
    <div className="set-overlay set-overlay--drawer" onClick={onCancel}>
      <div className="ajb-scrim" />
      <aside className="set-drawer" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="set-editor-head">
          <h3 className="set-editor-title">{heading}</h3>
          <button type="button" className="set-iconbtn" onClick={onCancel} aria-label={s.cancel}><Icon name="x" /></button>
        </div>
        <div className="set-drawer-body">{body}</div>
        <div className="set-drawer-foot">{actions}</div>
      </aside>
    </div>
  );
}

/* ---------- delete confirm ---------- */
export function CatalogDelete({ tab, item, s, lang, onCancel, onConfirm }) {
  const name = tab === 'variables'
    ? '{{' + item.token + '}}'
    : (lang === 'ar' ? (item.ar || item.en) : (item.en || item.ar));
  const used = catalogUsage(tab, item);
  return (
    <div className="set-overlay" onClick={onCancel}>
      <div className="ajb-scrim" />
      <div className="ajb-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="ajb-dialog__ico"><Icon name="trash-2" /></div>
        <h3 className="ajb-dialog__title">{s.delTitle.replace('{name}', name)}</h3>
        <p className="ajb-dialog__text">{s.delText}</p>
        {used > 0 && <div className="set-usedwarn"><Icon name="alert-triangle" />{s.usedWarn.replace('{n}', used)}</div>}
        <div className="ajb-dialog__actions">
          <button type="button" className="ajb-btn ajb-btn--secondary" onClick={onCancel}>{s.delKeep}</button>
          <button type="button" className="ajb-btn ajb-btn--danger" onClick={onConfirm}><Icon name="trash-2" />{s.delConfirm}</button>
        </div>
      </div>
    </div>
  );
}
