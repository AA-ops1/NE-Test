/* global React, TPL, Icon, L, cx, CatalogTable, CatalogCards, CatalogEditor, CatalogDelete, blankItem, catalogUsage */
/* ============================================================
   Settings — catalogue manager (Products · Template types · Variables)
   One page, tabbed. Full CRUD + drag-reorder, EN/AR, persisted to
   localStorage (TPL.CATALOG_KEY) and merged back into the catalogue
   by template-data.js so Create / Edit / List pick up the edits.
   `view` ('table' | 'cards') is driven by the Catalog-view tweak.
   ============================================================ */
const { useState: useSS, useMemo: useSM, useEffect: useSE } = React;

const SET_TABS = [
  { id: 'products', icon: 'box', lbl: 'tabProducts', desc: 'descProducts', add: 'addProduct' },
  { id: 'types', icon: 'shapes', lbl: 'tabTypes', desc: 'descTypes', add: 'addType' },
  { id: 'variables', icon: 'braces', lbl: 'tabVars', desc: 'descVars', add: 'addVar' },
];

/* flatten / regroup the variable catalogue */
function flattenVars(groups) {
  const out = [];
  groups.forEach((g) => (g.vars || []).forEach((v) => out.push({ ...v, group: g.id })));
  return out;
}

function SettingsConsole({ t, lang, view }) {
  const s = t.set;
  const [tab, setTab] = useSS('products');
  const [q, setQ] = useSS('');

  const [products, setProducts] = useSS(() => TPL.PRODUCTS.map((x) => ({ ...x })));
  const [types, setTypes] = useSS(() => TPL.TYPES.map((x) => ({ ...x })));
  const [groups] = useSS(() => TPL.VAR_GROUPS.map((g) => ({ id: g.id, en: g.en, ar: g.ar, icon: g.icon })));
  const [vars, setVars] = useSS(() => flattenVars(TPL.VAR_GROUPS));

  const [editor, setEditor] = useSS(null); // { item, index, isNew }
  const [del, setDel] = useSS(null);        // { item, index }
  const [toast, setToast] = useSS(null);

  /* persist → localStorage (regroup vars), so the forms see the edits */
  useSE(() => {
    const varGroups = groups
      .map((g) => ({ ...g, vars: vars.filter((v) => v.group === g.id).map(({ group, ...rest }) => rest) }))
      .filter((g) => g.vars.length);
    try { localStorage.setItem(TPL.CATALOG_KEY, JSON.stringify({ products, types, varGroups })); } catch (e) {}
  }, [products, types, vars, groups]);

  useSE(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(id);
  }, [toast]);

  const items = tab === 'products' ? products : tab === 'types' ? types : vars;
  const setItems = tab === 'products' ? setProducts : tab === 'types' ? setTypes : setVars;
  const meta = SET_TABS.find((x) => x.id === tab);

  const filtered = useSM(() => {
    const n = q.trim().toLowerCase();
    if (!n) return items;
    return items.filter((it) => Object.values(it).join(' ').toLowerCase().includes(n));
  }, [items, q]);
  const canReorder = !q.trim();

  /* CRUD */
  const openNew = () => setEditor({ item: blankItem(tab, groups), index: -1, isNew: true });
  const openEdit = (item, index) => setEditor({ item: { ...item }, index, isNew: false });
  const saveItem = (draft) => {
    if (editor.isNew) setItems((arr) => [...arr, draft]);
    else setItems((arr) => arr.map((x, i) => (i === editor.index ? draft : x)));
    setToast({ icon: editor.isNew ? 'plus' : 'check', msg: editor.isNew ? s.addedToast : s.savedToast, sub: s.savedSub });
    setEditor(null);
  };
  const doDelete = () => {
    setItems((arr) => arr.filter((_, i) => i !== del.index));
    setToast({ icon: 'trash-2', tone: 'danger', msg: s.deletedToast });
    setDel(null);
  };
  const resetAll = () => { try { localStorage.removeItem(TPL.CATALOG_KEY); } catch (e) {} window.location.reload(); };

  const onEdit = { open: openEdit, reorder: setItems };
  const Rows = view === 'cards' ? CatalogCards : CatalogTable;
  const counts = { products: products.length, types: types.length, variables: vars.length };

  return (
    <div className="ts-page set-page">
      <header className="set-head">
        <div>
          <div className="ajb-crumb"><span className="ajb-crumb__current">{s.crumb}</span></div>
          <h1 className="ts-h1 set-h1">{s.title}</h1>
          <p className="set-sub">{s.subtitle}</p>
        </div>
        <button type="button" className="set-reset" onClick={resetAll} title={s.resetCat}>
          <Icon name="rotate-ccw" />{s.resetCat}
        </button>
      </header>

      <div className="set-flownote"><Icon name="git-branch" />{s.flowNote}</div>

      <div className="ajb-tabs set-tabs">
        {SET_TABS.map((tt) => (
          <button key={tt.id} type="button" className={cx(tab === tt.id && 'is-on')}
            onClick={() => { setTab(tt.id); setQ(''); }}>
            <Icon name={tt.icon} />{s[tt.lbl]}
            <span className="ajb-tab-badge set-tabbadge">{counts[tt.id]}</span>
          </button>
        ))}
      </div>

      <div className="set-toolbar">
        <p className="set-tabdesc">{s[meta.desc]}</p>
        <div className="set-toolbar-r">
          <div className="set-search">
            <Icon name="search" />
            <input value={q} placeholder={s.search} onChange={(e) => setQ(e.target.value)}
              dir={lang === 'ar' ? 'rtl' : 'ltr'} />
            {q && <button type="button" className="set-search-x" onClick={() => setQ('')}><Icon name="x" /></button>}
          </div>
          <button type="button" className="ajb-btn ajb-btn--sand" onClick={openNew}>
            <Icon name="plus" />{s[meta.add]}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="set-empty">
          <span className="set-empty-ico"><Icon name={q ? 'search-x' : meta.icon} /></span>
          <div className="set-empty-t">{q ? s.noMatch : s.empty}</div>
          {!q && <div className="set-empty-sub">{s.emptySub}</div>}
        </div>
      ) : (
        <Rows tab={tab} items={filtered} groups={groups} s={s} lang={lang}
          canReorder={canReorder} onEdit={onEdit} onDelete={(it, i) => setDel({ item: it, index: items.indexOf(it) })} />
      )}

      {editor && (
        <CatalogEditor surface={view === 'cards' ? 'dialog' : 'drawer'} tab={tab}
          item={editor.item} isNew={editor.isNew} groups={groups} s={s} lang={lang}
          onSave={saveItem} onCancel={() => setEditor(null)} />
      )}
      {del && (
        <CatalogDelete tab={tab} item={del.item} s={s} lang={lang}
          onCancel={() => setDel(null)} onConfirm={doDelete} />
      )}
      {toast && (
        <div className="set-toastwrap">
          <div className="ajb-toast set-toast">
            <span className={cx('ajb-toast__ico', toast.tone === 'danger' ? 'set-toast-ico--danger' : 'set-toast-ico--ok')}>
              <Icon name={toast.icon} />
            </span>
            <div className="ajb-toast__body">
              <div className="ajb-toast__title">{toast.msg}</div>
              {toast.sub && <div className="set-toast-sub">{toast.sub}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SettingsConsole });
