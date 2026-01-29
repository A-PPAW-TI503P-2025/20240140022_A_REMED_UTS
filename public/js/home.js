// Home page functionality
let allBooks = [];
let currentLocation = null;

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const borrowModal = document.getElementById('borrowModal');
const borrowForm = document.getElementById('borrowForm');
const closeModal = document.querySelector('.close');

// Load books on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    initModal();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        filterBooks(e.target.value);
    });
});

// Initialize modal
function initModal() {
    closeModal.onclick = () => {
        borrowModal.classList.remove('show');
    };

    window.onclick = (e) => {
        if (e.target === borrowModal) {
            borrowModal.classList.remove('show');
        }
    };

    borrowForm.addEventListener('submit', handleBorrowSubmit);
}

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
            booksGrid.innerHTML = '<p style="text-align: center; color: #6B7280;">Belum ada buku. Admin bisa menambahkan buku.</p>';
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
    const stockText = book.stock > 0 ? `${book.stock} tersedia` : 'Stok Habis';

    const borrowButton = book.stock > 0
        ? `<button class="btn btn-success btn-borrow" onclick="openBorrowModal(${book.id}, '${escapeHtml(book.title)}')">📖 Pinjam Buku</button>`
        : `<button class="btn btn-danger btn-borrow" disabled>Stok Habis</button>`;

    card.innerHTML = `
        <h4>${escapeHtml(book.title)}</h4>
        <p><strong>Penulis:</strong> ${escapeHtml(book.author)}</p>
        <p class="${stockClass}"><strong>Stok:</strong> ${stockText}</p>
        ${borrowButton}
    `;

    return card;
}

// Open borrow modal
function openBorrowModal(bookId, bookTitle) {
    document.getElementById('borrowBookId').value = bookId;
    document.getElementById('borrowBookInfo').innerHTML = `
        <p style="font-size: 1.1rem;"><strong>Buku:</strong> ${bookTitle}</p>
        <p style="color: #6B7280;">ID: ${bookId}</p>
    `;

    borrowModal.classList.add('show');
    document.getElementById('userId').value = '';
    document.getElementById('borrowMessage').style.display = 'none';

    // Get location
    getLocation();
}

// Get user location
function getLocation() {
    const locationStatus = document.getElementById('locationStatus');
    const locationCoords = document.getElementById('locationCoords');

    if (navigator.geolocation) {
        locationStatus.textContent = 'Mendeteksi lokasi...';
        locationCoords.textContent = '';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                locationStatus.textContent = '✅ Lokasi terdeteksi';
                locationCoords.textContent = `Lat: ${currentLocation.latitude.toFixed(6)}, Long: ${currentLocation.longitude.toFixed(6)}`;
            },
            (error) => {
                locationStatus.textContent = '❌ Gagal mendeteksi lokasi';
                locationCoords.textContent = 'Mohon izinkan akses lokasi untuk meminjam buku';
                currentLocation = null;
            }
        );
    } else {
        locationStatus.textContent = '❌ Browser tidak support geolocation';
        currentLocation = null;
    }
}

// Handle borrow form submit
async function handleBorrowSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const bookId = document.getElementById('borrowBookId').value;
    const borrowMessage = document.getElementById('borrowMessage');
    const submitBtn = document.getElementById('borrowSubmitBtn');

    if (!currentLocation) {
        borrowMessage.textContent = 'Lokasi belum terdeteksi. Mohon izinkan akses lokasi.';
        borrowMessage.className = 'message error';
        borrowMessage.style.display = 'block';
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';

        const response = await borrowBook(userId, bookId, currentLocation.latitude, currentLocation.longitude);

        borrowMessage.textContent = '✅ Buku berhasil dipinjam!';
        borrowMessage.className = 'message success';
        borrowMessage.style.display = 'block';

        // Reload books after 1.5 seconds
        setTimeout(() => {
            borrowModal.classList.remove('show');
            loadBooks();
        }, 1500);

    } catch (error) {
        borrowMessage.textContent = `❌ Error: ${error.message}`;
        borrowMessage.className = 'message error';
        borrowMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pinjam Buku';
    }
}

// Filter books by search term
function filterBooks(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (term === '') {
        displayBooks(allBooks);
        return;
    }

    const filtered = allBooks.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
    );

    displayBooks(filtered);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
