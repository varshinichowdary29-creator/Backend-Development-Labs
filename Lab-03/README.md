# Lab 3 – REST API Development

## Project Title
Book Management REST API using Node.js, Express.js and SQLite.

## Objective
To develop REST API endpoints with search, sorting, filtering, validation and error handling.

## Technologies Used
- Node.js
- Express.js
- SQLite
- JavaScript
- PowerShell for API testing

## Project Structure
```text
backend-lab3/
├── database/
│   └── db.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /books | Retrieve all books |
| GET | /books/:id | Retrieve a book by ID |
| POST | /books | Add a new book |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book |

## Query Parameters
- `search_q` – Search books by title.
- `order_by` – Sort by ID, title, author or price.
- `order` – ASC or DESC.
- `limit` – Limit the number of records.
- `offset` – Skip records.
- `min_price` – Minimum price.
- `max_price` – Maximum price.

## Validation and Error Handling
- Checks required title and author.
- Checks numeric and non-negative price.
- Returns 400 for invalid input.
- Returns 404 when a book is not found.
- Returns appropriate success status codes.

## How to Run

```bash
npm install
npm run dev
```

Server URL: http://localhost:3000

## Conclusion
Successfully developed and tested a Book Management REST API using Node.js, Express.js and SQLite. Implemented CRUD operations, query parameters, validation and error handling.