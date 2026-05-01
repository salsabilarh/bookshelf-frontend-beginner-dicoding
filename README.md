# 📚 Bookshelf App — Browser-Based Book Collection Manager

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Storage](https://img.shields.io/badge/Web_Storage-localStorage-brightgreen?style=for-the-badge)
![Dicoding](https://img.shields.io/badge/Dicoding-Submission-4285F4?style=for-the-badge)
![Score](https://img.shields.io/badge/Score-4%2F5_%E2%98%85-FFD700?style=for-the-badge)
![Learning Path](https://img.shields.io/badge/Frontend_Web-Learning_Path_Stage_3-orange?style=for-the-badge)

> ⭐ **Final submission for "Belajar Membuat Front-End Web untuk Pemula"** — Stage 3 of the *Frontend Web Learning Path* at Dicoding.
> A full-featured book collection manager built with pure Vanilla JavaScript, DOM Manipulation, and Web Storage as the persistence layer.

---

## 📖 Table of Contents

- [Executive Summary](#executive-summary)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Technical Approach](#architecture--technical-approach)
- [Installation & Local Usage](#installation--local-usage)
- [Technical Notes: Why 4/5](#technical-notes-why-45)
- [What I Learned](#what-i-learned)
- [License](#license)

---

## Executive Summary

> This project marks the **real transition from static markup to an interactive application**: a page that responds to user input, remembers data after the browser is closed, and validates input before persisting it — all without a framework, without a library, and without a backend.

Bookshelf App lets users manage their personal book collection entirely in the browser:
- Add new books 📖
- Move them between *"Reading"* and *"Finished"* shelves 🔄
- Edit details ✏️
- Delete entries 🗑️
- Search by title 🔍

All data **persists in `localStorage`** — surviving page refreshes and browser restarts.

What sets this project apart from merely satisfying the submission requirements is a deliberate layer of **defensive programming**: XSS input sanitization, year validation with sensible bounds, corrupt-data cleanup on load, and fail-safe patterns at every point of potential failure.

---

## Key Features

### Usability

| Feature | Description |
|---------|-------------|
| ➕ **Add Book** | 4-field form (title, author, year, read status) with a dynamic submit label that updates as the checkbox is toggled |
| 📚 **Two Separate Shelves** | Books are automatically routed to "Reading" or "Finished" based on their status |
| 🔁 **Toggle Completion** | A single click moves a book between shelves without reloading the page |
| ✏️ **In-Modal Editing** | Animated `fadeInUp` modal with form fields pre-filled from the selected book's data |
| 🗑️ **Delete with Confirmation** | A confirmation dialog prevents accidental deletion |
| 🔍 **Live Search** | Case-insensitive title filtering with a one-click reset button |
| 🎁 **Demo Data** | Three sample books are seeded on first load — the UI is never empty |

### Reliability

| Feature | Description |
|---------|-------------|
| 💾 **localStorage Persistence** | All data survives browser close and reopen |
| 🛡️ **Error Handling on Load** | `try/catch` in `loadBooksFromStorage()` — corrupted localStorage data triggers a clean reset instead of a crash |
| 🔍 **Data Integrity Filter** | On load, every item is validated for required properties (`id`, `title`, `author`, `year`) — partial records are discarded before entering state |
| ✅ **Input Validation** | Year is validated as a positive integer in the range 1000–3000; title and author are checked for non-empty values after trimming |
| 🔒 **Basic XSS Protection** | `escapeHtml()` escapes `&`, `<`, and `>` characters before user content is injected into the DOM via `innerHTML` |
| 📱 **Responsive Layout** | Adapts to screens ≤640px; action buttons use `flex: 1` to fill available width on mobile |

---

## Tech Stack

```text
📁 Technologies
├── HTML5              → Structure & markup; data-testid attributes for automated testing
├── CSS3
│   ├── Flexbox        → Form, bookshelf, and action button layouts
│   ├── CSS Transitions & Animation (fadeInUp) → Modal UX
│   └── Media Query (640px) → Mobile responsiveness
└── JavaScript (ES6+)
    ├── DOM API        → createElement, innerHTML, addEventListener, querySelector
    ├── Web Storage    → localStorage for data persistence
    ├── Array Methods  → push, filter, find, findIndex, forEach
    └── JSON           → stringify/parse for storage serialization
```

**External Dependencies:** None. Zero dependencies — runs directly in any browser with no installation required.

---

## Architecture & Technical Approach

### State Management: Single Array as Source of Truth

All application state lives in one global array:

```javascript
let books = [];
```

Every operation — add, edit, delete, toggle — modifies this array, then consistently calls two functions:

```javascript
saveBooksToStorage(); // sync to localStorage
renderBooks(books);   // sync to DOM
```

This implements **unidirectional data flow** manually: state → storage → render. No operation ever mutates the DOM directly without first going through state. This is the same pattern that underpins modern state management frameworks like Zustand and Redux — just without the abstraction layer.

### DOM Manipulation: Data-Driven Rendering

Rather than concatenating raw HTML strings, each book item is built programmatically:

```javascript
const bookDiv = document.createElement('div');
bookDiv.setAttribute('data-bookid', book.id);
bookDiv.setAttribute('data-testid', 'bookItem');
bookDiv.classList.add('book-item');

// Event listeners attached directly to the newly created element
const toggleBtn = bookDiv.querySelector('[data-testid="bookItemIsCompleteButton"]');
toggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleBookCompletion(book.id);
});
```

A key decision here: `e.stopPropagation()` is used because action buttons are nested inside the book container. Without it, a button click would bubble up to the container and potentially trigger unintended parent-level events.

### localStorage: Serialization and Defensive Loading

Data is stored as a JSON string and reloaded with layered validation:

```javascript
function loadBooksFromStorage() {
  const stored = localStorage.getItem('books');
  if (stored) {
    try {
      books = JSON.parse(stored);
      // Guard: discard records missing required fields
      books = books.filter(b => b.id && b.title && b.author && typeof b.year === 'number');
    } catch(e) {
      books = []; // fallback if JSON is malformed
    }
  }
}
```

`typeof b.year === 'number'` explicitly verifies the data type, not just property existence — because `JSON.parse` may return `{ year: "2023" }` (a string) if the stored value was manually edited via DevTools.

### Basic XSS Protection

Since user-supplied book data is rendered back into the DOM via `innerHTML`, there is a real risk of XSS injection. `escapeHtml()` addresses this:

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

This is not a comprehensive XSS solution — it does not handle HTML attributes, JavaScript URLs, or other vectors — but it reflects a conscious awareness that **user input should never be trusted implicitly**, a principle that applies equally to frontend and backend systems.

### Layer Architecture: Context Within the Learning Path

```
Stage 1 (HTML & CSS)       : Semantic HTML + visual CSS → Static foundation
Stage 2 (JS Fundamentals)  : OOP, recursion, unit testing, functional array methods
Stage 3 (This Project)     : + DOM Manipulation + localStorage → Interactivity & persistence
Stage 4 (Next)             : + Fetch API + RESTful API consumption → Server-side data
Stage 5 (Future)           : + Framework (React/Vue) → Component-based architecture
```

This is the stage where a *page* evolves into an *application* — the most important transition to understand before working with any framework, because everything a framework does is ultimately an abstraction of what is done here by hand.

---

## Installation & Local Usage

No build tools or local server required.

**Clone and open directly:**
```bash
git clone https://github.com/salsabilarh/bookshelf-frontend-beginner-dicoding.git
cd bookshelf-frontend-beginner-dicoding
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

**Or via VS Code Live Server:**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **"Open with Live Server"**

**Project structure:**
```
bookshelf-frontend-beginner-dicoding/
├── index.html    ← Markup + data-testid attributes for automated testing
├── main.js       ← All application logic (state, DOM, storage, validation)
└── style.css     ← Styling + modal animation + responsive layout
```

**To reset all data:** Open DevTools → Application → Local Storage → right-click the origin → Clear, then refresh.

---

## Technical Notes: Why 4/5

This submission satisfies all mandatory Dicoding criteria and adds features beyond what was required — modal editing, XSS protection, year validation, and demo data seeding. The 4/5 score reflects an active learning stage rather than a final product, and the gaps are already identified:

- **Custom Event API**: A more advanced implementation would use `CustomEvent` and `dispatchEvent` for inter-component communication instead of direct function calls — a more scalable pattern that mirrors how frameworks handle event-driven updates.
- **Separation of Concerns**: Storage logic, data manipulation, and rendering currently coexist in a single `main.js` file. The next iteration would split these into dedicated modules (`storage.js`, `books.js`, `render.js`).
- **Stricter `const` Usage**: Some variables that are never reassigned are still declared with `let`.

These limitations are fully understood and serve as concrete targets for the projects ahead.

---

## What I Learned

### 1. State Is the Center of Everything

The most important insight from this project: the UI should be nothing more than a *reflection* of state — never state itself. Every impulse to manipulate the DOM directly ("just remove this element") is better served by modifying the `books` array and re-rendering. It is *slower* in theory, but far more *predictable and maintainable* in practice — and this is the foundational principle behind every modern frontend framework.

### 2. localStorage Is a Database With Hard Limits

Implementing the full `get → parse → modify → stringify → set` cycle by hand makes localStorage's constraints viscerally real: no querying, no indexing, no relational data, and synchronous I/O. This crystallizes *why* alternatives like IndexedDB exist and *why* real applications eventually move state to the server — not as abstract theory, but as felt necessity.

### 3. Validation Is Communication, Not a Barrier

`validateBookFields()` produces specific, actionable error messages. This is not just about keeping bad data out — it is about helping users understand what went wrong and why. The same principle holds in API design: a well-formed `400 Bad Request` response always identifies *which field* failed and *why*, rather than returning a generic error.

### 4. "It Works" Is Not the Finish Line

Adding `escapeHtml()` was not a requirement. Filtering records on load was not a requirement. Wrapping `JSON.parse` in a `try/catch` was not a requirement. But each of these decisions separates code that *happens to work under normal conditions* from code that is *designed not to break under abnormal ones*. That gap is the difference between junior-level code and production-ready code.

---

## License

This project was built as a Dicoding course submission and is open for educational use.

---

*Submission: Belajar Membuat Front-End Web untuk Pemula — Stage 3 of Frontend Web Learning Path, Dicoding 2026*
