// API Helper Functions

// Get all books
async function getAllBooks() {
    try {
        const response = await fetch(API_ENDPOINTS.books);
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// Get book by ID
async function getBookById(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.books}/${id}`);
        if (!response.ok) throw new Error('Book not found');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
}

// Create book (Admin only)
async function createBook(bookData) {
    try {
        const response = await fetch(API_ENDPOINTS.books, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': USER_ROLES.ADMIN
            },
            body: JSON.stringify(bookData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create book');
        }

        return data;
    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    }
}

// Update book (Admin only)
async function updateBook(id, bookData) {
    try {
        const response = await fetch(`${API_ENDPOINTS.books}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': USER_ROLES.ADMIN
            },
            body: JSON.stringify(bookData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update book');
        }

        return data;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

// Delete book (Admin only)
async function deleteBook(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.books}/${id}`, {
            method: 'DELETE',
            headers: {
                'x-user-role': USER_ROLES.ADMIN
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete book');
        }

        return data;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
}

// Borrow book (User only)
async function borrowBook(userId, bookId, latitude, longitude) {
    try {
        const response = await fetch(API_ENDPOINTS.borrow, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': USER_ROLES.USER,
                'x-user-id': userId.toString()
            },
            body: JSON.stringify({
                bookId: parseInt(bookId),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to borrow book');
        }

        return data;
    } catch (error) {
        console.error('Error borrowing book:', error);
        throw error;
    }
}

// Get user's geolocation
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error('Unable to retrieve your location'));
            }
        );
    });
}
