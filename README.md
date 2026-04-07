# Zeerostock Inventory Portal

Welcome to the Zeerostock Inventory System. This project completes **both Assignment A (Search-Focused) and Assignment B (Database-Focused)** in a single, unified full-stack application.

This README is explicitly designed to directly and simply answer the specific questions requested in the assignment instructions. 

---

## 🔍 Assignment A: Search-Focused Requirement

### 1. Search Logic Explanation
The search feature is built to handle dynamic user inputs and interact cleanly with the backend database. Here is how it works step-by-step:
* **Capturing Input:** The frontend provides fields for `q` (Product Name), `category`, `minPrice`, and `maxPrice`.
* **API Request:** When the user enters data, it makes a `GET /api/search` request with these fields attached as query parameters.
* **Dynamic Database Query:** The backend receives these parameters and dynamically constructs a SQL query:
  * If a user types a product name, it uses `LIKE '%query%'` to ensure **partial and case-insensitive** matching.
  * If filters like `category` or `price` ranges are added, it conditionally appends those `AND` statements to the SQL query.
  * If no filters are provided at all, it simply returns all available inventory.
* **Empty States:** If the query returns zero matching rows, the frontend natively catches this empty array and displays a beautiful "No results found" UI message.

### 2. Performance Improvement for Large Datasets
If we scale this application to handle millions of records, the one critical improvement I would make is **Implementing Database Indexes alongside a Full-Text Search Engine**. 
Doing basic `LIKE '%...%'` queries causes the database to perform a slow "full table scan". Instead, I would implement **PostgreSQL's GIN (Generalized Inverted Index)** or use a dedicated tool like **Elasticsearch**. This changes the search logic to instantly look up exact word tokens, drastically reducing search times from seconds to sub-milliseconds.

---

## 💾 Assignment B: Database-Focused Requirement

### 1. Database Schema Explanation
The database is structured to prevent data duplication and maintain absolute integrity. It perfectly maps the requirements using two tables:
* **`Suppliers` Table:** Stores details about the supplier (Columns: `id`, `name`, `city`).
* **`Inventory` Table:** Stores the specific product details (Columns: `id`, `supplier_id`, `product_name`, `quantity`, `price`). 
* **Relationship:** There is a strict **One-to-Many Relationship**. A supplier can have many inventory items, but each specific inventory item connects back to only one supplier through the `supplier_id` **Foreign Key**.

### 2. Why SQL was Chosen over NoSQL
I deliberately chose an **SQL Relational Database (SQLite)** over a NoSQL database (like MongoDB) for this assignment because:
* **Strict Relationships:** Inventory stock inherently belongs to Suppliers. SQL excels at managing strict and predictable relationships using strict Foreign Keys.
* **Complex Aggregations:** The assignment strictly requires grouping inventory by supplier and calculating the total inventory value `(quantity * price)`. SQL handles mathematical aggregations (`GROUP BY`, `SUM`, `ORDER BY`) much more natively, efficiently, and cleanly than NoSQL document queries.
* **Data Integrity constraints:** Enforcing strict business rules directly at the database level (like ensuring Quantity ≥ 0 and Price > 0) is natively safer in structured SQL schemas.

### 3. One Indexing / Optimization Suggestion
To optimize the heavily used grading query (`GET /inventory` which groups and sums supplier value), I strongly suggest adding a **Composite Database Index on the `(supplier_id)` column within the Inventory table**. 
Because the backend query frequently acts on grouping `supplier_id` together to sum their financial value, an index here stops the database from having to blindly scan every single inventory item. It creates a map directly jumping to the grouped chunks, speeding up the `SUM(quantity * price)` math operation significantly when the tables grow large.

---

## 🚀 How to Run the Project Locally

The project is structured cleanly into two main folders for separation of frontend and backend concerns.

### 1. Start the Backend API
Open a terminal and run the following commands:
```bash
cd server
npm install
npm run dev
```

### 2. Start the Frontend UI
Open a second, separate terminal and run these commands:
```bash
cd client
npm install
npm run dev
```

The comprehensive app is now active! **Visit `http://localhost:5173` in your browser** to test the system.
