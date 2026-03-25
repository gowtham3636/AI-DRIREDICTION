---
description: how to run the Stock Prediction system
---

To run the full system, you need to start three separate components in three different terminals:

1. **Start the AI Service (Python)**
   ```powershell
   python "mern-stock-dashboard\ai-service\app.py"
   ```

2. **Start the Backend Server (Node.js)**
   ```powershell
   cd "mern-stock-dashboard\server"
   npm start
   ```

3. **Start the Frontend Client (Vite)**
   ```powershell
   cd "mern-stock-dashboard\client"
   npm run dev
   ```

// turbo-all
Once all three are running, open your browser to http://localhost:5173 to access the dashboard.
