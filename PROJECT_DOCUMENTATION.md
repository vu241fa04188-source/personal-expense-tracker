# PERSONAL EXPENSE TRACKER - CLA-4 PROJECT REPORT

**Course / Evaluation:** B.Tech Computer Science & Engineering – Continuous Learning Assessment (CLA-4)  
**Project Title:** Personal Expense Tracker Full-Stack Web Application  
**Technology Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  

---

## 1. Project Abstract
The **Personal Expense Tracker** is a comprehensive, full-stack web application developed to help individuals systematically manage their personal finances. With the proliferation of cashless transactions and multiple expenditure streams, manual financial management is prone to errors, omission, and lack of visual insight. This project provides an automated, secure, and user-centric platform that allows users to register, log daily income and expenses across customizable categories, track real-time net balances, filter and search historical transaction records, and analyze monthly and yearly financial trends through interactive data visualizations. Built using the modern MERN stack architecture, the system guarantees strong data isolation through JSON Web Token (JWT) based authentication and bcrypt password encryption.

---

## 2. Introduction
Personal financial management is a fundamental life skill that directly influences an individual’s financial stability. With multiple sources of income (such as allowances, salaries, freelance work) and varied categories of expenditures (housing, food, education, healthcare, entertainment), maintaining financial discipline requires timely tracking and actionable insights. 

The Personal Expense Tracker web application is engineered to bridge the gap between complex accounting software and inadequate paper-based ledgers. It provides an intuitive, responsive graphical user interface that simplifies transaction logging and presents clear statistical metrics to prevent overspending and cultivate healthy saving habits.

---

## 3. Problem Statement
Many individuals, particularly college students and young professionals, struggle with financial management due to:
1. **Lack of Centralized Records:** Expenses are scattered across digital payment receipts, bank SMS notifications, and cash receipts without a single consolidated view.
2. **Impulse Spending & Absence of Real-Time Balances:** Users often realize their financial deficit only when account balances reach critical lows.
3. **Absence of Visual Trends:** Numerical spreadsheets do not intuitively highlight category-wise spending proportions or month-on-month savings patterns.
4. **Data Security & Privacy Concerns:** Financial records require strict confidentiality and user isolation so no unauthorized party can access sensitive transaction history.

---

## 4. Objectives of the Project
- To design and implement a secure, full-stack web application using React.js, Node.js, Express.js, and MongoDB.
- To implement token-based user authentication using JWT and cryptographic password hashing with bcryptjs.
- To calculate and display real-time financial summaries including Total Income, Total Expenses, and Net Remaining Balance.
- To provide dynamic CRUD operations (Create, Read, Update, Delete) on transactions with instant recalculations.
- To incorporate interactive charts (bar charts and doughnut charts) for monthly cash flow and category spending distribution.
- To engineer advanced search and multi-parameter filtering capabilities (by category, type, and date range).
- To develop an export-ready monthly and annual reporting module calculating net savings and savings ratios.

---

## 5. Existing System vs. Proposed System

### 5.1 Existing System
- **Manual Logbooks/Diaries:** Time-consuming, easily lost or physically damaged, no automated calculations.
- **Spreadsheet Applications (Excel/Sheets):** Require manual formula maintenance; lack mobile responsiveness, authentication isolation, and purpose-built intuitive dashboards.
- **Commercial Banking Apps:** Only record transactions processed within that specific bank account, ignoring cash and third-party wallet transactions.

### 5.2 Proposed System
- **Automated Calculations:** Instant recalculation of net balance, total income, and total expenses.
- **Cross-Platform Accessibility:** Modern responsive UI functional on smartphones, tablets, and desktop computers.
- **Category-Wise & Monthly Analytics:** Dynamic visual charts highlighting where funds are allocated.
- **Complete User Isolation:** Each user has their own private database space authenticated via JWT.

---

## 6. System Requirements

### 6.1 Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
- **RAM:** Minimum 4 GB (8 GB recommended)
- **Hard Disk / SSD:** Minimum 1 GB free space
- **Display Resolution:** 1280 x 720 or higher

### 6.2 Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Development Environment (IDE):** Visual Studio Code
- **Runtime Environment:** Node.js (v18.x to v24.x)
- **Package Manager:** npm (v9.x or higher)
- **Database Server:** MongoDB Community Server (v6.x or v8.x) or MongoDB Atlas Cloud
- **Web Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge

---

## 7. System Architecture
The application follows a decoupled 3-Tier Client-Server Architecture:

```
+-------------------------------------------------------------------+
|                           PRESENTATION TIER                       |
|                       React.js Client Application                 |
|     (Navbar, Sidebar, Dashboard, AddTransaction, Reports, Login)  |
+---------------------------------+---------------------------------+
                                  |
                   HTTP/JSON REST API Requests (Axios)
                   Authorization: Bearer <JWT_Token>
                                  |
                                  v
+---------------------------------+---------------------------------+
|                           APPLICATION TIER                        |
|                       Node.js + Express.js Server                 |
|    - Route Handlers (/api/auth, /api/transactions)                |
|    - JWT Verification Middleware (auth.js)                        |
|    - Business Logic Controllers (authController, txController)    |
+---------------------------------+---------------------------------+
                                  |
                     Mongoose ODM Object Modeling
                                  |
                                  v
+---------------------------------+---------------------------------+
|                             DATA TIER                             |
|                        MongoDB Database                           |
|         - users Collection (Credentials & Profile)                |
|         - transactions Collection (Financial Records)            |
+-------------------------------------------------------------------+
```

