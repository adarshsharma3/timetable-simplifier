#📅 Timetable Simplifier

This project converts complex Excel/PDF-based timetables into a clean, user-friendly web interface.  
It combines a **Python backend (Flask)** for handling Excel/PDF parsing with a **React frontend** for visualization.

---

## 🚀 Features
- Upload Excel timetable files (`.xls` / `.xlsx`).
- Parse and process timetable data on the backend.
- Display a simplified, beautiful timetable view on the frontend.
- Built with **Flask (Python)** + **React (Vite + TailwindCSS)**.
- Easy to extend for other institutions or formats.

---

## 🗂 Project Structure

TIMETABLE/
├── api/ # Backend (Flask API)
│ ├── uploads/ # Uploaded Excel/PDF files
│ ├── uploads2/ # Processed timetables
│ ├── api.py # Flask API entry point
│ └── venv/ # Python virtual environment
│
├── public/ # Static frontend assets
├── src/ # React frontend source
│ ├── assets/ # Images, fonts, etc.
│ ├── Page/ # Components for timetable results
│ │ ├── Finalresult.jsx
│ │ └── TimetableResult.jsx
│ ├── App.jsx # Main React app
│ ├── Home.jsx # Homepage
│ ├── main.jsx # Vite entry point
│ └── index.css # Global styles
│
├── package.json # Node dependencies
├── vite.config.js # Vite config
├── tailwind.config.js # TailwindCSS config
├── postcss.config.js # PostCSS config
└── README.md # Project documentation


---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/timetable-simplifier.git
cd timetable-simplifier

2. Backend Setup (Flask + Python)

cd api
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Run the Flask API:

python api.py

By default, it will run on http://127.0.0.1:5000.
3. Frontend Setup (React + Vite + TailwindCSS)

cd ..
npm install
npm run dev

By default, it will run on http://localhost:5173.
🔗 Connecting Frontend & Backend

    The React frontend fetches processed timetable data from the Flask API.

    Make sure both servers are running:

        Flask: http://127.0.0.1:5000

        Vite: http://localhost:5173

📸 Screenshots (Optional)

Add screenshots of before (Excel/PDF) and after (web view) here.
🛠 Tech Stack

    Frontend: React, Vite, TailwindCSS

    Backend: Flask (Python)

    File Handling: Excel (.xls/.xlsx) parsing

    Deployment: Node + Flask

🙌 Contribution

Feel free to fork this project, open issues, or submit pull requests if you’d like to improve it.