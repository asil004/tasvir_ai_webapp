# 🚀 Vercel'da Deploy Qilish - To'liq Qo'llanma

## 📋 Kerakli Narsalar

- GitHub akkaunt
- Vercel akkaunt (GitHub bilan kirish tavsiya etiladi)
- Backend API ishlab turgan bo'lishi kerak (HTTPS)
- Telegram Bot tokeni

---

## 1️⃣ GitHub Repository Yaratish

### 1.1 GitHub'ga Kod Yuklash

```bash
# Loyihangiz papkasiga o'ting
cd D:\projects\image_generator_v1\webapp

# Git repository'ni boshlang (agar qilmagan bo'lsangiz)
git init

# .gitignore faylini tekshiring
# (node_modules, .next, .env* qo'shilgan bo'lishi kerak)

# Fayllarni qo'shing
git add .

# Commit qiling
git commit -m "Initial commit - Tasvir AI webapp"

# GitHub'da yangi repository yarating (GitHub.com → New Repository)
# Nomi: tasvir-ai-webapp

# Remote qo'shing (USERNAME o'rniga GitHub username)
git remote add origin https://github.com/USERNAME/tasvir-ai-webapp.git

# Push qiling
git branch -M main
git push -u origin main
```

---

## 2️⃣ Vercel Akkaunt va Loyiha

### 2.1 Vercel'ga Kirish

1. [vercel.com](https://vercel.com) ga o'ting
2. "Sign Up" tugmasini bosing
3. "Continue with GitHub" tanlang
4. GitHub bilan ruxsat bering

### 2.2 Yangi Loyiha Qo'shish

1. Vercel Dashboard → **"Add New Project"**
2. **"Import Git Repository"**
3. GitHub repository'ngizni toping: `tasvir-ai-webapp`
4. **"Import"** tugmasini bosing

---

## 3️⃣ Loyiha Sozlamalari

### 3.1 Build Settings

Vercel avtomatik aniqlaydi, lekin tekshiring:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3.2 Root Directory

Agar webapp papka ichida bo'lsa:
- **Root Directory:** `webapp`
- Aks holda bo'sh qoldiring

### 3.3 Environment Variables

**"Environment Variables"** bo'limiga o'ting va qo'shing:

| Name | Value | Izoh |
|------|-------|------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com` | Backend API URL (HTTPS!) |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | `your_bot_username` | Bot username (@siz) |
| `NODE_ENV` | `production` | Production rejimi |

**Muhim:**
- Backend URL oxirida `/` bo'lmasin
- HTTPS bo'lishi shart (HTTP ishlamaydi Telegram'da)

---

## 4️⃣ Deploy Qilish

### 4.1 Birinchi Deploy

1. Barcha sozlamalarni tekshiring
2. **"Deploy"** tugmasini bosing
3. Kutib turing (2-5 daqiqa)
4. Deploy muvaffaqiyatli bo'lsa, URL ko'rinadi:
   ```
   https://tasvir-ai-webapp.vercel.app
   ```

### 4.2 Custom Domain (Ixtiyoriy)

1. Vercel Dashboard → Loyihangiz → **"Settings"** → **"Domains"**
2. Domeningizni qo'shing: `tasvir.ai` yoki `app.tasvir.uz`
3. DNS sozlamalarini yangilang (ko'rsatmalar chiqadi)

---

## 5️⃣ Telegram Bot Sozlash

### 5.1 Bot Menu Button

BotFather'da menu button o'rnatish:

```
1. @BotFather ga /mybots yuboring
2. Botingizni tanlang
3. Bot Settings → Menu Button → Edit Menu Button URL

URL: https://tasvir-ai-webapp.vercel.app
```

### 5.2 Web App Domain

Agar kerak bo'lsa, BotFather'da domen tasdiqlang:

```
/setdomain - Web App domenini sozlash
```

### 5.3 Bot Commands (Ixtiyoriy)

```
/setcommands

start - Botni ishga tushirish
app - Web App ochish
help - Yordam
```

---

## 6️⃣ Backend Sozlamalar

Backend'da Vercel URL'ni qo'shish kerak:

### 6.1 CORS Sozlamalari

Backend (FastAPI) da:

```python
# main.py yoki app/main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tasvir-ai-webapp.vercel.app",  # Vercel URL
        "https://your-custom-domain.com",        # Custom domain (agar bor bo'lsa)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6.2 Webhook Sozlamalari (Click uchun)

Click webhook'da Vercel URL ishlatilmaydi (Backend'ga to'g'ridan-to'g'ri keladi).
Faqat backend HTTPS'da bo'lishi kerak.

---

## 7️⃣ Test Qilish

### 7.1 Telegram'da Test

1. Telegram'ni oching
2. Botingizni toping
3. Menu tugmasini bosing yoki `/start` yuboring
4. Web App ochilishi kerak
5. Template tanlang va test qiling

### 7.2 Tekshirish Ro'yxati

