import fetchBooks from './fetchBooks.js';
import { addFavorite, getFavorites } from './favorites.js';
import { showToast } from './toast.js';

const SEARCH_FORM_ID = 'bookSearchForm';
const SEARCH_INPUT_ID = 'bookSearchInput';
const GRID_ID = 'booksGrid';
const LOADING_ID = 'booksLoading';
const NORESULT_ID = 'booksNoResult';

function el(id) { return document.getElementById(id); }

function createCard(book) {
  const article = document.createElement('article');
  article.className = 'bg-white rounded-lg shadow-sm overflow-hidden flex flex-col';
  article.innerHTML = `
    <div class="h-48 bg-gray-200 ${book.cover ? '' : ''}" style="background-image: url('${book.cover || ''}'); background-size: cover; background-position: center;"></div>
    <div class="p-4 flex-1">
      <h3 class="font-semibold">${escapeHtml(book.title)}</h3>
      <p class="text-sm text-gray-500 mt-1">${escapeHtml(book.author)}</p>
      <div class="mt-4 flex items-center justify-between">
        <div class="flex gap-3">
          <button data-id="${escapeHtml(book.id)}" class="homeViewBtn text-gray-700 hover:text-indigo-600">View</button>
          <button data-id="${escapeHtml(book.id)}" class="homeAddBtn text-indigo-600 font-semibold">Add</button>
        </div>
        <span class="text-sm text-gray-400">&nbsp;</span>
      </div>
    </div>
  `;
  return article;
}

export function setLoading(loading) {
  const loader = el(LOADING_ID);
  if (!loader) return;
  loader.style.display = loading ? 'block' : 'none';
}



function setNoResults(show) {
  const nr = el(NORESULT_ID);
  if (!nr) return;
  nr.style.display = show ? 'block' : 'none';
}

async function doSearch(q) {
  const grid = el(GRID_ID);
  if (!grid) return;
  setNoResults(false);
  setLoading(true);
  grid.innerHTML = '';
  try {
    const books = await fetchBooks(q, { limit: 20 });
    setLoading(false);
    if (!books || books.length === 0) {
      setNoResults(true);
      return;
    }
    const favs = (getFavorites() || []).map(b => b.id || b.key || b);
    books.forEach(book => {
      const card = createCard(book);
      const btn = card.querySelector('button.homeAddBtn');
      const viewBtn = card.querySelector('button.homeViewBtn');
      if (favs.includes(book.id)) {
        btn.textContent = 'Added';
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
      } else {
        btn.addEventListener('click', () => {
          addFavorite(book);
          btn.textContent = 'Added';
          btn.disabled = true;
          btn.classList.add('opacity-60', 'cursor-not-allowed');
          showToast('Added to favorites');
          // Navigate immediately to favorites page
          //   window.location.href = 'favorite.html';
        });
      }
      if (viewBtn) {
        viewBtn.addEventListener('click', () => showModal(book));
      }
      grid.appendChild(card);
    });
  } catch (e) {
    setLoading(false);
    setNoResults(true);
    console.error(e);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function init() {
  // Set year in footer
  const yearEl = el('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const menuBtn = el('menuBtn');
  const mobileMenu = el('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Learn More modal
  const learnMoreBtn = el('learnMoreBtn');
  const learnMoreModal = el('learnMoreModal');
  const learnMoreClose = el('learnMoreClose');
  const aboutBtn = el('aboutBtn');
  const aboutBtnMobile = el('aboutBtnMobile');

  if ((learnMoreBtn || aboutBtn || aboutBtnMobile) && learnMoreModal) {
    const openModal = () => learnMoreModal.classList.remove('hidden');
    if (learnMoreBtn) learnMoreBtn.addEventListener('click', openModal);
    if (aboutBtn) aboutBtn.addEventListener('click', openModal);
    if (aboutBtnMobile) aboutBtnMobile.addEventListener('click', openModal);
  }

  if (learnMoreClose && learnMoreModal) {
    learnMoreClose.addEventListener('click', () => {
      learnMoreModal.classList.add('hidden');
    });
  }
  if (learnMoreModal) {
    learnMoreModal.addEventListener('click', (e) => {
      if (e.target === learnMoreModal) {
        learnMoreModal.classList.add('hidden');
      }
    });
  }

  // Contact modal
  const contactBtn = el('contactBtn');
  const contactBtnMobile = el('contactBtnMobile');
  const contactModal = el('contactModal');
  const contactClose = el('contactClose');

  if ((contactBtn || contactBtnMobile) && contactModal) {
    const openModal = () => contactModal.classList.remove('hidden');
    if (contactBtn) contactBtn.addEventListener('click', openModal);
    if (contactBtnMobile) contactBtnMobile.addEventListener('click', openModal);
  }

  if (contactClose && contactModal) {
    contactClose.addEventListener('click', () => {
      contactModal.classList.add('hidden');
    });
  }
  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.add('hidden');
      }
    });
  }

  // Clear Favorites button
  const clearBtn = el('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
        localStorage.removeItem('bookExplorer.favorites');
        location.reload();
      }
    });
  }

  const form = el(SEARCH_FORM_ID);
  const input = el(SEARCH_INPUT_ID);
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) doSearch(q);
    });
  }

  // initialize with a default query
  doSearch('classic literature');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

// Helper function to reset favorites (call from console: window.clearAllFavorites())
window.clearAllFavorites = () => {
  localStorage.removeItem('bookExplorer.favorites');
  alert('All favorites cleared! Reloading...');
  location.reload();
};

// Modal helpers
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
    // If id looks like an OpenLibrary key (/works/OL...), link to openlibrary
    if (book.id && String(book.id).startsWith('/')) link.href = `https://openlibrary.org${book.id}`;
    else link.href = '#';
  }

  modal.classList.remove('hidden');

  const close = document.getElementById('modalClose');
  function hide() { modal.classList.add('hidden'); close && close.removeEventListener('click', hide); }
  if (close) close.addEventListener('click', hide);
  modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
}