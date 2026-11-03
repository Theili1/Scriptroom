import { useEffect, useMemo, useState } from 'react'
import { Search, Clapperboard, Clock3, Eye, MessageCircle, ArrowUpLeft, X, Film, Bookmark, ChevronLeft } from 'lucide-react'
import { scripts as sampleScripts } from './data'
import { supabase, isSupabaseConfigured } from './supabase'

function Comments({ script }) {
  const [comments, setComments] = useState([])
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadComments = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('id, nickname, message, created_at')
      .eq('script_id', script.id)
      .order('created_at', { ascending: false })
      .limit(100)
    if (fetchError) setError('دریافت دیدگاه‌ها با مشکل روبه‌رو شد.')
    else setComments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    setError('')
    setNotice('')
    setComments([])
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.id])

  const submitComment = async (event) => {
    event.preventDefault()
    const cleanMessage = message.trim()
    const cleanNickname = nickname.trim().slice(0, 40) || 'مهمان'
    if (cleanMessage.length < 2) {
      setError('لطفاً یک دیدگاه کوتاه‌تر از دو حرف ننویس.')
      return
    }
    if (cleanMessage.length > 2000) {
      setError('دیدگاه باید حداکثر ۲۰۰۰ کاراکتر باشد.')
      return
    }
    if (!isSupabaseConfigured) {
      setError('اتصال دیتابیس هنوز تنظیم نشده است. راهنمای README را دنبال کن.')
      return
    }
    setSending(true)
    setError('')
    setNotice('')
    const { error: insertError } = await supabase.from('comments').insert({
      script_id: script.id,
      nickname: cleanNickname,
      message: cleanMessage,
    })
    setSending(false)
    if (insertError) {
      setError('ارسال دیدگاه انجام نشد. کمی بعد دوباره امتحان کن.')
      return
    }
    setMessage('')
    setNotice('دیدگاهت ثبت شد؛ ممنون که در گفت‌وگو شرکت کردی.')
    await loadComments()
  }

  return <div className="comments-area">
    {!isSupabaseConfigured && <div className="setup-hint">
      <strong>یک مرحله تا فعال شدن دیدگاه‌ها</strong>
      <p>برای ذخیره و نمایش دیدگاه‌ها، پروژه را به Supabase وصل کن. راهنمای کامل و دستور ساخت جدول در README قرار دارد.</p>
    </div>}
    <form className="comment-form" onSubmit={submitComment}>
      <label className="comment-label" htmlFor="nickname">نام مستعار <span>(اختیاری)</span></label>
      <input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40} placeholder="مثلاً یک عاشق سینما" />
      <label className="comment-label" htmlFor="comment-message">دیدگاه تو</label>
      <textarea id="comment-message" value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} rows={4} placeholder="نظرت رو درباره‌ی این فیلمنامه بنویس..." />
      <div className="comment-submit-row">
        <span className="comment-limit">{message.length}/۲۰۰۰</span>
        <button className="comment-submit" type="submit" disabled={sending || !isSupabaseConfigured}>{sending ? 'در حال ارسال...' : 'ارسال دیدگاه'} <ArrowUpLeft size={15} /></button>
      </div>
      {error && <p className="form-message error">{error}</p>}
      {notice && <p className="form-message success">{notice}</p>}
    </form>
    <div className="comments-list-head"><strong>دیدگاه‌های خوانندگان</strong><span>{comments.length} دیدگاه</span></div>
    {loading ? <p className="comments-empty">در حال دریافت دیدگاه‌ها...</p>
      : comments.length === 0 ? <p className="comments-empty">هنوز دیدگاهی ثبت نشده. اولین نفر باش!</p>
      : <div className="comments-list">{comments.map(comment => <article className="comment-item" key={comment.id}>
        <div className="comment-avatar">{(comment.nickname || 'م')[0]}</div>
        <div className="comment-content"><div className="comment-byline"><strong>{comment.nickname || 'مهمان'}</strong><time>{new Date(comment.created_at).toLocaleDateString('fa-IR')}</time></div><p>{comment.message}</p></div>
      </article>)}</div>}
  </div>
}

function ScriptReader({ script, onClose }) {
  return <div className="reader-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <article className="reader">
      <header className="reader-top">
        <span className="eyebrow"><span className="live-dot" /> متن فیلمنامه</span>
        <button className="icon-btn" onClick={onClose} aria-label="بستن"><X /></button>
      </header>
      <div className="reader-heading">
        <span className="script-english">{script.english}</span>
        <h2>{script.title}</h2>
        <div className="reader-meta">نوشته‌ی {script.author}<span>·</span>{script.genre}<span>·</span>{script.minutes} دقیقه</div>
      </div>
      <div className="screenplay">
        {script.content.map((line, i) => line.type === 'scene'
          ? <h3 className="scene" key={i}>{line.text}</h3>
          : line.type === 'character'
            ? <div className="dialogue" key={i}><strong>{line.name}</strong><p>{line.text}</p></div>
            : <p className="action" key={i}>{line.text}</p>
        )}
      </div>
      <section className="reader-comments">
        <div className="section-kicker">AFTER THE SCREENING</div>
        <h3>گفت‌وگو و نقد</h3>
        <p className="muted">نظرت را درباره‌ی داستان با دیگر خواننده‌ها به اشتراک بگذار.</p>
        <Comments script={script} />
      </section>
    </article>
  </div>
}

