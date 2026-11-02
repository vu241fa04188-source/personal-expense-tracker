# PERSONAL EXPENSE TRACKER - CLA-4 VIVA QUESTIONS & ANSWERS (35+ QUESTIONS)

This guide contains beginner-friendly, precise answers designed for your college project evaluation and viva examination.

---

## Category 1: React.js & JavaScript (Frontend)

### Q1. What is React.js and why did you choose it for this project?
**Answer:** React.js is an open-source JavaScript library developed by Facebook/Meta for building interactive User Interfaces, especially Single Page Applications (SPAs). We chose React because of its **component-based architecture**, fast rendering via the **Virtual DOM**, and reusable UI state management.

### Q2. What are React Hooks? Which hooks did you use in this project?
**Answer:** React Hooks are built-in functions that let functional components use state and other React features without writing class components. In this project, we used:
1. `useState`: To manage local component states such as form inputs, active tabs, modal visibility, and fetched data.
2. `useEffect`: To trigger asynchronous side effects, such as fetching transactions and dashboard summaries when components mount or filter states change.

### Q3. What is JSX in React?
**Answer:** JSX stands for **JavaScript XML**. It is a syntax extension for JavaScript that allows us to write HTML-like elements inside JavaScript code. Under the hood, Babel or Vite compiles JSX into standard `React.createElement()` calls.

### Q4. What is a Single Page Application (SPA)?
**Answer:** An SPA is a web application that loads a single HTML document and dynamically rewrites the current page as the user interacts with the app, without requiring a full page refresh from the server. This makes navigation instant and smooth.

### Q5. What is the difference between Props and State in React?
**Answer:** 
- **Props (Properties):** Read-only data passed from a parent component down to a child component (unidirectional data flow).
- **State:** An updatable, local data store managed internally within the component using `useState`.

### Q6. What is Axios and why did you use it instead of the native `fetch()` API?
**Answer:** Axios is a promise-based HTTP client library. We used Axios because:
1. It automatically transforms JSON responses (no need to call `res.json()`).
2. It allows global configuration via base URLs.
3. It supports **Interceptors** to automatically attach the JWT Bearer token to every outgoing request.

---

## Category 2: Node.js & Express.js (Backend)

### Q7. What is Node.js? How does it differ from traditional server environments?
**Answer:** Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Unlike multi-threaded servers (like Apache), Node.js uses an **event-driven, non-blocking asynchronous I/O model**, making it lightweight, fast, and capable of handling thousands of concurrent connections.

### Q8. What is Express.js?
**Answer:** Express.js is a minimalist, fast, and flexible web application framework for Node.js. It simplifies building RESTful APIs by providing powerful tools for routing, middleware integration, and request/response handling.

### Q9. What is Middleware in Express.js? Give an example from your project.
**Answer:** Middleware functions are functions that have access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle. They can execute code, modify requests, and end the cycle.
*Example:* Our `protect` middleware (`middleware/auth.js`) checks for a valid JWT Bearer token before allowing access to private transaction routes.

### Q10. What is CORS and why is it necessary?
**Answer:** CORS stands for **Cross-Origin Resource Sharing**. Browsers enforce a Same-Origin Policy for security. Since our React frontend runs on port 3000 and the Express backend runs on port 5000 (different origins), the `cors()` middleware allows the frontend to safely communicate with the backend.

### Q11. What is the purpose of the `dotenv` package?
**Answer:** `dotenv` loads environment variables from a `.env` file into Node's `process.env`. This keeps sensitive secrets like database connection strings (`MONGO_URI`) and encryption keys (`JWT_SECRET`) out of the source code.

---

## Category 3: MongoDB & Mongoose (Database)

### Q12. What is MongoDB? Why is it classified as a NoSQL database?
**Answer:** MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON (Binary JSON) documents. It is classified as NoSQL because it does not use tabular tables with fixed rows and columns like SQL, allowing dynamic and scalable schemas.

### Q13. What is Mongoose?
**Answer:** Mongoose is an **Object Data Modeling (ODM)** library for MongoDB and Node.js. It provides a schema-based solution to model application data, enforce validation, handle type-casting, and manage database queries.

### Q14. What are the two collections used in your database?
**Answer:**
1. **`users` Collection:** Stores user identity details: `name`, `email` (unique index), and hashed `password`.
2. **`transactions` Collection:** Stores individual transaction records: `user` (foreign reference to User), `title`, `amount`, `type` (`income` or `expense`), `category`, `date`, and `description`.

### Q15. How do you ensure that User A cannot see User B's transactions?
**Answer:** In every transaction route, our `protect` middleware identifies the logged-in user from the JWT token and attaches `req.user`. Every database query strictly filters by `{ user: req.user._id }`. When updating or deleting, the controller checks whether `transaction.user.toString() === req.user._id.toString()`.

---

## Category 4: Authentication & Security

