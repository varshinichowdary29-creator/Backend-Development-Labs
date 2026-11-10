
const express = require('express');
const connectDB = require('./database/db');

const app = express();
app.use(express.json());

let db;

// Validate book details
function validateBook(req, res, next) {
    const { title, author, price } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
            message: 'Title is required'
        });
    }

    if (!author || typeof author !== 'string' || !author.trim()) {
        return res.status(400).json({
            message: 'Author is required'
        });
    }

    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({
            message: 'Price must be a valid non-negative number'
        });
    }

    next();
}

// Validate book ID
function validateId(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid book ID'
        });
    }

    req.bookId = id;
    next();
}

// Home route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Book Management REST API is running!'
    });
});

// GET all books with search, sorting and filters
app.get('/books', async (req, res) => {
    try {
        const {
            search_q = '',
            order_by = 'id',
            order = 'ASC',
            limit = '10',
            offset = '0',
            min_price,
            max_price
        } = req.query;

        // Sorting validation
        const allowedColumns = ['id', 'title', 'author', 'price'];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: 'Invalid order_by value'
            });
        }

        const sortOrder = order.toUpperCase();

        if (!['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({
                message: 'Order must be ASC or DESC'
            });
        }

        // Pagination validation
        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (!Number.isInteger(pageLimit) || pageLimit < 1 || pageLimit > 100 ||
            !Number.isInteger(pageOffset) || pageOffset < 0) {
            return res.status(400).json({
                message: 'Invalid limit or offset'
            });
        }

        // Build parameterised filters
        let sql = 'SELECT * FROM books WHERE 1=1';
        const params = [];

        if (search_q.trim()) {
            sql += ' AND title LIKE ?';
            params.push(`%${search_q}%`);
        }

        if (min_price !== undefined) {
            if (min_price.trim() === '' || !Number.isFinite(Number(min_price))) {
                return res.status(400).json({
                    message: 'Invalid min_price'
                });
            }

            sql += ' AND price >= ?';
            params.push(Number(min_price));
        }

        if (max_price !== undefined) {
            if (max_price.trim() === '' || !Number.isFinite(Number(max_price))) {
                return res.status(400).json({
                    message: 'Invalid max_price'
                });
            }

            sql += ' AND price <= ?';
            params.push(Number(max_price));
        }

        if (min_price !== undefined && max_price !== undefined &&
            Number(min_price) > Number(max_price)) {
            return res.status(400).json({
                message: 'min_price cannot be greater than max_price'
            });
        }

        sql += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;

        params.push(pageLimit, pageOffset);

        const books = await db.all(sql, params);

        res.status(200).json({
            message: 'Books retrieved successfully',
            count: books.length,
            data: books
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve books'
        });
    }
});

// GET a single book by ID
app.get('/books/:id', validateId, async (req, res) => {
    try {
        const book = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [req.bookId]
        );

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book retrieved successfully',
            data: book
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve book'
        });
    }
});

// POST - Add a new book
app.post('/books', validateBook, async (req, res) => {
    try {
        const { title, author, price } = req.body;

        const result = await db.run(
            'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
            [title.trim(), author.trim(), price]
        );

        res.status(201).json({
            message: 'Book created successfully',
            id: result.lastID
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to create book'
        });
    }
});

// PUT - Update an existing book
app.put('/books/:id', validateId, validateBook, async (req, res) => {
    try {
        const { title, author, price } = req.body;

        const result = await db.run(
            `UPDATE books
             SET title = ?, author = ?, price = ?
             WHERE id = ?`,
            [title.trim(), author.trim(), price, req.bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update book'
        });
    }
});

// DELETE - Delete a book
app.delete('/books/:id', validateId, async (req, res) => {
    try {
        const result = await db.run(
            'DELETE FROM books WHERE id = ?',
            [req.bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete book'
        });
    }
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON format'
        });
    }

    res.status(500).json({
        message: 'Internal server error'
    });
});

// Start server
async function startServer() {
    try {
        db = await connectDB();

        const PORT = 3000;

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
