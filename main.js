// ---------- DATA GLOBAL ----------
let books = [];

// DOM Elements
const bookForm = document.getElementById('bookForm');
const searchForm = document.getElementById('searchBook');
const incompleteBookList = document.getElementById('incompleteBookList');
const completeBookList = document.getElementById('completeBookList');
const targetShelfSpan = document.getElementById('targetShelf');
const searchInput = document.getElementById('searchBookTitle');
const resetSearchBtn = document.getElementById('resetSearch');
const editModal = document.getElementById('editModal');
const editBookForm = document.getElementById('editBookForm');
const cancelEditBtn = document.getElementById('cancelEdit');

// Helper: simpan ke localStorage
function saveBooksToStorage() {
  localStorage.setItem('books', JSON.stringify(books));
}

// Helper: generate ID unik
function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

// RESET PENCARIAN & RENDER ULANG (menampilkan semua buku)
function resetSearchAndRender() {
  if (searchInput) searchInput.value = '';
  renderBooks(books);
}

// ========== VALIDASI INPUT (UMUM) ==========
function validateBookFields(title, author, year) {
  const trimmedTitle = title?.trim();
  const trimmedAuthor = author?.trim();
  if (!trimmedTitle || trimmedTitle === "") {
    alert("❌ Judul buku tidak boleh kosong!");
    return false;
  }
  if (!trimmedAuthor || trimmedAuthor === "") {
    alert("❌ Penulis buku tidak boleh kosong!");
    return false;
  }
  const yearNum = Number(year);
  if (isNaN(yearNum) || !Number.isInteger(yearNum) || yearNum <= 0 || yearNum > new Date().getFullYear() + 5) {
    alert("❌ Tahun harus berupa angka positif dan masuk akal (contoh: 1945 - 2030).");
    return false;
  }
  if (yearNum < 1000 || yearNum > 3000) {
    alert("❌ Masukkan tahun yang valid (minimal 1000, maksimal 3000).");
    return false;
  }
  return true;
}

// ========== FUNGSI TAMBAH BUKU ==========
function addBook(title, author, year, isComplete) {
  if (!validateBookFields(title, author, year)) return false;

  const newBook = {
    id: generateId(),
    title: title.trim(),
    author: author.trim(),
    year: parseInt(year, 10),
    isComplete: isComplete
  };
  books.push(newBook);
  saveBooksToStorage();
  resetSearchAndRender();   // bersihkan filter & tampilkan semua
  return true;
}

// ========== EDIT BUKU ==========
function editBookById(bookId, updatedTitle, updatedAuthor, updatedYear, updatedIsComplete) {
  if (!validateBookFields(updatedTitle, updatedAuthor, updatedYear)) return false;

  const bookIndex = books.findIndex(book => book.id === bookId);
  if (bookIndex === -1) {
    alert("Buku tidak ditemukan!");
    return false;
  }

  books[bookIndex] = {
    id: bookId,
    title: updatedTitle.trim(),
    author: updatedAuthor.trim(),
    year: parseInt(updatedYear, 10),
    isComplete: updatedIsComplete
  };
  saveBooksToStorage();
  resetSearchAndRender();   // setelah edit, tampilkan semua dan hilangkan filter
  return true;
}

// ========== PINDAH RAK (toggle completion) ==========
function toggleBookCompletion(bookId) {
  const book = books.find(b => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    saveBooksToStorage();
    resetSearchAndRender();
  }
}

// ========== HAPUS BUKU ==========
function deleteBookById(bookId) {
  const confirmDelete = confirm("⚠️ Apakah Anda yakin ingin menghapus buku ini?");
  if (confirmDelete) {
    books = books.filter(book => book.id !== bookId);
    saveBooksToStorage();
    resetSearchAndRender();
  }
}

