import { fetchBooks } from './fetchBooks.js';
import { addFavorite, clearFavorites, getFavorites, isFavorite, removeFavorite } from './favorites.js';

const displayGrid = document.getElementById('display-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loading = document.getElementById('loading');
const clearAllBtn = document.getElementById('clear-all');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    initMobileMenu();
    const path = window.location.pathname.toLowerCase();
    if (path.includes('favorites.html')) {
        initFavoritesPage();
    } else if (path.includes('about.html')) {
        return;
    } else {
        initHomePage();
    }
}

function initMobileMenu() {
    menuBtn?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside or on a link
    document.addEventListener('click', (event) => {
        if (!menuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.add('hidden');
        }
    });

    // Close mobile menu when clicking on a link
    mobileMenu?.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            mobileMenu?.classList.add('hidden');
        }
    });
}

function initHomePage() {
    searchBtn?.addEventListener('click', () => {
        const query = searchInput.value.trim();
        handleSearch(query);
    });

    searchInput?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchBtn?.click();
    });

    handleSearch('programming');
}

async function handleSearch(query) {
    setLoading(true);
    try {
        const books = await fetchBooks(query);
        renderBooks(books, false);
    } catch (error) {
        console.error(error);
        if (displayGrid) {
            displayGrid.innerHTML = `<p class="col-span-full rounded-xl border border-dashed border-rose-200 bg-rose-50 p-10 text-center text-sm text-rose-600">Could not load books. Please check your connection and try again.</p>`;
        }
    } finally {
        setLoading(false);
    }
}

function initFavoritesPage() {
    clearAllBtn?.addEventListener('click', () => {
        clearFavorites();
        renderFavorites();
    });

    renderFavorites();
}

function renderFavorites() {
    const favorites = getFavorites();
    renderBooks(favorites, true);
}

function renderBooks(books, isFavoritesPage) {
    if (!displayGrid) return;
    displayGrid.innerHTML = '';

    if (!books.length) {
        displayGrid.innerHTML = `<p class="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No books to show yet.</p>`;
        return;
    }

    books.forEach((book) => {
        const card = document.createElement('article');
        card.className = 'rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md';
        card.innerHTML = `
            <div class="h-40 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                <img src="${book.cover}" alt="${book.title}" class="h-full w-full object-cover">
            </div>
            <h3 class="mt-4 text-lg font-semibold truncate">${book.title}</h3>
            <p class="mt-1 text-sm text-slate-500 truncate">${book.author}</p>
            <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
                <button class="action-btn flex items-center gap-2 font-semibold text-blue-600 hover:underline">
                    <span class="text-base">❤️</span>
                    <span>${isFavoritesPage ? 'REMOVE' : isFavorite(book.id) ? 'SAVED' : 'FAVORITE'}</span>
                </button>
                <a href="${book.preview || '#'}" target="_blank" rel="noreferrer"
                   class="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200">
                    PREVIEW
                </a>
            </div>
        `;

        const actionBtn = card.querySelector('.action-btn');
        actionBtn?.addEventListener('click', () => {
            if (isFavoritesPage) {
                removeFavorite(book.id);
                renderFavorites();
                return;
            }

            if (!isFavorite(book.id)) {
                addFavorite(book);
                actionBtn.querySelector('span:last-child').textContent = 'SAVED';
            }
        });

        displayGrid.appendChild(card);
    });
}

function setLoading(isLoading) {
    if (!loading) return;
    loading.classList.toggle('hidden', !isLoading);
}