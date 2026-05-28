# Random Test Generator

Maktab va o'quv markazlar uchun professional test yaratish tizimi.

## Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Backend | Node.js + Express.js |
| Frontend | EJS + Tailwind CSS + Vanilla JS |
| Database | SQLite |
| ORM | Prisma |
| Auth | express-session + bcrypt |
| Word Export | docx |
| Excel Import | xlsx |

## O'rnatish

### 1. Loyihani clone qiling yoki yuklab oling

```bash
cd C:\WorkDisk\Diana
```

### 2. .env fayl yarating

```bash
copy .env.example .env
```

`.env` faylni o'zingizga moslang:

```env
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="o'zgartiring-bu-maxfiy-kalitni"
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
```

### 3. Barcha narsani o'rnating (bitta buyruq)

```bash
npm run setup
```

Bu buyruq:
- `npm install` — paketlarni o'rnatadi
- `prisma generate` — Prisma clientni generatsiya qiladi
- `prisma db push` — ma'lumotlar bazasini yaratadi
- `node prisma/seed.js` — admin va namuna fanlarni qo'shadi

### 4. Serverni ishga tushiring

```bash
# Ishlab chiqish uchun (auto-restart bilan)
npm run dev

# Ishlab chiqarishga chiqarish uchun
npm start
```

Brauzerda oching: **http://localhost:3000**

---

## Login ma'lumotlari

```
Username : admin
Password : Admin123!
```

---

## Funksiyalar

### Admin Panel
- **Dashboard** — statistika, so'nggi testlar, fan bo'yicha jadval
- **Fanlar** — CRUD, savollar va testlar soni
- **Savollar** — CRUD, qidirish, filtr (fan, qiyinlik), pagination
- **Excel Import** — bulk import, namuna fayl yuklab olish
- **Test Yaratish** — random variantlar generatsiya qilish
- **Test Tarixi** — avvalgi testlarni ko'rish va yuklab olish

### Test Generatsiya Algoritmi

```
1. Savollar usage-count bo'yicha saralanadi (kam ishlatilgan birinchi)
2. Tasodifiy noise qo'shiladi (teng-ishlatilganlar uchun)
3. Har variant uchun eng kam ishlatilgan N ta savol tanlanadi
4. Savollar tartibi tasodifiy aralashtirilib, Fisher-Yates algoritmi bilan
5. Har savol uchun A/B/C/D javoblar random tartibda aralashtiriladi
6. To'g'ri javob yangi pozitsiyaga qarab avtomatik qayta hisoblanadi
```

Bu algoritm maksimal farqli variantlar yaratadi.

### Word Export

**Testlar.docx:**
- Har variant alohida sahifada
- F.I.O va sana maydonlari
- Professional formatlash
- A/B/C/D javob variantlari

**Javoblar_kaliti.docx:**
- Jadval formatida (30 gacha savol)
- Paragraph formatida (30+ savol)
- Har variant uchun to'liq kalit

### Excel Import formati

| Question | A | B | C | D | Correct | Subject | Difficulty |
|----------|---|---|---|---|---------|---------|------------|
| Savol matni | Variant A | Variant B | Variant C | Variant D | B | Matematika | easy |

- **Correct**: A, B, C yoki D
- **Difficulty**: easy / medium / hard (ixtiyoriy, default: medium)
- **Subject**: mavjud bo'lmasa avtomatik yaratiladi

---

## Skriptlar

```bash
npm run dev          # Development server (nodemon)
npm start            # Production server
npm run db:push      # Schema o'zgarishlarini qo'llash
npm run db:seed      # Ma'lumotlar bazasini to'ldirish
npm run db:studio    # Prisma Studio (DB GUI)
npm run setup        # To'liq o'rnatish
```

---

## Loyiha tuzilmasi

```
random-test-generator/
├── prisma/
│   ├── schema.prisma      # Database modellari
│   ├── seed.js            # Boshlang'ich ma'lumotlar
│   └── dev.db             # SQLite fayl (gitignore)
├── src/
│   ├── server.js          # Express app + middleware
│   ├── config/
│   │   └── database.js    # Prisma singleton
│   ├── middleware/
│   │   └── auth.js        # Session authentication
│   ├── routes/            # URL marshrutlar
│   ├── controllers/       # Biznes mantiqi
│   ├── services/
│   │   ├── randomizer.js  # Test generatsiya algoritmi
│   │   ├── wordExporter.js # Word fayl yaratish
│   │   └── excelImporter.js # Excel o'qish
│   ├── utils/
│   │   └── helpers.js     # Yordamchi funksiyalar
│   ├── views/             # EJS shablonlar
│   └── public/            # Static fayllar
├── exports/               # Vaqtinchalik fayllar
├── uploads/               # Excel yuklash uchun
└── .env                   # Muhit o'zgaruvchilari
```

---

## Xavfsizlik

- **Helmet.js** — HTTP sarlavhalari xavfsizligi
- **Rate limiting** — 500 so'rov/15 daqiqa (login: 20/15 daqiqa)
- **bcrypt** — parol hashing (12 rounds)
- **httpOnly cookies** — XSS himoyasi
- **SameSite: strict** — CSRF himoyasi
- **Session-based auth** — barcha admin sahifalar himoyalangan
