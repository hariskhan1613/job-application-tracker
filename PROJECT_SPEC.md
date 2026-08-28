# Job Application Tracker — Complete Project Spec

> Is file mein pura blueprint hai: features, logic, database, design, aur deployment.
> Isko padh ke tumhe pata chal jayega kya banega aur kyu banega — phir hum code karna
> shuru karenge isi spec ko follow karte hue.

---

## 1. PROJECT OVERVIEW

**Kya hai:** Ek full-stack MERN app jaha user apni job applications track kar sakta hai —
company, role, status, dates, notes — ek dashboard pe, with basic analytics.

**Kyu banega:** Fresher/job-seekers ko 20-50+ applications track karni padti hain, Excel
mein messy ho jata hai. Real problem, real solution — interview mein genuine story bhi
milegi.

---

## 2. FEATURES — FULL LIST

### 2.1 Authentication
- Signup (name, email, password)
- Login (JWT token based)
- Logout
- Protected routes — bina login ke dashboard access nahi

**Logic:** Expense Tracker jaisa hi — bcrypt se password hash, JWT token generate,
`Authorization: Bearer <token>` header se har protected request verify hoti hai.

### 2.2 Application Management (Core CRUD)
- **Add Application:** company name, role, applied date, job link, status, notes, salary range (optional)
- **View All:** dashboard list/table view, saari applications ek jagah
- **Edit:** status update karna sabse common action hoga (Applied → Interview → Offer/Reject)
- **Delete:** galti se duplicate ya spam application hatana

**Logic:** Har application document mein `user` field hoga (jo user se belongs karta hai,
jaise Expense Tracker mein tha). Query karte time hamesha `{ user: req.user._id }` filter
lagega — taaki koi user ka data doosre ko na dikhe.

### 2.3 Status Tracking System
Status states (enum): `Applied`, `OA/Assessment`, `Interview Scheduled`, `Interview Done`, `Offer`, `Rejected`, `Withdrawn`

**Logic:** Ye ek simple state field hai Expense ke `category` enum jaisa, bas zyada
states hain. Frontend mein har status ka apna color hoga (design section mein details).

### 2.4 Filter & Search
- Status se filter karo (dropdown: "sirf Interview wale dikhao")
- Company name se search karo
- Date range se sort (newest/oldest first)

**Logic:** Frontend pe client-side filtering (agar applications kam hain, jaise <200) —
simple `array.filter()` React state pe. Agar future mein bahut zyada data ho toh backend
query params se filter karenge (`GET /api/applications?status=Interview`), lekin abhi
shuruat mein client-side hi kaafi hai — simpler aur explain karna bhi easy hoga.

### 2.5 Follow-up Reminder (highlight feature)
Agar "Applied" status ko 7+ din ho gaye aur update nahi hua, dashboard pe ek badge/highlight
dikhega "Follow up needed".

**Logic:** Ye pure frontend logic hai — koi extra DB field nahi chahiye. Har application
ke `createdAt` (Mongoose automatically deta hai `timestamps: true` se) ko aaj ki date se
compare karo:
```
const daysSinceApplied = (Date.now() - new Date(app.createdAt)) / (1000*60*60*24);
if (daysSinceApplied > 7 && app.status === 'Applied') { showReminder = true }
```
Ye recruiters ko dikhayega tumne sirf CRUD nahi, thoda "business logic" bhi socha hai.

### 2.6 Analytics Dashboard (resume-strong feature)
- Total applications count
- Status-wise breakdown (kitne Applied, kitne Interview, kitne Rejected) — Pie/Bar chart
- Response rate % = (Interview + Offer + Rejected) / Total × 100
- Applications over time — Line chart (weekly/monthly trend)

**Logic:** Backend se saari applications fetch karke, frontend pe JavaScript se aggregate
karenge (`reduce()` se group by status). Charting ke liye **Recharts** library (React ke
saath easy integrate hoti hai). Ye feature interview mein alag se discuss ho sakta hai —
"maine data ko group kaise kiya, chart library kaise use ki" — good talking point.

### 2.7 Responsive Dashboard UI
- Table view (desktop) → Card view (mobile) — same data, different layout based on screen size
- Add/Edit form — modal ya separate page

---

## 3. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Axios, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (cloud, free tier) |
| Auth | JWT + bcryptjs |
| Deployment | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas |

---

## 4. DATABASE DESIGN (MongoDB Atlas)

### Collections:

**users**
```
{
  _id, name, email (unique), password (hashed), createdAt, updatedAt
}
```

**applications**
```
{
  _id,
  user: ObjectId (ref → users),
  company: String,
  role: String,
  status: String (enum),
  appliedDate: Date,
  jobLink: String,
  salaryRange: String (optional),
  notes: String,
  createdAt, updatedAt
}
```

**Relation:** One user → many applications (1:N), same pattern as Expense Tracker
(`user` field with `ref: 'User'`).

