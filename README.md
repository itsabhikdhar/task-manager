# Task Manager App

A simple full-stack **Task Manager** application built with:

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Axios
- **Database**: PostgreSQL (running in Docker)

This project demonstrates how to scaffold, integrate, and run a modern enterprise-style app with clean separation of concerns.

---

## 🚀 Features Implemented So Far

- Backend API with Express:
  - `GET /tasks` → fetch all tasks
  - `POST /tasks` → create new tasks (title + description)
- PostgreSQL database with Docker Compose
  - Table schema includes: `id`, `title`, `description`, `completed`
- React frontend:
  - Displays tasks from the API
  - Form to add new tasks
- Verified end-to-end flow with `curl` and frontend UI

---

## 📂 Project Structure

task-manager/
├── backend/
│ ├── index.js
│ ├── package.json
│ ├── .env.example # show format, not secrets
│ ├── docker-compose.yml
├── frontend/
│ ├── src/
│ ├── package.json
├── README.md

---

## 🛠 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/task-manager.git
cd task-manager

```

### 2. Start the database

cd backend
docker compose up -d

### 3. Configure environment variables

Create a .env file in backend/:
DATABASE_URL=postgresql://admin:secret@localhost:5432/taskmanager

### 4. Run the backend

cd backend
npm install
node index.js

### 5. Run the frontend

cd frontend
npm install
npm start

---

🧩 Roadmap

- Add timestamps (created_at, updated_at)
- Add authentication (Auth0 / Azure AD)
- Dockerize backend + frontend
- CI/CD with GitHub Actions
- Deploy to cloud (AWS Amplify + Google Cloud Run)
- Integration with Retool / n8n for dashboards and workflows

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

📜 License
MIT

---

This README gives you a professional-looking starting point. You can commit it with:

```bash
git add README.md
git commit -m "Add starter README"
git push origin main


```
