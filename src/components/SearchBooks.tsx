import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import axios from 'axios';

interface Book {
  key: string;
  title: string;
  cover_i: string;
  author_name: string;
  seed: string;
}

const SearchBooks: FunctionalComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value);
  };

  const handleSubmit = (e: h.JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setBooks([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);

    const apiUrl = `https://openlibrary.org/search.json?q=${searchQuery}&limit=20`;

    axios
      .get(apiUrl)
      .then(response => {
        
        const { docs, numFound } = response.data;
        setBooks(docs);
        setTotalResults(numFound);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setIsLoading(false);
      });
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    const apiUrl = `https://openlibrary.org/search.json?q=${searchQuery}&limit=20&page=${nextPage}`;

    setIsLoading(true);
    setError(null);

    axios
      .get(apiUrl)
      .then(response => {
        const { docs, numFound } = response.data;
        setBooks(prevBooks => [...prevBooks, ...docs]);
        setTotalResults(numFound);
        setCurrentPage(nextPage);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchQuery}
          onInput={handleInputChange}
          placeholder="Buscar libros..."
        />
        <button type="submit">Search</button>
      </form>

      {isLoading && <div>Loading...</div>}

      {error && <div>Error: {error}</div>}

      <section className={'bookSearch'}>
          {books.map(book => (
            <div key={book.key}>
              <img 
              src={book.cover_i ?
                `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png'}
              alt="cover" />
              <p>{book.title}</p>
              <h5>{book.author_name}</h5>
              <a href={`https://openlibrary.org${book.seed[0]}`}>See more</a>
            </div>
          ))}
        </section>

      {totalResults > 20 && books.length < totalResults && !isLoading ? 
        <button onClick={handleNextPage}>Load more</button>
       : ''}

      {books.length === 0 && !isLoading ? <div>No results</div> : ''}
    </div>
  );
};

export default SearchBooks;