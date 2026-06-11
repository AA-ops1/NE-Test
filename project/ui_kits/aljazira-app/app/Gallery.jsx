/* global React, useApp, AjbHeader, Badge, StatusDot, CountBadge, Alert, Radio, Checkbox, Toggle, Segmented, Tabs, Select, Avatar, AvatarStack, ProgressBar, Spinner, Skeleton, Chip, Pagination, Breadcrumb, Toast, EmptyState, ListRow, Calendar, DateField */
const { useState: useGState } = React;

function Section({ title, children }) {
  return (
    <div className="ajbc-gal-sec">
      <div className="ajbc-gal-h">{title}</div>
      <div className="ajbc-gal-body">{children}</div>
    </div>
  );
}

function ComponentsGallery() {
  const { setScreen } = useApp();
  const [seg, setSeg] = useGState('All');
  const [tab, setTab] = useGState('accounts');
  const [radio, setRadio] = useGState('instant');
  const [save, setSave] = useGState(true);
  const [bio, setBio] = useGState(true);
  const [travel, setTravel] = useGState(false);
  const [page, setPage] = useGState(1);
  const [chips, setChips] = useGState(['Riyadh', 'Beneficiaries']);
  const [showToast, setShowToast] = useGState(true);
  const [date, setDate] = useGState(new Date(2026, 4, 19));

  return (
    <div className="ajb-app-screen ajbc-gal">
      <AjbHeader title="Components" onBack={() => setScreen('home')} />
      <div className="ajbc-gal-scroll">

        <Section title="Badges & status">
          <div className="ajbc-wrap">
            <Badge tone="sand">Premier</Badge>
            <Badge tone="success">Active</Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="danger">Blocked</Badge>
            <Badge tone="info">New</Badge>
          </div>
          <div className="ajbc-wrap" style={{ marginTop: 12, gap: 18 }}>
            <StatusDot tone="success">Settled</StatusDot>
            <StatusDot tone="warning">Processing</StatusDot>
            <StatusDot tone="danger">Failed</StatusDot>
            <span className="ajbc-status" style={{ gap: 8 }}>Alerts <CountBadge>3</CountBadge></span>
          </div>
        </Section>

        <Section title="Alerts">
          <Alert tone="success" title="Transfer complete" onClose={() => {}}>18,400 SAR sent to Aramco payroll.</Alert>
          <div style={{ height: 10 }} />
          <Alert tone="warning" title="Verify your identity">Your Absher details expire in 5 days.</Alert>
        </Section>

        <Section title="Selection controls">
          <div className="ajbc-cols2">
            <div>
              <Radio checked={radio === 'instant'} label="Instant" onChange={() => setRadio('instant')} />
              <Radio checked={radio === 'sameday'} label="Same-day" onChange={() => setRadio('sameday')} />
            </div>
            <div>
              <Checkbox checked={save} label="Save beneficiary" onChange={() => setSave(!save)} />
              <Toggle checked={bio} label="Biometric login" onChange={setBio} />
              <Toggle checked={travel} label="Travel mode" onChange={setTravel} />
            </div>
          </div>
        </Section>

        <Section title="Segmented & tabs">
          <Segmented options={['All', 'Income', 'Spending']} value={seg} onChange={setSeg} />
          <div style={{ height: 16 }} />
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'accounts', label: 'Accounts' },
            { id: 'cards', label: 'Cards', badge: 2 },
            { id: 'invest', label: 'Invest' },
          ]} />
        </Section>

        <Section title="Select">
          <Select label="From account" value="Current · •••• 4429" />
          <div style={{ height: 12 }} />
          <Select label="Transfer speed" value="Instant" focus />
        </Section>

        <Section title="Avatars">
          <div className="ajbc-wrap" style={{ alignItems: 'center', gap: 14 }}>
            <Avatar size="sm" initials="KA" gradient="linear-gradient(135deg,#001421,#8c684a)" />
            <Avatar size="md" src="../../assets/photo-man-shirt.png" />
            <Avatar size="md" symbol />
            <AvatarStack more={5} items={[
              { initials: 'F', gradient: 'linear-gradient(135deg,#001421,#8c684a)' },
              { initials: 'K', gradient: 'linear-gradient(135deg,#33b793,#1f6e57)' },
              { initials: 'N', gradient: 'linear-gradient(135deg,#3e87d3,#1f4c7d)' },
            ]} />
          </div>
        </Section>

        <Section title="Progress & loaders">
          <ProgressBar value={62} label="Hajj 2026 goal" right="62%" />
          <div style={{ height: 16 }} />
          <div className="ajbc-wrap" style={{ alignItems: 'center', gap: 16 }}>
            <Spinner label="Confirming…" size={32} />
          </div>
          <div style={{ height: 16 }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton w={40} h={40} radius={12} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton w="60%" h={12} /><Skeleton w="40%" h={10} />
            </div>
          </div>
        </Section>

        <Section title="Chips & filters">
          <div className="ajbc-wrap">
            {chips.map(c => <Chip key={c} onRemove={() => setChips(chips.filter(x => x !== c))}>{c}</Chip>)}
            <Chip selected>Income</Chip>
            <Chip dashed>+ Add filter</Chip>
          </div>
        </Section>

        <Section title="List rows">
          <div className="ajbc-list">
            <ListRow icon="user" title="Personal details" sub="Name, ID, contact" />
            <ListRow icon="globe" title="Language" value="العربية" />
            <ListRow icon="fingerprint" title="Biometric login" trailing="toggle" toggleOn={bio} onClick={() => setBio(!bio)} />
          </div>
        </Section>

        <Section title="Calendar & date field">
          <DateField label="Scheduled transfer" value={date} focus />
          <div style={{ height: 14 }} />
          <Calendar value={date} onChange={setDate} year={2026} month={4} />
        </Section>

        <Section title="Navigation">
          <Breadcrumb items={['Accounts', 'Current', 'May statement']} />
          <div style={{ height: 16 }} />
          <Pagination page={page} pages={[1, 2, 3]} last={12} onChange={setPage} />
        </Section>

        <Section title="Toast & empty state">
          {showToast && <Toast tone="success" icon="check" title="Beneficiary saved" action="Undo" onAction={() => setShowToast(false)} />}
          <div style={{ height: 16 }} />
          <EmptyState icon="inbox" title="No transactions yet" action="Make a transfer" onAction={() => setScreen('transfer')}>
            When money moves in or out, it appears here.
          </EmptyState>
        </Section>

      </div>
    </div>
  );
}

window.ComponentsGallery = ComponentsGallery;
