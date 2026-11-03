import { useEffect, useMemo, useState } from 'react'
import {
  Search, Clapperboard, Clock3, Eye, MessageCircle, ArrowUpLeft, X, Film,
  Bookmark, ChevronLeft, LayoutDashboard, FileText, Plus, LogOut, Pencil,
  Trash2, User, LockKeyhole, Sparkles, CalendarDays, Save, LoaderCircle,
} from 'lucide-react'
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
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [items, setItems] = useState([])
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const empty = { title: '', english: '', author: '', genre: '', minutes: 10, excerpt: '', body: '', color: 'blue' }
  const refresh = async () => {
    const { data, error: err } = await supabase.from('scripts').select('*').order('created_at', { ascending: false })
    if (err) setError('دریافت فیلمنامه‌ها ناموفق بود؛ تنظیمات دیتابیس را بررسی کنید.')
    else setItems(data || [])
  }
  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (session) refresh() }, [session])
  const login = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) setError('ورود ناموفق بود؛ ایمیل و رمز عبور را بررسی کنید.')
  }
  const save = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    const payload = { title: form.title.trim(), english: form.english.trim(), author: form.author.trim(), genre: form.genre.trim(), minutes: Number(form.minutes), excerpt: form.excerpt.trim(), content: form.body.split(/\n\s*\n/).map(text => ({ type: 'action', text: text.trim() })).filter(x => x.text), color: form.color || 'ochre' }
    if (!payload.content.length) { setError('متن فیلمنامه را وارد کنید.'); setBusy(false); return }
    const { error: err } = form.id ? await supabase.from('scripts').update(payload).eq('id', form.id) : await supabase.from('scripts').insert(payload)
    if (err) { setError('ذخیره ناموفق بود. دسترسی مدیر و اطلاعات را بررسی کنید.'); setBusy(false); return }
    setForm(null); await refresh(); await onChanged(); setBusy(false)
  }
  const remove = async id => {
    if (!window.confirm('این فیلمنامه و دیدگاه‌های آن حذف شوند؟')) return
    const { error: err } = await supabase.from('scripts').delete().eq('id', id)
    if (err) setError('حذف ناموفق بود. دسترسی مدیر را بررسی کنید.')
    else { await refresh(); onChanged() }
  }
  const editItem = item => setForm({ ...item, body: item.content.map(x => x.text).join('\n\n') })

  return <div className="reader-backdrop admin-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <article className="admin-panel">
      <header className="admin-topbar">
        <div className="admin-brand"><span><Clapperboard size={19} /></span><div><strong>ScriptRoom</strong><small>پنل مدیریت محتوا</small></div></div>
        <div className="admin-top-actions">{session && <span className="admin-online"><i /> آنلاین</span>}<button className="icon-btn" onClick={onClose} aria-label="بستن پنل"><X /></button></div>
      </header>

      {!supabase ? <div className="admin-state"><Sparkles /><h2>اتصال به Supabase کامل نیست</h2><p>متغیرهای اتصال را در تنظیمات پروژه وارد و سایت را دوباره منتشر کنید.</p></div>
        : authLoading ? <div className="admin-state"><LoaderCircle className="spin" /><p>در حال بررسی نشست مدیریت...</p></div>
          : !session ? <div className="admin-login-layout">
            <section className="admin-login-intro"><div className="login-orb"><Clapperboard /></div><span>داشبورد اختصاصی ScriptRoom</span><h2>روایت‌ها را<br /><em>حرفه‌ای مدیریت کن.</em></h2><p>فیلمنامه‌های تازه را منتشر کن، آثار قبلی را ویرایش کن و کتابخانه را همیشه به‌روز نگه دار.</p><div className="login-features"><span><FileText /> مدیریت یکپارچه آثار</span><span><LockKeyhole /> ورود امن با Supabase</span></div></section>
            <form className="admin-login-card" onSubmit={login}>
              <div className="login-card-head"><span><LockKeyhole /></span><div><h3>ورود مدیر</h3><p>برای ورود اطلاعات حساب مدیریت را وارد کنید.</p></div></div>
              <label><span>ایمیل مدیر</span><div className="input-with-icon"><User /><input type="email" dir="ltr" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" /></div></label>
              <label><span>رمز عبور</span><div className="input-with-icon"><LockKeyhole /><input type="password" dir="ltr" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div></label>
              {error && <p className="form-message error">{error}</p>}
              <button className="admin-primary wide" disabled={busy}>{busy ? <><LoaderCircle className="spin" /> در حال ورود...</> : <>ورود به داشبورد <ArrowUpLeft /></>}</button>
            </form>
          </div>
            : <div className="admin-workspace">
              <aside className="admin-sidebar">
                <div className="admin-user"><span><User /></span><div><strong>مدیر محتوا</strong><small>{session.user.email}</small></div></div>
                <nav><button className="active" onClick={() => setForm(null)}><LayoutDashboard /> نمای کلی</button><button onClick={() => setForm(empty)}><Plus /> فیلمنامه جدید</button></nav>
                <button className="admin-logout" onClick={() => supabase.auth.signOut()}><LogOut /> خروج از حساب</button>
              </aside>
              <main className="admin-main">
                <div className="admin-heading"><div><span>CONTENT STUDIO</span><h2>{form ? (form.id ? 'ویرایش فیلمنامه' : 'فیلمنامه جدید') : 'مدیریت فیلمنامه‌ها'}</h2><p>{form ? 'اطلاعات اثر را کامل کنید و تغییرات را ذخیره کنید.' : 'همه‌ی آثار منتشرشده را از اینجا مدیریت کنید.'}</p></div>{!form && <button className="admin-primary" onClick={() => setForm(empty)}><Plus /> افزودن فیلمنامه</button>}</div>
                {!form && <div className="admin-stats"><article><span><FileText /></span><div><b>{items.length.toLocaleString('fa-IR')}</b><small>فیلمنامه منتشرشده</small></div></article><article><span><Sparkles /></span><div><b>{new Set(items.map(x => x.genre)).size.toLocaleString('fa-IR')}</b><small>ژانر فعال</small></div></article><article><span><CalendarDays /></span><div><b>{new Date().toLocaleDateString('fa-IR', { month: 'long' })}</b><small>آخرین به‌روزرسانی</small></div></article></div>}

                {form ? <form className="admin-editor" onSubmit={save}>
                  <div className="editor-section"><div className="editor-section-title"><span>۰۱</span><div><strong>مشخصات اصلی</strong><small>اطلاعاتی که روی کارت اثر دیده می‌شود.</small></div></div><div className="admin-form-grid">{[['title','عنوان فارسی','مثلاً آخرین قطار'],['english','عنوان انگلیسی','THE LAST TRAIN'],['author','نام نویسنده','نام و نام خانوادگی'],['genre','ژانر','مثلاً درام'],['minutes','زمان مطالعه','۱۰']].map(([key,label,placeholder]) => <label key={key} className={key === 'title' || key === 'english' ? 'field-wide' : ''}><span>{label}</span><input required type={key === 'minutes' ? 'number' : 'text'} dir={key === 'english' ? 'ltr' : 'rtl'} min={key === 'minutes' ? 1 : undefined} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label><span>رنگ پوستر</span><select value={form.color || 'blue'} onChange={e => setForm({ ...form, color: e.target.value })}><option value="blue">آبی شب</option><option value="ochre">کهربایی</option><option value="rose">رز دودی</option></select></label><label className="field-full"><span>خلاصه‌ی داستان</span><textarea required rows={3} maxLength={2000} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="در چند جمله کوتاه، فضای داستان را معرفی کنید..." /></label></div></div>
                  <div className="editor-section"><div className="editor-section-title"><span>۰۲</span><div><strong>متن فیلمنامه</strong><small>برای جدا کردن بندها یک خط خالی بگذارید.</small></div></div><label className="script-editor"><textarea required rows={14} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="متن فیلمنامه را اینجا بنویسید..." /><small>{form.body.length.toLocaleString('fa-IR')} نویسه</small></label></div>
                  {error && <p className="form-message error">{error}</p>}
                  <div className="editor-actions"><button type="button" className="admin-secondary" onClick={() => { setForm(null); setError('') }}>انصراف</button><button className="admin-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Save />} {busy ? 'در حال ذخیره...' : 'ذخیره و انتشار'}</button></div>
                </form>
                  : <section className="admin-content-list"><div className="content-list-head"><span>عنوان اثر</span><span>ژانر و زمان</span><span>تاریخ انتشار</span><span>عملیات</span></div>{items.length === 0 ? <div className="admin-empty"><FileText /><h3>هنوز فیلمنامه‌ای نیست</h3><p>اولین اثر را به کتابخانه اضافه کنید.</p><button className="admin-primary" onClick={() => setForm(empty)}><Plus /> افزودن فیلمنامه</button></div> : items.map((item, index) => <article className="admin-content-row" key={item.id}><div className="content-title"><span className={`mini-poster ${item.color || 'blue'}`}>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.english} · {item.author}</small></div></div><div className="content-meta"><span>{item.genre}</span><small>{item.minutes.toLocaleString('fa-IR')} دقیقه</small></div><time>{new Date(item.created_at).toLocaleDateString('fa-IR')}</time><div className="row-actions"><button onClick={() => editItem(item)} aria-label={`ویرایش ${item.title}`}><Pencil /></button><button className="danger" onClick={() => remove(item.id)} aria-label={`حذف ${item.title}`}><Trash2 /></button></div></article>)}</section>}
              </main>
            </div>}
    </article>
  </div>
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
  useEffect(() => {
    if (!admin && !selected) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setAdmin(false)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [admin, selected])
  const filtered = useMemo(() => scripts.filter(s =>
    (activeGenre === 'همه' || s.genre === activeGenre) &&
    `${s.title} ${s.author} ${s.excerpt}`.includes(query.trim())
  ), [scripts, activeGenre, query])
  const toggleSave = id => setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])

  return <main>
    <nav className="nav shell">
      <a className="brand" href="#"><span className="brand-mark"><Clapperboard size={19} /></span><span>SCRIPT<span className="brand-light">ROOM</span></span></a>
      <div className="nav-links"><a href="#library">کتابخانه</a><a href="#about">درباره‌ی پروژه</a></div>
      <div className="nav-actions"><button className="admin-link" onClick={() => setAdmin(true)}><LayoutDashboard size={15} /> مدیریت</button><a className="nav-cta" href="#library">کشف فیلمنامه‌ها <ArrowUpLeft size={15} /></a></div>
    </nav>

    <section className="hero shell">
      <div className="hero-copy">
        <div className="overline"><span className="live-dot" /> یک قاب برای هر روایت</div>
        <h1>هر داستانی،<br /><em>یک جهان تازه.</em></h1>
        <p>فیلمنامه‌ها را بخوان، وارد جهان نویسنده شو و بعد از تیتراژ، گفت‌وگو را ادامه بده.</p>
        <a className="primary-btn" href="#library">ورود به کتابخانه <ChevronLeft size={17} /></a>
        <div className="hero-stats"><div><b>{scripts.length.toLocaleString('fa-IR')}</b><span>داستان منتخب</span></div><i /><div><b>{Math.max(genres.length - 1, 0).toLocaleString('fa-IR')}</b><span>ژانر متفاوت</span></div><i /><div><b>∞</b><span>زاویه‌ی دید</span></div></div>
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
