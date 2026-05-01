# 📚 Bookshelf App — Manajer Koleksi Buku Berbasis Web

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Storage](https://img.shields.io/badge/Web_Storage-localStorage-brightgreen?style=for-the-badge)
![Dicoding](https://img.shields.io/badge/Dicoding-Submission-4285F4?style=for-the-badge)
![Score](https://img.shields.io/badge/Score-4%2F5_%E2%98%85-FFD700?style=for-the-badge)
![Learning Path](https://img.shields.io/badge/Frontend_Web-Learning_Path_Stage_3-orange?style=for-the-badge)

> ⭐ **Submission akhir kursus "Belajar Membuat Front-End Web untuk Pemula"** — tahap ketiga dari *Frontend Web Learning Path* Dicoding.  
> Aplikasi manajemen koleksi buku *full-featured* yang dibangun dengan Vanilla JavaScript murni, DOM Manipulation, dan Web Storage sebagai lapisan persistensi data.

---

## 📖 Daftar Isi

- [Ringkasan Eksekutif](#ringkasan-eksekutif)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack)
- [Arsitektur & Pendekatan Teknis](#️-arsitektur--pendekatan-teknis)
- [Cara Instalasi & Penggunaan](#-cara-instalasi--penggunaan-lokal)
- [Catatan Teknis: Mengapa Skor 4/5](#-catatan-teknis-mengapa-skor-45)
- [Pelajaran Teknis — What I Learned](#-pelajaran-teknis--what-i-learned)
- [Lisensi](#-lisensi)

---

## Ringkasan Eksekutif

> Proyek ini adalah **transisi nyata dari *markup statis* ke *aplikasi interaktif***: halaman yang merespons pengguna, mengingat data setelah browser ditutup, dan memvalidasi input sebelum disimpan — semuanya tanpa framework, tanpa library, tanpa backend.

Bookshelf App memungkinkan pengguna mengelola koleksi buku pribadi mereka langsung di browser:
- Menambah buku baru 📖
- Memindahkannya antara rak *"Belum Selesai"* dan *"Selesai Dibaca"* 🔄
- Mengedit detail ✏️
- Menghapus 🗑️
- Mencari berdasarkan judul 🔍

Seluruh data **persisten di `localStorage`** — tetap tersedia saat halaman di-refresh atau browser dibuka kembali.

Yang membedakan proyek ini dari sekadar mengikuti *requirement* submission adalah adanya **lapisan *defensive programming*** yang ditambahkan secara sadar: sanitasi input XSS, validasi tahun dengan batas yang masuk akal, pembersihan data korup saat *load*, dan pola *fail-safe* di setiap titik yang bisa gagal.

---

## Fitur Utama

### Kegunaan (Usability)

| Fitur | Deskripsi |
|-------|------------|
| ➕ **Tambah Buku** | Form dengan 4 field (judul, penulis, tahun, status baca) + label submit dinamis yang berubah mengikuti checkbox |
| 📚 **Dua Rak Terpisah** | Buku otomatis ditempatkan di rak "Belum Selesai" atau "Selesai Dibaca" sesuai status |
| 🔁 **Toggle Completion** | Satu klik memindahkan buku antar rak tanpa *reload* halaman |
| ✏️ **Edit In-Modal** | Pop-up modal dengan animasi `fadeInUp`, form terisi otomatis dengan data buku yang dipilih |
| 🗑️ **Hapus dengan Konfirmasi** | Dialog konfirmasi mencegah penghapusan tidak disengaja |
| 🔍 **Live Search** | Filter buku berdasarkan judul secara *case-insensitive*, dengan tombol *reset* satu klik |
| 🎁 **Demo Data** | Tiga buku contoh otomatis tersedia saat pertama kali dibuka — UX tidak pernah kosong |

### Keandalan (Reliability)

| Fitur | Deskripsi |
|-------|------------|
| 💾 **Persistensi localStorage** | Semua data bertahan setelah browser ditutup dan dibuka kembali |
| 🛡️ **Error Handling pada Load** | `try/catch` di `loadBooksFromStorage()` — jika data di localStorage rusak/*corrupted*, aplikasi *reset* ke state awal tanpa *crash* |
| 🔍 **Data Integrity Filter** | Saat *load*, setiap item divalidasi memiliki properti wajib (`id`, `title`, `author`, `year`) — data parsial dibuang sebelum memasuki state |
| ✅ **Validasi Input** | Tahun divalidasi sebagai integer positif dalam rentang 1000–3000; *title* dan *author* diperiksa tidak kosong setelah *trim* |
| 🔒 **Proteksi XSS Dasar** | Fungsi `escapeHtml()` meng-escape karakter `&`, `<`, `>` sebelum konten user diinjeksikan ke DOM via `innerHTML` |
| 📱 **Responsive** | Layout menyesuaikan di layar ≤640px; tombol aksi buku menggunakan `flex: 1` agar memenuhi lebar di *mobile* |

---

## Tech Stack

```text
📁 Teknologi
├── HTML5              → Struktur & markup; data-testid untuk automated testing
├── CSS3
│   ├── Flexbox        → Layout form, bookshelf, dan action buttons
│   ├── CSS Transitions & Animation (fadeInUp) → Modal UX
│   └── Media Query (640px) → Responsivitas mobile
└── JavaScript (ES6+)
    ├── DOM API        → createElement, innerHTML, addEventListener, querySelector
    ├── Web Storage    → localStorage untuk persistensi data
    ├── Array Methods  → push, filter, find, findIndex, forEach
    └── JSON           → stringify/parse untuk serialisasi data ke storage

**Ketergantungan Eksternal:** Tidak ada. Zero dependencies — dapat berjalan langsung di browser tanpa instalasi apapun.

---

## Arsitektur & Pendekatan Teknis

### State Management: Array Tunggal sebagai Source of Truth

Seluruh state aplikasi hidup dalam satu array global:

```javascript
let books = [];
```

Setiap operasi (tambah, edit, hapus, toggle) memodifikasi array ini, lalu secara konsisten memanggil dua fungsi:

```javascript
saveBooksToStorage(); // sinkronisasi ke localStorage
renderBooks(books);   // sinkronisasi ke DOM
```

Pola **unidirectional data flow** secara manual: state → storage → render. Tidak ada operasi yang memodifikasi DOM secara langsung tanpa melewati state terlebih dahulu. Ini adalah pola yang sama yang mendasari framework state management modern (Zustand, Redux) — hanya diimplementasikan tanpa abstraksi.

### DOM Manipulation: Render Berbasis Data

Alih-alih menggunakan string HTML yang digabung, setiap book item dibangun programatik:

```javascript
const bookDiv = document.createElement('div');
bookDiv.setAttribute('data-bookid', book.id);
bookDiv.setAttribute('data-testid', 'bookItem');
bookDiv.classList.add('book-item');

// Event listener diattach langsung ke elemen yang baru dibuat
const toggleBtn = bookDiv.querySelector('[data-testid="bookItemIsCompleteButton"]');
toggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleBookCompletion(book.id);
});
```

Keputusan penting: `e.stopPropagation()` digunakan karena tombol-tombol aksi bersarang di dalam elemen buku. Tanpanya, klik pada tombol akan bubble ke container dan bisa memicu event yang tidak diinginkan.

### localStorage: Serialisasi dan Defensive Loading

Data disimpan sebagai JSON string dan dimuat kembali dengan validasi berlapis:

```javascript
function loadBooksFromStorage() {
  const stored = localStorage.getItem('books');
  if (stored) {
    try {
      books = JSON.parse(stored);
      // Guard: buang data yang tidak memiliki field wajib
      books = books.filter(b => b.id && b.title && b.author && typeof b.year === 'number');
    } catch(e) {
      books = []; // fallback jika JSON rusak
    }
  }
}
```

`typeof b.year === 'number'` secara eksplisit memverifikasi tipe data, bukan hanya keberadaan property — karena `JSON.parse` bisa saja mengembalikan `{ year: "2023" }` (string) jika data di-inject secara manual via DevTools.

### Proteksi XSS Sederhana

Karena data buku yang diinput user dirender kembali ke DOM via `innerHTML`, ada risiko XSS injection. Fungsi `escapeHtml()` menangani ini:

```javascript
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
```

Ini bukan solusi XSS yang komprehensif (tidak menghandle atribut HTML, JavaScript URL, dll), tetapi mencerminkan kesadaran bahwa **user input tidak pernah boleh dipercaya** — prinsip yang berlaku sama di frontend maupun backend.

### Arsitektur Layer: Konteks dalam Learning Path

```
Stage 1 (HTML & CSS)        : HTML semantik + CSS visual → Fondasi statis
Stage 2 (JS Fundamentals)   : OOP, rekursi, unit testing, functional array methods
Stage 3 (Proyek Ini)        : + DOM Manipulation + localStorage → Interaktivitas & persistensi
Stage 4 (Berikutnya)        : + Fetch API + RESTful API consumption → Data dari server
Stage 5 (Future)            : + Framework (React/Vue) → Component-based architecture
```

Proyek ini adalah titik di mana *halaman* berevolusi menjadi *aplikasi* — titik yang paling penting untuk dipahami sebelum bekerja dengan framework apapun, karena semua yang dilakukan framework sesungguhnya adalah abstraksi dari apa yang dilakukan di sini secara manual.

---

## Cara Instalasi & Penggunaan Lokal

Proyek tidak memerlukan build tool atau server lokal.

**Clone dan buka langsung:**
```bash
git clone https://github.com/USERNAME/bookshelf-app-dicoding.git
cd bookshelf-app-dicoding
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

**Atau via VS Code Live Server:**
1. Install ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Klik kanan `index.html` → **"Open with Live Server"**

**Struktur folder:**
```
bookshelf-app-dicoding/
├── index.html    ← Markup + data-testid attributes untuk automated testing
├── main.js       ← Seluruh logika aplikasi (state, DOM, storage, validation)
└── style.css     ← Styling + modal animation + responsive layout
```

**Cara reset data:** Buka DevTools → Application → Local Storage → klik kanan origin → Clear, lalu refresh halaman.

---

## Catatan Teknis: Mengapa Skor 4/5

Submission ini memenuhi seluruh kriteria wajib Dicoding dan menambahkan fitur di luar requirement (modal edit, proteksi XSS, validasi tahun, demo data). Skor 4/5 mencerminkan bahwa ini adalah tahap belajar aktif — bukan produk final — dan ada ruang peningkatan yang sudah teridentifikasi:

- **Custom Event API**: Requirement lebih lanjut mengharapkan penggunaan `CustomEvent` dan `dispatchEvent` untuk komunikasi antar komponen, sebagai pengganti pemanggilan fungsi langsung. Ini adalah pola yang lebih scalable dan lebih dekat dengan cara framework bekerja.
- **Pemisahan Concerns**: Logika storage, manipulasi data, dan rendering saat ini berada dalam satu file `main.js`. Pada iterasi berikutnya, ini akan dipisah ke modul terpisah (`storage.js`, `books.js`, `render.js`).
- **Penggunaan `const` yang Lebih Ketat**: Beberapa variabel yang seharusnya bisa `const` masih dideklarasikan dengan `let`.

Keterbatasan ini disadari penuh dan menjadi target perbaikan konkret di proyek-proyek berikutnya dalam learning path.

---

## Pelajaran Teknis — What I Learned

### 1. State adalah Pusat Segalanya

Insight terpenting dari proyek ini: UI hanya boleh menjadi *cerminan* dari state, bukan state itu sendiri. Setiap kali tergoda untuk langsung memanipulasi DOM ("hapus elemen ini"), yang benar dilakukan adalah memodifikasi array `books`, lalu re-render seluruhnya. Ini *lebih lambat* tapi jauh lebih *predictable dan maintainable* — dan ini adalah dasar dari semua framework modern.

### 2. localStorage adalah Database dengan Limitasi

Mengimplementasikan sendiri siklus `get → parse → modify → stringify → set` membuat limitasi localStorage menjadi nyata secara visceral: tidak ada query, tidak ada indexing, tidak ada relasi, sinkronous. Pemahaman ini mengkristalisasi *mengapa* solusi seperti IndexedDB, atau pindah ke server-side database, ada — bukan hanya teori.

### 3. Validasi adalah Komunikasi, Bukan Hambatan

Fungsi `validateBookFields()` memvalidasi dengan pesan error yang spesifik dan actionable. Ini bukan hanya tentang mencegah data buruk masuk — ini tentang membantu pengguna memahami apa yang salah. Prinsip yang sama berlaku di API: response `400 Bad Request` yang baik selalu menjelaskan *field mana* yang bermasalah dan *mengapa*.

### 4. "Berhasil Jalan" Bukan Tujuan Akhir

Menambahkan `escapeHtml()` bukan requirement submission. Menambahkan `filter()` saat load data bukan requirement. Menambahkan `try/catch` di JSON parsing bukan requirement. Tapi semuanya membuat perbedaan antara kode yang *kebetulan bekerja di kondisi normal* dengan kode yang *dirancang untuk tidak pecah di kondisi tidak normal*. Ini adalah perbedaan antara kode junior dan kode yang siap production.

---

## Lisensi

Proyek ini dibuat sebagai submission kursus Dicoding dan bersifat open untuk keperluan pembelajaran.

---
*Submission: Belajar Membuat Front-End Web untuk Pemula — Stage 3 of Frontend Web Learning Path, Dicoding 2026*