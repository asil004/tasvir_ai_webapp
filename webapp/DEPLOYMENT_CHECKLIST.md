# ✅ Deployment Checklist

Vercel'ga deploy qilishdan oldin va keyin tekshirish ro'yxati.

---

## 📦 Deploy Qilishdan Oldin

### Kod Tayyorligi
- [ ] Barcha fayllar saqlangan
- [ ] `npm run build` local'da ishlaydi
- [ ] `.gitignore` to'g'ri sozlangan
  - [ ] `node_modules/` qo'shilgan
  - [ ] `.next/` qo'shilgan
  - [ ] `.env.local` qo'shilgan
- [ ] Sirli ma'lumotlar `.env` fayllarida (kodda emas!)

### GitHub
- [ ] GitHub repository yaratilgan
- [ ] Kod GitHub'ga push qilingan
- [ ] Repository public yoki Vercel access bor

### Backend Tayyorligi
- [ ] Backend API HTTPS'da ishlaydi
- [ ] CORS sozlamalari to'g'ri
- [ ] Barcha endpointlar ishlaydi:
  - [ ] `GET /templates`
  - [ ] `POST /check-subscription`
  - [ ] `POST /generate`
  - [ ] `POST /create-payment`
  - [ ] `POST /confirm-payment` (Stars uchun)
  - [ ] `GET /generation-status/{id}`
  - [ ] `GET /download/{filename}`

### Telegram Bot
- [ ] Bot tokeni olingan (@BotFather)
- [ ] Bot username ma'lum

---

## 🚀 Vercel Deploy Jarayoni

### Loyiha Sozlash
- [ ] Vercel akkauntga kirilgan
- [ ] GitHub bilan ulangan
- [ ] "New Project" boshlangan
- [ ] Repository import qilingan

### Build Sozlamalari
- [ ] Framework: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Root Directory: `webapp` (agar kerak bo'lsa)

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` = Backend URL (HTTPS!)
- [ ] `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` = Bot username
- [ ] `NODE_ENV` = production

### Deploy
- [ ] "Deploy" tugmasi bosilgan
- [ ] Deploy muvaffaqiyatli tugagan
- [ ] Vercel URL olingan: `https://your-app.vercel.app`

---

## 🔗 Telegram Bot Ulash

### BotFather Sozlamalari
- [ ] @BotFather'ga /mybots yuborilgan
- [ ] Bot tanlangan
- [ ] Bot Settings → Menu Button → Edit Menu Button URL
- [ ] Vercel URL kiritilgan
- [ ] Saqlangan

### Test
- [ ] Telegram'da botni ochish
- [ ] Menu tugmasi ko'rinadi
- [ ] Menu tugmasi bosilganda Web App ochiladi
- [ ] Vercel URL'ga yo'naltiriladi

---

## 🧪 Funksionallik Testi

### Web App Ochilishi
- [ ] Telegram'da Web App ochiladi
- [ ] Loading ekrani ko'rinadi
- [ ] Xatoliklar yo'q (Console tekshirish)

### User Detection
- [ ] Telegram user ma'lumotlari olinadi
- [ ] User ID to'g'ri
- [ ] DevModeIndicator ko'rinmaydi (production'da)

### Templates
- [ ] Templatelar yuklanadi
- [ ] Rasmlar to'g'ri ko'rinadi
- [ ] Narxlar to'g'ri (Stars va UZS)
- [ ] Template tanlanadi

### Image Upload
- [ ] "Rasmlaringizni yuklang" modal ochiladi
- [ ] Kamera/galereya ochiladi
- [ ] Rasmlar yuklanadi va preview ko'rinadi
- [ ] Kerakli sondagi rasmlar yuklansa "Davom etish" faol bo'ladi

### Subscription Check
- [ ] Check kanallar sub qilish ishlaydi
- [ ] 2+ kanal: To'lovsiz davom etadi
- [ ] <2 kanal: To'lov modal ochiladi

