# 📚 LibraryEase — Vintage Library & Digital Services

### A Smarter Way to Discover, Explore and Experience Public Libraries

LibraryEase is a full-stack web application designed to modernize public library services through digital technology and AI-powered assistance.

It provides a centralized platform where users can discover books, explore nearby library branches, manage their borrowing activities, receive notifications, and get personalized book recommendations through Google Gemini AI.

The project combines a **Vintage Library aesthetic with Modern AI technology**, creating a welcoming, elegant, and user-friendly digital library experience.

---

## 🌟 Project Overview

Traditional library services can make it difficult for users to discover books, access library information, and manage borrowing activities conveniently.

LibraryEase aims to simplify these processes through a single digital platform.

### 🎯 Objectives

- Digitize public library information and services.
- Simplify book discovery and searching.
- Help users explore nearby library branches.
- Provide AI-powered book recommendations.
- Improve borrowing and return management.
- Enhance communication between library users and librarians.

---

## ✨ Key Features

### 📖 1. Book Discovery
- Search books by title, author, and category.
- Filter and sort available books.
- View detailed book information.
- Check book availability and shelf information.

### 📍 2. Mumbai Library Explorer
- Explore Mumbai library branches.
- Search libraries by locality.
- View library information and facilities.
- Interactive map-based library discovery.

### 🤖 3. AI Book Assistant
- Powered by Google Gemini AI.
- Personalized book recommendations.
- Conversational book discovery.
- Recommendations grounded in the available library catalogue.
- Rule-based fallback when live AI is unavailable.

### 👤 4. User Authentication
- User registration and login.
- Secure password hashing.
- JWT-based authentication.
- User profile management.

### 📚 5. My Library Dashboard
- Virtual library membership card.
- View borrowed books.
- Track borrowing and return dates.
- Monitor overdue books.
- Manage eligible book renewals.

### 🔔 6. Notifications
- Borrowing confirmations.
- Due-date reminders.
- Overdue notifications.
- In-app notification management.

### 📝 7. Feedback System
- Submit feedback.
- Interactive star ratings.
- Categorized feedback.
- Form validation and confirmation messages.

### 📩 8. Book Request System
- Request books not currently available.
- Track request status.
- Support librarian review.

### 🏛️ 9. Librarian Dashboard
- Library administration.
- Book management.
- Member information.
- Borrowing records.
- Book request management.

*Note: Book requests and librarian dashboard functionality are planned or under development unless their implementation has been verified.*

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Styling | CSS3 |
| Programming Languages | JavaScript, Python |
| Backend | FastAPI |
| Database | SQLite / MySQL configuration |
| AI Integration | Google Gemini API |
| API Architecture | REST APIs |
| Authentication | JWT |
| Password Security | Bcrypt |
| API Documentation | Swagger UI |
| Version Control | Git & GitHub |

---

## 🏗️ System Architecture

LibraryEase follows a frontend-backend architecture.

```text
              USER
                |
                ▼
       REACT + VITE FRONTEND
          (Port 5173)
                |
                ▼
          REST API CALLS
                |
                ▼
          FASTAPI BACKEND
          (Port 8001)
                |
       ┌────────┼─────────┐
       |        |         |
       ▼        ▼         ▼
    DATABASE  GEMINI AI  AUTH
    (SQLite)  SERVICE    (JWT)
       |
       ▼
  BOOKS, USERS,
  BORROWINGS,
  NOTIFICATIONS,
  FEEDBACK
```

---

## 📂 Project Structure

```text
LibraryEase/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   ├── ai_service.py
│   ├── seed_data.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation and Setup

Follow these instructions to run LibraryEase locally.

### Prerequisites

Install the following:

- Python 3.11 or later
- Node.js and npm
- Git
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/anjalivish05/LibraryEase-Vintage-and-Digital-Library.git
```

Navigate to the project:

```bash
cd LibraryEase-Vintage-and-Digital-Library
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the environment variables in `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Add other required environment variables according to the backend configuration.

Start the backend:

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Backend URL:

```text
http://127.0.0.1:8001
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 4. API Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://localhost:8001/docs
```

---

## 🔌 API Modules

The backend provides REST API endpoints for:

| Module | Functionality |
|---|---|
| Authentication | Registration, login, profile |
| Books | Book catalogue and management |
| Libraries | Library branch information |
| AI Assistant | AI-powered book recommendations |
| Borrowings | Issue, return and renewal |
| Notifications | User notifications and reminders |
| Feedback | Feedback submission |
| Book Requests | Book acquisition requests |
| Admin | Library administration and statistics |

---

## 🔐 Security

LibraryEase incorporates several security practices:

- Password hashing using bcrypt.
- JWT-based user authentication.
- Environment variables for API credentials.
- Backend-side request validation.
- Role-based access control for protected operations.
- Explicit CORS configuration.
- SSL certificate verification for Gemini API communication.

**Important:** Never upload `.env` files, API keys, passwords, or private database credentials to GitHub.

---

## 🎨 UI/UX Design Philosophy

LibraryEase follows a **Vintage Library + Modern AI** design approach.

### Color Palette

| Color | Hex Code | Usage |
|---|---|---|
| Antique Cream | `#F5EBDD` | Background |
| Parchment | `#E7D6B8` | Surfaces |
| Forest Green | `#355442` | Primary elements |
| Muted Sage | `#9BAF98` | Secondary elements |
| Dusty Lavender | `#C7B9D8` | AI features |
| Ink Charcoal | `#302D27` | Typography |
| White | `#FFFFFF` | Cards and surfaces |

The interface combines traditional library-inspired visuals with modern digital functionality.

---

## 🧪 Testing and Verification

The latest project remediation report recorded:

- Backend unit tests: 17/17 passed.
- Frontend production build: Passed.
- Borrowing and return integration: Tested.
- CORS configuration: Tested.
- Library branch APIs: Tested.
- Gemini AI communication: Tested.

These are results from the November 11, 2026 development verification. Individual features should be retested after subsequent changes.

---

## 🚀 Future Enhancements

Potential future improvements include:

- Online book reservations.
- Digital library membership cards.
- Real-time inventory synchronization.
- Advanced AI-powered reading suggestions.
- Librarian analytics dashboard.
- Automated email and SMS notifications.
- Additional public library integrations.
- Cloud deployment and managed database hosting.

---

## 👩‍💻 Developer

**Anjali Manoj Vishwakarma**

BE Information Technology

GitHub: [@anjalivish05](https://github.com/anjalivish05)

Project: [LibraryEase — Vintage Library & Digital Services](https://github.com/anjalivish05/LibraryEase-Vintage-and-Digital-Library)

---

## ❤️ Acknowledgement

LibraryEase is developed as an academic project to explore how modern web technologies and artificial intelligence can improve access to public library services.

**Making libraries more accessible, one click at a time.**

---

⭐ If you find this project interesting, consider giving the repository a star!
