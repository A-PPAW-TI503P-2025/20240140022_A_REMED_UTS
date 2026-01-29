// Admin page functionality
let allBooks = [];
let currentEditBookId = null;

// DOM Elements
const addBookForm = document.getElementById('addBookForm');
const editBookForm = document.getElementById('editBookForm');
const booksTable = document.getElementById('booksTable');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const addMessage = document.getElementById('addMessage');
const editMessage = document.getElementById('editMessage');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    // Form submissions
    addBookForm.addEventListener('submit', handleAddBook);
    editBookForm.addEventListener('submit', handleEditBook);

    // Modal close
    closeModal.addEventListener('click', () => {
        editModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('show');
        }
    });
});

// Load all books
async function loadBooks() {
    try {
        loadingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        booksTable.innerHTML = '';

        const response = await getAllBooks();
        allBooks = response.data || [];

        loadingSpinner.style.display = 'none';

        if (allBooks.length === 0) {
            booksTable.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 2rem;">No books yet. Add your first book above.</p>';
            return;
        }

        displayBooksTable(allBooks);
    } catch (error) {
        loadingSpinner.style.display = 'none';
        errorMessage.textContent = `Error loading books: ${error.message}`;
        errorMessage.style.display = 'block';
    }
}

// Display books in table
function displayBooksTable(books) {
    const table = document.createElement('table');

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Stock</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${books.map(book => `
                <tr>
                    <td>${book.id}</td>
                    <td>${escapeHtml(book.title)}</td>
                    <td>${escapeHtml(book.author)}</td>
                    <td>${book.stock}</td>
                    <td class="actions">
                        <button class="btn btn-primary btn-small" onclick="openEditModal(${book.id})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="handleDeleteBook(${book.id})">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    booksTable.appendChild(table);
}

// Handle add book
async function handleAddBook(e) {
    e.preventDefault();

    const formData = new FormData(addBookForm);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        stock: parseInt(formData.get('stock'))
    };

    try {
        addMessage.style.display = 'none';

        const response = await createBook(bookData);

        addMessage.className = 'message success';
        addMessage.textContent = response.message || 'Book added successfully!';
        addMessage.style.display = 'block';

        addBookForm.reset();
        loadBooks();

        setTimeout(() => {
            addMessage.style.display = 'none';
        }, 3000);
    } catch (error) {
        addMessage.className = 'message error';
        addMessage.textContent = error.message || 'Failed to add book';
        addMessage.style.display = 'block';
    }
}

// Open edit modal
function openEditModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    currentEditBookId = bookId;
    document.getElementById('editBookId').value = bookId;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editStock').value = book.stock;

    editMessage.style.display = 'none';
    editModal.classList.add('show');
}

// Handle edit book
async function handleEditBook(e) {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('editTitle').value.trim(),
        author: document.getElementById('editAuthor').value.trim(),
        stock: parseInt(document.getElementById('editStock').value)
    };

    try {
        editMessage.style.display = 'none';

        const response = await updateBook(currentEditBookId, bookData);

        editMessage.className = 'message success';
        editMessage.textContent = response.message || 'Book updated successfully!';
        editMessage.style.display = 'block';

        setTimeout(() => {
            editModal.classList.remove('show');
            editMessage.style.display = 'none';
        }, 2000);

        loadBooks();
    } catch (error) {
        editMessage.className = 'message error';
        editMessage.textContent = error.message || 'Failed to update book';
        editMessage.style.display = 'block';
    }
}

// Handle delete book
async function handleDeleteBook(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
        return;
    }

    try {
        const response = await deleteBook(bookId);

        alert(response.message || 'Book deleted successfully!');
        loadBooks();
    } catch (error) {
        alert(error.message || 'Failed to delete book');
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
