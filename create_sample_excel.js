/**
 * Namuna savollar bilan Excel fayl yaratadi.
 * Ishlatish: node create_sample_excel.js
 * Natija: sample_questions.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');

const questions = [

  // ─── MATEMATIKA ───────────────────────────────────────────────────────────
  { Question: '2 + 2 × 2 = ?',                              A: '6',              B: '8',               C: '4',              D: '5',              Correct: 'A', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: 'Kvadrat tenglamaning ildizi: x² - 9 = 0',    A: 'x = ±2',         B: 'x = ±3',          C: 'x = ±4',         D: 'x = ±9',         Correct: 'B', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: '15% dan 200 ning 15% i qancha?',             A: '25',             B: '30',              C: '20',             D: '15',             Correct: 'B', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: 'log₂(8) = ?',                                A: '2',              B: '4',               C: '3',              D: '5',              Correct: 'C', Subject: 'Matematika', Difficulty: 'medium' },
  { Question: 'sin²(x) + cos²(x) = ?',                     A: '0',              B: '2',               C: '-1',             D: '1',              Correct: 'D', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: 'Doira yuzasi formulasi qaysi?',              A: 'S = πd',         B: 'S = 2πr',         C: 'S = πr²',        D: 'S = πr³',        Correct: 'C', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: '√144 = ?',                                   A: '11',             B: '13',              C: '14',             D: '12',             Correct: 'D', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: '3! (3 faktorial) = ?',                       A: '3',              B: '9',               C: '6',              D: '12',             Correct: 'C', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: 'Agar a = 5, b = 3 bo\'lsa, a² - b² = ?',   A: '14',             B: '16',              C: '34',             D: '20',             Correct: 'B', Subject: 'Matematika', Difficulty: 'medium' },
  { Question: 'Arifmetik progressiya: 2, 5, 8, 11 ... 20-had?', A: '56',        B: '59',              C: '62',             D: '65',             Correct: 'B', Subject: 'Matematika', Difficulty: 'medium' },
  { Question: '0.25 kasr ko\'rinishida: ?',                 A: '1/5',            B: '1/4',             C: '2/5',            D: '3/8',            Correct: 'B', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: 'To\'g\'ri burchakli uchburchakda: a²+b²=c². Bu qaysi teorema?', A: 'Viyet', B: 'Pifagor', C: 'Fales', D: 'Eyler', Correct: 'B', Subject: 'Matematika', Difficulty: 'easy' },
  { Question: 'Ikki sonning EKUK — bu nima?',               A: 'Eng katta umumiy bo\'luvchi', B: 'Eng kichik umumiy ko\'paytma', C: 'Eng katta ko\'paytma', D: 'Eng kichik bo\'luvchi', Correct: 'B', Subject: 'Matematika', Difficulty: 'easy' },
  { Question: 'Funksiya y = x² grafigi qanday nomlanadi?', A: 'Sinusoida',      B: 'Giperbola',       C: 'Parabola',       D: 'Ellips',         Correct: 'C', Subject: 'Matematika', Difficulty: 'easy'   },
  { Question: '(-3)³ = ?',                                  A: '9',              B: '-9',              C: '27',             D: '-27',            Correct: 'D', Subject: 'Matematika', Difficulty: 'medium' },

  // ─── FIZIKA ───────────────────────────────────────────────────────────────
  { Question: 'Nyutonning birinchi qonuni nima deyiladi?',  A: 'Harakat qonuni', B: 'Inersiya qonuni', C: 'Tortishish qonuni', D: 'Kuch qonuni', Correct: 'B', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Yorug\'lik tezligi taxminan qancha?',        A: '3×10⁶ m/s',      B: '3×10⁸ m/s',       C: '3×10¹⁰ m/s',     D: '3×10⁴ m/s',      Correct: 'B', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Kuch formulasi: F = ?',                      A: 'm + a',          B: 'm / a',           C: 'm × a',          D: 'a / m',          Correct: 'C', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Issiqlik o\'lchov birligi nima?',            A: 'Vatt',           B: 'Joul',            C: 'Nyuton',         D: 'Paskal',         Correct: 'B', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Gravitatsiya tezlanishi g ≈ ?',              A: '10 m/s',         B: '9.8 m/s²',        C: '8.9 m/s²',       D: '10 m/s³',        Correct: 'B', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Ohm qonuni: I = ?',                          A: 'U × R',          B: 'U + R',           C: 'U / R',          D: 'R / U',          Correct: 'C', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Tovush tezligi havoda taxminan qancha?',     A: '300 m/s',        B: '340 m/s',         C: '400 m/s',        D: '200 m/s',        Correct: 'B', Subject: 'Fizika', Difficulty: 'medium' },
  { Question: 'Qaysi hodisa yorug\'likning sinishi bilan bog\'liq?', A: 'Difraksiya', B: 'Interferensiya', C: 'Refraktsiya', D: 'Polyarizatsiya', Correct: 'C', Subject: 'Fizika', Difficulty: 'medium' },
  { Question: 'Elektr quvvati o\'lchov birligi?',           A: 'Amper',          B: 'Vatt',            C: 'Volt',           D: 'Om',             Correct: 'B', Subject: 'Fizika', Difficulty: 'easy'   },
  { Question: 'Termodinamikaning 1-qonuni nima haqida?',    A: 'Elektr zaryadlari saqlanishi', B: 'Energiya saqlanishi', C: 'Impuls saqlanishi', D: 'Massa saqlanishi', Correct: 'B', Subject: 'Fizika', Difficulty: 'medium' },

  // ─── INGLIZ TILI ─────────────────────────────────────────────────────────
  { Question: '"She ___ a doctor" bo\'shliqqa nima kerak?',  A: 'are',           B: 'am',              C: 'is',             D: 'were',           Correct: 'C', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: '"Apple" so\'zining tarjimasi?',               A: 'Olcha',         B: 'Nok',             C: 'Olma',           D: 'Uzum',           Correct: 'C', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: '"I go to school" — bu qaysi zamon?',          A: 'Past Simple',   B: 'Present Perfect', C: 'Present Simple', D: 'Future Simple',  Correct: 'C', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: '"Beautiful" so\'zining antonimi?',            A: 'Nice',          B: 'Ugly',            C: 'Pretty',         D: 'Lovely',         Correct: 'B', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: '"They ___ playing football yesterday" bo\'shliq?', A: 'is',       B: 'are',             C: 'was',            D: 'were',           Correct: 'D', Subject: 'Ingliz tili', Difficulty: 'medium' },
  { Question: 'Ko\'plik shakli: "Child" → ?',                A: 'Childs',        B: 'Childes',         C: 'Childrens',      D: 'Children',       Correct: 'D', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: '"Fast" so\'zining darajalari: fast — faster — ?', A: 'most fast', B: 'fastest',         C: 'more fast',      D: 'fastiest',       Correct: 'B', Subject: 'Ingliz tili', Difficulty: 'easy'   },
  { Question: 'Qaysi so\'z ot (noun)?',                      A: 'Run',           B: 'Quickly',         C: 'Happiness',      D: 'Beautiful',      Correct: 'C', Subject: 'Ingliz tili', Difficulty: 'medium' },
  { Question: '"I ___ never been to Paris" bo\'shliq?',      A: 'had',           B: 'have',            C: 'has',            D: 'having',         Correct: 'B', Subject: 'Ingliz tili', Difficulty: 'medium' },
  { Question: 'Inglizcha "kitob" qanday yoziladi?',          A: 'Boke',          B: 'Book',            C: 'Bok',            D: 'Buok',           Correct: 'B', Subject: 'Ingliz tili', Difficulty: 'easy'   },

  // ─── BIOLOGIYA ────────────────────────────────────────────────────────────
  { Question: 'Fotosintez qayerda sodir bo\'ladi?',          A: 'Mitoxondriyada', B: 'Yadro',          C: 'Xloroplastda',   D: 'Ribosom',        Correct: 'C', Subject: 'Biologiya', Difficulty: 'easy'   },
  { Question: 'DNK nima?',                                    A: 'Dezoksiribonuklein kislota', B: 'Ribonuklein kislota', C: 'Adenozin trifosfat', D: 'Glikogen', Correct: 'A', Subject: 'Biologiya', Difficulty: 'easy' },
  { Question: 'Odam organizmida nechta xromosoma bor?',       A: '23 ta',        B: '48 ta',           C: '46 ta',          D: '44 ta',          Correct: 'C', Subject: 'Biologiya', Difficulty: 'easy'   },
  { Question: 'Qon guruhlari nechta?',                        A: '3 ta',         B: '5 ta',            C: '4 ta',           D: '2 ta',           Correct: 'C', Subject: 'Biologiya', Difficulty: 'easy'   },
  { Question: 'Energiya "valyutasi" deb qaysi modda ataladi?', A: 'DNK',         B: 'ATP',             C: 'RNK',            D: 'GMF',            Correct: 'B', Subject: 'Biologiya', Difficulty: 'medium' },
  { Question: 'Eng yirik hujayra qaysi?',                     A: 'Nerv hujayra', B: 'Jigar hujayra',  C: 'Tuxum hujayra',  D: 'Qon hujayra',    Correct: 'C', Subject: 'Biologiya', Difficulty: 'medium' },
  { Question: 'O\'simliklar qaysi organellada nafas oladi?',  A: 'Xloroplast',   B: 'Mitoxondriya',   C: 'Vakuola',        D: 'Ribosoma',       Correct: 'B', Subject: 'Biologiya', Difficulty: 'medium' },
  { Question: 'Meiotik bo\'linish natijasida nechta hujayra hosil bo\'ladi?', A: '2', B: '8',          C: '4',              D: '16',             Correct: 'C', Subject: 'Biologiya', Difficulty: 'medium' },

  // ─── KIMYO ───────────────────────────────────────────────────────────────
  { Question: 'Suvning kimyoviy formulasi?',                  A: 'H₂O₂',         B: 'HO',              C: 'H₂O',            D: 'H₃O',            Correct: 'C', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'Mendeleev jadvalidagi birinchi element?',       A: 'Geliy',        B: 'Kislorod',        C: 'Vodorod',        D: 'Uglerod',        Correct: 'C', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'NaCl — bu qaysi modda?',                       A: 'Osh tuzi',     B: 'Soda',            C: 'Sirka kislota',  D: 'Limon kislota',  Correct: 'A', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'Kislotalar litmus qog\'ozini qanday rangga bo\'yaydi?', A: 'Ko\'k', B: 'Sariq',         C: 'Qizil',          D: 'Yashil',         Correct: 'C', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'Mis elementi belgisi?',                         A: 'Mn',           B: 'Mg',              C: 'Co',             D: 'Cu',             Correct: 'D', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'Atomning markaziy qismi nima deyiladi?',        A: 'Elektron',     B: 'Proton',          C: 'Yadro',          D: 'Neytron',        Correct: 'C', Subject: 'Kimyo',    Difficulty: 'easy'   },
  { Question: 'Mol — bu nima?',                                A: 'Massa o\'lchovi', B: 'Moddiy miqdor o\'lchovi', C: 'Hajm o\'lchovi', D: 'Tezlik o\'lchovi', Correct: 'B', Subject: 'Kimyo', Difficulty: 'medium' },
  { Question: 'pH = 7 bo\'lgan eritma qanday muhitga ega?',    A: 'Kislotali',    B: 'Ishqorli',        C: 'Neytral',        D: 'Oksidlovchi',    Correct: 'C', Subject: 'Kimyo',    Difficulty: 'easy'   },

  // ─── ONA TILI ─────────────────────────────────────────────────────────────
  { Question: 'O\'zbek alifbosida nechta harf bor?',          A: '30',           B: '29',              C: '32',             D: '31',             Correct: 'B', Subject: "Ona tili", Difficulty: 'easy'   },
  { Question: '"Tez-tez" qanday so\'z turkumi?',               A: 'Sifat',        B: 'Fe\'l',           C: 'Ravish',         D: 'Ot',             Correct: 'C', Subject: "Ona tili", Difficulty: 'easy'   },
  { Question: 'Gap bo\'laklaridan biri qaysi?',                A: 'Ko\'makchi',   B: 'Ega',             C: 'Qo\'shimcha',    D: 'Undov',          Correct: 'B', Subject: "Ona tili", Difficulty: 'easy'   },
  { Question: '"Oq" so\'zining antonimi?',                     A: 'Sariq',        B: 'Ko\'k',           C: 'Qora',           D: 'Yashil',         Correct: 'C', Subject: "Ona tili", Difficulty: 'easy'   },
  { Question: 'Qaysi so\'zda imloviy xato bor?',               A: 'Maktab',       B: 'Kitop',           C: 'Daftar',         D: 'Qalam',          Correct: 'B', Subject: "Ona tili", Difficulty: 'easy'   },
  { Question: '"Men o\'qiyman" gapida "o\'qiyman" qanday bo\'lak?', A: 'Ega',    B: 'To\'ldiruvchi',   C: 'Kesim',          D: 'Aniqlovchi',     Correct: 'C', Subject: "Ona tili", Difficulty: 'easy'   },

  // ─── TARIX ───────────────────────────────────────────────────────────────
  { Question: 'O\'zbekiston mustaqillikka qaysi yili erishdi?', A: '1990',        B: '1992',            C: '1993',           D: '1991',           Correct: 'D', Subject: 'Tarix',    Difficulty: 'easy'   },
  { Question: 'Amir Temur qaysi davlatni asos solgan?',         A: 'Somoniylar',  B: 'Temuriylar',      C: 'G\'aznaviylar',  D: 'Qoraxoniylar',   Correct: 'B', Subject: 'Tarix',    Difficulty: 'easy'   },
  { Question: 'Birinchi jahon urushi qachon boshlandi?',         A: '1916',        B: '1918',            C: '1912',           D: '1914',           Correct: 'D', Subject: 'Tarix',    Difficulty: 'easy'   },
  { Question: 'Ikkinchi jahon urushi qaysi yili tugadi?',        A: '1943',        B: '1944',            C: '1946',           D: '1945',           Correct: 'D', Subject: 'Tarix',    Difficulty: 'easy'   },
  { Question: 'Samarqand qaysi davlat tomonidan Ulug\' ipak yo\'lining markazi bo\'lgan?', A: 'Somoniylar', B: 'Temuriylar', C: 'Qoraxitoylar', D: 'Mo\'g\'ullar', Correct: 'B', Subject: 'Tarix', Difficulty: 'medium' },
  { Question: 'Al-Xorazmiy kim bo\'lgan?',                      A: 'Shoir',       B: 'Matematik va astronom', C: 'Lashkarboshi', D: 'Davlat arbobi', Correct: 'B', Subject: 'Tarix', Difficulty: 'easy'  },
];

// Build worksheet
const headers = ['Question', 'A', 'B', 'C', 'D', 'Correct', 'Subject', 'Difficulty'];
const rows = questions.map(q => [
  q.Question, q.A, q.B, q.C, q.D, q.Correct, q.Subject, q.Difficulty,
]);

const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

// Column widths
ws['!cols'] = [
  { wch: 55 }, // Question
  { wch: 28 }, // A
  { wch: 28 }, // B
  { wch: 28 }, // C
  { wch: 28 }, // D
  { wch: 10 }, // Correct
  { wch: 14 }, // Subject
  { wch: 12 }, // Difficulty
];

// Freeze top row
ws['!freeze'] = { xSplit: 0, ySplit: 1 };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Savollar');

// ── Sheet 2: Ko'rsatmalar ───────────────────────────────────────────────────
const infoData = [
  ['EXCEL IMPORT KO\'RSATMALARI'],
  [''],
  ['Ustun', 'Tavsif', 'Misol'],
  ['Question', 'Savol matni (majburiy)', '2 + 2 = ?'],
  ['A', 'A varianti (majburiy)', '3'],
  ['B', 'B varianti (majburiy)', '4'],
  ['C', 'C varianti (majburiy)', '5'],
  ['D', 'D varianti (majburiy)', '6'],
  ['Correct', 'To\'g\'ri javob (A/B/C/D)', 'B'],
  ['Subject', 'Fan nomi', 'Matematika'],
  ['Difficulty', 'Qiyinlik darajasi', 'easy / medium / hard'],
  [''],
  ['FANLAR RO\'YXATI (bu faylda):'],
  ...['Matematika','Fizika','Ingliz tili','Biologiya','Kimyo','Ona tili','Tarix'].map(s => [s]),
  [''],
  ['Jami savollar:', questions.length],
];

const ws2 = XLSX.utils.aoa_to_sheet(infoData);
ws2['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 25 }];
XLSX.utils.book_append_sheet(wb, ws2, "Ko'rsatmalar");

// Save
const outPath = path.join(__dirname, 'sample_questions.xlsx');
XLSX.writeFile(wb, outPath);

// Stats
const bySubject = {};
questions.forEach(q => { bySubject[q.Subject] = (bySubject[q.Subject] || 0) + 1; });

console.log('\n✅ sample_questions.xlsx yaratildi!\n');
console.log('📊 Savollar soni:');
Object.entries(bySubject).forEach(([s, c]) => console.log(`   ${s.padEnd(15)} ${c} ta`));
console.log(`${'─'.repeat(30)}`);
console.log(`   ${'JAMI'.padEnd(15)} ${questions.length} ta`);
console.log(`\n📁 Fayl: ${outPath}`);
