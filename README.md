# SDE Task Dependency Tracker

A full-stack application to manage tasks and visualize dependencies.

## Features

- **Graph Visualization:** Auto-arranges tasks using HTML5 Canvas.
- **Cycle Detection:** Prevents circular dependencies.
- **Auto-Status:** Tasks update based on their dependencies.

## Setup

1. **Database:** Create a MySQL database named `task_db`.
2. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
