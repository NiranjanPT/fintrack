# FinTrack – Personal Finance & Expense Analytics Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application for tracking income and expenses, managing budgets, subscriptions and savings goals, and analysing spending with monthly charts and downloadable reports.

Built as the **Full Stack – Back End Web Technology Lab** project. One application demonstrates all **11 CAS experiments** (see the [CAS experiment mapping](#cas-experiment-mapping) at the end).

---

## Features

| Feature | What it does |
|---|---|
| **Authentication** | Register, log in, log out. Passwords hashed with bcrypt and sessions use JWT. Every user sees only their own data. |
| **Income & expenses** | Add, view, edit and delete transactions. Search by text and filter by type, category, payment method, date range and recurring. Results are paginated. |
| **Automatic categorization** | Rule-based keyword matching (no AI). For example, "pizza" → Food, "uber" → Transport, "netflix" → Entertainment, "amazon" → Shopping, "electricity" → Bills. The form previews the detected category while you type, and you can always pick a category manually. |
| **Recurring expenses** | Mark rent, internet, gym or a loan as recurring, with a frequency, next occurrence and status (active/paused). When a due date arrives, the entry is created automatically. Upcoming recurring expenses are listed. |
| **Subscriptions** | Add, edit and delete subscriptions with name, amount, billing cycle, next billing date, category and status. Shows monthly and yearly subscription totals. |
| **Budgets** | Monthly budget per category, showing limit, spent, remaining and percentage used. |
| **Budget alerts** | Warning at 80% (adjustable) and "Exceeded" at 100%. Shown in the navbar bell, on the dashboard and right after saving an expense. |
| **Savings goals** | Create, edit and delete goals, and add money to them. Shows target, current and remaining amount, progress % and deadline. |
| **Dashboard** | Total income, total expenses, current balance and total savings, plus recent transactions, budget status, upcoming subscriptions and savings goals. Three charts: income vs expense, expense by category, and monthly expense trend. |
| **Monthly analytics** | Monthly income, expenses and savings, category-wise expenses, a daily spending trend and a 6-month comparison for any month and year. |
| **Financial reports** | Monthly or full-year report: totals, category-wise expenses, income sources, budgets, subscription costs and savings goals. **Export as CSV.** |
| **Responsive UI** | Sidebar, navbar, cards, tables, forms, charts and progress bars. Works on desktop and mobile. |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Context API, `useState` / `useReducer`, Recharts |
| Backend | Node.js, Express 5, RESTful APIs |
| Database | MongoDB with Mongoose |
| Security | JWT (`jsonwebtoken`), password hashing (`bcrypt`), CORS |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project Structure

```
fintrack/
├── client/                         # React frontend (Vite)
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── charts/             # IncomeExpenseChart, CategoryChart, TrendChart (Recharts)
│   │   │   ├── Navbar.jsx, Sidebar.jsx, Layout.jsx, Card.jsx, StatCard.jsx
│   │   │   ├── TransactionTable.jsx, TransactionForm.jsx
│   │   │   ├── BudgetCard.jsx, BudgetForm.jsx
│   │   │   ├── SubscriptionCard.jsx, SubscriptionForm.jsx
│   │   │   ├── SavingsGoalCard.jsx, SavingsGoalForm.jsx
│   │   │   ├── ProtectedRoute.jsx, GuestRoute.jsx
│   │   │   └── Loading.jsx, ErrorMessage.jsx, EmptyState.jsx, Modal.jsx, ProgressBar.jsx ...
│   │   ├── context/                # AuthContext, FinanceContext (Context API + useReducer)
│   │   ├── hooks/                  # useAuth, useFinance, useFetch, useTransactions, useDebounce
│   │   ├── pages/                  # Login, Register, Dashboard, Transactions, Budgets,
│   │   │                           # Subscriptions, SavingsGoals, Analytics, Reports
│   │   ├── services/               # api.js (Axios instance) + one service file per resource
│   │   ├── utils/                  # formatting, constants, chart theme
│   │   ├── App.jsx                 # Routes
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Styles
│   ├── .env.example
│   ├── vercel.json                 # SPA routing on Vercel
│   ├── vite.config.js              # Dev proxy /api -> http://localhost:5000
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/                     # db.js (MongoDB connection), constants.js
│   ├── controllers/                # Request/response handling
│   ├── middleware/                 # auth (JWT), logger, error handler
│   ├── models/                     # User, Transaction, Category, Budget, Subscription, SavingsGoal
│   ├── routes/                     # Express routers (index.js mounts all under /api)
│   ├── services/                   # Business logic + MongoDB queries/aggregations
│   ├── utils/                      # ApiError, date helpers, seed script
│   ├── app.js                      # Express app (middleware + routes)
│   ├── server.js                   # Node.js entry point (env, DB connect, listen)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                    # Root scripts (run both apps together)
└── README.md
```

### Request flow

```
React page  →  Axios service  →  Express route  →  Controller  →  Service  →  Mongoose model  →  MongoDB
     ↑                                                                                         │
     └──────────────────────────────── JSON response ←─────────────────────────────────────────┘
```

Example: the **Transactions** page calls `transactionService.create()` (Axios), which sends `POST /api/transactions`. The router passes it through the `protect` (JWT) middleware to `transactionController.createTransaction`. `transactionService.createTransaction` auto-categorizes it, saves it with the `Transaction` model and checks the budget. The JSON response then updates the React UI and shows any budget alert.

---

## Prerequisites

- **Node.js 20 or newer** (`node -v`)
- **npm** (comes with Node.js)
- **MongoDB**: either a local MongoDB Community Server or a free MongoDB Atlas cluster

---

## MongoDB Setup

### Option A – Local MongoDB
1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and make sure the service is running.
2. Use this connection string:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/fintrack
   ```

### Option B – MongoDB Atlas (cloud, also used for deployment)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free **M0** cluster.
2. **Database Access** → add a database user with a username and password.
3. **Network Access** → add IP address `0.0.0.0/0` (allow from anywhere, which Render needs).
4. **Connect → Drivers** → copy the connection string and add the database name `fintrack`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fintrack?retryWrites=true&w=majority
   ```

The collections (`users`, `transactions`, `categories`, `budgets`, `subscriptions`, `savinggoals`) are created automatically by Mongoose.

---

## Environment Variables

### `server/.env` (copy from `server/.env.example`)

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Port for the Express server |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/fintrack` | MongoDB connection string |
| `JWT_SECRET` | a long random string | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime (optional, default `7d`) |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL allowed by CORS (comma-separate several) |

Generate a strong `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### `client/.env` (optional, copy from `client/.env.example`)

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://fintrack-api.onrender.com/api` | Backend URL. **Leave empty locally**, because Vite proxies `/api` to `http://localhost:5000`. |

> `.env` files are listed in `.gitignore`. Never commit real secrets.

---

## Installation

From the `fintrack/` folder:

```bash
# Installs root, server and client dependencies
npm run install-all
```

Or install each part separately:

```bash
cd server && npm install
cd ../client && npm install
```

---

## Backend Setup

```bash
cd server
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# edit .env and fill in MONGODB_URI and JWT_SECRET
npm run dev                 # starts with nodemon (auto-restart on changes)
# or
npm start                   # plain node server.js
```

Expected output:
```
MongoDB connected: 127.0.0.1/fintrack
FinTrack API running on http://localhost:5000 (development)
```

Check it: open <http://localhost:5000/api/health>, which should return:
```json
{ "success": true, "message": "FinTrack API is running" }
```

**Optional demo data:** `npm run seed` creates a demo account with 6 months of transactions, budgets (including warning and exceeded alerts), subscriptions, recurring expenses and savings goals.
Log in with **`demo@fintrack.com` / `demo123`**.

---

## Frontend Setup

```bash
cd client
npm run dev
```

Open <http://localhost:5173>. Register a new account, or use the demo account after seeding.

---

## How to Run the Application

1. Make sure MongoDB is running (local) or your Atlas URI is in `server/.env`.
2. **Terminal 1:** `cd server && npm run dev` (API on port 5000)
3. **Terminal 2:** `cd client && npm run dev` (React app on port 5173)

Or start both with one command from the `fintrack/` folder:

```bash
npm run dev
```

### npm scripts

| Location | Script | Description |
|---|---|---|
| root | `npm run install-all` | Install all dependencies |
| root | `npm run dev` | Run backend and frontend together |
| root | `npm run seed` | Create demo data |
| server | `npm start` / `npm run dev` / `npm run seed` | Start the API / start with nodemon / seed demo data |
| client | `npm run dev` / `npm run build` / `npm run preview` | Dev server / production build / preview the build |

---

## API Overview

Base URL: `http://localhost:5000/api`. All routes except `health`, `register` and `login` require the header `Authorization: Bearer <token>`.

Responses are JSON: `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`.

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API status |

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register `{ name, email, password }` and receive `{ user, token }` |
| POST | `/api/auth/login` | Log in `{ email, password }` and receive `{ user, token }` |
| GET | `/api/auth/me` | Get the current logged-in user |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List with filters: `type, category, paymentMethod, search, startDate, endDate, recurring, page, limit` |
| GET | `/api/transactions/:id` | Get one transaction |
| POST | `/api/transactions` | Create one. Omit `category` to auto-categorize. Response includes `budgetAlert` |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/recurring` | Upcoming recurring expenses |

Example body for a recurring expense:
```json
{
  "type": "expense", "title": "House rent", "amount": 12000, "date": "2026-10-05",
  "paymentMethod": "bank_transfer", "isRecurring": true,
  "recurrence": { "frequency": "monthly", "status": "active" }
}
```

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories?type=expense` | List the user's categories |
| POST | `/api/categories` | Create `{ name, type }` |
| DELETE | `/api/categories/:id` | Delete (only if unused) |
| GET | `/api/categories/suggest?text=uber&type=expense` | Automatic categorization preview |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets?month=10&year=2026` | Budgets with spent, remaining, percentage and status |
| GET | `/api/budgets/alerts?month=10&year=2026` | Budgets at warning or exceeded |
| GET | `/api/budgets/:id` | Get one budget |
| POST | `/api/budgets` | Create `{ category, month, year, limit, alertThreshold }` |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subscriptions?status=active` | List with monthly and yearly totals |
| GET | `/api/subscriptions/:id` | Get one subscription |
| POST | `/api/subscriptions` | Create `{ name, amount, billingCycle, nextBillingDate, category, status }` |
| PUT | `/api/subscriptions/:id` | Update a subscription |
| DELETE | `/api/subscriptions/:id` | Delete a subscription |

### Savings Goals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/savings-goals` | List with summary |
| GET | `/api/savings-goals/:id` | Get one goal |
| POST | `/api/savings-goals` | Create `{ name, targetAmount, currentAmount, deadline, description }` |
| PUT | `/api/savings-goals/:id` | Update a goal |
| POST | `/api/savings-goals/:id/add` | Add money `{ amount }` |
| DELETE | `/api/savings-goals/:id` | Delete a goal |

### Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard?month=10&year=2026` | All dashboard data and charts |
| GET | `/api/analytics/monthly?month=10&year=2026` | Monthly analytics |
| GET | `/api/reports?month=10&year=2026` | Financial report (`month=all` for the full year) |
| GET | `/api/reports/export?month=10&year=2026` | Download the report as CSV |

---

## Deployment

The backend goes to **Render**, the frontend to **Vercel**, and the database to **MongoDB Atlas**. Push the `fintrack` folder to a GitHub repository first.

### 1. Database – MongoDB Atlas
Follow [MongoDB Setup → Option B](#option-b--mongodb-atlas-cloud-also-used-for-deployment) and copy the `mongodb+srv://...` connection string. Allow network access from `0.0.0.0/0`.

### 2. Backend – Render
1. On [render.com](https://render.com) choose **New → Web Service** and connect your GitHub repository.
2. Settings:
   - **Root Directory:** `fintrack/server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. **Environment variables:**
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string
   - `CLIENT_URL` = your Vercel URL (add it after step 3, e.g. `https://fintrack.vercel.app`)
   - `NODE_ENV` = `production`
   - (Render sets `PORT` automatically.)
4. Deploy, then open `https://<your-service>.onrender.com/api/health` to check it.

*Alternative:* **New → Blueprint** uses `render.yaml` in the repository root and asks only for the secret values.

### 3. Frontend – Vercel
1. On [vercel.com](https://vercel.com) choose **Add New → Project** and import the same repository.
2. Settings:
   - **Root Directory:** `fintrack/client`
   - **Framework Preset:** Vite (build `npm run build`, output `dist`)
3. **Environment variable:** `VITE_API_URL` = `https://<your-service>.onrender.com/api`
4. Deploy. `client/vercel.json` rewrites all paths to `index.html`, so React Router pages such as `/budgets` work on refresh.

### 4. Connect them
Set `CLIENT_URL` on Render to the Vercel URL (no trailing slash) and redeploy the backend so CORS allows the frontend.

> Render's free tier sleeps after inactivity, so the first request can take about 30–60 seconds.

---

## CAS Experiment Mapping

| # | Experiment | Where it is demonstrated |
|---|---|---|
| 1 | **Demonstrate the Use of Node.js** | Node.js backend server: `server/server.js` (loads env variables with dotenv, checks required variables, connects to the DB, starts the HTTP server, shuts down gracefully), `package.json` npm scripts (`start`, `dev`, `seed`), and `GET /api/health` |
| 2 | **Implementation of Express.js** | Express application and API routes: `server/app.js` (built-in JSON/CORS middleware, custom `logger` middleware, 404 + error-handling middleware), `routes/`, `controllers/` |
| 3 | **Connecting to MongoDB** | MongoDB + Mongoose: `config/db.js`, schemas and models in `models/`, CRUD through the services, aggregation pipelines in `analyticsService.js` / `budgetService.js` |
| 4 | **Building RESTful APIs** | Finance REST APIs for auth, transactions, budgets, subscriptions, savings goals, analytics and reports, using GET / POST / PUT / DELETE and proper status codes (200, 201, 400, 401, 404, 409) |
| 5 | **Integrating React.js** | React frontend: `client/` built with Vite, React Router in `App.jsx`, 9 pages and reusable components |
| 6 | **User Authentication and Authorization** | JWT authentication and protected routes: bcrypt hashing in the `User` model, JWT in `authService.js`, `middleware/auth.js` (`protect`), every query filtered by `req.user._id`, and `ProtectedRoute.jsx` / `GuestRoute.jsx` in React |
| 7 | **React State Management** | `useState` (forms, modals, notices, report period) and `useReducer` (`authReducer`, `financeReducer`, `transactionReducer` in `hooks/useTransactions.js`), plus custom hooks |
| 8 | **Context API in React.js** | `AuthContext` (user, login, register, logout, auth state) and `FinanceContext` (selected month/year shared by the Navbar, Dashboard, Budgets and Analytics, plus categories and budget alerts) |
| 9 | **Data Fetching in React.js** | Axios API services: `services/api.js` (instance, JWT interceptor, error handling), one service per resource, and the `useFetch` hook with loading and error states |
| 10 | **Integrating React with Express** | Frontend-backend communication: React → Axios → Express → Controller → Service → MongoDB → JSON → React UI. The Vite dev proxy (`/api` → `:5000`) is used locally and CORS + `VITE_API_URL` in production |
| 11 | **Full Stack Application Deployment** | Vercel + Render + MongoDB Atlas, using `client/vercel.json`, `render.yaml`, environment-based configuration and the [deployment steps](#deployment) above |
