# Job Application Tracker

> A focused MERN workspace for turning a scattered job search into a clear, trackable system.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

Job Application Tracker is a full-stack web application for managing every stage of a job search in one place. Save applications, follow status changes, find companies quickly, review progress, and use analytics to understand the search instead of relying on scattered spreadsheets.

---

## Contents

- [What This Project Does](#what-this-project-does)
- [Feature Overview](#feature-overview)
- [Application Statuses](#application-statuses)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [How the Application Works](#how-the-application-works)
- [Prerequisites](#prerequisites)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Deployment Guide](#deployment-guide)
- [Roadmap](#roadmap)
- [Credits](#credits)

---

## What This Project Does

The tracker is designed for students, freshers, career switchers, and anyone managing multiple applications at once.

It helps you:

- Keep company, role, date, link, salary, notes, and status information together.
- See the entire application pipeline at a glance.
- Search and filter applications without digging through a spreadsheet.
- Notice applications that may need a follow-up.
- Understand response patterns through visual analytics.
- Keep each user's applications private through JWT-protected API requests.

---

## Feature Overview

### Authentication

- Register with name, email, and password.
- Log in with JWT-based authentication.
- Passwords are hashed with `bcryptjs` before storage.
- Protected pages redirect unauthenticated users to `/login`.
- Protected API requests use `Authorization: Bearer <token>`.
- JWT tokens expire after 7 days.
- Logout clears the local authentication state.

### Application Management

Each application can contain:

- Company name
- Job role
- Application status
- Applied date
- Job posting link
- Salary range
- Personal notes

The application workspace supports:

- Create a new application.
- View all applications belonging to the logged-in user.
- Open a single application for editing.
- Update application details or status.
- Delete duplicate, withdrawn, or unwanted applications.
- Sort by newest or oldest applied date.
- Display a desktop table and responsive mobile cards.

### Search and Filtering

- Search by company name or role.
- Filter by any supported status.
- Sort by newest first or oldest first.
- Clear filters and return to the complete list.
- Backend requests also support `status`, `search`, `page`, and `limit` query parameters.

### Follow-up Reminder

Applications that remain in the `Applied` state for more than seven days can be highlighted as needing follow-up. The reminder uses the application's timestamps and status, so no extra database field is required.

A useful follow-up message can help you send a timely email instead of letting a promising application disappear in the pile.

### Analytics Dashboard

The analytics page provides a visual summary of the search:

- Total applications.
- Count for every application status.
- Status distribution through a chart.
- Application trend over time.
- Response-rate style insights based on progressed applications.
- Empty, loading, and error states for reliable feedback.

Charts are powered by `Recharts` and the data is loaded from the applications and statistics APIs.

### Responsive Experience

- Desktop: sidebar navigation, spacious dashboard, and table view.
- Tablet: flexible layout with the same core workflows.
- Mobile: stacked application cards that remain readable without horizontal table scrolling.
- Shared loading, empty, error, and filtered-empty states keep the interface understandable.

---

## Application Statuses

| Status | Meaning | Suggested visual tone |
| --- | --- | --- |
| `Applied` | Application has been submitted | Blue |
| `OA/Assessment` | Online assessment or screening task | Purple |
| `Interview Scheduled` | Interview has been booked | Amber |
| `Interview Done` | Interview has taken place | Amber |
| `Offer` | Offer received | Green |
| `Rejected` | Application was not selected | Red |
| `Withdrawn` | Application was withdrawn | Grey |

These values are shared by the backend model and frontend controls. Use the exact spelling when sending API requests.

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Recharts |
| Frontend styling | Component/page CSS with responsive media queries |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JWT and bcryptjs |
| Development | Nodemon for backend, Vite HMR for frontend |

---

## Project Structure

```text
Job Tracker/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── controllers/                 # Authentication and application logic
│   ├── middleware/authMiddleware.js # JWT verification
│   ├── models/                      # User and Application schemas
│   ├── routes/                      # Auth and application endpoints
│   ├── .env.example                 # Backend environment template
│   ├── package.json
│   └── server.js                    # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/              # Forms, table, navbar, pagination, cards
│   │   ├── context/                 # Authentication context/provider
│   │   ├── hooks/                   # Reusable React hooks
│   │   ├── pages/                   # Home, auth, dashboard, applications, analytics
│   │   ├── services/                # Axios, auth, and application API services
│   │   ├── App.jsx                  # Client-side route definitions
│   │   └── index.css                # Global styles
│   ├── .env                         # Local frontend API configuration
│   └── package.json
├── PROJECT_SPEC.md                  # Product blueprint and planned direction
└── README.md
```

---

## How the Application Works

1. A visitor opens the React frontend.
2. A new user registers or an existing user logs in.
3. The backend hashes passwords and returns a signed JWT.
4. The frontend stores the authentication state and attaches the token to API requests.
5. The JWT middleware identifies the current user on protected application routes.
6. Every application query is scoped to that user's ID.
7. The dashboard loads applications, while the analytics page loads status totals and trend data.

This user-scoped design means one authenticated user cannot read or modify another user's applications through the normal API flow.

---

## Prerequisites

Install these before starting:

- Node.js 18 or newer
- npm 9 or newer
- A MongoDB Atlas account, or a local MongoDB server
- Git, if cloning the project

Check your Node and npm versions:

```bash
node --version
npm --version
```

### MongoDB Atlas setup

1. Create a free MongoDB Atlas account.
2. Create an `M0` cluster.
3. Create a database user and password.
4. Add your current IP address under Network Access.
5. For temporary local testing only, you may allow `0.0.0.0/0`. Restrict this before production.
6. Copy the connection string and replace its username and password placeholders.
7. Use a database name such as `jobtracker` in the connection string.

Example format:

```text
mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/jobtracker
```

---

## Local Installation

### 1. Get the project

```bash
git clone <your-repository-url>
cd "Job Tracker"
```

If the project is already on your computer, open a terminal in the `Job Tracker` folder.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a file named `.env` in the `backend` folder by copying `.env.example`:

```bash
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Open `backend/.env` and set a real MongoDB URI and a long JWT secret.

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The repository already includes a local frontend environment file with this default value, but verify it before starting the app.

### 4. Start the backend

In the backend terminal:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:5000
```

You can verify it by opening `http://localhost:5000/`. A successful response contains:

```json
{
  "success": true,
  "message": "Job Application Tracker API is running"
}
```

For a normal start without Nodemon:

```bash
npm start
```

### 5. Start the frontend

In the frontend terminal:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

Keep both terminals running while using the application.

---

## Environment Variables

### Backend: `backend/.env`

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Port for the Express server |
| `MONGO_URI` | Yes | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | Yes | `replace-with-a-long-random-secret` | Signs and verifies JWTs |
| `NODE_ENV` | No | `development` | Runtime environment label |

### Frontend: `frontend/.env`

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL used by Axios |

Never commit real database credentials or JWT secrets. Environment files containing secrets should stay local and remain ignored by Git.

---

## Available Scripts

### Backend

Run these from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node |

### Frontend

Run these from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

Before sharing a frontend change, run:

```bash
npm run lint
npm run build
```

---

## Application Routes

| URL | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/dashboard` | Protected | Summary dashboard |
| `/dashboard/applications` | Protected | Searchable application list |
| `/dashboard/add` | Protected | Add an application |
| `/dashboard/edit/:id` | Protected | Edit an application |
| `/analytics` | Protected | Charts and progress insights |

Trying to open a protected page without a valid login redirects to `/login`. Authenticated users are redirected to the dashboard when they open the public auth pages.

---

## API Reference

The local API base URL is `http://localhost:5000/api`.

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Create a user account |
| `POST` | `/auth/login` | No | Authenticate a user and return a JWT |

Register request:

```json
{
  "name": "Haris",
  "email": "haris@example.com",
  "password": "your-password"
}
```

Login request:

```json
{
  "email": "haris@example.com",
  "password": "your-password"
}
```

Successful authentication returns user information and a token inside `data`.

### Applications

All application endpoints require:

```http
Authorization: Bearer <jwt-token>
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/applications` | Get the current user's applications |
| `GET` | `/applications/:id` | Get one application |
| `POST` | `/applications` | Create an application |
| `PUT` | `/applications/:id` | Update an application |
| `DELETE` | `/applications/:id` | Delete an application |
| `GET` | `/applications/stats` | Get total and status-wise counts |

Create or update request example:

```json
{
  "company": "Example Technologies",
  "role": "Frontend Developer",
  "status": "Applied",
  "appliedDate": "2026-08-29",
  "jobLink": "https://example.com/jobs/frontend-developer",
  "salaryRange": "12-16 LPA",
  "notes": "Tailor portfolio examples before the first call."
}
```

Supported list query parameters:

```text
GET /api/applications?status=Applied&search=frontend&page=1&limit=10
```

- `status`: one exact supported status.
- `search`: case-insensitive search across company and role.
- `page`: positive integer; defaults to `1`.
- `limit`: positive integer up to `50`; defaults to `10`.

Application list responses include `data.applications` and pagination metadata such as `totalPages`, `hasNextPage`, and `hasPreviousPage`.

---

## Database Design

### `users`

- `name`
- `email` (unique and normalized to lowercase)
- `password` (hashed)
- `createdAt`
- `updatedAt`

### `applications`

- `user` (reference to the owning user)
- `company`
- `role`
- `status`
- `appliedDate`
- `jobLink`
- `salaryRange`
- `notes`
- `createdAt`
- `updatedAt`

Applications use a user-plus-applied-date index to keep user-specific, date-sorted queries efficient.

---

## Security Notes

- Passwords are never stored as plain text.
- JWT secrets belong in environment variables, not source code.
- Application routes require authentication.
- Application reads, updates, and deletes are scoped to the authenticated user.
- Mongoose validation limits required fields, string lengths, and allowed statuses.
- CORS is currently configured for flexible local development. Restrict it to the deployed frontend origin before production.
- Use HTTPS and strong, unique secrets in a deployed environment.

---

## Troubleshooting

### `MongoServerError` or database connection failure

- Confirm `MONGO_URI` exists in `backend/.env`.
- Check the MongoDB username and password.
- If the password contains special characters, URL-encode them in the connection string.
- Confirm your IP address is allowed in MongoDB Atlas Network Access.
- Make sure the cluster is running.

### Frontend cannot reach the API

- Confirm the backend terminal is running on port `5000`.
- Check `frontend/.env` contains `VITE_API_BASE_URL=http://localhost:5000/api`.
- Restart Vite after changing an environment variable.
- Check the browser console and Network tab for the failing request.

### `401 Authentication required`

- Log in again to obtain a fresh token.
- Confirm the frontend is attaching the token as `Authorization: Bearer <token>`.
- Remember that tokens expire after 7 days.

### Port already in use

Change `PORT` in `backend/.env`, then update the frontend API URL to match. For example:

```env
# backend/.env
PORT=5050

# frontend/.env
VITE_API_BASE_URL=http://localhost:5050/api
```

### Frontend changes are not visible

- Stop and restart the Vite process.
- Confirm you are editing files inside `frontend/src`.
- Run `npm run build` to catch production-only build issues.

---

## Deployment Guide

The intended deployment shape is:

- MongoDB Atlas for the database.
- Render, Railway, or a similar Node host for the backend.
- Vercel, Netlify, or a similar static host for the frontend.

### Backend deployment checklist

1. Set the backend root directory to `backend`.
2. Install command: `npm install`.
3. Start command: `npm start`.
4. Configure `MONGO_URI`, `JWT_SECRET`, `PORT`, and `NODE_ENV` in the hosting dashboard.
5. Restrict CORS to the deployed frontend URL.
6. Confirm the root health response and authentication endpoints.

### Frontend deployment checklist

1. Set the frontend root directory to `frontend`.
2. Install dependencies with `npm install`.
3. Build with `npm run build`.
4. Set `VITE_API_BASE_URL` to the deployed backend API URL ending in `/api`.
5. Configure SPA fallback/rewrites so React Router URLs load correctly.
6. Test registration, login, CRUD, logout, and analytics on the deployed site.

---

## Roadmap

Potential next improvements:

- Add automated backend and frontend tests.
- Add a dedicated follow-up date or reminder history.
- Add server-side analytics for very large datasets.
- Add richer date-range filtering.
- Add export to CSV or JSON.
- Add refresh-token rotation and stricter production CORS.
- Add CI checks for linting and builds.

---

## Credits

<div align="center">

### Crafted with clarity and care by **Haris**

This project was created to make the job search feel more organized, more measurable, and a little less overwhelming. Every application is a step forward; this tracker simply gives those steps a place to be seen.

**Job Application Tracker**

*Plan thoughtfully. Apply consistently. Keep moving forward.*

</div>

---

<div align="center">

Made for focused applications, honest progress, and the next great opportunity.

</div>
