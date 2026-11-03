# ScriptRoom 🎬

کتابخانه‌ای فارسی و راست‌چین برای خواندن فیلمنامه‌های کوتاه و گفت‌وگو درباره‌ی آن‌ها. ساخته‌شده با React + Vite و قابل انتشار روی GitHub Pages.

## اجرا در سیستم شخصی

```bash
npm install
cp .env.example .env
npm run dev
```

## فعال‌سازی کامنت بدون ثبت‌نام

کامنت‌ها با Supabase ذخیره می‌شوند؛ کاربران برای نظر دادن نیازی به ساخت حساب یا ورود به GitHub ندارند.

1. در [supabase.com](https://supabase.com/) یک پروژه بساز.
2. در داشبورد پروژه به **SQL Editor** برو و محتوای `supabase/schema.sql` را اجرا کن.
3. از **Project Settings → API** آدرس پروژه و کلید عمومی `anon` یا `publishable` را بردار.
4. فایل `.env.example` را به `.env` تغییر نام بده و مقادیر را وارد کن:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

5. برنامه را اجرا کن و ثبت دیدگاه را امتحان کن.

> کلید عمومی anon/publishable برای استفاده در مرورگر طراحی شده است. هرگز کلید `service_role` یا کلید محرمانه را در فرانت‌اند قرار نده.

### امنیت و مدیریت اسپم

این نسخه از Row Level Security (RLS) استفاده می‌کند و فقط خواندن و ثبت دیدگاه را از سمت بازدیدکننده مجاز می‌کند؛ حذف یا ویرایش عمومی وجود ندارد. چون فرم عمومی است، در انتشار عمومی واقعی بهتر است CAPTCHA مثل Cloudflare Turnstile یا hCaptcha و محدودیت نرخ درخواست در یک Edge Function اضافه شود. محدودیت‌های طول متن به‌تنهایی جلوی اسپم خودکار را نمی‌گیرند.

## انتشار روی GitHub Pages

1. پروژه را در یک repository در GitHub قرار بده.
2. در **Settings → Secrets and variables → Actions → Variables** دو متغیر زیر را بساز:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. فایل workflow در `.github/workflows/deploy.yml` را به‌روزرسانی کن تا این متغیرها هنگام build به Vite داده شوند (نمونه پایین).
4. در **Settings → Pages**، Source را روی **GitHub Actions** قرار بده.
5. با هر push به شاخه `main`، سایت build و منتشر می‌شود.

در فایل `.github/workflows/deploy.yml`، مرحله‌ی build را این‌طور تنظیم کن:

```yaml
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}
```

تنظیم `base` در `vite.config.js` نام repository را برای GitHub Actions به‌صورت خودکار می‌خواند. اگر سایت را روی دامنه‌ی اصلی `username.github.io` منتشر می‌کنی، مقدار `base` را `/` قرار بده.

## امکانات

- فهرست و جست‌وجوی فیلمنامه‌ها
- فیلتر ژانر
- صفحه‌خوان اختصاصی با فرمت فیلمنامه
- مدیریت فیلمنامه‌ها با ورود مدیر و ذخیره در Supabase
- ارسال و نمایش دیدگاه عمومی بدون ثبت‌نام
- طراحی واکنش‌گرا و فارسی/RTL

## پنل مدیریت فیلمنامه‌ها

1. در پروژه رایگان Supabase، فایل `supabase/schema.sql` را در SQL Editor اجرا کنید. اجرای مجدد آن داده‌های موجود را بازنویسی نمی‌کند و نمونه‌های اولیه را اضافه می‌کند.
2. در بخش Authentication → Users یک کاربر با ایمیل و رمز عبور بسازید. شناسه UUID آن را بردارید و در SQL Editor دستور زیر را با شناسه واقعی اجرا کنید:

```sql
insert into public.admins (user_id) values ('USER_UUID') on conflict do nothing;
```

3. آدرس و کلید عمومی پروژه را مطابق بخش تنظیمات بالا در `.env` وارد و برنامه را دوباره اجرا کنید. در سایت روی «مدیریت» بزنید و با همان حساب وارد شوید. مدیر می‌تواند فیلمنامه اضافه، ویرایش یا حذف کند؛ حذف فیلمنامه دیدگاه‌های آن را نیز حذف می‌کند.
4. بازدیدکنندگان بدون حساب می‌توانند برای هر فیلمنامه دیدگاه بگذارند. دسترسی نوشتن فیلمنامه از طریق RLS به مدیران محدود است؛ حساب‌های عادی مدیر نیستند.

متن جدید به صورت بندهای ساده ذخیره می‌شود؛ هنگام ویرایش نمونه‌های دارای دیالوگ و سرصحنه، قالب‌بندی ویژه آنها به بند ساده تبدیل می‌شود. نمایش و ذخیره داده‌ها به تنظیم پروژه Supabase و انتشار متغیرهای محیطی وابسته است. سقف‌ها و شرایط پلن رایگان Supabase ممکن است تغییر کنند.
