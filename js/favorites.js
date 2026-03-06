const FAVORITES_KEY = 'book-explorer-favorites';

export function addFavorite(book) {
    const favorites = getFavorites();
    if (!favorites.find(b => b.id === book.id)) {
        favorites.push(book);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
}

export function removeFavorite(bookId) {
    const favorites = getFavorites();
    const filtered = favorites.filter(b => b.id !== bookId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function getFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function isFavorite(bookId) {
    return getFavorites().some(b => b.id === bookId);
}

export function clearFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
}
