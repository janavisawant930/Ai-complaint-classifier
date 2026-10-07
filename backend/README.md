# ComplainAI Backend (Flask & MySQL)

This is the Flask & MySQL backend service for the **ComplainAI - Smart Resolution System**.

## Features

- **Authentication**: User Sign Up & Sign In with password hashing (`scrypt`/`pbkdf2`).
- **Complaints Management**:
  - Submit new complaints with automated ID generation (`CMP-100X`).
  - Retrieve all complaints with search, category/priority/status filters, and confidence sorting.
  - Retrieve single complaint details.
  - Update complaint status (`Pending`, `In Progress`, `Resolved`).
- **AI Classification Engine**:
  - Automated natural language classification into 7 categories:
    - *Fraud/Security*, *Billing*, *Technical Issues*, *Delivery*, *Account*, *Product/Service*, *Other*.
  - Smart priority urgency scoring (*High*, *Medium*, *Low*).
  - Accurate confidence percentage calculation (85%-98%).
- **Analytics Engine**:
  - Category distribution breakdown.
  - Priority & status metrics.
  - Resolution performance & average confidence tracking.
- **MySQL Integration**:
  - Database: `complaint_db`
  - Tables: `complaints`, `users`
  - Automatic table creation & sample data seeding on startup.
- **CORS Support**: Ready for React / Vite frontend (`http://localhost:5173`).

---

## Prerequisites

- Python 3.9+
- MySQL Server running on `localhost:3306` (e.g. via XAMPP, WampServer, or MySQL Workbench).

---

## Installation & Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell / Command Prompt)
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your MySQL credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=complaint_db
   ```
   *(If your local root account has no password, leave `DB_PASSWORD=` blank).*

5. Run the Flask application:
   ```bash
   python app.py
   ```

   The backend will start at: `http://localhost:5000`

---

## Available REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/signin` | Log in with email/username & password |
| `GET` | `/api/complaints` | Fetch all complaints (supports `?category=`, `?status=`, `?priority=`, `?search=`, `?sort=`) |
| `POST` | `/api/complaints` | Submit a new complaint (auto-classifies if needed) |
| `GET` | `/api/complaints/<id>` | Fetch single complaint by ID (e.g. `CMP-1001`) |
| `PATCH` / `PUT` | `/api/complaints/<id>/status` | Update complaint status (`Pending`, `In Progress`, `Resolved`) |
| `POST` | `/api/classify` | AI classification for raw text / complaint title & description |
| `GET` | `/api/analytics` | Get distribution metrics, resolution rates & stats |
| `GET` | `/api/health` | Check backend & MySQL connection health |