// ========== RENDER BUKU KE RAK (DENGAN FILTER OPSIONAL) ==========
function renderBooks(booksToRender) {
  // Kosongkan container
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  if (!booksToRender || booksToRender.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '📭 Tidak ada buku yang ditemukan.';
    incompleteBookList.appendChild(emptyMsg.cloneNode(true));
    completeBookList.appendChild(emptyMsg.cloneNode(true));
    return;
  }

  let hasIncomplete = false;
  let hasComplete = false;

  booksToRender.forEach(book => {
    const bookDiv = document.createElement('div');
    bookDiv.setAttribute('data-bookid', book.id);
    bookDiv.setAttribute('data-testid', 'bookItem');
    bookDiv.classList.add('book-item');

    // Inner konten buku
    bookDiv.innerHTML = `
      <h3 data-testid="bookItemTitle">📖 ${escapeHtml(book.title)}</h3>
      <p data-testid="bookItemAuthor">✍️ Penulis: ${escapeHtml(book.author)}</p>
      <p data-testid="bookItemYear">📅 Tahun: ${book.year}</p>
      <div class="book-actions">
        <button data-testid="bookItemIsCompleteButton" class="${book.isComplete ? 'btn-warning' : 'btn-success'}">
          ${book.isComplete ? '↩️ Belum selesai dibaca' : '✔️ Tandai Selesai'}
        </button>
        <button data-testid="bookItemDeleteButton" class="btn-danger">🗑️ Hapus Buku</button>
        <button data-testid="bookItemEditButton" class="btn-warning">✏️ Edit Buku</button>
      </div>
    `;

    // Event tombol pindah rak
    const toggleBtn = bookDiv.querySelector('[data-testid="bookItemIsCompleteButton"]');
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookCompletion(book.id);
    });

    // Event hapus
    const deleteBtn = bookDiv.querySelector('[data-testid="bookItemDeleteButton"]');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteBookById(book.id);
    });

    // Event edit
    const editBtn = bookDiv.querySelector('[data-testid="bookItemEditButton"]');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(book);
    });

    // Masukkan ke rak sesuai status
    if (book.isComplete) {
      completeBookList.appendChild(bookDiv);
      hasComplete = true;
    } else {
      incompleteBookList.appendChild(bookDiv);
      hasIncomplete = true;
    }
  });

  // Tampilkan pesan kosong per rak jika diperlukan
  if (!hasIncomplete) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '📭 Belum ada buku di rak "Belum selesai".';
    incompleteBookList.appendChild(emptyMsg);
  }
  if (!hasComplete) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '📭 Belum ada buku di rak "Selesai dibaca".';
    completeBookList.appendChild(emptyMsg);
  }
}

// simple XSS protection
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

// ========== PENCARIAN BUKU ==========
function searchBooksByTitle(keyword) {
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword === "") {
    renderBooks(books);
    return;
  }
  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(trimmedKeyword.toLowerCase())
  );
  renderBooks(filtered);
  if (filtered.length === 0) {
    // sudah ditangani di renderBooks
  }
}

// ========== MODAL EDIT ==========
function openEditModal(book) {
  // Isi form modal dengan data buku yang dipilih
  document.getElementById('editBookTitle').value = book.title;
  document.getElementById('editBookAuthor').value = book.author;
  document.getElementById('editBookYear').value = book.year;
  document.getElementById('editBookIsComplete').checked = book.isComplete;
  document.getElementById('editBookId').value = book.id;
  
  editModal.style.display = 'flex';
}

function closeEditModal() {
  editModal.style.display = 'none';
  editBookForm.reset();  // reset form edit
}

// ========== EVENT LISTENER ==========
// 1. Form Tambah Buku
bookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const success = addBook(title, author, year, isComplete);
  if (success) {
    bookForm.reset();
    // reset checkbox label tampilan targetShelf
    document.getElementById('bookFormIsComplete').checked = false;
    targetShelfSpan.textContent = 'Belum selesai dibaca';
  }
});

// Perubahan checkbox pada form tambah
const completeCheckbox = document.getElementById('bookFormIsComplete');
if (completeCheckbox) {
  completeCheckbox.addEventListener('change', function() {
    targetShelfSpan.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  });
}

// 2. Pencarian Submit
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const keyword = searchInput.value;
  searchBooksByTitle(keyword);
});

// 3. Tombol Reset Pencarian
resetSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  renderBooks(books);
});

// 4. EDIT BUKU - Submit Form Edit + VALIDASI KUAT
editBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const bookId = parseInt(document.getElementById('editBookId').value, 10);
  const newTitle = document.getElementById('editBookTitle').value;
  const newAuthor = document.getElementById('editBookAuthor').value;
  const newYear = document.getElementById('editBookYear').value;
  const newCompleteStatus = document.getElementById('editBookIsComplete').checked;

  // Validasi ketat sebelum menyimpan
  if (!validateBookFields(newTitle, newAuthor, newYear)) {
    return; // alert sudah ditampilkan di validateBookFields
  }

  const success = editBookById(bookId, newTitle, newAuthor, newYear, newCompleteStatus);
  if (success) {
    closeEditModal();
    // render sudah direset di dalam editBookById (resetSearchAndRender)
  }
});

// 5. Tombol cancel / tutup modal
cancelEditBtn.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// 6. Load data dari localStorage saat pertama
function loadBooksFromStorage() {
  const stored = localStorage.getItem('books');
  if (stored) {
    try {
      books = JSON.parse(stored);
      // pastikan setiap buku memiliki properti yang benar
      books = books.filter(b => b.id && b.title && b.author && typeof b.year === 'number');
    } catch(e) { books = []; }
  } else {
    // Data contoh untuk demo (agar tidak kosong)
    books = [
      { id: generateId(), title: "Pemrograman Web", author: "John Doe", year: 2023, isComplete: false },
      { id: generateId(), title: "Atomic Habits", author: "James Clear", year: 2018, isComplete: true },
      { id: generateId(), title: "Deep Work", author: "Cal Newport", year: 2016, isComplete: false }
    ];
    saveBooksToStorage();
  }
  renderBooks(books);
}

// Inisialisasi semua
loadBooksFromStorage();