// Lightweight module to fetch books from Open Library Search API
export default async function fetchBooks(query, { limit = 20 } = {}) {
  if (!query || String(query).trim() === '') return [];
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch books');
  const data = await res.json();
  // Map to simplified structure
  return (data.docs || []).map(doc => {
    const id = doc.key || doc.cover_edition_key || doc.edition_key?.[0] || doc.title;
    const title = doc.title || 'Untitled';
    const author = (doc.author_name && doc.author_name[0]) || 'Unknown';
    const coverId = doc.cover_i;
    const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
    return { id, title, author, cover };
  });
}


