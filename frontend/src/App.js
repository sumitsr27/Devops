import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    publishedYear: '',
    genre: '',
  });
  const [editBookId, setEditBookId] = useState(null);
  const [editBookData, setEditBookData] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [showMoreIds, setShowMoreIds] = useState(new Set()); // Track books with "show more" active

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/books', newBook);
      setNewBook({
        title: '',
        author: '',
        description: '',
        publishedYear: '',
        genre: '',
      });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const startEditing = (book) => {
    setEditBookId(book._id);
    setEditBookData({
      title: book.title,
      author: book.author,
      description: book.description,
      publishedYear: book.publishedYear,
      genre: book.genre,
    });
  };

  const handleEditChange = (e) => {
    setEditBookData({ ...editBookData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, editBookData);
      setEditBookId(null);
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const cancelEdit = () => {
    setEditBookId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleReviewInputChange = (bookId, e) => {
    setReviewInputs({
      ...reviewInputs,
      [bookId]: {
        ...reviewInputs[bookId],
        [e.target.name]: e.target.value,
      },
    });
  };

  const submitReview = async (bookId) => {
    const review = reviewInputs[bookId];
    if (!review || !review.reviewer || !review.comment || !review.rating) {
      alert('Please fill in all review fields.');
      return;
    }

    try {
      const bookRes = await axios.get(`http://localhost:5000/api/books/${bookId}`);
      const currentReviews = bookRes.data.reviews || [];

      const updatedReviews = [
        ...currentReviews,
        {
          reviewer: review.reviewer,
          comment: review.comment,
          rating: Number(review.rating),
        },
      ];

      await axios.put(`http://localhost:5000/api/books/${bookId}`, {
        ...bookRes.data,
        reviews: updatedReviews,
      });

      setReviewInputs({ ...reviewInputs, [bookId]: {} });

      fetchBooks();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 'No ratings';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(2);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle Show More/Show Less
  const toggleShowMore = (id) => {
    setShowMoreIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const styles = {
  container: {
    maxWidth: 750,
    margin: '20px auto',
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  input: {
    width: '90%',
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    padding: '7px 15px',
    marginRight: 10,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  bookCard: {
    border: '1px solid #ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 25,
    backgroundColor: 'white',
  },
  textarea: {
    width: '100%',
    marginBottom: 8,
    padding: 8,
    minHeight: 60,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
};


  return (
    <div className="App-header" style={styles.container}>
      <h1>📚 Books List with Reviews</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 20,
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
      />

      {/* Add new book form */}
      <form onSubmit={handleAddBook} style={{ marginBottom: 30 }}>
        <h2>Add a New Book</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newBook.title}
          onChange={handleInputChange}
          required
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={newBook.author}
          onChange={handleInputChange}
          required
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <input
          type="number"
          name="publishedYear"
          placeholder="Published Year"
          value={newBook.publishedYear}
          onChange={handleInputChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          name="genre"
          placeholder="Genre"
          value={newBook.genre}
          onChange={handleInputChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newBook.description}
          onChange={handleInputChange}
          style={{ width: '100%', marginBottom: 8, padding: 8, minHeight: 60 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Add Book
        </button>
      </form>

      {filteredBooks.length === 0 ? (
        <p>No books available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredBooks.map((book) => (
            <li
              key={book._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 5,
                padding: 15,
                marginBottom: 25,
              }}
            >
              {editBookId === book._id ? (
                <>
                  <input
                    name="title"
                    value={editBookData.title}
                    onChange={handleEditChange}
                    style={{ width: '100%', marginBottom: 8, padding: 8 }}
                  />
                  <input
                    name="author"
                    value={editBookData.author}
                    onChange={handleEditChange}
                    style={{ width: '100%', marginBottom: 8, padding: 8 }}
                  />
                  <input
                    name="publishedYear"
                    type="number"
                    value={editBookData.publishedYear}
                    onChange={handleEditChange}
                    style={{ width: '100%', marginBottom: 8, padding: 8 }}
                  />
                  <input
                    name="genre"
                    value={editBookData.genre}
                    onChange={handleEditChange}
                    style={{ width: '100%', marginBottom: 8, padding: 8 }}
                  />
                  <textarea
                    name="description"
                    value={editBookData.description}
                    onChange={handleEditChange}
                    style={{ width: '100%', marginBottom: 8, padding: 8, minHeight: 60 }}
                  />
                  <button
                    onClick={() => saveEdit(book._id)}
                    style={{ marginRight: 10, padding: '6px 12px' }}
                  >
                    Save
                  </button>
                  <button onClick={cancelEdit} style={{ padding: '6px 12px' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {/* Title followed by author */}
                  <h3>
                    {book.title} by {book.author}
                  </h3>

                  {/* Show More / Show Less button */}
                  <button
                    onClick={() => toggleShowMore(book._id)}
                    style={{ marginBottom: 10, padding: '6px 12px' }}
                  >
                    {showMoreIds.has(book._id) ? 'Show Less' : 'Show More'}
                  </button>

                  {/* Conditional additional info */}
                  {showMoreIds.has(book._id) && (
                    <>
                      <p>
                        <b>Genre:</b> {book.genre || 'N/A'} | <b>Published Year:</b>{' '}
                        {book.publishedYear || 'N/A'}
                      </p>
                      <p>{book.description || 'No description available.'}</p>
                    </>
                  )}

                  <p>
                    <b>Average Rating:</b> {calculateAverageRating(book.reviews)}
                  </p>

                  <button
                    onClick={() => startEditing(book)}
                    style={{ marginRight: 10, padding: '6px 12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    style={{ padding: '6px 12px' }}
                  >
                    Delete
                  </button>

                  {/* Reviews Section */}
                  <div style={{ marginTop: 20 }}>
                    <h4>Reviews:</h4>
                    {book.reviews && book.reviews.length > 0 ? (
                      <ul style={{ paddingLeft: 20 }}>
                        {book.reviews.map((rev, idx) => (
                          <li key={idx} style={{ marginBottom: 8 }}>
                            <b>{rev.reviewer}</b> ({rev.rating}⭐): {rev.comment}
                          </li>
                        ))}
                      </ul>
                    )
: (
<p>No reviews yet</p>
)}
                {/* Add review form */}
                <div
                  style={{
                    marginTop: 15,
                    borderTop: '1px solid #ccc',
                    paddingTop: 10,
                  }}
                >
                  <input
                    type="text"
                    name="reviewer"
                    placeholder="Your name"
                    value={reviewInputs[book._id]?.reviewer || ''}
                    onChange={(e) => handleReviewInputChange(book._id, e)}
                    style={{ marginRight: 8, padding: 6 }}
                  />
                  <input
                    type="text"
                    name="comment"
                    placeholder="Review"
                    value={reviewInputs[book._id]?.comment || ''}
                    onChange={(e) => handleReviewInputChange(book._id, e)}
                    style={{ marginRight: 8, padding: 6, width: 250 }}
                  />
                  <input
                    type="number"
                    name="rating"
                    placeholder="Rating (1-5)"
                    min="1"
                    max="5"
                    value={reviewInputs[book._id]?.rating || ''}
                    onChange={(e) => handleReviewInputChange(book._id, e)}
                    style={{ marginRight: 8, padding: 6, width: 100 }}
                  />
                  <button onClick={() => submitReview(book._id)} style={{ padding: '6px 12px' }}>
                    Submit Review
                  </button>
                </div>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  )}
</div>
);
}

export default App;