function Admin({ onClose, onChanged }) {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [items, setItems] = useState([])
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const empty = { title: '', english: '', author: '', genre: '', minutes: 10, excerpt: '', body: '' }
  const refresh = async () => {
    const { data, error: err } = await supabase.from('scripts').select('*').order('created_at', { ascending: false })
    if (err) setError('دریافت فیلمنامه‌ها ناموفق بود؛ تنظیمات دیتابیس را بررسی کنید.')
    else setItems(data || [])
  }
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (session) refresh() }, [session])
  const login = async e => {
    e.preventDefault(); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('ورود ناموفق بود؛ ایمیل و رمز عبور را بررسی کنید.')
  }
  const save = async e => {
    e.preventDefault(); setError('')
    const payload = { title: form.title.trim(), english: form.english.trim(), author: form.author.trim(), genre: form.genre.trim(), minutes: Number(form.minutes), excerpt: form.excerpt.trim(), content: form.body.split(/\n\s*\n/).map(text => ({ type: 'action', text: text.trim() })).filter(x => x.text), color: form.color || 'ochre' }
    if (!payload.content.length) { setError('متن فیلمنامه را وارد کنید.'); return }
    const { error: err } = form.id ? await supabase.from('scripts').update(payload).eq('id', form.id) : await supabase.from('scripts').insert(payload)
    if (err) { setError('ذخیره ناموفق بود. دسترسی مدیر و اطلاعات را بررسی کنید.'); return }
    setForm(null); await refresh(); onChanged()
  }
  const remove = async id => {
    if (!window.confirm('این فیلمنامه و دیدگاه‌های آن حذف شوند؟')) return
    const { error: err } = await supabase.from('scripts').delete().eq('id', id)
    if (err) setError('حذف ناموفق بود. دسترسی مدیر را بررسی کنید.')
    else { await refresh(); onChanged() }
  }
  return <div className="reader-backdrop"><article className="reader admin-panel"><header className="reader-top"><strong>مدیریت فیلمنامه‌ها</strong><button className="icon-btn" onClick={onClose} aria-label="بستن"><X /></button></header>
    {!supabase ? <p>ابتدا اتصال Supabase را طبق README تنظیم کنید.</p> : !session ? <form className="admin-form" onSubmit={login}><label>ایمیل مدیر<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>رمز عبور<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="primary-btn">ورود</button></form> : <><div className="admin-actions"><button className="primary-btn" onClick={() => setForm(empty)}>فیلمنامه جدید</button><button onClick={() => supabase.auth.signOut()}>خروج</button></div>
    {form && <form className="admin-form" onSubmit={save}>{[['title','عنوان'],['english','عنوان انگلیسی'],['author','نویسنده'],['genre','ژانر'],['minutes','زمان مطالعه (دقیقه)'],['excerpt','خلاصه']].map(([key,label]) => <label key={key}>{label}<input required type={key === 'minutes' ? 'number' : 'text'} min={key === 'minutes' ? 1 : undefined} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label>متن فیلمنامه<textarea required rows={12} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label><small>برای جدا کردن بندها یک خط خالی بگذارید.</small><div className="admin-actions"><button className="primary-btn">ذخیره</button><button type="button" onClick={() => setForm(null)}>انصراف</button></div></form>}
    <div className="admin-list">{items.map(item => <div key={item.id}><span>{item.title} — {item.author}</span><button onClick={() => setForm({ ...item, body: item.content.map(x => x.text).join('\n\n') })}>ویرایش</button><button onClick={() => remove(item.id)}>حذف</button></div>)}</div></>}{error && <p className="form-message error">{error}</p>}</article></div>
}

function App() {
  const [scripts, setScripts] = useState(isSupabaseConfigured ? [] : sampleScripts)
  const [loadError, setLoadError] = useState('')
  const [admin, setAdmin] = useState(false)
  const loadScripts = async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('scripts').select('*').order('created_at', { ascending: false })
    if (error) setLoadError('دریافت فیلمنامه‌ها ناموفق بود. اتصال و تنظیمات دیتابیس را بررسی کنید.')
    else { setLoadError(''); setScripts(data.map(s => ({ ...s, date: new Date(s.created_at).toLocaleDateString('fa-IR'), reads: '—' }))) }
  }
  useEffect(() => { loadScripts() }, [])
  const genres = ['همه', ...new Set(scripts.map(s => s.genre))]
  const [activeGenre, setActiveGenre] = useState('همه')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [saved, setSaved] = useState([])
  const filtered = useMemo(() => scripts.filter(s =>
    (activeGenre === 'همه' || s.genre === activeGenre) &&
    `${s.title} ${s.author} ${s.excerpt}`.includes(query.trim())
  ), [activeGenre, query])
  const toggleSave = id => setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])

  return <main>
    <nav className="nav shell">
      <a className="brand" href="#"><span className="brand-mark"><Clapperboard size={19} /></span><span>SCRIPT<span className="brand-light">ROOM</span></span></a>
      <div className="nav-links"><a href="#library">کتابخانه</a><a href="#about">درباره‌ی پروژه</a><button className="admin-link" onClick={() => setAdmin(true)}>مدیریت</button></div>
      <a className="nav-cta" href="#library">کشف فیلمنامه‌ها <ArrowUpLeft size={15} /></a>
    </nav>

    <section className="hero shell">
      <div className="hero-copy">
        <div className="overline"><span className="live-dot" /> یک قاب برای هر روایت</div>
        <h1>هر داستانی،<br /><em>یک جهان تازه.</em></h1>
        <p>فیلمنامه‌ها را بخوان، وارد جهان نویسنده شو و بعد از تیتراژ، گفت‌وگو را ادامه بده.</p>
        <a className="primary-btn" href="#library">ورود به کتابخانه <ChevronLeft size={17} /></a>
        <div className="hero-stats"><div><b>۰۳</b><span>داستان منتخب</span></div><i /><div><b>۰۳</b><span>ژانر متفاوت</span></div><i /><div><b>∞</b><span>زاویه‌ی دید</span></div></div>
      </div>
      <div className="hero-art">
        <div className="art-glow" />
        <div className="poster poster-back"><span>AN OPEN<br />ENDING</span><small>SR / 026</small></div>
        <div className="poster poster-front"><div className="poster-top">SCRIPTROOM <span>NO. 001</span></div><div className="poster-sun" /><div className="poster-title">THE<br /><i>LAST</i><br />TRAIN</div><div className="poster-bottom"><span>A STORY BY<br />RAHA NADERI</span><span>DRAMA<br />18 MIN</span></div></div>
        <div className="floating-note"><span className="note-dot" /> داستان‌ها اینجا زنده‌اند</div>
      </div>
    </section>

    <section className="library shell" id="library">
      <div className="section-head">
        <div><div className="section-kicker">THE SCRIPT LIBRARY / 01</div><h2>قاب‌های <em>خواندنی</em></h2><p className="muted">از میان روایت‌ها انتخاب کن؛ هر کدام شروع یک مکالمه‌اند.</p></div>
        <div className="library-count"><b>{String(filtered.length).padStart(2, '0')}</b><span>فیلمنامه</span></div>
      </div>
      <div className="toolbar">
        <div className="filters">{genres.map(g => <button key={g} className={activeGenre === g ? 'filter active' : 'filter'} onClick={() => setActiveGenre(g)}>{g}</button>)}</div>
        <label className="search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی عنوان یا نویسنده..." /></label>
      </div>
      {loadError && <p className="form-message error">{loadError}</p>}<div className="script-grid">
        {filtered.map((s, i) => <article className="script-card" key={s.id}>
          <div className={`card-art ${s.color}`}>
            <span className="card-index">SR — 00{i + 1}</span>
            <span className="card-art-title">{s.english.split(' ').map((w, j) => <span key={j}>{w}</span>)}</span>
            <span className="card-art-foot">A SHORT SCREENPLAY</span>
            <button className={`save-btn ${saved.includes(s.id) ? 'saved' : ''}`} onClick={() => toggleSave(s.id)} aria-label="ذخیره"><Bookmark size={16} fill={saved.includes(s.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="card-body">
            <div className="card-meta"><span>{s.genre}</span><span>{s.date}</span></div>
            <h3>{s.title}</h3><p>{s.excerpt}</p>
            <div className="card-footer"><span>نوشته‌ی {s.author}</span><button onClick={() => setSelected(s)}>خواندن داستان <ArrowUpLeft size={15} /></button></div>
            <div className="card-stats"><span><Clock3 size={13} /> {s.minutes} دقیقه</span><span><Eye size={13} /> {s.reads} بازدید</span><span><MessageCircle size={13} /> نقد و نظر</span></div>
          </div>
        </article>)}
      </div>
      {filtered.length === 0 && <div className="empty">چیزی پیدا نشد. عبارت یا ژانر دیگری را امتحان کن.</div>}
    </section>

    <section className="manifesto" id="about"><div className="shell manifesto-inner"><Film size={25} /><div className="section-kicker">A SPACE FOR STORIES</div><h2>فیلم‌ها تمام می‌شوند.<br /><em>گفت‌وگوها نه.</em></h2><p>ScriptRoom یک کتابخانه‌ی کوچک برای خواندن فیلمنامه و شنیدن برداشت‌های متفاوت است. اینجا قرار نیست فقط تماشاچی باشیم.</p></div></section>
    <footer className="footer shell"><a className="brand" href="#"><span className="brand-mark"><Clapperboard size={17} /></span><span>SCRIPT<span className="brand-light">ROOM</span></span></a><span>ساخته‌شده برای عاشقان روایت.</span><span>© 2026 SCRIPTROOM</span></footer>
    {admin && <Admin onClose={() => setAdmin(false)} onChanged={loadScripts} />}
    {selected && <ScriptReader script={selected} onClose={() => setSelected(null)} />}
  </main>
}

export default App