### Payment (Stars)
- [ ] To'lov usulini tanlash modal ochiladi
- [ ] Stars tugmasi ko'rinadi
- [ ] Narx to'g'ri ko'rsatilgan
- [ ] Telegram versiya tekshiriladi:
  - [ ] v6.1+ : Stars ishlaydi
  - [ ] v6.0 : Ogohlantirish ko'rsatiladi
- [ ] Stars invoice ochiladi
- [ ] To'lov qilinadi
- [ ] Callback qaytadi
- [ ] confirm-payment API chaqiriladi

### Payment (Click)
- [ ] Click tugmasi ko'rinadi
- [ ] Click logo ko'rinadi
- [ ] Click URL ochiladi (yangi tab)
- [ ] "To'lov qildim" tugmasi ishlaydi
- [ ] Status polling boshlanadi

### Generation
- [ ] Generatsiya jarayoni boshlanadi
- [ ] Progress bar/spinner ko'rinadi
- [ ] Status polling ishlaydi (har 3 soniyada)
- [ ] Tugashi kutiladi

### Result
- [ ] Tayyor rasm ko'rinadi
- [ ] "Yuklab olish" tugmasi ishlaydi
- [ ] Rasm yuklab olinadi
- [ ] "Yana yaratish" ishlaydi

---

## 🔧 Backend CORS

### Backend Sozlamalari
- [ ] Backend CORS qo'shilgan:
```python
allow_origins=[
    "https://your-app.vercel.app",
    "https://your-custom-domain.com",  # agar bor
]
```
- [ ] Backend restart qilingan
- [ ] CORS ishlashi tekshirilgan

---

## 📊 Monitoring va Logging

### Vercel Dashboard
- [ ] Deployments page ochilgan
- [ ] Hech qanday xato yo'q
- [ ] Build logs tekshirilgan
- [ ] Runtime logs tekshirilgan

### Browser DevTools
- [ ] Console'da xatolar yo'q
- [ ] Network tab'da failed requests yo'q
- [ ] API calls muvaffaqiyatli

### Telegram
- [ ] Bot ishlamoqda
- [ ] Web App tez ochilmoqda
- [ ] Hech qanday crash yo'q

---

## 🎨 UI/UX Final Check

### Desktop
- [ ] Layout to'g'ri
- [ ] Rasmlar to'g'ri ko'rinadi
- [ ] Tugmalar ishlaydi
- [ ] Modallar to'g'ri ochiladi

### Mobile
- [ ] Telegram Web App'da ishlaydi
- [ ] Responsive design ishlaydi
- [ ] Touch events ishlaydi
- [ ] Viewport to'g'ri

### Dark/Light Mode
- [ ] Telegram theme'ga mos keladi
- [ ] Ranglar o'qiladi
- [ ] Kontrastlar yaxshi

---

## 🔒 Security Check

### API Keys
- [ ] Sirli ma'lumotlar Vercel ENV'da
- [ ] `.env` fayllari GitHub'da yo'q
- [ ] Kod ichida hard-coded keys yo'q

### HTTPS
- [ ] Web App HTTPS'da
- [ ] Backend HTTPS'da
- [ ] Mixed content xatolari yo'q

---

## 🎉 Production Ready!

Barcha checkboxlar belgilangan bo'lsa, loyiha production'da ishlashga tayyor!

---

## 🔄 Keyingi Deploylar

Har safar o'zgarish qilganingizda:

1. Kod o'zgartirish
2. Local test (`npm run dev`)
3. Git commit va push
4. Vercel avtomatik deploy qiladi
5. Test qilish (yuqoridagi checklist)

---

## 🆘 Muammo Bo'lsa

1. **Vercel Logs** - Runtime xatolarni ko'rish
2. **Browser Console** - Frontend xatolarni ko'rish
3. **Network Tab** - API xatolarni ko'rish
4. **Backend Logs** - Server xatolarni ko'rish

---

**Barcha qadamlar bajarilgandan keyin foydalanuvchilarga ulashing! 🚀**