---

## 8. Database Design & Schemas

### 8.1 Users Collection (`users`)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Auto-generated unique identifier |
| `name` | String | Required, Trimmed | Full name of the registered user |
| `email` | String | Required, Unique, Lowercase | User email address used for login |
| `password` | String | Required, Min 6 chars | Salted bcrypt hash of user password |
| `createdAt`| Date | Default: Date.now | Account creation timestamp |

### 8.2 Transactions Collection (`transactions`)
| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Auto-generated transaction ID |
| `user` | ObjectId | Ref: 'User', Required | Foreign key referencing `users._id` |
| `title` | String | Required, Trimmed | Title/Description of transaction |
| `amount` | Number | Required, Min: 0.01 | Transaction value in INR (₹) |
| `type` | String | Enum: ['income', 'expense'] | Transaction classification |
| `category` | String | Required, Trimmed | Category (e.g. Salary, Education) |
| `date` | Date | Required, Default: Date.now | Transaction occurrence date |
| `description`| String | Optional | Additional notes/memo |
| `createdAt`| Date | Default: Date.now | Creation timestamp |

---

## 9. Module Description

### 9.1 Authentication & Security Module
- **User Registration (`POST /api/auth/register`):** Validates credentials, checks email uniqueness, salts and hashes the password with 10 salt rounds via bcryptjs, and signs a JWT valid for 30 days.
- **User Login (`POST /api/auth/login`):** Compares submitted password against stored hash using `bcrypt.compare`. On match, issues JWT token and user profile payload.
- **JWT Protection Middleware (`middleware/auth.js`):** Intercepts incoming requests, decodes bearer token, verifies authenticity against `process.env.JWT_SECRET`, and extracts user document into `req.user`.

### 9.2 Financial Management & CRUD Module
- **Create Transaction (`POST /api/transactions`):** Logs a new income or expense associated with the authenticated user's ID.
- **Read Transactions (`GET /api/transactions`):** Queries transactions belonging strictly to the user, with support for search regex, type filtering, category filtering, and chronological sorting.
- **Update Transaction (`PUT /api/transactions/:id`):** Verifies ownership of the target transaction before applying field updates.
- **Delete Transaction (`DELETE /api/transactions/:id`):** Removes the record with confirmation dialog.

### 9.3 Dashboard & Analytics Module
- **Summary Calculations (`GET /api/transactions/summary`):** Computes total income, total expenditure, and net balance. Formats dynamic datasets for bar charts (monthly cash flow) and doughnut charts (category spending distribution).
- **Annual Reports (`GET /api/transactions/reports`):** Computes 12-month aggregations for a specified year, reporting monthly income, expenses, net savings, and category distribution.

---

## 10. Testing & Verification

| Test Case ID | Test Scenario | Input Data | Expected Output | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | User Registration with valid credentials | Name: Rahul, Email: rahul@test.com, Pass: 123456 | User created, 201 Created, JWT token issued | As expected | PASS |
| **TC-02** | User Registration with duplicate email | Duplicate email address | 400 Bad Request: "User already exists" | As expected | PASS |
| **TC-03** | User Login with incorrect password | Valid email, wrong password | 401 Unauthorized: "Invalid credentials" | As expected | PASS |
| **TC-04** | Add Income Transaction | Amount: ₹15,000, Category: Salary | Transaction saved with user ID | As expected | PASS |
| **TC-05** | Add Expense Transaction | Amount: ₹2,500, Category: Education | Transaction saved, balance adjusted to ₹12,500 | As expected | PASS |
| **TC-06** | Access without Bearer Token | No Authorization header | 401 Unauthorized: "No token provided" | As expected | PASS |
| **TC-07** | Delete Transaction | Valid transaction ID of own user | Record deleted, 200 OK | As expected | PASS |
| **TC-08** | Unauthorized cross-user transaction access | Token of User A accessing User B's record | 403 Forbidden | As expected | PASS |

---

## 11. Conclusion
The **Personal Expense Tracker** successfully fulfills all objectives stipulated for the CLA-4 evaluation. By combining React's component-based frontend with Express and MongoDB's flexible document model, the application provides a fast, reliable, and aesthetically pleasing financial assistant. The project demonstrates core principles of full-stack development: RESTful architecture, relational mapping via foreign keys in NoSQL, cryptographic password handling, state management with React hooks, and interactive data visualization.

---

## 12. Future Enhancements
1. **Recurring Transactions:** Automation for monthly bills like subscriptions and rent.
2. **Budget Threshold Alerts:** In-app notifications when category expenditure exceeds 80% of a preset limit.
3. **Receipt Scanner (OCR):** Upload photo of bills/receipts to automatically extract amount and merchant name.
4. **Export to PDF / CSV:** One-click download of monthly statements for tax and accounting purposes.
5. **Multi-Currency Support:** Automatic currency conversion using real-time foreign exchange APIs.

---

## 13. References
1. React Documentation: https://react.dev
2. Express.js API Reference: https://expressjs.com
3. MongoDB & Mongoose Documentation: https://mongoosejs.com
4. Chart.js Documentation: https://www.chartjs.org
5. JSON Web Tokens Standard (RFC 7519): https://jwt.io
