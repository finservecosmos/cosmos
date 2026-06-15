# Cosmos Finserve — Client Management & Financial Ledger System

Cosmos Finserve is an institutional wealth, loan advisory, and payment ledger application designed to streamline client onboarding, track advisor/partner commissions, and manage cash flows. 

The application is built as a single-page application (SPA) powered by **React** (Vite) on the frontend, integrating directly with **Supabase** for database operations, authentication, and file storage.

---

## 🚀 Key Features

* **Client Onboarding & Records Book:**
  * Multi-step wizard modal to onboarding clients with comprehensive credit, dwelling, banking, and income profiles.
  * Dynamically populated fields, including a secure dropdown select of active Associates mapped from database records.
* **Reminders & Due Lists:**
  * Interactive task tracker featuring customizable dates, priorities (High, Medium, Low), and complete date ranges (Start Date, End Date, and Due Date).
  * Auto-synchronized schedule widgets on the main overview dashboard displaying active ranges.
* **Payments & Outstanding Ledgers:**
  * Tracks financial collections, payouts, and outstanding debt balances across client files.
  * Implements partial payment logic, automatically updating account statuses (Paid, Partial, Pending) and keeping data synchronized in real-time.
* **Internal Finance Invoices:**
  * Generates, reviews, and prints transaction-specific **Income Receipts** and **Expense Vouchers** with uniform branding.
* **Profile & Admin Hub:**
  * Role-based access control protecting critical pages.
  * Relocated administration panel grid under the User Profile, allowing administrators to manage users, configure system settings, and download database backups.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 19 (JavaScript SPA)
* **Build Tool & Bundler:** Vite 8
* **Styling System:** Vanilla CSS & Tailwind CSS
* **Database & Authentication:** Supabase Client SDK (Postgres)
* **Iconography:** Lucide React
* **Testing Suite:** Vitest, React Testing Library (RTL), and JSDOM

---

## 📥 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Environment Setup
Configure your environment variables by creating a `.env` file in the `cosmos/` subfolder:
```properties
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-public-key
```

### 3. Installation
Navigate into the workspace folder and install the project dependencies:
```bash
cd cosmos
npm install
```

### 4. Running Locally
Launch the Vite local development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Compilation
Verify code compilation and bundle size optimizations:
```bash
npm run build
```
The optimized static build assets will be written to the `cosmos/dist/` directory, ready for cloud hosting (e.g. Vercel, Netlify, or AWS).

---

## 🧪 Testing Suite

The project features a complete testing framework using **Vitest** for unit logic and **React Testing Library** for component render trees.

### Run Tests:
* Run the test suite interactively (Watch Mode):
  ```bash
  npm run test
  ```
* Run the test suite in single-run mode:
  ```bash
  npm run test:run
  ```

---

## 📁 Repository Structure

```
cosmos/
├── src/
│   ├── assets/             # Brand logos (cosmos-logo.png) and static images
│   ├── context/            # Global contexts (AppStateContext, UserContext)
│   ├── features/           # Component modules (client-onboarding, ledgers)
│   ├── lib/api/            # Supabase database query functions
│   ├── pages/              # Main tabs & views (Invoice, LoginPage, ClientRecordBook)
│   ├── shared/             # Shared UI components, configurations, and hooks
│   ├── test/               # Setup helpers and test suites (*.test.js)
│   └── widgets/            # Layout dashboard cards & sidebar elements
├── index.html
├── vite.config.js          # Vite and Vitest configurations
└── package.json
```