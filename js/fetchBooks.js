const SEARCH_ENDPOINT = 'https://openlibrary.org/search.json';
const COVER_ENDPOINT = 'https://covers.openlibrary.org/b/id/';
const DEFAULT_COVER = 'https://via.placeholder.com/150x200?text=No+Cover';

export async function fetchBooks(query) {
    const term = query.trim() || 'programming';
    const params = new URLSearchParams({
        q: term,
        limit: '40',
        fields: 'key,title,author_name,cover_i,first_publish_year'
    });

    const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Open Library request failed');
    }

    const data = await response.json();
    const docs = data.docs || [];

    return docs.map((doc) => {
        const cover = doc.cover_i
            ? `${COVER_ENDPOINT}${doc.cover_i}-M.jpg`
            : DEFAULT_COVER;

        return {
            id: doc.key,
            title: doc.title || 'Untitled',
            author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
            year: doc.first_publish_year ? String(doc.first_publish_year) : '—',
            cover,
            preview: doc.key ? `https://openlibrary.org${doc.key}` : '#'
        };
    });
}