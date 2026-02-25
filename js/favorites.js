import { showToast } from './toast.js';

const STORAGE_KEY = 'bookExplorer.favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch (e) {
    // ignore
  }
}

function addFavorite(bookOrId) {
  const favs = getFavorites();
  let id = null;
  let item = null;
  if (typeof bookOrId === 'string') {
    id = bookOrId;
    item = { id };
  } else if (bookOrId && typeof bookOrId === 'object') {
    id = bookOrId.id || bookOrId.key;
    item = { id, title: bookOrId.title, author: bookOrId.author, cover: bookOrId.cover };
  }
  if (!id) return;
  if (!favs.find(b => b.id === id)) {
    favs.unshift(item);
    saveFavorites(favs);
  }
}

function removeFavorite(id) {
  const favs = getFavorites().filter(book => book.id !== id);
  saveFavorites(favs);
  try { showToast('Removed from favorites'); } catch (e) { /* ignore */ }
}


// Render functions for favorite.html page
let favoritesEl = null;
let emptyHint = null;

function renderFavorites() {
  if (!favoritesEl || !emptyHint) return;
  favoritesEl.innerHTML = '';
  const favs = getFavorites();
  // Filter to only show books with real title and author
  const validFavs = favs.filter(book => book.title && book.author && book.title.trim() && book.author.trim());
  if (validFavs.length === 0) {
    emptyHint.style.display = 'block';
    return;
  }
  emptyHint.style.display = 'none';
  validFavs.forEach(book => {
    const item = document.createElement('div');
    item.className = 'bg-white rounded-lg shadow-sm p-4 flex items-center justify-between';
    item.innerHTML = `
      <div class="flex-1">
        <div class="font-semibold">${escapeHtml(book.title)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(book.author)}</div>
        ${book.cover ? `<img src="${book.cover}" alt="cover" class="w-20 h-28 mt-2 object-cover rounded" />` : ''}
      </div>
      <div class="flex gap-2">
        <button data-id="${escapeHtml(book.id)}" class="viewBtn text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-1">View</button>
        <button data-id="${escapeHtml(book.id)}" class="removeBtn text-red-500 hover:text-red-700 font-semibold px-3 py-1">Remove</button>
      </div>
    `;
    favoritesEl.appendChild(item);
  });
}

function init() {
  favoritesEl = document.getElementById('favoritesList');
  emptyHint = document.getElementById('emptyHint');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderFavorites();

  if (favoritesEl) {
    favoritesEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('removeBtn')) {
        removeFavorite(id);
        renderFavorites();
      } else if (btn.classList.contains('viewBtn')) {
        const book = getFavorites().find(b => b.id === id);
        if (book) showModal(book);
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showModal(book) {
  const modal = document.getElementById('bookModal');
  if (!modal) return;
  const title = document.getElementById('modalTitle');
  const author = document.getElementById('modalAuthor');
  const cover = document.getElementById('modalCover');
  const desc = document.getElementById('modalDesc');
  const link = document.getElementById('modalLink');

  if (title) title.textContent = book.title || 'Untitled';
  if (author) author.textContent = book.author || 'Unknown';
  if (cover) {
    if (book.cover) {
      cover.src = book.cover;
      cover.style.display = '';
    } else {
      cover.src = '';
      cover.style.display = 'none';
    }
  }
  if (desc) desc.textContent = book.description || book.subtitle || 'No description available.';
  if (link) {
    if (book.id && String(book.id).startsWith('/')) link.href = `https://openlibrary.org${book.id}`;
    else link.href = '#';
  }

  modal.classList.remove('hidden');

  const close = document.getElementById('modalClose');
  function hide() { modal.classList.add('hidden'); close && close.removeEventListener('click', hide); }
  if (close) close.addEventListener('click', hide);
  modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
}

export { getFavorites, saveFavorites, addFavorite, removeFavorite };