### Q16. What is JWT and how does it work?
**Answer:** JWT stands for **JSON Web Token**. It is a compact, URL-safe standard (RFC 7519) used to securely transmit information between parties as a JSON object.
It consists of three parts separated by dots:
1. **Header:** Algorithm and token type (e.g., HS256).
2. **Payload:** User claims (e.g., `user.id` and expiration time).
3. **Signature:** Cryptographic verification hash generated using `process.env.JWT_SECRET`.

### Q17. Why do we store hashed passwords instead of plaintext?
**Answer:** If the database is compromised, plaintext passwords would expose user accounts. Hashing is a one-way mathematical function that cannot be decrypted back into the original password, protecting user security.

### Q18. How does `bcrypt` work? What is "salt"?
**Answer:** `bcrypt` is an adaptive cryptographic hashing algorithm. A **salt** is random data added to the password input before hashing. This ensures that two users with the exact same password will have completely different stored hashes, defending against rainbow table attacks.

### Q19. What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication:** Verifying *who you are* (e.g., logging in with email and password to receive a JWT).
- **Authorization:** Verifying *what permissions you have* (e.g., ensuring a user can only edit their own transactions, not another user's).

---

## Category 5: REST APIs & Architecture

### Q20. What is a RESTful API?
**Answer:** REST (Representational State Transfer) is an architectural style for networked systems. RESTful APIs use standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) to perform CRUD operations on stateless resource endpoints.

### Q21. List the primary REST endpoints created in your project.
**Answer:**
- `POST /api/auth/register`: Create user account.
- `POST /api/auth/login`: Authenticate and receive token.
- `GET /api/transactions`: Retrieve user transactions (supports query filters).
- `POST /api/transactions`: Create a new transaction.
- `PUT /api/transactions/:id`: Update existing transaction.
- `DELETE /api/transactions/:id`: Delete a transaction.
- `GET /api/transactions/summary`: Fetch dashboard statistics and chart data.
- `GET /api/transactions/reports`: Fetch 12-month annual reports.

### Q22. What HTTP status codes did you use, and what do they mean?
**Answer:**
- **200 OK:** Successful request (retrieving data, updates).
- **201 Created:** New resource successfully created (registration, adding transaction).
- **400 Bad Request:** Missing fields or validation failure.
- **401 Unauthorized:** Missing or invalid JWT token, or incorrect password.
- **403 Forbidden:** Authenticated user attempting to access another user's resource.
- **404 Not Found:** Resource or route not found.
- **500 Internal Server Error:** Unexpected backend exception.

---

## Category 6: Project Functionality & Calculations

### Q23. How is the "Remaining Balance" calculated?
**Answer:** The remaining balance is calculated dynamically:
$$\text{Remaining Balance} = \sum \text{Income Amounts} - \sum \text{Expense Amounts}$$
If total income is ₹15,000 and total expenses are ₹2,500, the remaining balance is ₹12,500.

### Q24. How does the category-wise expense breakdown work?
**Answer:** In `transactionController.js`, we filter all transactions where `type === 'expense'`, group them by their `category` string, and sum the amounts. This grouped data is sent to the frontend to render the Doughnut Chart.

### Q25. How did you implement real-time transaction searching and filtering?
**Answer:** In the React frontend, input fields update filter state variables (`search`, `type`, `category`, `startDate`, `endDate`). When changed, `useEffect` triggers an Axios `GET` request passing these values as query parameters (`/api/transactions?search=books&type=expense`). MongoDB executes the query using regular expressions for text search and comparison operators (`$gte`, `$lte`) for dates.

### Q26. Which charting library is used, and what charts are implemented?
**Answer:** We used **Chart.js** with **react-chartjs-2**.
We implemented:
1. **Bar Chart:** Visualizes monthly cash flow (Income vs Expenses).
2. **Doughnut / Pie Chart:** Displays category-wise expense distribution with distinct color codes.

### Q27. How does the application handle responsive design for mobile devices?
**Answer:** We used responsive CSS media queries:
- On desktop, the sidebar is permanently visible on the left.
- On screens narrower than 768px, the sidebar collapses into a sliding mobile drawer toggled via a hamburger menu button.
- CSS Grid auto-fits stat cards from 3 columns down to 1 column.

### Q28. What happens when a user clicks "Sign Out"?
**Answer:** The `handleLogout` function in `App.jsx` removes the `token` and `user` keys from browser `localStorage`, clears the user state in React, and immediately redirects the user to the Login screen.

### Q29. What validation did you implement on transactions?
**Answer:**
- Title must be non-empty.
- Amount must be a positive number greater than 0.
- Type must strictly be `'income'` or `'expense'`.
- Category and Date must be selected.
- Validations are enforced on both the client (React form) and server (Mongoose Schema validators).

### Q30. What was the most challenging part of this project, and how did you resolve it?
**Answer:** Managing user-scoped database isolation and calculating real-time monthly chart data efficiently. We solved this by creating a dedicated `/summary` endpoint in the backend that performs the aggregation and sends cleanly formatted data directly to Chart.js components, ensuring fast page load times and accurate reports.

