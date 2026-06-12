# LeadSphere CRM - Enterprise Client Relationship Management

LeadSphere CRM is a lightweight, high-performance Customer Relationship Management platform built specifically for managing leads, customer conversion, pipeline deals, activities logs, and dynamic metrics dashboards. It includes role-based access control (Admin vs Sales Representative) and a professional dark mode interface.

---

## Technical Stack

- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS, React Router, Axios, Chart.js / React-Chartjs-2, Lucide Icons
- **Backend**: Node.js, Express.js (ES Modules), MongoDB, Mongoose ODM, JWT Authentication, bcryptjs
- **Architecture**: Monorepo layout with decoupled front/back operations.

---
## Screenshots

## Folder Structure

```
leadsphere-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # API handlers (auth, leads, deals, dashboards)
│   │   ├── middleware/      # JWT auth, owner verification and RBAC
│   │   ├── models/          # Mongoose Schemas (User, Lead, Deal, Customer, Activity)
│   │   ├── routes/          # Express Routers
│   │   ├── utils/           # Seeder script
│   │   └── server.js        # Main startup script
│   ├── .env                 # Environment config
│   └── package.json
├── src/                     # React App Source
│   ├── components/          # Reusable layouts, navbar, sidebar, loaders
│   ├── context/             # AuthContext session provider
│   ├── layouts/             # Protected router screens layout
│   ├── pages/               # Login, Register, Dashboard, Leads, Deals, Reports, Profile, Users
│   ├── services/            # Axios API config
│   ├── App.tsx              # React Routes Configuration
│   ├── index.css            # Tailwind directives
│   └── main.tsx             # DOM mounting
├── index.html               # Entry HTML
├── tailwind.config.js       # Styling configurations
├── tsconfig.json            # TypeScript rules
├── vite.config.ts           # Vite Bundler settings
└── README.md                # Documentation guide
```

---

## Setup & Running Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/leadsphere` (or configure via backend `.env` variables).

### 1. Configure the Backend
Navigate to the `backend` folder:
```bash
cd backend
npm install
```
Seed the database with default accounts and 15 mock records to instantly feed the dashboard graphs:
```bash
npm run seed
```
Start the API dev server on port `5000`:
```bash
npm run dev
```

### 2. Configure the Frontend
Navigate back to the root directory:
```bash
cd ..
npm install
```
Start the Vite React developer server on port `3000`:
```bash
npm run dev
```
Open your web browser and navigate to `http://localhost:3000` to interact with the system.

---

## Key Features

- **Automated Customer Conversion**: When a Deal stage is updated to `Won`, the lead's status is synced to `Won`, and a Mongoose trigger copies details to create an account in the `customers` database automatically.
- **Dynamic Charts**: ChartJS components query live database aggregations (Leads by Month, Deal Stage Doughnuts, and Revenue Bar charts).
- **Custom CSV Export**: Generates raw reports direct from database aggregates, filtering by date ranges, representative ownerships, or status states.
