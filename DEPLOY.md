# Render.com ga Deploy Qilish Ko'rsatmasi

## 1-qadam: GitHub repozitoriya yarating

### Git o'rnatilgan bo'lsa:

```bash
cd C:\WorkDisk\Diana

git init
git add .
git commit -m "Initial commit: Random Test Generator"
```

GitHub.com da yangi **public yoki private** repo yarating, keyin:

```bash
git remote add origin https://github.com/SIZNING_USERNAME/random-test-generator.git
git branch -M main
git push -u origin main
```

---

## 2-qadam: Render.com da hisob oching

1. **render.com** ga kiring
2. **"Get Started for Free"** tugmasini bosing
3. GitHub akkauntingiz bilan ro'yxatdan o'ting

---

## 3-qadam: Web Service yarating

1. Dashboard da **"New +"** → **"Web Service"** ni tanlang
2. **"Connect a repository"** — GitHub repo ni ulang
3. Quyidagi sozlamalarni kiriting:

| Maydon | Qiymat |
|--------|--------|
| **Name** | random-test-generator |
| **Region** | Frankfurt (EU Central) — O'zbekistonga yaqin |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js` |
| **Start Command** | `npm start` |
| **Plan** | Free |

---

## 4-qadam: Persistent Disk qo'shing (MUHIM!)

> ⚠️ Bu qadam bo'lmasa SQLite ma'lumotlari har restart da o'chadi!

1. Web Service yaratish sahifasida pastga tushing
2. **"Add Disk"** tugmasini bosing
3. Sozlamalar:

| Maydon | Qiymat |
|--------|--------|
| **Name** | sqlite-data |
| **Mount Path** | /var/data |
| **Size** | 1 GB |

> 💰 Narx: $0.25/GB/oy = **$0.25/oy** (juda arzon!)

---

## 5-qadam: Environment Variables kiriting

Web Service sahifasida **"Environment"** bo'limiga o'ting:

| Key | Value | Izoh |
|-----|-------|------|
| `DATABASE_URL` | `file:/var/data/prod.db` | Persistent disk manzili |
| `SESSION_SECRET` | `uzun-tasodifiy-kalit-bu-yerga` | Kamida 32 ta belgi |
| `NODE_ENV` | `production` | |
| `ADMIN_USERNAME` | `admin` | Login |
| `ADMIN_PASSWORD` | `KuchliParol123!` | **O'zgartiring!** |
| `PORT` | `10000` | Render 10000 portini tavsiya qiladi |

### Kuchli SESSION_SECRET yaratish:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6-qadam: Deploy boshlash

**"Create Web Service"** tugmasini bosing.

Render avtomatik:
1. GitHub dan kodni yuklab oladi
2. `npm install` ishlatadi
3. Prisma generate va DB push qiladi
4. Admin foydalanuvchi yaratadi
5. Serverni ishga tushiradi

---

## 7-qadam: Saytga kiring

Deploy tugagach (3-5 daqiqa) Render sizga URL beradi:

```
https://random-test-generator-XXXX.onrender.com
```

Shu URL orqali kirib login qiling.

---

## Muhim eslatmalar

### Free tier cheklashlari:
- 15 daqiqa faoliyatsizlikdan so'ng **"uyquga" ketadi** (sleep mode)
- Birinchi so'rov uyqudan uyg'otadi — **30-60 soniya kutish kerak**
- Bu muammo bo'lsa — **Starter plan** ($7/oy) ni tanlang

### Avtomatik yangilash (Auto-deploy):
- GitHub ga `git push` qilganingizda Render avtomatik qayta deploy qiladi
- Ma'lumotlar saqlanib qoladi (persistent disk tufayli)

### Muammo chiqsa — Loglarni tekshiring:
```
Render Dashboard → Sizning service → "Logs" tab
```

---

## Lokal ishga tushirish (development)

```bash
npm run dev
# http://localhost:3000
```

## Render da ishga tushirish tekshirish

```bash
# Render shell orqali (Dashboard → Shell tab):
node -e "const p = require('@prisma/client'); const c = new p.PrismaClient(); c.user.count().then(console.log)"
```
