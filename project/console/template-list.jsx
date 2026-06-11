/* global React, TPL, Icon, L, cx, DropSelect, StatusPill, ChannelTag, KebabMenu, DeleteModal, NeToast, ArchiveModal, deleteMode */
/* ============================================================
   Templates list (Template Store) — search, filters, statuses.
   Rows route to View (details) and Edit. Read-only list surface.
   ============================================================ */
const { useState: useLS, useMemo: useLM } = React;

const TL_STATUSES = ['active', 'draft', 'review', 'expired', 'archived', 'inactive'];
const TL_STATUS_KEY = { active: 'stActive', draft: 'stDraft', review: 'stReview', expired: 'stExpired', archived: 'stArchived', inactive: 'stInactive' };
const TL_EDITABLE = { active: true, draft: true, review: true, inactive: true, expired: false, archived: false };

function lfmt(str, map) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m)); }

function TemplateStore({ t, lang, hrefView, hrefEdit, hrefNew }) {
  const [q, setQ] = useLS('');
  const [chan, setChan] = useLS('all');
  const [status, setStatus] = useLS('all');
  const [product, setProduct] = useLS('all');
  const [data, setData] = useLS(() => TPL.LIST);
  const [del, setDel] = useLS(null);
  const [arc, setArc] = useLS(null);
  const [toast, setToast] = useLS(null);

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  const askDelete = (row) => setDel({ mode: deleteMode(row), row });
  const askArchive = (row) => { setDel(null); setArc(row); };
  const doDelete = () => { setData(d => d.filter(x => x.id !== del.row.id)); setToast({ tone: 'danger', title: t.tDeleted, sub: t.tDeletedSub }); setDel(null); };
  const doArchive = (reason) => {
    const row = arc;
    setData(d => d.map(x => x.id === row.id
      ? { ...x, status: 'archived', archivedBy: { en: 'A. Al Amri', ar: 'عبدالرحمن العمري' }, archivedAt: { en: 'just now', ar: 'الآن' }, archivedReason: reason }
      : x));
    const sub = reason ? lfmt(t.tArchivedSubReason, { reason: reason.label + (reason.note ? ' — ' + reason.note : '') }) : t.tArchivedSub;
    setToast({ tone: 'neutral', title: t.tArchived, sub });
    setArc(null);
  };

  const statusOpts = useLM(() => [
    { id: 'all', en: TPL.T.en.allStatuses, ar: TPL.T.ar.allStatuses },
    ...TL_STATUSES.map(s => ({ id: s, en: TPL.T.en[TL_STATUS_KEY[s]], ar: TPL.T.ar[TL_STATUS_KEY[s]] })),
  ], []);
  const productOpts = useLM(() => [
    { id: 'all', en: TPL.T.en.allProducts, ar: TPL.T.ar.allProducts },
    ...TPL.PRODUCTS,
  ], []);

  const rows = useLM(() => {
    const needle = q.trim().toLowerCase();
    return data.filter(r => {
      if (chan !== 'all' && r.ch !== chan) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (product !== 'all' && r.product !== product) return false;
      if (needle) {
        const hay = (r.name.en + ' ' + r.name.ar + ' ' + r.id).toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data, q, chan, status, product]);

  const dirty = q || chan !== 'all' || status !== 'all' || product !== 'all';
  const clear = () => { setQ(''); setChan('all'); setStatus('all'); setProduct('all'); };

  const channels = [{ id: 'all', icon: 'layout-grid', en: t.allChannels, ar: t.allChannels }, ...TPL.CHANNELS];

  return (
    <div className="ts-page">
      <header className="tl-head">
        <div className="tl-head-l">
          <div className="ajb-crumb"><span className="ajb-crumb__current">{t.listTitle}</span></div>
          <h1 className="ts-h1" style={{ marginTop: 6 }}>{t.listTitle}</h1>
          <p className="tl-count">{rows.length === 1 ? t.tplCount1 : lfmt(t.tplCount, { n: rows.length })}</p>
        </div>
        <div className="tl-head-r">
          <div className="ts-listsearch">
            <Icon name="search" />
            <input value={q} placeholder={t.searchList} onChange={e => setQ(e.target.value)} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
          </div>
          <a href={hrefNew} className="ajb-btn ajb-btn--sand"><Icon name="plus" />{t.listNew}</a>
        </div>
      </header>

      <div className="tl-filters">
        <div className="tl-chips">
          {channels.map(c => (
            <span key={c.id}
              className={cx('ajb-chip', 'ajb-chip--filter', (chan === c.id || (c.id === 'all' && chan === 'all')) && 'is-on')}
              onClick={() => setChan(c.id)}>
              {c.id !== 'all' && <Icon name={c.icon} />}{L(c, lang)}
            </span>
          ))}
        </div>
        <div className="tl-selects">
          <div className="tl-select"><DropSelect value={status} onChange={setStatus} options={statusOpts} lang={lang} placeholder={t.allStatuses} icon="circle-dot" /></div>
          <div className="tl-select"><DropSelect value={product} onChange={setProduct} options={productOpts} lang={lang} placeholder={t.allProducts} icon="package" /></div>
          {dirty && <button type="button" className="tl-clear" onClick={clear}><Icon name="x" />{t.clearFilters}</button>}
        </div>
      </div>

      <div className="ts-tablewrap tl-tablewrap">
        {rows.length === 0 ? (
          <div className="tl-empty">
            <div className="ajb-empty">
              <div className="ajb-empty__badge"><Icon name="search-x" /></div>
              <h3 className="ajb-empty__title">{t.noResultsTitle}</h3>
              <p className="ajb-empty__text">{t.noResultsText}</p>
              {dirty && <button type="button" className="ajb-btn ajb-btn--secondary" onClick={clear}>{t.clearFilters}</button>}
            </div>
          </div>
        ) : (
          <table className="ajb-table ts-table">
            <thead>
              <tr>
                <th>{t.colName}</th>
                <th className="tl-hide2">{t.colProduct}</th>
                <th className="tl-hide">{t.colType}</th>
                <th className="tl-hide2">{t.colVer}</th>
                <th>{t.colStatus}</th>
                <th className="tl-hide">{t.colUpdated}</th>
                <th className="tl-actions-col">{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const prod = TPL.PRODUCTS.find(p => p.id === r.product);
                const type = TPL.TYPES.find(x => x.id === r.type);
                const ch = TPL.CHANNELS.find(x => x.id === r.ch);
                const viewUrl = hrefView + '?ch=' + r.detail;
                const canEdit = TL_EDITABLE[r.status];
                return (
                  <tr key={r.id} onClick={() => { window.location.href = viewUrl; }}>
                    <td>
                      <div className="tl-namecell">
                        <span className="tl-chico"><Icon name={ch.icon} /></span>
                        <div className="tl-nameblock">
                          <div className="ts-tname">{L(r.name, lang)}</div>
                          <div className="ts-tid ajb-ltr">{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="tl-hide2">{prod ? L(prod, lang) : '—'}</td>
                    <td className="tl-hide">{type ? L(type, lang) : '—'}</td>
                    <td className="tl-hide2 tl-vercell"><span className="ajb-ltr">{r.ver}</span></td>
                    <td><StatusPill status={r.status} t={t} /></td>
                    <td className="tl-hide ts-muted">{L(r.upd, lang)} <span className="tl-updby">· {t.updatedByShort} {L(r.by, lang)}</span></td>
                    <td className="tl-actions-col" onClick={e => e.stopPropagation()}>
                      <div className="tl-actions">
                        <a href={viewUrl} className="tl-act" title={t.detailsAction}><Icon name="eye" /></a>
                        <a href={canEdit ? hrefEdit : undefined} className={cx('tl-act', !canEdit && 'is-disabled')} title={t.editAction}><Icon name="pencil" /></a>
                        <KebabMenu t={t} items={r.status === 'archived'
                          ? [{ icon: 'copy', label: t.duplicateTpl, onClick: () => {} }]
                          : [
                            { icon: 'copy', label: t.duplicateTpl, onClick: () => {} },
                            { icon: 'archive', label: t.archiveTpl, onClick: () => askArchive(r) },
                            { sep: true },
                            { icon: 'trash-2', label: t.deleteTpl, danger: r.status === 'draft', disabled: r.status !== 'draft', hint: r.status !== 'draft' ? t.delDraftOnly : undefined, onClick: () => askDelete(r) },
                          ]} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {del && <DeleteModal mode={del.mode} row={del.row} lang={lang} t={t} onClose={() => setDel(null)} onConfirm={doDelete} onArchive={() => askArchive(del.row)} />}
      {arc && <ArchiveModal row={arc} lang={lang} t={t} onClose={() => setArc(null)} onConfirm={doArchive} />}
      {toast && <NeToast tone={toast.tone} title={toast.title} sub={toast.sub} onClose={() => setToast(null)} />}
    </div>
  );
}

Object.assign(window, { TemplateStore });
