import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDownToLine, ArrowRight, BookOpen, Check, ChevronDown, ClipboardList, Compass, FlaskConical, FolderOpen, Lightbulb, LockKeyhole, Sparkles, X } from 'lucide-react';
import { accountUrl, isDemo, listReports, loadAccount, membershipUrl, sampleReport, startDemo, submitDraft } from './api';
import { content, type Account, type Assessment, type Draft, type Report } from './content';
import './styles.css';

const fresh = (assessment: Assessment): Draft => ({ assessment, mode: 'explore', subject: '', level: '', topic: '', resources: '' });
const dateLabel = (date: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
const assessmentFromUrl = (): Assessment => window.location.hash === '#ee' ? 'ee' : 'ia';

export default function App() {
  const [assessment, setAssessment] = useState(assessmentFromUrl);
  const [drafts, setDrafts] = useState({ ia: fresh('ia'), ee: fresh('ee') });
  const [account, setAccount] = useState<Account | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [accountReady, setAccountReady] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<'register' | 'login' | 'membership' | null>(null);
  const [accountError, setAccountError] = useState('');
  const modal = useRef<HTMLDialogElement>(null);
  const result = useRef<HTMLElement>(null);
  const history = useRef<HTMLElement>(null);
  const draft = drafts[assessment];
  const config = content[assessment];
  const refining = draft.mode === 'refine';

  useEffect(() => {
    let active = true;
    loadAccount().then(value => { if (active) setAccount(value); })
      .catch(() => { if (active) setError('We couldn’t load your account. You can still view a sample report.'); })
      .finally(() => { if (active) setAccountReady(true); });
    const syncAssessment = () => { setAssessment(assessmentFromUrl()); setReport(null); setError(''); };
    window.addEventListener('hashchange', syncAssessment);
    return () => { active = false; window.removeEventListener('hashchange', syncAssessment); };
  }, []);

  useEffect(() => {
    if (dialog && !modal.current?.open) modal.current?.showModal();
    if (!dialog && modal.current?.open) modal.current.close();
  }, [dialog]);

  useEffect(() => {
    if (report) result.current?.focus();
  }, [report]);

  useEffect(() => {
    if (reports) history.current?.focus();
  }, [reports]);

  function update(change: Partial<Draft>) {
    setDrafts(previous => ({ ...previous, [assessment]: { ...previous[assessment], ...change } }));
  }

  function selectAssessment(value: Assessment) {
    setAssessment(value);
    window.history.replaceState(null, '', '#' + value);
    setReport(null);
    setError('');
  }

  function openDialog(value: NonNullable<typeof dialog>) {
    if (value === 'membership' && membershipUrl) { window.location.assign(membershipUrl); return; }
    if (value !== 'membership' && accountUrl) {
      const url = new URL(accountUrl, window.location.origin);
      url.searchParams.set('intent', value);
      url.searchParams.set('returnTo', window.location.pathname + window.location.hash);
      window.location.assign(url);
      return;
    }
    setAccountError('');
    setDialog(value);
  }

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const next = await submitDraft({ ...draft, topic: draft.topic.trim(), resources: draft.resources.trim() });
      setAccount(next.account);
      setReport(next.report);
      setReports(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We couldn’t create your report.');
    } finally { setBusy(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !accountReady) return;
    if (!draft.topic.trim()) { setError('Enter a topic or research question to continue.'); return; }
    if (!account) { openDialog('register'); return; }
    if (!account.remaining) { openDialog('membership'); return; }
    await generate();
  }

  async function openHistory() {
    setError('');
    try { setReports(await listReports()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'We couldn’t load your reports.'); }
  }

  return <div className="sp-topic-planner">
    <header className="site-header"><div className="shell header-row">
      <a className="brand" href="./"><span className="brand-icon"><BookOpen size={19} /></span>SyllaPass</a>
      <nav aria-label="Account">
        {account ? <button className="button ghost" onClick={openHistory}><FolderOpen size={17} /> My reports</button> : <>
          <button className="button ghost" onClick={() => openDialog('login')}>Log in</button>
          <button className="button dark" onClick={() => openDialog('register')}>Create free account <ArrowRight size={16} /></button>
        </>}
      </nav>
    </div></header>

    <main className="shell">
      <section className="hero" aria-labelledby="main-title">
        <div>
          <span className="free-label"><Sparkles size={15} /> Free to try</span>
          <h1 id="main-title">IB Topic Planner</h1>
          <p>Turn your interests into a research question you can take to your supervisor.</p>
          {!account && <div className="hero-actions">
            <button className="button dark" onClick={() => openDialog('register')}>Get started free <ArrowRight size={17} /></button>
            <button className="button quiet" onClick={() => setReport(sampleReport(draft))}>View a sample report</button>
          </div>}
        </div>
        <div className="free-details">
          <h2>Free account</h2>
          <p>No payment required. Create an account or log in to start.</p>
          <strong>2 topic plans per day</strong>
          <span>Use your plans to explore ideas or refine a question.</span>
        </div>
      </section>

      <div className="workspace">
        <form className="panel planner" onSubmit={submit}>
          <div className="panel-heading"><div><h2>Plan your research</h2><p>Choose your assessment and tell us what interests you.</p></div></div>
          <fieldset disabled={busy}>
            <legend>Assessment type</legend>
            <div className="assessment-options">
              {(['ia', 'ee'] as const).map(value => {
                const Icon = value === 'ia' ? FlaskConical : BookOpen;
                return <label className="assessment-option" key={value}>
                  <input type="radio" name="assessment" value={value} checked={assessment === value} onChange={() => selectAssessment(value)} />
                  <span className="assessment-face"><Icon size={20} /><span><strong>{value.toUpperCase()}</strong><small>{content[value].label}</small></span>{assessment === value && <Check className="selected-check" size={16} />}</span>
                </label>;
              })}
            </div>
          </fieldset>
          <div className="mode" aria-label="Planning mode">
            <button type="button" disabled={busy} aria-pressed={!refining} onClick={() => { update({ mode: 'explore' }); setError(''); }}>Explore topic ideas</button>
            <button type="button" disabled={busy} aria-pressed={refining} onClick={() => { update({ mode: 'refine' }); setError(''); }}>Refine my research question</button>
          </div>
          <div className="field-row">
            <label>Subject<span className="select-wrap"><select disabled={busy} required value={draft.subject} onChange={event => update({ subject: event.target.value })}><option value="">Select a subject</option>{config.subjects.map(subject => <option key={subject}>{subject}</option>)}</select><ChevronDown size={16} /></span></label>
            {assessment === 'ia' && <label>Level<span className="select-wrap"><select disabled={busy} required value={draft.level} onChange={event => update({ level: event.target.value })}><option value="">Select a level</option><option>HL</option><option>SL</option></select><ChevronDown size={16} /></span></label>}
          </div>
          <label>{refining ? 'Your current research question' : 'What topics interest you?'}
            <textarea disabled={busy} required maxLength={800} value={draft.topic} placeholder={refining ? 'Paste or type your research question.' : config.topic} onChange={event => update({ topic: event.target.value })} />
          </label>
          <label>{assessment === 'ia' ? 'What materials or data can you access?' : 'What sources have you found?'} <span className="optional">Optional</span>
            <textarea className="resources" disabled={busy} maxLength={1200} value={draft.resources} placeholder={config.resources} onChange={event => update({ resources: event.target.value })} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="submit-row">
            <button className="button primary" disabled={busy || !accountReady} type="submit"><Sparkles size={17} />{busy ? 'Preparing your report…' : refining ? 'Refine my question' : 'Show topic ideas'}<ArrowRight size={17} /></button>
            <span>{account ? account.remaining + ' of ' + account.dailyLimit + ' plans left today' : <><LockKeyhole size={14} /> Free account required</>}</span>
          </div>
          {account?.remaining === 0 && <button className="button quiet" type="button" onClick={() => openDialog('membership')}>Explore membership for more daily plans</button>}
        </form>

        <aside className="panel benefits">
          <div className="benefit-heading"><span className="tile"><ClipboardList size={20} /></span><h2>What you’ll receive</h2></div>
          <div className="benefit"><Compass size={19} /><div><h3>{refining ? 'A more focused question' : 'Three focused directions'}</h3><p>{refining ? 'See one way to narrow your question and what to verify before adopting it.' : 'Compare research questions grounded in your subject and interests.'}</p></div></div>
          <div className="benefit"><Lightbulb size={19} /><div><h3>A feasibility check</h3><p>{config.benefit}</p></div></div>
          <div className="benefit"><BookOpen size={19} /><div><h3>A next step for your supervisor</h3><p>Bring specific points to discuss before you commit to a topic.</p></div></div>
          <button className="button quiet sample-link" onClick={() => setReport(sampleReport(draft))}>View a sample report <ArrowRight size={16} /></button>
          <div className="report-note"><ArrowDownToLine size={17} /><p>Save a PDF copy anytime. Completed reports stay in My Reports for 15 days.</p></div>
        </aside>
      </div>

      {report && <section className="panel report" ref={result} tabIndex={-1} aria-label="Topic report">
        <div className="panel-heading"><div><h2>{report.title}</h2><p>{report.id === 'sample' || isDemo ? 'This fictional report shows the format and level of detail you can expect.' : 'Use these suggestions as a starting point for discussion with your supervisor.'}</p></div><button className="button dark print-button" onClick={() => window.print()}><ArrowDownToLine size={17} /> Save as PDF</button></div>
        {report.directions.map((direction, index) => <article className="direction" key={index}>
          <h3>{direction.title}</h3><p className="question">{direction.question}</p>
          <dl><div><dt>Possible approach</dt><dd>{direction.approach}</dd></div><div><dt>Evidence to look for</dt><dd>{direction.evidence}</dd></div><div><dt>Check this first</dt><dd>{direction.nextStep}</dd></div></dl>
        </article>)}
        {report.expiresAt && <p className="muted">Available through {dateLabel(report.expiresAt)}.</p>}
      </section>}

      {reports && <section className="panel history" ref={history} tabIndex={-1}><h2>My reports</h2>
        {reports.length ? <ul>{reports.map(item => <li key={item.id}><div><strong>{item.title}</strong><span>Available through {dateLabel(item.expiresAt)}</span></div><button className="button quiet" onClick={() => setReport({ ...item })}>Open report <ArrowRight size={16} /></button></li>)}</ul> : <p>No saved reports yet.</p>}
      </section>}
      <footer><span>SyllaPass</span><span>{isDemo ? 'Interactive demo · sample output' : 'IB Topic Planner'}</span></footer>
    </main>

    <dialog ref={modal} onClose={() => setDialog(null)} aria-labelledby="dialog-title">
      <button className="button close" aria-label="Close" onClick={() => setDialog(null)}><X size={19} /></button>
      <h2 id="dialog-title">{dialog === 'membership' ? 'Need more daily plans?' : dialog === 'login' ? 'Log in to SyllaPass' : 'Create a free account'}</h2>
      <p>{dialog === 'membership' ? 'Membership gives you more daily plans. Plan details are unavailable in this preview.' : isDemo ? 'Try the account flow with a demo session. You don’t need to enter any personal information.' : 'Account access is currently unavailable here.'}</p>
      {accountError && <p className="error" role="alert">{accountError}</p>}
      {isDemo && dialog !== 'membership' && <button className="button primary" onClick={async () => {
        try { setAccount(await startDemo()); setDialog(null); }
        catch { setAccountError('We couldn’t start a demo session. Check that your browser allows local storage.'); }
      }}>Continue in demo <ArrowRight size={17} /></button>}
    </dialog>
  </div>;
}
