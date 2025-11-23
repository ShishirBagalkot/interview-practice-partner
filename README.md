# 🎤 Interview Practice Partner 🚀  
An interactive AI-powered interview coach that helps you **practice, improve, and ace** your job interviews — complete with realistic conversations, probing follow-ups, and actionable feedback.

---

## 🌟 Overview  
- **🎯 Purpose:** Help job-seekers prepare confidently with **role-specific mock interviews**, natural follow-ups, and structured evaluations.  
- **🎙️ Interaction style:** Voice-first (STT/TTS) with chat as a convenient fallback.  
- **👥 Ideal for:** Software engineers, sales reps, retail staff, customer support candidates, and anyone preparing for interviews.

---

## ⚙️ Installation & Running the Project

### 🧩 1. Clone the repository
```bash
git clone <your-repo-url>
cd interview-practice-partner
```

---

### 🖥️ 2. Run the Backend (FastAPI)

#### 🐍 Requirements
- Python 3.9+
- FastAPI
- uvicorn (optional, but recommended)

#### ▶️ Start backend
You can run the backend directly:

```bash
python main.py
```

OR using uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

Backend will run at:
```
http://localhost:8000
```

---

### 🌐 3. Run the Frontend

The frontend is completely static — no build needed.

To start:

1. Open the `frontend/` directory  
2. Double-click `index.html` **OR** open it with any browser

That's it! 🎉  
Your frontend will communicate with the backend at `http://localhost:8000`.

---

## ✨ Features

- **🧑‍💼 Role-specific mock interviews**  
- **🤔 Realistic follow-ups**  
- **📝 Post-interview evaluation**  
- **📊 Scores & actionable tips**  
- **🎤 Voice + 💬 Chat modes**  
- **🪶 Lightweight frontend + backend**

---

## 🧠 Why Choose Mistral with Ollama?

- 📘 Excellent instruction-following  
- ⚖️ Great balance of size & capability  
- 💻 Easy local hosting with Ollama (fast, private, efficient)

---

## 🆓 Open-Source Models You Can Use

- 🌀 Mistral 7B  
- 🐑 LLaMA 2 / 3  
- 💎 Gemma  
- 🦅 Falcon  
- 🌍 BLOOM  

> 💡 Use small or quantized builds for local inference.

---

## ⚙️ Quick Ollama Commands (PowerShell)

```pwsh
ollama pull mistral
ollama list
ollama run mistral
```

---

## 🏗️ System Architecture

### 🖥️ Frontend (`frontend/`)
- Handles UI  
- Microphone access (voice input)  
- Audio playback  
- Requests → backend  

### 🧩 Backend (`backend/`)
- FastAPI app  
- Prompt orchestration  
- LLM calls  
- Evaluation logic  

### 🤖 LLM API
- Self-hosted (Ollama) or cloud LLM  
- Generates questions, follow-ups & feedback  

### 🔊 STT/TTS (optional)
- Browser Web Speech API  
- Or cloud/open-source alternatives  

---

## 🔁 Flow Diagram (Simplified)

**User** → **Frontend** → **Backend** → **LLM** → **Backend scoring** → **Frontend Output/TTS**

🎧 Speak → 🧠 Think → 🗣️ Respond → 📊 Evaluate → 🔁 Improve