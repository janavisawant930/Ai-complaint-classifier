# AI Complaint Classifier

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Custom_Theme-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, interactive web application designed to automatically classify, prioritize, and manage customer complaints using rule-based Natural Language Processing (NLP) pattern detection. The system provides real-time category prediction, urgency scoring, dynamic dashboard analytics, and end-to-end complaint lifecycle tracking.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Purpose](#project-purpose)
- [Key Features](#key-features)
- [Complaint Categories](#complaint-categories)
- [AI Classification Engine](#ai-classification-engine)
- [Dashboard](#dashboard)
- [All Complaints Management](#all-complaints-management)
- [Analytics & Visualizations](#analytics--visualizations)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [How to Use](#how-to-use)
- [Example AI Results](#example-ai-results)
- [Learning Outcomes](#learning-outcomes)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Project Overview

In customer-facing organizations, handling high volumes of customer complaints manually causes slow response times, misrouting, and delayed resolution for urgent problems. 

**AI Complaint Classifier** solves this challenge by serving as an automated resolution hub:
- It processes raw complaint titles and descriptions entered by users.
- It automatically analyzes the intent and domain of the complaint using Natural Language Processing keyword matching.
- It assigns an accurate **Category**, **Priority level**, and **Confidence score**.
- It provides support teams with an interactive administrative dashboard equipped with multi-criteria filtering, volume metrics, and real-time status updates (*Pending*, *In Progress*, *Resolved*).

---

## Project Purpose

The primary objective of this project is to streamline customer support operations. By automatically categorizing customer feedback and scoring urgency upon submission, organizations can:
1. **Reduce Triage Time**: Eliminate manual reading and manual categorization of routine tickets.
2. **Prioritize Critical Incidents**: Immediately flag high-priority fraud or billing issues before they escalate.
3. **Enhance Resolution Visibility**: Track resolution bottlenecks through interactive category distribution and timeline analytics.
4. **Improve Customer Satisfaction**: Ensure complaints reach the right department with transparent status tracking.

---

## Key Features

- **Authentication System (Sign In & Sign Up)**:
  - User registration with field validation (Name, Email, Username, Password match).
  - Secure credential sign-in with Show/Hide password toggle.
  - "Remember Me" session persistence using the Web Storage API (`localStorage` & `sessionStorage`).
  - Pre-configured demo accounts for fast evaluation (*Administrator* and *Support Specialist*).
  - User logout functionality from the sidebar and profile menu.
- **Submit Complaint Form**:
  - Structured input for Complaint Title and Detailed Description.
  - Optional file upload attachment support (PNG, JPG, PDF up to 10MB).
  - Form validation for required fields.
- **Automated AI Classification**:
  - Instant automated categorization upon submission.
  - Urgency/Priority determination (*High*, *Medium*, *Low*).
  - Model confidence percentage calculation (up to 96%).
  - Visual classification feedback card with animated confidence progress bar.
- **Interactive Dashboard**:
  - Live summary cards for *Total Complaints*, *Pending*, *Resolved*, and *High Priority* tickets.
  - Clicking any summary card immediately filters and navigates to the relevant complaints list.
  - Dynamic category doughnut chart with calculated percentage angles.
  - Volume trend line chart with time range selection (7 days, 30 days, 90 days) and SVG tooltips.
  - Recent complaints feed with click-to-view details modal.
- **Complaint Management (All Complaints)**:
  - Multi-criteria filtering: Category, Status, Priority, and Sorting order.
  - Real-time search across Complaint ID, User name, Complaint content, Category, and Priority.
  - Active filter chips with one-click individual dismissal.
  - One-click "Reset All Filters" button.
  - Inline status update dropdowns (*Pending* $\rightarrow$ *In Progress* $\rightarrow$ *Resolved*).
- **Complaint Inspection Modal**:
  - Detailed dialog showing submitter information, timestamp, full description, category, priority, and confidence.
  - Ticket status change controls (*Reopen*, *Mark In Progress*, *Mark Resolved*).
  - Keyboard accessibility (close on `Escape` key or backdrop click).
- **Analytics View**:
  - Category volume bar chart with interactive bars linking directly to filtered complaint records.
  - Priority and resolution status distribution metrics.
  - Resolution efficiency metrics (average resolution time, resolution rate).
  - Inflow volume histogram toggled across Daily, Weekly, and Monthly intervals.
- **Notification Center & Alerts**:
  - Interactive topbar notification popover with unread counter badge and "Mark all read" capability.
  - Non-intrusive floating toast notifications for user actions (login, ticket submission, status updates).

---

## Complaint Categories

The system classifies complaints into 7 distinct categories, each configured with specific color badges and theme accents:

| Category | Color Code | Description | Typical Keywords Analyzed |
| :--- | :---: | :--- | :--- |
| **Fraud / Security** | `#ef4444` (Red) | Unauthorized access, security breaches, suspicious charges | `fraud`, `unauthorized`, `scam`, `stolen`, `transaction` |
| **Billing** | `#6366f1` (Indigo) | Invoices, double charges, payment processing, refunds | `payment`, `charge`, `refund`, `invoice`, `billing` |
| **Technical Issues** | `#06b6d4` (Cyan) | Application crashes, login errors, bugs, performance issues | `login`, `password`, `crash`, `error`, `technical` |
| **Product / Service** | `#8b5cf6` (Purple) | Defective items, broken shipments, poor service quality | `product`, `damaged`, `service`, `broken` |
| **Delivery** | `#10b981` (Green) | Late shipping, missing parcels, tracking delays | `delivery`, `shipping`, `arrive`, `package` |
| **Account** | `#f59e0b` (Orange) | Profile changes, phone number updates, credential settings | `account`, `profile`, `phone number` |
| **Other** | `#94a3b8` (Gray) | General questions or inquiries not matching primary keywords | Default fallback category |

---

## AI Classification Engine

The AI classification module in [`src/App.jsx`](src/App.jsx) operates via a deterministic Natural Language Processing (NLP) keyword-matching algorithm:

```
[Customer Complaint Input: Title + Description]
                     │
                     ▼
       [Text Preprocessing & Normalization]
      (Lowercasing, Token Extraction, Trimming)
                     │
                     ▼
          [Keyword Pattern Evaluator]
  ┌──────────────────┼──────────────────┐
  ▼                  ▼                  ▼
[Category]      [Priority Level]    [Confidence Score]
(e.g., Billing)  (e.g., High)        (e.g., 94%)
                     │
                     ▼
   [Generated Record with CMP-xxxx ID & Status]
```

### Classification Pipeline Steps:
1. **Input Aggregation**: The complaint's title and description are concatenated into a single text payload.
2. **Text Normalization**: The raw string is converted to lowercase to ensure case-insensitive pattern matching.
3. **Intent Pattern Matching**:
   - The engine checks for domain-specific keyword clusters.
   - For example, occurrences of security-sensitive terms (`fraud`, `unauthorized`, `stolen`) trigger the **Fraud/Security** category with **High** priority and **96%** confidence.
   - Occurrences of financial terms (`charge`, `refund`, `billing`) trigger the **Billing** category with **High** priority and **94%** confidence.
   - Occurrences of software issues (`crash`, `login`, `error`) trigger **Technical Issues** with **Medium** priority and **91%** confidence.
4. **Fallback Handling**: If no specialized keywords match, the system categorizes the issue under **Other** with **Medium** priority and a baseline confidence score of **82%**.

---

## Dashboard

The Dashboard provides a consolidated high-level overview of the complaint management system:

- **Summary Metric Cards**:
  - **Total Complaints**: Cumulative count of all complaints recorded in the system.
  - **Pending**: Volume of open complaints awaiting resolution.
  - **Resolved**: Number of tickets successfully resolved.
  - **High Priority**: Urgent complaints requiring immediate team intervention.
  - *Interactivity*: Clicking any card filters the main complaint registry accordingly.
- **Complaints by Category (Chart)**:
  - Dynamically calculates proportional slices in a CSS `conic-gradient` based on live complaint counts.
  - An interactive legend displays individual counts and percentages; clicking any category filters the database by that category.
- **Complaints Over Time (Trend Chart)**:
  - SVG area/line chart depicting incoming ticket volume trends.
  - Dropdown selector toggles intervals between **Last 7 days**, **Last 30 days**, and **Last 90 days**.
  - Interactive data points feature native tooltips showing exact dates and ticket counts.
- **Recent Complaints Feed**:
  - Displays the 5 latest complaints with status badges. Clicking any row opens the full details modal.
  - Quick action button `"View All Complaints →"` redirects directly to the main table.

---

## All Complaints Management

The **All Complaints** view is a data grid offering filtering and administration features:

- **Search Bar**: Real-time filtering across Complaint ID (e.g., `CMP-1001`), Submitter name, Complaint description text, Category name, and Priority. Includes an instant clear (`×`) button.
- **Filter Dropdowns**:
  - *Category*: Filter by any of the 7 supported categories.
  - *Status*: Filter by `Pending`, `In Progress`, or `Resolved`.
  - *Priority*: Filter by `High`, `Medium`, or `Low`.
  - *Sorting*: Sort by `Newest First`, `Oldest First`, `Confidence: High to Low`, or `Confidence: Low to High`.
- **Active Filter Chips**: Visual tags indicating current search and filter constraints, dismissible individually.
- **Empty State Display**: Displays an informative placeholder message with a `"Reset All Filters"` button when no records match.
- **Inline Actions**:
  - Quick View (`👁`): Opens the detailed ticket inspection dialog.
  - Quick Status Select: Change status directly between *Pending*, *In Progress*, and *Resolved* with instant UI updates and toast feedback.

---

## Analytics & Visualizations

The **Analytics** view provides operational metrics regarding complaint handling performance:

- **Complaints by Category**:
  - Vertical bar visualization representing complaint distribution across categories.
  - Heights dynamically adjust to the active complaint distribution; clicking a bar filters tickets by that category.
- **Complaints by Priority**:
  - Categorized breakdown showing counts for High, Medium, and Low urgency tickets with interactive filter links.
- **Complaints by Status**:
  - Progress bar indicators visualizing percentage completion for Resolved, Pending, and In Progress tickets.
- **Resolution Performance Card**:
  - Displays operational KPIs: Average Resolution Days (`2.4 days`), Resolution Rate (`87%`), and AI Model Accuracy (`94%`).
- **Complaint Inflow Activity**:
  - Segmented mini-bar histogram showing incoming ticket frequency.
  - Interactive tab buttons toggle view between **Daily**, **Weekly**, and **Monthly** time intervals.

---

## Technology Stack

The project is built entirely with modern frontend web standards:

- **Frontend Framework**: [React 19](https://react.dev/) (Functional Components, Hooks: `useState`, `useMemo`, `useEffect`)
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/) (Fast HMR & Optimized Production Build)
- **Language**: JavaScript (ES6+ / JSX)
- **Styling**: Pure CSS3 (`src/App.css` and `src/index.css`)
  - CSS Custom Properties (Variables)
  - Responsive Grid & Flexbox layouts
  - Custom SVG graphics & gradients
  - Keyframe animations and transitions
- **Client-Side Storage**: Web Storage API (`localStorage` & `sessionStorage`) for persistent complaints, users, and session states.
- **Linting & Code Quality**: [Oxlint](https://oxc.rs/)

---

## Project Structure

```
final-ai-complaint/
├── public/                     # Static public assets
│   ├── favicon.svg             # Application browser icon
│   └── icons.svg               # SVG icons
├── src/                        # Source code directory
│   ├── assets/                 # Static media and brand assets
│   │   ├── hero.png            # Application graphic
│   │   ├── react.svg           # React logo
│   │   └── vite.svg            # Vite logo
│   ├── App.css                 # Master application styles and responsive layout
│   ├── App.jsx                 # Core application shell, state management & views
│   ├── index.css               # Global base resets and root definitions
│   ├── Login.jsx               # Sign In / Sign Up component with validation
│   └── main.jsx                # Application root entry point
├── .gitignore                  # Git ignore definitions
├── .oxlintrc.json              # Oxlint linter configuration
├── index.html                  # HTML entry template
├── package.json                # Project dependencies and npm scripts
├── package-lock.json           # Exact dependency lockfile
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Project documentation
```

### Key File Descriptions:
- **[`src/App.jsx`](src/App.jsx)**: Contains the central application state (complaints list, active tab, active filters, notifications), the `classifyComplaint` NLP rule engine, and view components (`Dashboard`, `SubmitComplaint`, `ComplaintsTable`, `Classification`, `Analytics`, `ComplaintModal`).
- **[`src/Login.jsx`](src/Login.jsx)**: Handles authentication states, credential verification, registration form validation, duplicate checking, and session storage.
- **[`src/App.css`](src/App.css)**: Implements design system variables, dark sidebar aesthetics, glassmorphic cards, responsive media queries, and badge themes.

---

## Installation and Setup

Follow these steps to run the project locally on your machine:

### Prerequisites:
- [Node.js](https://nodejs.org/) (Version 18.0 or higher recommended)
- `npm` (bundled with Node.js)

### Step-by-Step Instructions:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/final-ai-complaint.git
   cd final-ai-complaint
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

5. **Build for production** (optional):
   ```bash
   npm run build
   ```
   To preview the production build locally:
   ```bash
   npm run preview
   ```

6. **Run linter**:
   ```bash
   npm run lint
   ```

---

## How to Use

A typical end-to-end user workflow proceeds as follows:

```
[Sign In / Sign Up] ──▶ [Dashboard Overview] ──▶ [Submit Complaint Form]
                                                         │
                                                         ▼
[Analytics & Reports] ◀── [Manage & Filter Table] ◀── [AI Classification Result]
```

1. **Sign In or Register**:
   - Access the login screen. You can register a new account under **Sign Up** or use the **"Quick Demo Access"** button to log in instantly as `admin@complainai.com` (`admin123`).
2. **Review the Dashboard**:
   - Inspect summary metrics, review category breakdowns in the pie chart, or observe volume trends over time.
3. **Submit a Complaint**:
   - Navigate to **"Submit Complaint"** in the sidebar.
   - Enter a Complaint Title (e.g., *"Double payment deducted for order"*) and a detailed description.
   - Click **"Submit Complaint"**.
4. **Observe AI Classification**:
   - The engine processes the input and returns the predicted **Category** (*Billing*), **Priority** (*High*), and **Confidence Score** (*94%*).
5. **Manage Complaints**:
   - Navigate to **"All Complaints"** to view the newly registered ticket.
   - Filter by status or priority, search for terms, or click on a row to open the full ticket dialog.
   - Update the complaint status to *In Progress* or *Resolved*.
6. **Analyze Insights**:
   - Switch to **"Analytics"** to observe real-time updates reflected across category bars, status progress bars, and volume timelines.
7. **Sign Out**:
   - Click **"Logout"** in the sidebar bottom or user profile popup to terminate the session.

---

## Example AI Results

Below are representative classification outputs generated by the built-in classification engine:

### Example 1: Security & Fraud Issue
- **Input Complaint:** *"I noticed an unauthorized transaction on my account yesterday."*
- **Predicted Category:** `Fraud/Security`
- **Assigned Priority:** `High`
- **Confidence Score:** `96%`

### Example 2: Billing & Payment Issue
- **Input Complaint:** *"My payment was charged twice for the same order and I need a refund."*
- **Predicted Category:** `Billing`
- **Assigned Priority:** `High`
- **Confidence Score:** `94%`

### Example 3: Technical Bug
- **Input Complaint:** *"The mobile application keeps crashing when I try to enter my login credentials."*
- **Predicted Category:** `Technical Issues`
- **Assigned Priority:** `Medium`
- **Confidence Score:** `91%`

### Example 4: Delivery Delay
- **Input Complaint:** *"My delivery shipping package has not arrived yet."*
- **Predicted Category:** `Delivery`
- **Assigned Priority:** `Medium`
- **Confidence Score:** `89%`

*(Note: The exact confidence score and priority are computed based on keyword heuristics embedded in the classification pipeline.)*

---

## Learning Outcomes

This project demonstrates practical skills in software engineering and applied AI concepts:

- **Modern React Architecture**: Building scalable single-page applications with React 19 functional components, reusable UI blocks, and custom hooks.
- **State Management & Persistence**: Implementing synchronized state patterns with `useState`, reactive memoization with `useMemo`, and browser persistence via `localStorage`.
- **Natural Language Processing Fundamentals**: Developing text normalization, intent extraction, and rule-based heuristic classification models.
- **Frontend Data Visualization**: Designing interactive charts, SVG vector paths, conic gradient pie charts, and responsive status dashboards without heavy third-party chart dependencies.
- **User Authentication Flow**: Implementing client-side authentication guards, input validation, role attribution, and session handling.
- **Code Quality & Build Tooling**: Configuring high-performance development environments using Vite and automated linting with Oxlint.

---

## Future Enhancements

Potential extensions planned for future iterations:

- [ ] **Machine Learning Model Integration**: Train and deploy a Python-based transformer model (e.g., BERT or RoBERTa) via a FastAPI/Flask backend for semantic understanding.
- [ ] **Multi-Language Support**: Extend complaint text preprocessing to support multilingual classification (e.g., Hindi, Marathi, Spanish).
- [ ] **Database & REST API**: Connect frontend state to a persistent database (PostgreSQL / MongoDB) with a secure backend API.
- [ ] **Automated Email Notifications**: Trigger automated confirmation emails and resolution alerts to customers upon ticket status updates.
- [ ] **Sentiment Analysis**: Score customer sentiment (positive, neutral, angry) to escalate dissatisfied customer complaints.
- [ ] **Role-Based Access Control (RBAC)**: Differentiate customer-facing submission portals from agent resolution dashboards.

---

## Author

**Janavi Vitthal Sawant**  
*B.Sc. Artificial Intelligence*  
SGM College, Karad | Shivaji University, Kolhapur

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - feel free to use and adapt this code for educational and project development purposes.