### How MongoDB Atlas connects:
1. Atlas pe free M0 cluster banate ho (cloud-hosted MongoDB, koi local install nahi chahiye)
2. Database user banate ho (username/password) — DB access ke liye
3. Network Access mein IP whitelist karte ho (`0.0.0.0/0` = anywhere se access, deployment ke liye zaroori)
4. Atlas ek **connection string** deta hai:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobtracker`
5. Ye string `.env` file mein `MONGO_URI` variable mein daalte ho
6. Backend ka `mongoose.connect(process.env.MONGO_URI)` isi string se connect ho jata hai
7. **Scalability point:** Atlas free tier 512MB storage deta hai — ek personal/resume
   project ke liye kaafi zyada hai (hazaaron records fit ho jayenge). Paid tier pe upgrade
   scale karne pe possible hai bina code change kiye — ye baat interview mein bol sakte ho.

---

## 5. SCALABILITY (kitne users handle karega)

Honest answer for interview: **Ye ek resume/portfolio project hai, production-scale nahi**,
lekin architecture scalable hai:
- MongoDB Atlas horizontally scale ho sakta hai (sharding) — free tier pe nahi, paid pe
- Stateless backend (JWT-based, no server-side sessions) — matlab multiple server instances
  pe load balance karna easy hai (koi session storage dependency nahi)
- Realistically: is architecture pe free-tier resources ke saath **hundreds of concurrent
  users** comfortably handle ho sakte hain. Thousands+ ke liye caching (Redis), pagination,
  aur DB indexing add karni padegi.
- **Pagination** hum abhi se add karenge (`limit`/`skip` query params) — taaki agar user
  ke paas 500 applications bhi hon, ek saath sab load na ho, performance acchi rahe. Ye
  bhi interview mein "maine scalability soch ke banaya" wala point banega.

---

## 6. DEPLOYMENT PLAN

1. **GitHub:** Code push karo, proper commits (feature-wise, not one giant commit)
2. **MongoDB Atlas:** Cluster already banaya (step 4 mein), connection string ready
3. **Backend → Render:**
   - Render pe naya "Web Service" banao, GitHub repo connect karo
   - Environment variables daalo (MONGO_URI, JWT_SECRET) Render dashboard mein
   - Build command: `npm install`, Start command: `npm start`
4. **Frontend → Vercel:**
   - Vercel pe React/Vite project import karo GitHub se
   - Environment variable: backend ka deployed URL (`VITE_API_URL`)
   - Auto-deploy on every git push (Vercel ye khud kar deta hai)
5. **CORS update:** Backend ke `cors()` config mein sirf deployed frontend URL allow karo
   (security ke liye `origin: 'https://yourapp.vercel.app'`)
6. **Test end-to-end** live URL pe — signup, login, add application, sab check karo

---

## 7. DESIGN & UI (Premium, Simple, Responsive)

### Design Philosophy
Minimal, clean, "SaaS dashboard" feel — jaise Notion/Linear jaise tools dikhte hain.
Zyada colors nahi, whitespace zyada, typography clean.

### Color Palette (Premium + Simple)
- **Background:** `#FAFAFA` (off-white, not pure white — softer look)
- **Surface/Cards:** `#FFFFFF` with subtle shadow
- **Primary (buttons, links, accents):** `#4F46E5` (Indigo — modern, professional, trust-signaling)
- **Text — Primary:** `#111827` (near-black, not pure black)
- **Text — Secondary:** `#6B7280` (grey, for labels/notes)
- **Borders:** `#E5E7EB` (light grey)

**Status colors (for badges):**
- Applied → `#3B82F6` (blue)
- OA/Assessment → `#8B5CF6` (purple)
- Interview Scheduled/Done → `#F59E0B` (amber)
- Offer → `#10B981` (green)
- Rejected → `#EF4444` (red)
- Withdrawn → `#9CA3AF` (grey)

### Typography
- Font: **Inter** (clean, modern, free — Google Fonts) or system font stack
- Headings: semi-bold, generous size
- Body: regular weight, 14-16px

### Layout
- **Sidebar** (desktop): navigation — Dashboard, Add Application, Analytics, Logout
- **Top bar:** search box + "Add Application" button (primary color, top-right)
- **Main content:** application cards/table with status badges (colored pills)
- **Analytics page:** chart cards in a grid

### Responsive Behavior
- Desktop (>1024px): sidebar visible, table view for applications
- Tablet (768-1024px): sidebar collapses to icon-only or hamburger, table still visible
- Mobile (<768px): hamburger menu, applications shown as stacked cards (not table — tables
  don't work well on small screens), bottom nav bar optional

**Implementation approach:** Tailwind CSS ke responsive utility classes (`sm:`, `md:`,
`lg:` prefixes) — no custom media queries likhni padengi, Tailwind handle karega.

---

## 8. FRONTEND PAGE STRUCTURE

```
/               → Landing/redirect (to login or dashboard)
/login          → Login form
/signup         → Signup form
/dashboard      → Main application list (protected)
/dashboard/add  → Add new application (modal or page)
/dashboard/edit/:id → Edit application (protected)
/analytics      → Charts & stats (protected)
```

---

## 9. API ENDPOINTS (Backend)

```
POST   /api/auth/register     → signup
POST   /api/auth/login        → login

GET    /api/applications      → get all (user's own, with optional filter/pagination query params)
POST   /api/applications      → add new
PUT    /api/applications/:id  → update (mainly status changes)
DELETE /api/applications/:id  → delete

GET    /api/applications/stats → aggregated data for analytics page (optional — could also compute on frontend)
```

---

## 10. BUILD ORDER (jab code karenge)

1. Backend: models (User, Application) — same pattern Expense Tracker se
2. Backend: auth controller + routes (copy-adapt from Expense Tracker, bas field names badlenge)
3. Backend: application CRUD controller + routes
4. Backend: test with Postman/Thunder Client
5. Frontend: Vite React setup + Tailwind config
6. Frontend: Auth pages (login/signup) + auth context
7. Frontend: Dashboard — list view + status badges
8. Frontend: Add/Edit form
9. Frontend: Filter/search functionality
10. Frontend: Follow-up reminder logic
11. Frontend: Analytics page with Recharts
12. Responsive polish — test on mobile view
13. Deploy (Atlas → Render → Vercel)
14. README + GitHub push

---

## STATUS: Planning complete. Code not yet started.
