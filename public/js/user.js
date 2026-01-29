// User page functionality
let allBooks = [];
let selectedBookId = null;
let userLocation = null;

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const userIdInput = document.getElementById('userId');
const borrowModal = document.getElementById('borrowModal');
const closeModal = document.querySelector('.close');
const borrowBookInfo = document.getElementById('borrowBookInfo');
const locationStatus = document.getElementById('locationStatus');
const locationCoords = document.getElementById('locationCoords');
const confirmBorrowBtn = document.getElementById('confirmBorrowBtn');
const borrowMessage = document.getElementById('borrowMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    // Modal close
    closeModal.addEventListener('click', () => {
        borrowModal.classList.remove('show');
        resetModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === borrowModal) {
            borrowModal.classList.remove('show');
            resetModal();
        }
    });

    // Confirm borrow button
    confirmBorrowBtn.addEventListener('click', handleConfirmBorrow);
});

// Load all books
async function loadBooks() {
    try {
        loadingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        booksGrid.innerHTML = '';

        const response = await getAllBooks();
        allBooks = response.data || [];

        loadingSpinner.style.display = 'none';

        if (allBooks.length === 0) {
            booksGrid.innerHTML = '<p style="text-align: center; color: #6B7280;">No books available yet.</p>';
            return;
        }

        displayBooks(allBooks);
    } catch (error) {
        loadingSpinner.style.display = 'none';
        errorMessage.textContent = `Error loading books: ${error.message}`;
        errorMessage.style.display = 'block';
    }
}

// Display books in grid
function displayBooks(books) {
    booksGrid.innerHTML = '';

    books.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
}

// Create book card element
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';

    const stockClass = book.stock > 0 ? 'stock' : 'stock out-of-stock';
    const stockText = book.stock > 0 ? `${book.stock} available` : 'Out of Stock';
    const isDisabled = book.stock <= 0;

    card.innerHTML = `
        <h4>${escapeHtml(book.title)}</h4>
        <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
        <p class="${stockClass}"><strong>Stock:</strong> ${stockText}</p>
        <button 
            class="btn btn-success btn-borrow" 
            onclick="openBorrowModal(${book.id})"
            ${isDisabled ? 'disabled' : ''}
        >
            ${isDisabled ? 'Out of Stock' : 'Borrow This Book'}
        </button>
    `;

    return card;
}

// Open borrow modal
async function openBorrowModal(bookId) {
    const userId = userIdInput.value.trim();

    if (!userId) {
        alert('Please enter your User ID first!');
        userIdInput.focus();
        return;
    }

    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    selectedBookId = bookId;

    // Display book info
    borrowBookInfo.innerHTML = `
        <div style="background: #F3F4F6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="color: #4F46E5;">${escapeHtml(book.title)}</h4>
            <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
            <p><strong>Available Stock:</strong> ${book.stock}</p>
        </div>
    `;

    // Reset states
    borrowMessage.style.display = 'none';
    confirmBorrowBtn.disabled = true;
    userLocation = null;

    // Show modal
    borrowModal.classList.add('show');

    // Get geolocation
    await getLocationForBorrow();
}

// Get user geolocation
async function getLocationForBorrow() {
    locationStatus.textContent = 'Getting your location...';
    locationCoords.style.display = 'none';

    try {
        userLocation = await getUserLocation();

        locationStatus.textContent = 'Location acquired successfully! ✓';
        locationStatus.style.color = '#10B981';

        document.getElementById('latitude').textContent = userLocation.latitude.toFixed(6);
        document.getElementById('longitude').textContent = userLocation.longitude.toFixed(6);
        locationCoords.style.display = 'block';

        confirmBorrowBtn.disabled = false;
    } catch (error) {
        locationStatus.textContent = `Error: ${error.message}`;
        locationStatus.style.color = '#EF4444';

        borrowMessage.className = 'message error';
        borrowMessage.textContent = 'Cannot proceed without location access. Please enable location services.';
        borrowMessage.style.display = 'block';
    }
}

// Handle confirm borrow
async function handleConfirmBorrow() {
    const userId = userIdInput.value.trim();

    if (!userId || !selectedBookId || !userLocation) {
        alert('Missing required information');
        return;
    }

    confirmBorrowBtn.disabled = true;
    borrowMessage.style.display = 'none';

    try {
        const response = await borrowBook(
            parseInt(userId),
            selectedBookId,
            userLocation.latitude,
            userLocation.longitude
        );

        borrowMessage.className = 'message success';
        borrowMessage.innerHTML = `
            <strong>Success!</strong><br>
            ${response.message}<br>
            <small>Borrow ID: ${response.data.borrowId}</small><br>
            <small>Remaining Stock: ${response.data.remainingStock}</small>
        `;
        borrowMessage.style.display = 'block';

        // Reload books to update stock
        setTimeout(() => {
            loadBooks();
            borrowModal.classList.remove('show');
            resetModal();
        }, 3000);
    } catch (error) {
        borrowMessage.className = 'message error';
        borrowMessage.textContent = error.message || 'Failed to borrow book';
        borrowMessage.style.display = 'block';
        confirmBorrowBtn.disabled = false;
    }
}

// Reset modal state
function resetModal() {
    selectedBookId = null;
    userLocation = null;
    borrowBookInfo.innerHTML = '';
    borrowMessage.style.display = 'none';
    locationStatus.textContent = 'Getting your location...';
    locationStatus.style.color = '#6B7280';
    locationCoords.style.display = 'none';
    confirmBorrowBtn.disabled = true;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