- ✅ Web App ochiladi
- ✅ Telegram user ma'lumotlari ko'rinadi (DevModeIndicator yashirin)
- ✅ Templatelar yuklanadi
- ✅ Rasm yuklash ishlaydi
- ✅ Subscription check ishlaydi
- ✅ To'lov oynasi ochiladi (Stars/Click)
- ✅ Generatsiya tugashi kutiladi
- ✅ Natija rasmni yuklab olish ishlaydi

---

## 8️⃣ Development Mode O'chirish

Production'da development mode ko'rinmasligi kerak.

### Variant 1: Environment Variable

`webapp/src/components/DevModeIndicator.tsx` da:

```typescript
const isDev = process.env.NODE_ENV === 'development' ||
              process.env.NEXT_PUBLIC_DEV_MODE === 'true';

if (!isDev) return null;
```

Vercel'da `NEXT_PUBLIC_DEV_MODE` qo'shmasangiz, ko'rinmaydi.

### Variant 2: Faylni O'chirish

`page.tsx` dan import va `<DevModeIndicator />` ni olib tashlang.

---

## 9️⃣ Yangi O'zgarishlar Deploy Qilish

### 9.1 GitHub'ga Push Qilish

```bash
# O'zgarishlar qiling
# Masalan: PaymentModal.tsx'da UI o'zgartirdingiz

# Fayllarni qo'shing
git add .

# Commit qiling
git commit -m "Update: Payment modal UI improvements"

# Push qiling
git push origin main
```

### 9.2 Avtomatik Deploy

- GitHub'ga push qilganingizdan keyin, Vercel avtomatik deploy qiladi
- 2-3 daqiqa ichida yangi versiya live bo'ladi
- Vercel Dashboard'da jarayonni kuzatishingiz mumkin

---

## 🔟 Muhim Maslahatlar

### 10.1 Environment Variables

- ❌ `.env.local` fayllarini GitHub'ga push qilmang
- ✅ Barcha sirli ma'lumotlarni Vercel Environment Variables'ga qo'ying
- ✅ Production va Development uchun alohida qiymatlar bering

### 10.2 HTTPS Majburiy

- Telegram WebApp faqat HTTPS'da ishlaydi
- Backend ham HTTPS bo'lishi kerak
- SSL sertifikati majburiy

### 10.3 Vercel Limitlar

**Free Plan:**
- 100 GB bandwidth/oy
- Unlimited deployments
- Automatic SSL
- Yetarli oddiy botlar uchun

**Agar ko'p foydalanuvchi bo'lsa:**
- Pro plan ($20/oy) - 1 TB bandwidth

### 10.4 Monitoring

Vercel Dashboard'da:
- **Analytics** - Traffic va performance
- **Logs** - Runtime errors
- **Deployments** - Deploy tarixi

---

## 🐛 Keng Tarqalgan Xatolar

### 1. "Module not found" xatosi

**Sabab:** Dependencies noto'g'ri o'rnatilgan

**Yechim:**
```bash
npm install
git add package-lock.json
git commit -m "Fix: Update dependencies"
git push
```

### 2. API chaqiruvlari ishlamaydi

**Sabab:** CORS yoki noto'g'ri API URL

**Yechim:**
- Backend CORS sozlamalarini tekshiring
- `NEXT_PUBLIC_API_URL` to'g'riligini tekshiring
- Network tab'da xatolarni ko'ring (Browser DevTools)

### 3. Environment variables ko'rinmaydi

**Sabab:** `NEXT_PUBLIC_` prefikssiz

**Yechim:**
- Client-side uchun: `NEXT_PUBLIC_API_URL`
- Server-side uchun: `API_SECRET_KEY` (prefikssiz)
- Redeploy qiling (Vercel ENV o'zgarganda)

### 4. Telegram'da "Web App ochilmadi"

**Sabab:** HTTP yoki noto'g'ri URL

**Yechim:**
- HTTPS ishlatilganini tekshiring
- BotFather'da URL to'g'riligini tekshiring
- SSL sertifikati amal qilayotganini tekshiring

---

## 📞 Qo'shimcha Yordam

### Vercel Documentation
- [Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Telegram WebApp
- [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)

### Deployment Logs
- Vercel Dashboard → Deployments → Log'larni ko'ring

---

## ✅ Deploy Muvaffaqiyatli!

Agar barcha qadamlar to'g'ri bajarilgan bo'lsa:

1. ✅ Vercel'da deploy bo'lgan
2. ✅ Telegram Bot ulangan
3. ✅ Backend bilan bog'langan
4. ✅ Foydalanuvchilar ishlatishlari mumkin

**Keyingi Qadamlar:**
- 📊 Analytics yoqing (Vercel + Google Analytics)
- 🔍 Error tracking (Sentry)
- 📱 Mobile responsiveness test qiling
- 🎨 UI/UX yaxshilang
- 📈 Foydalanuvchi feedbacki to'plang

---

**Muvaffaqiyat tilayman! 🎉**

Savollar bo'lsa, Vercel support yoki Telegram Web App dokumentatsiyasiga murojaat qiling.
