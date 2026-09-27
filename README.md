# Ai-complaint-classifier
# AI Complaint Classifier – ComplainAI

## 📌 Project Overview

**ComplainAI – AI Complaint Classifier** is a React-based complaint management application designed to help users submit, organize, classify, and analyze customer complaints.

The application provides an interactive dashboard where complaints can be submitted and automatically classified based on their content. The system assigns a complaint category, priority level, and confidence score using a keyword/rule-based classification approach.

---

## 🎯 Objectives

* To provide an easy platform for submitting customer complaints.
* To automatically classify complaints into relevant categories.
* To identify the priority of complaints.
* To provide confidence scores for classifications.
* To manage and track complaint status.
* To provide search, filtering, and sorting functionality.
* To visualize complaint information through an interactive dashboard.
* To provide analytics for better complaint management.

---

## ✨ Key Features

* 🔐 User Sign In and Sign Up
* 📊 Interactive Dashboard
* 📝 Submit Complaint
* 🤖 AI-based Complaint Classification
* 📋 All Complaints Management
* 🔎 Complaint Search
* 🏷️ Category Filtering
* ⚡ Priority Filtering
* 📌 Status Filtering
* 📈 Complaint Analytics
* 🔔 Notifications
* 👤 User Profile
* 🚪 Logout
* 📊 Complaint Statistics
* 🔄 Complaint Status Management

---

## 🤖 AI Complaint Classification

The project currently uses a **keyword/rule-based classification system** to analyze complaint text.

The system checks the complaint title and description for relevant keywords and assigns:

* Complaint Category
* Priority
* Confidence Score

For example, if a complaint contains words such as **fraud, unauthorized, scam, stolen, or transaction**, it can be classified as:

**Category:** Fraud/Security
**Priority:** High
**Confidence:** 96%

> Note: The current implementation is rule/keyword based. It is not a trained Machine Learning or Deep Learning model.

---

## 🏷️ Complaint Categories

The application supports the following complaint categories:

| Category         | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| Billing          | Issues related to bills and payments                             |
| Technical Issues | Technical or system-related problems                             |
| Product/Service  | Problems related to products or services                         |
| Account          | Account-related complaints                                       |
| Delivery         | Delivery-related complaints                                      |
| Fraud/Security   | Fraud, unauthorized transactions and security-related complaints |
| Other            | Complaints that do not match the above categories                |

---

## ⚡ Priority Classification

Complaints are assigned different priority levels based on the classification rules:

* **High**
* **Medium**
* **Low**

The priority is displayed throughout the complaint management interface.

---

## 📊 Dashboard

The dashboard provides an overview of complaint activity.

It includes:

* Total Complaints
* Pending Complaints
* Resolved Complaints
* High Priority Complaints
* Complaint Category Chart
* Complaint Trends
* Recent Complaints
* Complaint Management Options

The dashboard helps users quickly understand the current complaint status.

---

## 📝 Submit Complaint

Users can submit a new complaint by providing complaint information such as:

* Complaint Title
* Complaint Description
* Attachment

After submission, the application processes the complaint and generates a classification result.

The result includes:

* Category
* Priority
* Confidence

---

## 📋 All Complaints

The **All Complaints** section provides a centralized view of complaints.

Users can view information such as:

* Complaint ID
* User
* Complaint
* AI Category
* Priority
* Confidence
* Status
* Date
* Actions

---

## 🔎 Search, Filter and Sort

The application provides complaint management tools including:

### Search

Users can search complaints using information such as:

* Complaint ID
* User
* Complaint text
* Category
* Priority

### Filters

Complaints can be filtered by:

* Category
* Status
* Priority

### Sorting

Complaints can also be sorted using available sorting options such as confidence and complaint ID.

---

## 📈 Analytics

The Analytics section provides complaint-related information for understanding complaint patterns.

It includes visual representations and statistics related to:

* Complaints by Category
* Complaint Priority
* Complaint Status
* Complaint Trends
* Complaint Statistics

---

## 🔐 Authentication

The application provides:

* Sign In
* Sign Up
* Remember Me
* Demo Login
* Logout

The current authentication implementation stores user information using browser storage.

This implementation is suitable for a frontend project/demo but should be replaced with secure backend authentication for production use.

---

## 💾 Data Storage

The current application uses browser-based storage such as:

* `localStorage`
* `sessionStorage`

Complaint and user information can therefore be maintained within the browser.

A backend database can be integrated in future versions for persistent and secure data management.

---

## 🛠️ Technologies Used

* **React.js**
* **JavaScript**
* **CSS**
* **HTML**

---

## 📁 Project Structure

```text
AI-Complaint-Classifier/
│
├── App.jsx
├── App.css
├── Login.jsx
├── index.css
├── main.jsx
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

### 2. Open the Project

```bash
cd AI-Complaint-Classifier
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm run dev
```

Then open the local URL displayed in the terminal.

---

## 🧪 Example Classification

### Input Complaint

```text
Someone made an unauthorized transaction from my account.
```

### Classification Result

```text
Category: Fraud/Security
Priority: High
Confidence: 96%
```

---

## 🔮 Future Enhancements

The following features can be added in future versions:

* Machine Learning based complaint classification
* Natural Language Processing (NLP)
* Backend API integration
* Database integration
* Secure authentication
* Real-time complaint tracking
* Email notifications
* Advanced analytics
* Automatic complaint routing
* Improved NLP-based priority prediction
* Admin management system

---

## ⚠️ Current Limitations

* The current complaint classifier uses keyword/rule-based logic.
* It is not currently trained using a Machine Learning dataset.
* Authentication is frontend/browser-storage based.
* Complaint data is stored locally in the browser.
* A production application would require a secure backend and database.

---

## 🎓 Learning Outcomes

Through this project, the following concepts were practiced:

* React.js development
* Component-based UI development
* JavaScript programming
* State management
* Form handling
* Browser localStorage/sessionStorage
* Complaint classification logic
* Search and filtering
* Data visualization
* Dashboard design
* User authentication interface
* Frontend project development

---

## 👩‍💻 Author

**Janavi Vitthal Sawant**

B.Sc. Artificial Intelligence
SGM College, Karad
Shivaji University, Kolhapur

---

## 📄 License

This project is created for educational and internship purposes.
